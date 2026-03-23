from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, explode
from pyspark.sql.types import (
    StructType, StructField, StringType,
    IntegerType, ArrayType
)
import psycopg2

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

# ─── Schémas JSON ──────────────────────────────────────────────
card_schema = StructType([
    StructField("card_id",    IntegerType(), True),
    StructField("name",       StringType(),  True),
    StructField("family",     StringType(),  True),
    StructField("rarity",     StringType(),  True),
    StructField("gout",       IntegerType(), True),
    StructField("technique",  IntegerType(), True),
    StructField("esthetique", IntegerType(), True),
])
pack_schema = StructType([
    StructField("id",           IntegerType(), True),
    StructField("level",        StringType(),  True),
    StructField("cost",         IntegerType(), True),
    StructField("rarity_boost", StringType(),  True),
    StructField("cards_count",  IntegerType(), True),
])
player_schema = StructType([
    StructField("id",       IntegerType(), True),
    StructField("username", StringType(),  True),
])
team_ref_schema = StructType([
    StructField("id",             IntegerType(), True),
    StructField("name",           StringType(),  True),
    StructField("owner_id",       IntegerType(), True),
    StructField("owner_username", StringType(),  True),
])

# Schéma pack_opening
schema_pack = StructType([
    StructField("event_id",       StringType(),           True),
    StructField("event_type",     StringType(),           True),
    StructField("timestamp",      StringType(),           True),
    StructField("player",         player_schema,          True),
    StructField("pack",           pack_schema,            True),
    StructField("cards_obtained", ArrayType(card_schema), True),
])

# Schéma player_created
schema_player = StructType([
    StructField("event_id",   StringType(), True),
    StructField("event_type", StringType(), True),
    StructField("timestamp",  StringType(), True),
    StructField("username",   StringType(), True),
    StructField("email",      StringType(), True),
    StructField("first_name", StringType(), True),
    StructField("last_name",  StringType(), True),
    StructField("password",   StringType(), True),
])

# Schéma team_created
schema_team = StructType([
    StructField("event_id",        StringType(),           True),
    StructField("event_type",      StringType(),           True),
    StructField("timestamp",       StringType(),           True),
    StructField("player",          player_schema,          True),
    StructField("team_name",       StringType(),           True),
    StructField("base_id",         IntegerType(),          True),
    StructField("filling_id",      IntegerType(),          True),
    StructField("cream_id",        IntegerType(),          True),
    StructField("glaze_id",        IntegerType(),          True),
    StructField("decoration_ids",  ArrayType(IntegerType()), True),
])

# Schéma match_played
schema_match = StructType([
    StructField("event_id",       StringType(),    True),
    StructField("event_type",     StringType(),    True),
    StructField("timestamp",      StringType(),    True),
    StructField("team1",          team_ref_schema, True),
    StructField("team2",          team_ref_schema, True),
    StructField("score_team1",    IntegerType(),   True),
    StructField("score_team2",    IntegerType(),   True),
    StructField("winner_team_id", IntegerType(),   True),
])

# Schéma marketplace
schema_marketplace = StructType([
    StructField("event_id",         StringType(),  True),
    StructField("event_type",       StringType(),  True),
    StructField("timestamp",        StringType(),  True),
    StructField("player",           player_schema, True),
    StructField("card_instance_id", IntegerType(), True),
    StructField("card_name",        StringType(),  True),
    StructField("price",            IntegerType(), True),
])

# ─── Connexion BDD ─────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def event_already_processed(cur, event_id):
    cur.execute("SELECT 1 FROM pipeline_processed_events WHERE event_id = %s", (event_id,))
    return cur.fetchone() is not None

def mark_event_processed(cur, event_id):
    cur.execute(
        "INSERT INTO pipeline_processed_events (event_id, processed_at) VALUES (%s, NOW())",
        (event_id,)
    )

# ─── Handlers par type d'événement ────────────────────────────

def handle_pack_opening(row):
    """Crée les CardInstance pour chaque carte obtenue dans le pack."""
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if event_already_processed(cur, row.event_id):
            return

        inserted = 0
        for card in row.cards_obtained:
            try:
                cur.execute(
                    "INSERT INTO cards_cardinstance (card_id, owner_id, level) VALUES (%s, %s, 1)",
                    (card.card_id, row.player.id)
                )
                inserted += 1
            except Exception:
                conn.rollback()
                cur = conn.cursor()

        mark_event_processed(cur, row.event_id)
        conn.commit()
        print(f"  ✓ [PACK]        {row.player.username} | {row.pack.level.upper()} | {inserted}/{len(row.cards_obtained)} cartes")
    except Exception as e:
        conn.rollback()
        print(f"  ✗ [PACK] erreur : {e}")
    finally:
        cur.close()
        conn.close()


def handle_player_created(row):
    """Crée un User Django + Player associé."""
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if event_already_processed(cur, row.event_id):
            return

        # Vérifie que le username n'existe pas déjà
        cur.execute("SELECT 1 FROM auth_user WHERE username = %s", (row.username,))
        if cur.fetchone():
            mark_event_processed(cur, row.event_id)
            conn.commit()
            print(f"  ⚠ [PLAYER]      {row.username} existe déjà — ignoré")
            return

        # Crée le User Django avec un mot de passe hashé basique
        import hashlib, os
        # Hash compatible Django (PBKDF2 SHA256)
        salt = os.urandom(16).hex()
        import hmac
        dk = hashlib.pbkdf2_hmac('sha256', row.password.encode(), salt.encode(), 390000)
        hashed = f"pbkdf2_sha256$390000${salt}${dk.hex()}"

        cur.execute("""
            INSERT INTO auth_user (username, email, first_name, last_name, password,
                                   is_staff, is_active, is_superuser,
                                   date_joined, last_login)
            VALUES (%s, %s, %s, %s, %s, false, true, false, NOW(), NULL)
            RETURNING id
        """, (row.username, row.email, row.first_name, row.last_name, hashed))
        user_id = cur.fetchone()[0]

        # Crée le Player
        cur.execute(
            "INSERT INTO cards_player (user_id, money, created_at) VALUES (%s, 1000, NOW())",
            (user_id,)
        )

        mark_event_processed(cur, row.event_id)
        conn.commit()
        print(f"  ✓ [PLAYER]      Nouveau joueur créé : {row.username}")
    except Exception as e:
        conn.rollback()
        print(f"  ✗ [PLAYER] erreur : {e}")
    finally:
        cur.close()
        conn.close()


def handle_team_created(row):
    """Crée une Team avec ses CardInstance."""
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if event_already_processed(cur, row.event_id):
            return

        player_id = row.player.id

        # Vérifie que les cartes existent et appartiennent au joueur
        def check_card(ci_id):
            if not ci_id:
                return True
            cur.execute(
                "SELECT 1 FROM cards_cardinstance WHERE id = %s AND owner_id = %s",
                (ci_id, player_id)
            )
            return cur.fetchone() is not None

        if not check_card(row.base_id) or not check_card(row.filling_id):
            print(f"  ⚠ [TEAM]        Cartes invalides pour {row.player.username} — ignoré")
            mark_event_processed(cur, row.event_id)
            conn.commit()
            return

        cur.execute("""
            INSERT INTO cards_team (name, owner_id, base_id, filling_id, cream_id, glaze_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            row.team_name, player_id,
            row.base_id, row.filling_id,
            row.cream_id, row.glaze_id
        ))
        team_id = cur.fetchone()[0]

        # Décorations (ManyToMany)
        if row.decoration_ids:
            for deco_id in row.decoration_ids:
                if check_card(deco_id):
                    cur.execute(
                        "INSERT INTO cards_team_decorations (team_id, cardinstance_id) VALUES (%s, %s)",
                        (team_id, deco_id)
                    )

        mark_event_processed(cur, row.event_id)
        conn.commit()
        print(f"  ✓ [TEAM]        {row.player.username} crée '{row.team_name}' (id={team_id})")
    except Exception as e:
        conn.rollback()
        print(f"  ✗ [TEAM] erreur : {e}")
    finally:
        cur.close()
        conn.close()


def handle_match_played(row):
    """Crée un Match entre deux équipes."""
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if event_already_processed(cur, row.event_id):
            return

        winner_id = row.winner_team_id if row.score_team1 != row.score_team2 else None

        cur.execute("""
            INSERT INTO cards_match
                ("teamP1_id", "teamP2_id", score_player1, score_player2, winner_id, date)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (
            row.team1.id, row.team2.id,
            row.score_team1, row.score_team2,
            winner_id
        ))

        mark_event_processed(cur, row.event_id)
        conn.commit()
        print(f"  ✓ [MATCH]       {row.team1.name} {row.score_team1} - {row.score_team2} {row.team2.name}")
    except Exception as e:
        conn.rollback()
        print(f"  ✗ [MATCH] erreur : {e}")
    finally:
        cur.close()
        conn.close()


def handle_marketplace(row):
    """Crée une annonce marketplace."""
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if event_already_processed(cur, row.event_id):
            return

        # Vérifie que la carte appartient au joueur et n'est pas déjà en vente
        cur.execute(
            "SELECT 1 FROM cards_cardinstance WHERE id = %s AND owner_id = %s",
            (row.card_instance_id, row.player.id)
        )
        if not cur.fetchone():
            print(f"  ⚠ [MARKETPLACE] carte {row.card_instance_id} invalide — ignoré")
            mark_event_processed(cur, row.event_id)
            conn.commit()
            return

        cur.execute(
            "SELECT 1 FROM cards_marketplacelisting WHERE card_instance_id = %s AND status = 'active'",
            (row.card_instance_id,)
        )
        if cur.fetchone():
            print(f"  ⚠ [MARKETPLACE] carte déjà en vente — ignoré")
            mark_event_processed(cur, row.event_id)
            conn.commit()
            return

        cur.execute("""
            INSERT INTO cards_marketplacelisting
                (card_instance_id, seller_id, price, status, created_at)
            VALUES (%s, %s, %s, 'active', NOW())
        """, (row.card_instance_id, row.player.id, row.price))

        mark_event_processed(cur, row.event_id)
        conn.commit()
        print(f"  ✓ [MARKETPLACE] {row.player.username} vend {row.card_name} pour {row.price} coins")
    except Exception as e:
        conn.rollback()
        print(f"  ✗ [MARKETPLACE] erreur : {e}")
    finally:
        cur.close()
        conn.close()

# ─── Process batch générique ───────────────────────────────────
def make_process_batch(handler):
    def process_batch(batch_df, batch_id):
        count = batch_df.count()
        if count == 0:
            return
        print(f"\n{'═'*50}")
        print(f"BATCH {batch_id} — {count} événements")
        print(f"{'═'*50}")
        for row in batch_df.collect():
            handler(row)
    return process_batch

# ─── Point d'entrée ────────────────────────────────────────────
if __name__ == "__main__":
    spark = SparkSession.builder \
        .appName("PastryConsumer") \
        .getOrCreate()
    spark.sparkContext.setLogLevel("WARN")

    def read_topic(topic, schema):
        return spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", KAFKA_SERVER) \
            .option("subscribe", topic) \
            .option("startingOffsets", "earliest") \
            .load() \
            .select(from_json(col("value").cast("string"), schema).alias("e")) \
            .select("e.*")

    # Lance un stream par topic
    queries = [
        read_topic("pastry-events",     schema_pack)
            .writeStream.foreachBatch(make_process_batch(handle_pack_opening))
            .option("checkpointLocation", "/tmp/checkpoint_packs")
            .start(),

        read_topic("pastry-players",    schema_player)
            .writeStream.foreachBatch(make_process_batch(handle_player_created))
            .option("checkpointLocation", "/tmp/checkpoint_players")
            .start(),

        read_topic("pastry-teams",      schema_team)
            .writeStream.foreachBatch(make_process_batch(handle_team_created))
            .option("checkpointLocation", "/tmp/checkpoint_teams")
            .start(),

        read_topic("pastry-matches",    schema_match)
            .writeStream.foreachBatch(make_process_batch(handle_match_played))
            .option("checkpointLocation", "/tmp/checkpoint_matches")
            .start(),

        read_topic("pastry-marketplace", schema_marketplace)
            .writeStream.foreachBatch(make_process_batch(handle_marketplace))
            .option("checkpointLocation", "/tmp/checkpoint_marketplace")
            .start(),
    ]

    print("Consumer démarré — écoute sur 5 topics...")

    # Attend que tous les streams se terminent
    for q in queries:
        q.awaitTermination()