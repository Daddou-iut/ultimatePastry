from django.db import models

# Create your models here.
from django.db import models
from django.forms import ValidationError
from django.contrib.auth.models import User

class Card(models.Model):
    FAMILY_CHOICES = [
        ('base', 'Base'),
        ('cream', 'Crème'),
        ('filling', 'Fourrage'),
        ('glaze', 'Glaçage'),
        ('decoration', 'Décoration'),
    ]
    
    RARITY_CHOICES = [
        # val stockée dans la bdd, valeur affichée dans l'interface d'administration
        ('common', 'Commun'),
        ('uncommon', 'Peu commun'),
        ('rare', 'Rare'),
        ('epic', 'Épique'),
    ]
    
    name = models.CharField(max_length=100)
    family = models.CharField(max_length=20, choices=FAMILY_CHOICES)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES)
    level = models.IntegerField(default=1)
    flavor = models.CharField(max_length=50)
    
    gout = models.IntegerField()
    technique = models.IntegerField()
    esthetique = models.IntegerField()
    
    def __str__(self):
        return self.name

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    money = models.IntegerField(default=1000)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username
     
class CardInstance(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    owner = models.ForeignKey(Player, on_delete=models.CASCADE)
    level = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.card.name} (lvl {self.level}) owned by {self.owner.user.username}"
    
class Team(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(Player, on_delete=models.CASCADE)

    def clean(self):
        if self.base.card.family != 'base':
            raise ValidationError('La carte de base doit être de la famille "base".')
        if self.cream and self.cream.card.family != 'cream':
            raise ValidationError('La carte de crème doit être de la famille "cream".')
        if not self.filling:
            raise ValidationError('Le fourrage est obligatoire.')
        if self.filling.card.family != 'filling':
            raise ValidationError('La carte de fourrage doit être de la famille "filling".')
        if self.glaze and self.glaze.card.family != 'glaze':
            raise ValidationError('La carte de glaçage doit être de la famille "glaze".')
        for decoration in self.decorations.all():
            if decoration.card.family != 'decoration':
                raise ValidationError('Toutes les cartes de décoration doivent être de la famille "decoration".')
        if self.decorations.count() > 3:
            raise ValidationError("Maximum 3 décorations")
    base = models.ForeignKey(CardInstance, on_delete=models.CASCADE, related_name='team_base')
    cream = models.ForeignKey(CardInstance, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_cream')
    filling = models.ForeignKey(CardInstance, on_delete=models.SET_NULL, null=True, related_name='team_filling', blank=True)
    glaze = models.ForeignKey(CardInstance, on_delete=models.SET_NULL, null=True, related_name='team_glaze', blank=True)

    decorations = models.ManyToManyField(CardInstance, related_name='team_decorations')
    def __str__(self):
        return self.name
    
class Match(models.Model):
    teamP1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_player1')
    teamP2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_player2')
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    winner = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teamP1.name} vs {self.teamP2.name} on {self.date.strftime('%Y-%m-%d %H:%M:%S')}"
    

class Tournament(models.Model):
    BONUS_CHOICES = [
        ('classique', 'Duel classique'),
        ('technique', 'Technique'),
        ('thematique', 'Thématique'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    bonus_type = models.CharField(max_length=20, choices=BONUS_CHOICES, default='classique')
    
    # Multiplicateurs
    gout_multiplier = models.FloatField(default=1.0)
    technique_multiplier = models.FloatField(default=1.0)
    esthetique_multiplier = models.FloatField(default=1.0)
    
    # Bonus additionnels
    bonus_percentage = models.FloatField(default=0.0)  # exemple : 10 pour 10%
    
    def __str__(self):
        return self.name
    
class MarketplaceListing(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('cancelled', 'Cancelled'),
    ]
    
    card_instance = models.ForeignKey(CardInstance, on_delete=models.CASCADE)
    seller = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sold_listings')
    buyer = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_listings')
    price = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card_instance.card.name} listed by {self.seller.user.username} for {self.price} coins"
    

class Pack(models.Model):
    LEVEL_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
    ]
    
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    cost = models.IntegerField()  # prix en argent du jeu
    rarity_boost = models.CharField(max_length=20)  # exemple : "rare", "uncommon"
    cards_count = models.IntegerField(default=5)  # nombre de cartes dans le pack
    
    def __str__(self):
        return f"{self.level.capitalize()} Pack - {self.cost} coins"