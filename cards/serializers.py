from rest_framework import serializers
from cards.models import Card, Player, CardInstance, Team, Match, Pack, MarketplaceListing
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'user', 'money', 'profile_picture', 'created_at']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'name', 'family', 'rarity', 'level', 'flavor', 'gout', 'technique', 'esthetique']

class CardInstanceSerializer(serializers.ModelSerializer):
    card = CardSerializer(read_only=True)
    gout        = serializers.SerializerMethodField()
    technique   = serializers.SerializerMethodField()
    esthetique  = serializers.SerializerMethodField()

    class Meta:
        model = CardInstance
        fields = ['id', 'card', 'owner', 'level', 'gout', 'technique', 'esthetique']

    def get_gout(self, obj):
        return obj.gout

    def get_technique(self, obj):
        return obj.technique

    def get_esthetique(self, obj):
        return obj.esthetique

class TeamSerializer(serializers.ModelSerializer):
    base = CardInstanceSerializer(read_only=True)
    cream = CardInstanceSerializer(read_only=True)
    filling = CardInstanceSerializer(read_only=True)
    glaze = CardInstanceSerializer(read_only=True)
    decorations = CardInstanceSerializer(many=True, read_only=True)
    owner = PlayerSerializer(read_only=True)
    score = serializers.SerializerMethodField()  # On va calculer le score
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'owner', 'base', 'cream', 'filling', 'glaze', 'decorations', 'score']
    
    def get_score(self, obj):
        from cards.utils import calculer_score_final
        try:
            return calculer_score_final(obj)
        except:
            return 0

class TeamCreateSerializer(serializers.ModelSerializer):
    base_id = serializers.IntegerField(write_only=True)
    filling_id = serializers.IntegerField(write_only=True)
    cream_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    glaze_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    decoration_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Team
        fields = ['name', 'base_id', 'filling_id', 'cream_id', 'glaze_id', 'decoration_ids']

class MatchSerializer(serializers.ModelSerializer):
    teamP1 = TeamSerializer(read_only=True)
    teamP2 = TeamSerializer(read_only=True)
    winner = TeamSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'teamP1', 'teamP2', 'score_player1', 'score_player2', 'winner', 'date']

class MatchCreateSerializer(serializers.ModelSerializer):

    team1_id = serializers.IntegerField(write_only=True)
    team2_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Match
        fields = ['team1_id', 'team2_id']


class PackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pack
        fields = ['id', 'level', 'cost', 'rarity_boost', 'cards_count']


class PackOpenSerializer(serializers.Serializer):

    cards = CardInstanceSerializer(many=True, read_only=True)
    message = serializers.CharField(read_only=True)


class MarketplaceListingSerializer(serializers.ModelSerializer):
    card_instance = CardInstanceSerializer(read_only=True)
    seller = PlayerSerializer(read_only=True)
    buyer = PlayerSerializer(read_only=True, allow_null=True)
    
    class Meta:
        model = MarketplaceListing
        fields = ['id', 'card_instance', 'seller', 'buyer', 'price', 'status', 'created_at']


class MarketplaceListingCreateSerializer(serializers.ModelSerializer):

    card_instance_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MarketplaceListing
        fields = ['card_instance_id', 'price']

