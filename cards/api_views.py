from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from cards.models import Card, Player, CardInstance, Team, Match, Pack, MarketplaceListing
from cards.serializers import (
    UserSerializer,
    CardInstanceSerializer,
    TeamSerializer, TeamCreateSerializer,
    MatchSerializer, MatchCreateSerializer,
    PackSerializer, PackOpenSerializer,
    MarketplaceListingSerializer, MarketplaceListingCreateSerializer
)
from cards.utils import calculer_score_final, afficher_details_score
import random

MAX_INVENTORY_CARDS = 40

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    
    # Vérifie que les champs ne sont pas vides
    if not username or not password or not email or not first_name or not last_name:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifie que l'utilisateur n'existe pas déjà
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Crée l'User
    user = User.objects.create_user(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
    
    # Crée le Player associé
    player = Player.objects.create(user=user)
    
    # Crée le Token
    token = Token.objects.create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Vérifie que les champs ne sont pas vides
    if not username or not password:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Authentifie l'utilisateur
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Crée le token s'il n'existe pas, sinon le récupère
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_inventory(request):
    if request.user.is_authenticated:
        player = request.user.player
        card_instances = CardInstance.objects.filter(owner=player)
        serializer = CardInstanceSerializer(card_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

#teams

class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les gâteaux (Teams).
    
    Endpoints disponibles:
    - GET /api/teams/ → Liste mes gâteaux
    - POST /api/teams/ → Créer un nouveau gâteau
    - GET /api/teams/{id}/ → Détails d'un gâteau
    - PUT /api/teams/{id}/ → Modifier un gâteau
    - DELETE /api/teams/{id}/ → Supprimer un gâteau
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Retourne seulement les gâteaux du joueur connecté
        return Team.objects.filter(owner=self.request.user.player)
    
    def get_serializer_class(self):
        # Pour CREATE, on utilise TeamCreateSerializer (avec les IDs)
        # Pour le reste, on utilise TeamSerializer (avec objets complets)
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer
    
    def create(self, request):
        """
        Créer un nouveau gâteau.
        
        Body JSON attendu:
        {
            "name": "Mon super gâteau",
            "base_id": 1,
            "filling_id": 2,
            "cream_id": 3,   (optionnel)
            "glaze_id": 4,    (optionnel)
            "decoration_ids": [5, 6]  (optionnel, max 3)
        }
        """
        serializer = TeamCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Récupérer le joueur
        player = request.user.player
        
        # Récupérer les cartes
        try:
            base = CardInstance.objects.get(id=serializer.validated_data['base_id'], owner=player)
            filling = CardInstance.objects.get(id=serializer.validated_data['filling_id'], owner=player)
            cream = None
            glaze = None
            
            if 'cream_id' in serializer.validated_data and serializer.validated_data['cream_id']:
                cream = CardInstance.objects.get(id=serializer.validated_data['cream_id'], owner=player)
            
            if 'glaze_id' in serializer.validated_data and serializer.validated_data['glaze_id']:
                glaze = CardInstance.objects.get(id=serializer.validated_data['glaze_id'], owner=player)
            
        except CardInstance.DoesNotExist:
            return Response({'error': 'Une ou plusieurs cartes n\'existent pas ou ne vous appartiennent pas'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le gâteau
        team = Team.objects.create(
            name=serializer.validated_data['name'],
            owner=player,
            base=base,
            cream=cream,
            filling=filling,
            glaze=glaze
        )
        
        # Ajouter les décorations
        if 'decoration_ids' in serializer.validated_data:
            decoration_ids = serializer.validated_data['decoration_ids']
            if len(decoration_ids) > 3:
                team.delete()
                return Response({'error': 'Maximum 3 décorations'}, status=status.HTTP_400_BAD_REQUEST)
            
            for deco_id in decoration_ids:
                try:
                    deco = CardInstance.objects.get(id=deco_id, owner=player)
                    team.decorations.add(deco)
                except CardInstance.DoesNotExist:
                    team.delete()
                    return Response({'error': f'Décoration {deco_id} n\'existe pas'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
        
        # Retourner le gâteau créé avec son score
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def score_details(self, request, pk=None):
        """
        Endpoint custom pour avoir les détails du score.
        
        GET /api/teams/{id}/score_details/
        
        Retourne:
        {
            "score_brut": 120.50,
            "bonus_synergies": 0.25,
            "score_final": 150.63
        }
        """
        team = self.get_object()
        details = afficher_details_score(team)
        return Response(details)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_adversary_teams(request):
    """
    Retourne tous les gâteaux créés par les autres joueurs (pas le joueur connecté).
    """
    current_player = request.user.player
    adversary_teams = Team.objects.exclude(owner=current_player)
    serializer = TeamSerializer(adversary_teams, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


#matchs
class MatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les matchs.
    
    Endpoints disponibles:
    - GET /api/matches/ → Liste mes matchs
    - POST /api/matches/ → Lancer un nouveau match
    - GET /api/matches/{id}/ → Détails d'un match
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Retourne les matchs où le joueur connecté est impliqué
        player = self.request.user.player
        return Match.objects.filter(
            teamP1__owner=player
        ) | Match.objects.filter(
            teamP2__owner=player
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MatchCreateSerializer
        return MatchSerializer
    
    def create(self, request):
        """
        Lancer un nouveau match.
        
        Body JSON attendu:
        {
            "team1_id": 1,  (mon gâteau)
            "team2_id": 5   (gâteau adverse)
        }
        """
        serializer = MatchCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Récupérer les gâteaux
        try:
            team1 = Team.objects.get(id=serializer.validated_data['team1_id'])
            team2 = Team.objects.get(id=serializer.validated_data['team2_id'])
        except Team.DoesNotExist:
            return Response({'error': 'Un ou plusieurs gâteaux n\'existent pas'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Calculer les scores
        score1 = calculer_score_final(team1)
        score2 = calculer_score_final(team2)
        
        # Déterminer le gagnant
        winner = team1 if score1 > score2 else team2
        loser = team2 if winner == team1 else team1
        
        # Gérer les gains/pertes d'argent
        MONEY_WIN = 100
        MONEY_LOSS = 50
        
        winner.owner.money += MONEY_WIN
        winner.owner.save()
        
        loser.owner.money -= MONEY_LOSS
        if loser.owner.money < 0:
            loser.owner.money = 0
        loser.owner.save()
        
        # Créer le match
        match = Match.objects.create(
            teamP1=team1,
            teamP2=team2,
            score_player1=score1,
            score_player2=score2,
            winner=winner
        )
        
        # Retourner le résultat avec les montants gagnés/perdus
        response_data = MatchSerializer(match).data
        response_data['money_won'] = MONEY_WIN if winner == team1 else -MONEY_LOSS
        response_data['money_lost'] = -MONEY_LOSS if loser == team1 else MONEY_WIN
        
        return Response(response_data, status=status.HTTP_201_CREATED)

#packs
class PackViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour gérer les packs.
    
    Endpoints disponibles:
    - GET /api/packs/ → Liste des packs disponibles
    - GET /api/packs/{id}/ → Détails d'un pack
    - POST /api/packs/{id}/open/ → Ouvrir un pack
    """
    queryset = Pack.objects.all()
    serializer_class = PackSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def open(self, request, pk=None):
        """
        Ouvrir un pack et recevoir des cartes aléatoires.
        
        POST /api/packs/{id}/open/
        
        Retourne:
        {
            "cards": [...],  // Les cartes obtenues
            "message": "Vous avez obtenu 5 cartes!"
        }
        """
        pack = self.get_object()
        player = request.user.player

        # Limite d'inventaire: maximum 40 cartes
        inventory_count = CardInstance.objects.filter(owner=player).count()
        available_slots = MAX_INVENTORY_CARDS - inventory_count
        if available_slots <= 0:
            return Response(
                {'error': f'Inventaire plein ({MAX_INVENTORY_CARDS} cartes maximum). Fusionnez/vendez des cartes avant d\'ouvrir un pack.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pack.cards_count > available_slots:
            return Response(
                {'error': f'Pas assez de place dans l\'inventaire. Places restantes: {available_slots}, cartes dans le pack: {pack.cards_count}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Vérifier que le joueur a assez d'argent
        if player.money < pack.cost:
            return Response(
                {'error': f'Vous n\'avez pas assez d\'argent. Coût: {pack.cost}, Argent: {player.money}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 💰 Déduire l'argent
        player.money -= pack.cost
        player.save()
        
        # 🎰 Générer des cartes aléatoires
        cards_obtained = []
        
        # Probabilités selon la rareté du pack
        rarity_probabilities = {
            'bronze': {
                'common': 0.80,
                'uncommon': 0.15,
                'rare': 0.04,
                'epic': 0.01
            },
            'silver': {
                'common': 0.50,
                'uncommon': 0.30,
                'rare': 0.15,
                'epic': 0.05
            },
            'gold': {
                'common': 0.25,
                'uncommon': 0.30,
                'rare': 0.35,
                'epic': 0.10
            }
        }
        
        probabilities = rarity_probabilities.get(pack.level, rarity_probabilities['bronze'])
        
        # Générer les cartes
        for _ in range(pack.cards_count):
            # Choisir la rareté aléatoirement selon les probabilités
            rand = random.random()
            cumulative = 0
            rarity = 'common'
            
            for rar, prob in probabilities.items():
                cumulative += prob
                if rand < cumulative:
                    rarity = rar
                    break
            
            # Chercher une carte avec cette rareté
            available_cards = Card.objects.filter(rarity=rarity)
            if available_cards.exists():
                card = random.choice(available_cards)
                card_instance = CardInstance.objects.create(card=card, owner=player)
                cards_obtained.append(card_instance)
        
        # Retourner les cartes
        serializer = PackOpenSerializer({
            'cards': cards_obtained,
            'message': f'Félicitations! Vous avez obtenu {len(cards_obtained)} cartes!'
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)


# Merge cards functionality
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def merge_cards(request):
    """
    Fusionne deux instances de la même carte pour obtenir une carte avec le double du niveau.
    
    Body JSON attendu:
    {
        "card_instance_id_1": 1,
        "card_instance_id_2": 2
    }
    
    Retourne la carte fusionnée avec le niveau doublé.
    """
    player = request.user.player
    
    # Récupérer les IDs des deux cartes
    card_id_1 = request.data.get('card_instance_id_1')
    card_id_2 = request.data.get('card_instance_id_2')
    
    if not card_id_1 or not card_id_2:
        return Response(
            {'error': 'Vous devez fournir deux IDs de cartes'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Récupérer les deux cartes
        card_1 = CardInstance.objects.get(id=card_id_1, owner=player)
        card_2 = CardInstance.objects.get(id=card_id_2, owner=player)
        
    except CardInstance.DoesNotExist:
        return Response(
            {'error': 'Une ou plusieurs cartes n\'existent pas ou ne vous appartiennent pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que c'est la même carte
    if card_1.card.id != card_2.card.id:
        return Response(
            {'error': 'Vous ne pouvez fusionner que deux cartes identiques'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Fusionner les cartes
    # La card_1 garde le niveau doublé
    card_1.level = card_1.level + card_2.level
    card_1.save()
    
    # Supprimer la card_2
    card_2.delete()
    
    # Retourner la carte fusionnée
    serializer = CardInstanceSerializer(card_1)
    return Response(
        {
            'message': f'Cartes fusionnées avec succès! Niveau: {card_1.level}',
            'merged_card': serializer.data
        },
        status=status.HTTP_200_OK
    )


# Marketplace functionality
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_marketplace_listings(request):
    """
    Liste toutes les annonces actives de la marketplace.
    Chaque joueur peut voir les cartes des autres en vente.
    """
    # Récupérer toutes les annonces actives (pas les cartes du joueur connecté)
    listings = MarketplaceListing.objects.filter(status='active').exclude(seller=request.user.player)
    
    serializer = MarketplaceListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_own_marketplace_listings(request):
    """
    Liste les annonces du joueur connecté (ses ventes en cours ou terminées).
    """
    player = request.user.player
    listings = MarketplaceListing.objects.filter(seller=player)
    
    serializer = MarketplaceListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_marketplace_listing(request):
    """
    Crée une nouvelle annonce de vente pour une carte.
    
    Body JSON attendu:
    {
        "card_instance_id": 1,
        "price": 500
    }
    """
    player = request.user.player
    
    serializer = MarketplaceListingCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    card_instance_id = serializer.validated_data['card_instance_id']
    price = serializer.validated_data['price']
    
    # Vérifier que la carte appartient au joueur
    try:
        card_instance = CardInstance.objects.get(id=card_instance_id, owner=player)
    except CardInstance.DoesNotExist:
        return Response(
            {'error': 'Cette carte n\'existe pas ou ne vous appartient pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier qu'il n'y a pas déjà une annonce active pour cette carte
    existing_listing = MarketplaceListing.objects.filter(
        card_instance=card_instance,
        status='active'
    ).exists()
    
    if existing_listing:
        return Response(
            {'error': 'Cette carte est déjà en vente'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que la carte n'est pas utilisée dans une équipe
    if (card_instance.team_base.exists() or 
        card_instance.team_cream.exists() or 
        card_instance.team_filling.exists() or 
        card_instance.team_glaze.exists() or 
        card_instance.team_decorations.exists()):
        return Response(
            {'error': 'Vous ne pouvez pas vendre une carte en cours d\'utilisation dans une équipe'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Créer l'annonce
    listing = MarketplaceListing.objects.create(
        card_instance=card_instance,
        seller=player,
        price=price,
        status='active'
    )
    
    serializer = MarketplaceListingSerializer(listing)
    return Response(
        {
            'message': f'{card_instance.card.name} mis en vente pour {price} coins',
            'listing': serializer.data
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def buy_marketplace_listing(request, listing_id):
    """
    Achète une carte de la marketplace.
    """
    buyer = request.user.player

    # Limite d'inventaire: maximum 40 cartes
    inventory_count = CardInstance.objects.filter(owner=buyer).count()
    if inventory_count >= MAX_INVENTORY_CARDS:
        return Response(
            {'error': f'Inventaire plein ({MAX_INVENTORY_CARDS} cartes maximum). Fusionnez/vendez des cartes avant d\'acheter.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        listing = MarketplaceListing.objects.get(id=listing_id, status='active')
    except MarketplaceListing.DoesNotExist:
        return Response(
            {'error': 'Cette annonce n\'existe pas ou n\'est pas disponible'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que c'est un autre joueur
    if listing.seller == buyer:
        return Response(
            {'error': 'Vous ne pouvez pas acheter votre propre carte'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que l'acheteur a assez d'argent
    if buyer.money < listing.price:
        return Response(
            {'error': f'Vous n\'avez pas assez d\'argent. Vous en avez {buyer.money}, le prix est {listing.price}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Transférer la carte
    seller = listing.seller
    card_instance = listing.card_instance
    
    # Déduire l'argent de l'acheteur
    buyer.money -= listing.price
    buyer.save()
    
    # Ajouter l'argent au vendeur (on peut aussi prendre une commission)
    seller.money += listing.price
    seller.save()
    
    # Transférer la propriété de la carte
    card_instance.owner = buyer
    card_instance.save()
    
    # Marquer l'annonce comme vendue
    listing.status = 'sold'
    listing.buyer = buyer
    listing.save()
    
    serializer = MarketplaceListingSerializer(listing)
    return Response(
        {
            'message': f'Carte achetée avec succès! Vous avez dépensé {listing.price} coins',
            'listing': serializer.data
        },
        status=status.HTTP_200_OK
    )


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def cancel_marketplace_listing(request, listing_id):
    """
    Annule/supprime une annonce de vente.
    Seul le vendeur peut annuler son annonce.
    """
    seller = request.user.player
    
    try:
        listing = MarketplaceListing.objects.get(id=listing_id, seller=seller)
    except MarketplaceListing.DoesNotExist:
        return Response(
            {'error': 'Cette annonce n\'existe pas ou ne vous appartient pas'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if listing.status != 'active':
        return Response(
            {'error': f'Vous ne pouvez annuler que les annonces actives (statut: {listing.status})'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Annuler l'annonce
    listing.status = 'cancelled'
    listing.save()
    
    return Response(
        {
            'message': 'Annonce annulée avec succès',
            'listing_id': listing.id
        },
        status=status.HTTP_200_OK
    )

