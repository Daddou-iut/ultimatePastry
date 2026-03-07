# 🎂 Ultimate Pâtisserie - Game Logic

## 📖 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Structure des données](#structure-des-données)
3. [Calcul des scores](#calcul-des-scores)
4. [Système de synergies](#système-de-synergies)
5. [Comment utiliser les fonctions](#comment-utiliser-les-fonctions)

---

## Vue d'ensemble

Ultimate Pâtisserie est un jeu de stratégie où :
- **Les joueurs créent des gâteaux** en combinant des cartes (ingrédients)
- **Les gâteaux s'affrontent** dans des matchs
- **Le gâteau avec le meilleur score gagne**

---

## Structure des données

### 📊 Les modèles Django

#### **Card (Ingrédient)**
```
- nom : "Génoise", "Mascarpone", etc.
- famille : Base, Crème, Fourrage, Glaçage, Décoration
- rareté : Commun, Rare, Épique, Légendaire
- saveur : Chocolat, Fruité, Vanille, etc.
- niveau : 1 à 10
- stats :
  - gout : 10-50
  - technique : 10-50
  - esthetique : 10-50
```

#### **Team (Gâteau)**
```
- nom : "Mon super gâteau"
- propriétaire : 1 joueur
- composition :
  - 1 Base (obligatoire)
  - 1 Fourrage (obligatoire)
  - 1 Crème (optionnel)
  - 1 Glaçage (optionnel)
  - 1-3 Décorations (optionnel)
```

#### **Match**
```
- gâteau joueur 1 vs gâteau joueur 2
- score joueur 1
- score joueur 2
- gagnant
- date
```

#### **Tournament**
```
- nom : "Semaine du Glaçage", etc.
- bonus_type : Classique, Technique, Thématique
- multiplicateurs : pour Goût, Technique, Esthétique
- bonus_percentage : bonus additionnel
```

---

## Calcul des scores

### 🧮 Formule générale

```
Score Final = Score Brut × (1 + Bonus Synergies) × (1 + Bonus Tournoi)
```

### 1️⃣ Score Brut (Étape 1)

**Formule :**
```
Score Brut = (Somme Goûts × 1.5) + (Somme Techniques × 1.0) + (Somme Esthétiques × 1.0)
```

**Explication simple :**
- On additionne tous les **Goûts** du gâteau, puis on les multiplie par 1.5
- On additionne tous les **Techniques** du gâteau
- On additionne tous les **Esthétiques** du gâteau
- On ajoute tout ensemble

**Exemple :**
```
Gâteau: Génoise (20 goût, 15 tech, 10 esth) + Mascarpone (18 goût, 18 tech, 20 esth)

Goûts: (20 + 18) × 1.5 = 57
Techniques: 15 + 18 = 33
Esthétiques: 10 + 20 = 30

Score Brut = 57 + 33 + 30 = 120
```

### 2️⃣ Bonus Synergies (Étape 2)

Les synergies donnent des **bonus supplémentaires** quand les ingrédients se marient bien.

**Types de synergies :**

#### A) Synergies de Saveur
- Si 3+ cartes ont la **même saveur** → +15%
- Exemples : 3 cartes Chocolat, 3 cartes Fruité

#### B) Synergies Techniques
- Si certaines combinaisons "logiques" → bonus
- Exemples :
  - Génoise + Mascarpone → +15%
  - Pâte Feuilletée + Chantilly → +12%

#### C) Synergies Signature (rares et puissantes)
- Combinaisons spécifiques donnent **gros bonus**
- Exemples :
  - **Fraisier Royal** : Génoise + Mascarpone + Miroir + Fruits Rouges → +25%
  - **Tarte Choco-Caramel** : Pâte Sablée + Caramel + Chocolat + Or → +30%

**Le bonus est retourné en décimal :** 
- 0.15 = +15%
- 0.25 = +25%

**Exemple :**
```
Gâteau: Génoise + Mascarpone + Miroir + Fruits Rouges
Bonus détectés:
  - Génoise + Mascarpone = +15%
  - Fraisier Royal spécial = +25%
Bonus total = 0.15 + 0.25 = 0.40 (+40%)
```

### 3️⃣ Bonus Tournoi (À améliorer)

**Chaque semaine, un tournoi active des bonus spéciaux :**

**Exemple : Semaine du Glaçage**
```
- Esthétique ×2 (compte double)
- Glaçage Rare +10%
```

**Comment ça marche :**
1. Calculer le score brut **avec les multiplicateurs du tournoi**
2. Ajouter les bonus rareté (cartes Légendaires +20%, Épiques +10%, etc.)
3. Retourner le bonus final

---

## Système de synergies

### 📋 Synergies actuelles

#### Saveur (3+ cartes identiques)
| Saveur | Bonus |
|--------|-------|
| Chocolat | +15% |
| Fruité | +15% |
| Vanille | +15% |
| Caramel | +15% |

#### Techniques (combinaisons logiques)
| Combinaison | Bonus |
|-------------|-------|
| Génoise + Mascarpone | +15% |
| Pâte Feuilletée + Chantilly | +12% |
| Pâte Sablée + Crème Pâtissière | +10% |

#### Signature (spéciales rares)
| Combo | Cartes | Bonus |
|------|--------|-------|
| **Fraisier Royal** | Génoise + Mascarpone + Miroir + Fruits Rouges | +25% |
| **Tarte Choco-Caramel** | Pâte Sablée + Caramel + Chocolat + Or | +30% |

### 🔧 Comment ajouter des synergies

Pour ajouter une nouvelle synergie, c'est simple :
1. Ouvrir `cards/utils.py`
2. Aller dans la fonction `calculer_bonus_synergies()`
3. Ajouter une condition `if` pour la nouvelle combo
4. Ajouter le bonus à la variable `bonus`

Exemple :
```python
# Chocolat + Noisette = +18%
if (base.flavor == "Chocolat" and cream.flavor == "Noisette"):
    bonus += 0.18
```

---

## Comment utiliser les fonctions

### 📌 Les 4 fonctions principales

Toutes les fonctions sont dans `cards/utils.py`

#### 1. `calculer_score_brut(team)`
```python
from cards.utils import calculer_score_brut

mon_gateau = Team.objects.get(id=1)
score_brut = calculer_score_brut(mon_gateau)
# Retourne: 120.50 (exemple)
```

**Que fait elle :**
- Additionne les stats de toutes les cartes
- Applique les multiplicateurs (Goût ×1.5)
- Retourne un nombre

#### 2. `calculer_bonus_synergies(team)`
```python
from cards.utils import calculer_bonus_synergies

mon_gateau = Team.objects.get(id=1)
bonus = calculer_bonus_synergies(mon_gateau)
# Retourne: 0.25 (exemple = +25%)
```

**Que fait elle :**
- Vérifie les synergies activées
- Additionne tous les bonus
- Retourne le pourcentage total (0 à 1.5)

#### 3. `calculer_score_final(team)`
```python
from cards.utils import calculer_score_final

mon_gateau = Team.objects.get(id=1)
score = calculer_score_final(mon_gateau)
# Retourne: 150.60 (exemple)
```

**Que fait elle :**
- Appelle score_brut
- Appelle bonus_synergies
- Les combine : Score Brut × (1 + bonus)
- Retourne le score FINAL

#### 4. `afficher_details_score(team)`
```python
from cards.utils import afficher_details_score

mon_gateau = Team.objects.get(id=1)
details = afficher_details_score(mon_gateau)

# Affiche:
# 🎂 Détails du gâteau 'Mon super gâteau':
#    Score Brut: 120.50
#    Bonus Synergies: +25.0%
#    Score Final: 150.63
```

**Que fait elle :**
- Affiche tous les détails du calcul
- Utile pour déboguer
- Retourne un dictionnaire avec tous les scores

---

## Exemple complet

### Scénario
**Créer un gâteau et voir son score :**

```python
from cards.utils import calculer_score_final, afficher_details_score
from cards.models import Team, CardInstance, Card, Player

# 1. Récupérer un joueur
joueur = Player.objects.get(id=1)

# 2. Récupérer les cartes
base = CardInstance.objects.filter(card__family='base', owner=joueur).first()
cream = CardInstance.objects.filter(card__family='cream', owner=joueur).first()
glaze = CardInstance.objects.filter(card__family='glaze', owner=joueur).first()
deco = CardInstance.objects.filter(card__family='decoration', owner=joueur).first()

# 3. Créer un gâteau
gateau = Team.objects.create(
    name="Mon Fraisier Royal",
    owner=joueur,
    base=base,
    cream=cream,
    glaze=glaze
)
gateau.decorations.add(deco)

# 4. Calculer le score
score_final = calculer_score_final(gateau)
print(f"Score: {score_final}")  # Output: 150.63

# 5. Voir les détails
details = afficher_details_score(gateau)
# Output:
# 🎂 Détails du gâteau 'Mon Fraisier Royal':
#    Score Brut: 120.50
#    Bonus Synergies: +25.0%
#    Score Final: 150.63
```

---

## 🚀 Prochaines étapes

1. **Créer les API endpoints** pour que le frontend puisse :
   - Récupérer les cartes
   - Créer un gâteau
   - Voir le score

2. **Créer le système de matchs** :
   - Comparer 2 gâteaux
   - Déterminer le gagnant
   - Enregistrer le résultat

3. **Ajouter les tournois** :
   - Appliquer les bonus du tournoi
   - Gérer les bonus rareté

4. **Créer le marketplace** :
   - Vendre des cartes
   - Acheter des cartes
   - Fusionner des cartes

---

## 📝 Notes importantes

- **Les synergies s'additionnent** : si 2 synergies s'activent, c'est +15% + +15% = +30%
- **Le score est arrondi** à 2 décimales
- **Les cartes optionnelles** (fourrage, glaçage) peuvent ne pas exister
- **Chaque jour nouvelle synergies peuvent être ajoutées**

---

**Créé le:** 27/02/2026
**Version:** 1.0
**Auteur:** Game Development Team
