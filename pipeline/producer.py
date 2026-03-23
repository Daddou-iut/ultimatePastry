from pyspark.sql import SparkSession
from pyspark.sql.functions import lit
import psycopg2
import json
import random
import uuid
import time
from datetime import datetime, timezone

# ─── Config BDD Neon ───────────────────────────────────────────
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host":     os.getenv("NEON_HOST"),
    "database": os.getenv("NEON_DB"),
    "user":     os.getenv("NEON_USER"),
    "password": os.getenv("NEON_PASSWORD"),
    "sslmode":  "require"
}

KAFKA_SERVER = "localhost:9092"

TOPICS = {
    "packs":       "pastry-events",
    "players":     "pastry-players",
    "teams":       "pastry-teams",
    "matches":     "pastry-matches",
    "marketplace": "pastry-marketplace",
}

RARITY_WEIGHTS = {
    "bronze": {"common": 70, "uncommon": 25, "rare": 4,  "epic": 1},
    "silver": {"common": 45, "uncommon": 40, "rare": 13, "epic": 2},
    "gold":   {"common": 20, "uncommon": 35, "rare": 35, "epic": 10},
}

FAKE_FIRSTNAMES = ["Lucas", "Emma", "Noah", "Léa", "Hugo", "Chloé", "Théo", "Jade", "Nathan", "Camille"]
FAKE_LASTNAMES  = ["Martin", "Bernard", "Petit", "Durand", "Moreau", "Simon", "Laurent", "Thomas"]

# ─── Connexion BDD ─────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

# ─── Chargement des données ────────────────────────────────────
def load_data():
    conn = get_conn()
    cur  = conn.cursor()

    cur.execute("""
        SELECT p.id, u.username, p.money
        FROM cards_player p
        JOIN auth_user u ON u.id = p.user_id
    """)
    players = [{"id": r[0], "username": r[1], "money": r[2]} for r in cur.fetchall()]

    cur.execute("SELECT id, name, family, rarity, gout, technique, esthetique FROM cards_card")
    all_cards = cur.fetchall()
    cards_by_rarity = {"common": [], "uncommon": [], "rare": [], "epic": []}
    for r in all_cards:
        cards_by_rarity[r[3]].append({
            "card_id": r[0], "name": r[1], "family": r[2],
            "rarity": r[3], "gout": r[4], "technique": r[5], "esthetique": r[6]
        })

    cur.execute("SELECT id, level, cost, rarity_boost, cards_count FROM cards_pack")
    packs = [{"id": r[0], "level": r[1], "cost": r[2], "rarity_boost": r[3], "cards_count": r[4]} for r in cur.fetchall()]

    cur.execute("""
        SELECT t.id, t.name, t.owner_id, u.username
        FROM cards_team t
        JOIN cards_player p ON p.id = t.owner_id
        JOIN auth_user u ON u.id = p.user_id
    """)
    teams = [{"id": r[0], "name": r[1], "owner_id": r[2], "owner_username": r[3]} for r in cur.fetchall()]

    cur.execute("""
        SELECT ci.id, ci.card_id, ci.owner_id, c.name, c.rarity
        FROM cards_cardinstance ci
        JOIN cards_card c ON c.id = ci.card_id
    """)
    instances = [{"id": r[0], "card_id": r[1], "owner_id": r[2], "card_name": r[3], "rarity": r[4]} for r in cur.fetchall()]

    cur.close()
    conn.close()
    print(f"Données : {len(players)} joueurs, {sum(len(v) for v in cards_by_rarity.values())} cartes, {len(packs)} packs, {len(teams)} équipes, {len(instances)} instances")
    return players, cards_by_rarity, packs, teams, instances

# ─── Envoi Kafka ───────────────────────────────────────────────
def send(spark, topic, event):
    event_json = json.dumps(event, ensure_ascii=False)
    spark.createDataFrame([(event_json,)], ["value"]) \
         .write.format("kafka") \
         .option("kafka.bootstrap.servers", KAFKA_SERVER) \
         .option("topic", topic) \
         .save()

# ─── Générateurs d'événements ──────────────────────────────────
def draw_card(cards_by_rarity, pack_level):
    weights = RARITY_WEIGHTS[pack_level]
    rarity  = random.choices(list(weights.keys()), weights=list(weights.values()), k=1)[0]
    pool    = cards_by_rarity.get(rarity) or cards_by_rarity["common"]
    return random.choice(pool)

def event_pack_opening(player, pack, cards_by_rarity):
    return {
        "event_id":   str(uuid.uuid4()),
        "event_type": "pack_opening",
        "timestamp":  datetime.now(timezone.utc).isoformat(),
        "player":     {"id": player["id"], "username": player["username"]},
        "pack":       pack,
        "cards_obtained": [draw_card(cards_by_rarity, pack["level"]) for _ in range(pack["cards_count"])]
    }

def event_player_created():
    username = f"{random.choice(FAKE_FIRSTNAMES).lower()}_{random.choice(FAKE_LASTNAMES).lower()}_{random.randint(10,99)}"
    return {
        "event_id":   str(uuid.uuid4()),
        "event_type": "player_created",
        "timestamp":  datetime.now(timezone.utc).isoformat(),
        "username":   username,
        "email":      f"{username}@pastry.com",
        "first_name": random.choice(FAKE_FIRSTNAMES),
        "last_name":  random.choice(FAKE_LASTNAMES),
        "password":   "Pastry2026!",
    }

def event_team_created(player, instances):
    # Récupère les instances du joueur par famille
    owned = [i for i in instances if i["owner_id"] == player["id"]]
    by_family = {}
    for ci in owned:
        conn = get_conn()
        cur  = conn.cursor()
        cur.execute("SELECT family FROM cards_card WHERE id = %s", (ci["card_id"],))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            fam = row[0]
            by_family.setdefault(fam, []).append(ci)

    if "base" not in by_family or "filling" not in by_family:
        return None  # Pas assez de cartes pour créer une équipe

    base    = random.choice(by_family["base"])
    filling = random.choice(by_family["filling"])
    cream   = random.choice(by_family.get("cream",   [None])[:1] or [None])
    glaze   = random.choice(by_family.get("glaze",   [None])[:1] or [None])
    decos   = random.sample(by_family.get("decoration", []), min(2, len(by_family.get("decoration", []))))

    return {
        "event_id":    str(uuid.uuid4()),
        "event_type":  "team_created",
        "timestamp":   datetime.now(timezone.utc).isoformat(),
        "player":      {"id": player["id"], "username": player["username"]},
        "team_name":   f"Équipe {random.choice(['Royale','Prestige','Sucrée','Dorée','Légère'])} {random.randint(1,99)}",
        "base_id":     base["id"],
        "filling_id":  filling["id"],
        "cream_id":    cream["id"] if cream else None,
        "glaze_id":    glaze["id"] if glaze else None,
        "decoration_ids": [d["id"] for d in decos],
    }

def event_match_played(teams):
    if len(teams) < 2:
        return None
    t1, t2 = random.sample(teams, 2)
    s1, s2 = random.randint(50, 300), random.randint(50, 300)
    return {
        "event_id":      str(uuid.uuid4()),
        "event_type":    "match_played",
        "timestamp":     datetime.now(timezone.utc).isoformat(),
        "team1":         t1,
        "team2":         t2,
        "score_team1":   s1,
        "score_team2":   s2,
        "winner_team_id": t1["id"] if s1 >= s2 else t2["id"],
    }

def event_marketplace(player, instances):
    owned = [i for i in instances if i["owner_id"] == player["id"]]
    if not owned:
        return None
    ci    = random.choice(owned)
    price = random.randint(50, 800)
    return {
        "event_id":          str(uuid.uuid4()),
        "event_type":        "marketplace_listing",
        "timestamp":         datetime.now(timezone.utc).isoformat(),
        "player":            {"id": player["id"], "username": player["username"]},
        "card_instance_id":  ci["id"],
        "card_name":         ci["card_name"],
        "price":             price,
    }

# ─── Point d'entrée ────────────────────────────────────────────
if __name__ == "__main__":
    spark = SparkSession.builder.appName("PastryProducer").getOrCreate()
    spark.sparkContext.setLogLevel("WARN")

    players, cards_by_rarity, packs, teams, instances = load_data()

    if not players:
        print("Aucun joueur en BDD !")
        spark.stop()
        exit()

    print("\nProducer démarré — envoi d'événements toutes les 2 secondes...\n")

    # Séquence cyclique des types d'événements
    event_sequence = ["pack", "pack", "pack", "player", "team", "match", "marketplace"]
    idx = 0

    while True:
        event_type = event_sequence[idx % len(event_sequence)]
        idx += 1

        if event_type == "pack" and packs:
            player = random.choice(players)
            pack   = random.choice(packs)
            event  = event_pack_opening(player, pack, cards_by_rarity)
            send(spark, TOPICS["packs"], event)
            rarities = [c["rarity"] for c in event["cards_obtained"]]
            print(f"[PACK]        {player['username']} ouvre un {pack['level'].upper()} ({len(rarities)} cartes) : {', '.join(rarities)}")

        elif event_type == "player":
            event = event_player_created()
            send(spark, TOPICS["players"], event)
            print(f"[PLAYER]      Nouveau joueur : {event['username']}")

        elif event_type == "team" and players:
            player = random.choice(players)
            # Recharge les instances pour avoir les données fraîches
            _, _, _, _, instances = load_data()
            event = event_team_created(player, instances)
            if event:
                send(spark, TOPICS["teams"], event)
                print(f"[TEAM]        {player['username']} crée {event['team_name']}")
            else:
                print(f"[TEAM]        {player['username']} n'a pas assez de cartes — ignoré")

        elif event_type == "match":
            # Recharge les équipes
            _, _, _, teams, _ = load_data()
            event = event_match_played(teams)
            if event:
                send(spark, TOPICS["matches"], event)
                print(f"[MATCH]       {event['team1']['name']} vs {event['team2']['name']} → scores {event['score_team1']}/{event['score_team2']}")
            else:
                print(f"[MATCH]       Pas assez d'équipes — ignoré")

        elif event_type == "marketplace" and players:
            player = random.choice(players)
            _, _, _, _, instances = load_data()
            event = event_marketplace(player, instances)
            if event:
                send(spark, TOPICS["marketplace"], event)
                print(f"[MARKETPLACE] {player['username']} vend {event['card_name']} pour {event['price']} coins")
            else:
                print(f"[MARKETPLACE] {player['username']} n'a pas de cartes à vendre — ignoré")

        time.sleep(2)