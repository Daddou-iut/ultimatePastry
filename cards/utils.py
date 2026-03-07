# Fonctions pour calculer les scores des gâteaux

def calculer_score_brut(team):
    """
    Calcule le score BRUT d'un gâteau sans bonus.
    
    Formule:
    Score Brut = (Goût × 1.5) + Technique + Esthétique
    
    On additionne les stats de TOUTES les cartes du gâteau.
    """
    
    # Récupérer les cartes du gâteau
    base = team.base.card
    cream = team.cream.card
    filling = team.filling.card if team.filling else None
    glaze = team.glaze.card if team.glaze else None
    decorations = [d.card for d in team.decorations.all()]
    
    # Additionner tous les Goûts (avec multiplicateur ×1.5)
    total_gout = (base.gout + cream.gout) * 1.5
    if filling:
        total_gout += filling.gout * 1.5
    if glaze:
        total_gout += glaze.gout * 1.5
    for deco in decorations:
        total_gout += deco.gout * 1.5
    
    # Additionner tous les Techniques (multiplicateur ×1.0)
    total_technique = base.technique + cream.technique
    if filling:
        total_technique += filling.technique
    if glaze:
        total_technique += glaze.technique
    for deco in decorations:
        total_technique += deco.technique
    
    # Additionner tous les Esthétiques (multiplicateur ×1.0)
    total_esthetique = base.esthetique + cream.esthetique
    if filling:
        total_esthetique += filling.esthetique
    if glaze:
        total_esthetique += glaze.esthetique
    for deco in decorations:
        total_esthetique += deco.esthetique
    
    # Calculer le score brut
    score_brut = total_gout + total_technique + total_esthetique
    
    return score_brut


def calculer_bonus_synergies(team):
    """
    Calcule le bonus de synergies.
    
    Retourne un nombre entre 0 et 1 (exemple: 0.15 = +15%)
    """
    
    bonus = 0.0
    
    # Récupérer les cartes
    base = team.base.card
    cream = team.cream.card
    filling = team.filling.card if team.filling else None
    glaze = team.glaze.card if team.glaze else None
    decorations = [d.card for d in team.decorations.all()]
    
    # --- SYNERGIES DE SAVEUR ---
    # Compter combien de cartes ont la même saveur
    saveurs = [base.flavor, cream.flavor]
    if filling:
        saveurs.append(filling.flavor)
    if glaze:
        saveurs.append(glaze.flavor)
    for deco in decorations:
        saveurs.append(deco.flavor)
    
    # Si 3+ cartes ont la même saveur
    from collections import Counter
    saveur_count = Counter(saveurs)
    for saveur, count in saveur_count.items():
        if count >= 3:
            bonus += 0.15  # +15% pour 3 cartes de même saveur
    
    # --- SYNERGIES TECHNIQUES (combinaisons logiques) ---
    # Génoise + Mascarpone = +15%
    if (base.name == "Génoise" and cream.name == "Mascarpone"):
        bonus += 0.15
    
    # Pâte Feuilletée + Crème légère = +12%
    if (base.name == "Pâte Feuilletée" and cream.name == "Chantilly"):
        bonus += 0.12
    
    # --- SYNERGIES SIGNATURE (combinaisons spéciales rares) ---
    # Fraisier Royal
    if (
        base.name == "Génoise" and 
        cream.name == "Mascarpone" and 
        glaze and glaze.name == "Miroir" and
        any(d.name == "Fruits rouges" for d in decorations)
    ):
        bonus += 0.25  # +25% bonus spécial
    
    # Tarte Choco-Caramel Prestige
    if (
        (base.name == "Pâte sablée" or base.name == "Daquois") and
        glaze and glaze.name == "Caramel" and
        any(d.name == "Copeaux chocolat" for d in decorations) and
        any(d.name == "Or alimentaire" for d in decorations)
    ):
        bonus += 0.30  # +30% bonus spécial
    
    return bonus


def calculer_score_final(team):
    """
    Calcule le score FINAL en appliquant tous les bonus.
    
    Formule complète:
    Score Final = Score Brut × (1 + Bonus Synergies) × (1 + Bonus Tournoi)
    """
    
    # 1. Calcul du score brut
    score_brut = calculer_score_brut(team)
    
    # 2. Calcul du bonus synergies
    bonus_synergies = calculer_bonus_synergies(team)
    
    # 3. Bonus tournoi (pour l'instant on ignore, à ajouter plus tard)
    bonus_tournoi = 0.0
    
    # 4. Appliquer les bonus
    score_final = score_brut * (1 + bonus_synergies) * (1 + bonus_tournoi)
    
    # Arrondir à 2 décimales
    return round(score_final, 2)


def afficher_details_score(team):
    """
    Affiche les détails du calcul du score (utile pour déboguer).
    """
    score_brut = calculer_score_brut(team)
    bonus_synergies = calculer_bonus_synergies(team)
    score_final = calculer_score_final(team)
    
    print(f"🎂 Détails du gâteau '{team.name}':")
    print(f"   Score Brut: {score_brut:.2f}")
    print(f"   Bonus Synergies: +{bonus_synergies * 100:.1f}%")
    print(f"   Score Final: {score_final:.2f}")
    
    return {
        'score_brut': score_brut,
        'bonus_synergies': bonus_synergies,
        'score_final': score_final,
    }
