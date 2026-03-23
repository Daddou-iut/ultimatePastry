from rest_framework import status
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
from adrf.decorators import api_view    
from rest_framework.decorators import action, permission_classes, authentication_classes
from adrf import viewsets
from cards.utils import calculer_score_final, afficher_details_score
import random
from asgiref.sync import sync_to_async

MAX_INVENTORY_CARDS = 40

@api_view(['POST'])
@permission_classes([AllowAny])
async def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    
    if not username or not password or not email or not first_name or not last_name:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    if await User.objects.filter(username=username).aexists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = await sync_to_async(User.objects.create_user)(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
    
    player = await Player.objects.acreate(user=user)
    
    token = await Token.objects.acreate(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
async def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = await sync_to_async(authenticate)(username=username, password=password)
    
    if user is not None:
        token, created = await Token.objects.aget_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def get_inventory(request):
    if request.user.is_authenticated:
        player = await sync_to_async(lambda: request.user.player)()
        card_instances = [ci async for ci in CardInstance.objects.filter(owner=player).select_related('card')]
        serializer = CardInstanceSerializer(card_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

#teams

class TeamViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer

    async def list(self, request, *args, **kwargs):
        player = await sync_to_async(lambda: request.user.player)()
        qs = Team.objects.filter(owner=player).select_related(
            'owner', 'owner__user',
            'base', 'base__card',
            'filling', 'filling__card',
            'cream', 'cream__card',
            'glaze', 'glaze__card',
        ).prefetch_related('decorations', 'decorations__card')
        teams = [team async for team in qs]
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)

    async def create(self, request):
        serializer = TeamCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        player = await sync_to_async(lambda: request.user.player)()
        
        try:
            base = await CardInstance.objects.aget(id=serializer.validated_data['base_id'], owner=player)
            filling = await CardInstance.objects.aget(id=serializer.validated_data['filling_id'], owner=player)
            cream = None
            glaze = None
            
            if 'cream_id' in serializer.validated_data and serializer.validated_data['cream_id']:
                cream = await CardInstance.objects.aget(id=serializer.validated_data['cream_id'], owner=player)
            
            if 'glaze_id' in serializer.validated_data and serializer.validated_data['glaze_id']:
                glaze = await CardInstance.objects.aget(id=serializer.validated_data['glaze_id'], owner=player)
            
        except CardInstance.DoesNotExist:
            return Response({'error': 'Une ou plusieurs cartes n\'existent pas ou ne vous appartiennent pas'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        team = await Team.objects.acreate(
            name=serializer.validated_data['name'],
            owner=player,
            base=base,
            cream=cream,
            filling=filling,
            glaze=glaze
        )
        
        if 'decoration_ids' in serializer.validated_data:
            decoration_ids = serializer.validated_data['decoration_ids']
            if len(decoration_ids) > 3:
                await team.adelete()
                return Response({'error': 'Maximum 3 décorations'}, status=status.HTTP_400_BAD_REQUEST)
            
            for deco_id in decoration_ids:
                try:
                    deco = await CardInstance.objects.aget(id=deco_id, owner=player)
                    await team.decorations.aadd(deco)
                except CardInstance.DoesNotExist:
                    await team.adelete()
                    return Response({'error': f'Décoration {deco_id} n\'existe pas'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
        
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    async def score_details(self, request, pk=None):
        
        team = await sync_to_async(self.get_object)()
        details = await sync_to_async(afficher_details_score)(team)
        return Response(details)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def get_adversary_teams(request):

    current_player = await sync_to_async(lambda: request.user.player)()
    adversary_teams = [team async for team in Team.objects.exclude(owner=current_player).select_related(
        'owner', 'owner__user',
        'base', 'base__card',
        'filling', 'filling__card',
        'cream', 'cream__card',
        'glaze', 'glaze__card',
    ).prefetch_related('decorations', 'decorations__card')]
    serializer = TeamSerializer(adversary_teams, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


#matchs
class MatchViewSet(viewsets.ModelViewSet):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Match.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return MatchCreateSerializer
        return MatchSerializer

    async def list(self, request, *args, **kwargs):
        from django.db.models import Q
        player = await sync_to_async(lambda: request.user.player)()
        team_related = [
            'owner', 'owner__user',
            'base', 'base__card',
            'filling', 'filling__card',
            'cream', 'cream__card',
            'glaze', 'glaze__card',
        ]
        qs = Match.objects.filter(
            Q(teamP1__owner=player) | Q(teamP2__owner=player)
        ).select_related(
            *['teamP1__' + r for r in team_related],
            *['teamP2__' + r for r in team_related],
            *['winner__' + r for r in team_related],
        ).prefetch_related(
            'teamP1__decorations', 'teamP1__decorations__card',
            'teamP2__decorations', 'teamP2__decorations__card',
            'winner__decorations', 'winner__decorations__card',
        )
        matches = [m async for m in qs]
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    async def create(self, request):

        serializer = MatchCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
        _team_qs = Team.objects.select_related(
            'owner', 'base', 'base__card', 'filling', 'filling__card',
            'cream', 'cream__card', 'glaze', 'glaze__card',
        ).prefetch_related('decorations', 'decorations__card')
        try:
            team1 = await _team_qs.aget(id=serializer.validated_data['team1_id'])
            team2 = await _team_qs.aget(id=serializer.validated_data['team2_id'])
        except Team.DoesNotExist:
            return Response({'error': 'Un ou plusieurs gâteaux n\'existent pas'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        score1 = await sync_to_async(calculer_score_final)(team1)
        score2 = await sync_to_async(calculer_score_final)(team2)

        winner = team1 if score1 > score2 else team2
        loser = team2 if winner == team1 else team1
   
        MONEY_WIN = 100
        MONEY_LOSS = 50
        
        winner.owner.money += MONEY_WIN
        await winner.owner.asave()
        
        loser.owner.money -= MONEY_LOSS
        if loser.owner.money < 0:
            loser.owner.money = 0
        await loser.owner.asave()

        match = await Match.objects.acreate(
            teamP1=team1,
            teamP2=team2,
            score_player1=score1,
            score_player2=score2,
            winner=winner
        )
        _tr = ['owner', 'owner__user', 'base', 'base__card', 'filling', 'filling__card', 'cream', 'cream__card', 'glaze', 'glaze__card']
        match = await Match.objects.select_related(
            *['teamP1__' + r for r in _tr],
            *['teamP2__' + r for r in _tr],
            *['winner__' + r for r in _tr],
        ).prefetch_related(
            'teamP1__decorations', 'teamP1__decorations__card',
            'teamP2__decorations', 'teamP2__decorations__card',
            'winner__decorations', 'winner__decorations__card',
        ).aget(id=match.id)

        response_data = MatchSerializer(match).data
        response_data['money_won'] = MONEY_WIN if winner == team1 else -MONEY_LOSS
        response_data['money_lost'] = -MONEY_LOSS if loser == team1 else MONEY_WIN

        return Response(response_data, status=status.HTTP_201_CREATED)

#packs
class PackViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Pack.objects.all()
    serializer_class = PackSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    async def open(self, request, pk=None):

        pack = await sync_to_async(self.get_object)()
        player = await sync_to_async(lambda: request.user.player)()

        # Limite d'inventaire: maximum 40 cartes
        inventory_count = await CardInstance.objects.filter(owner=player).acount()
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
        
        if player.money < pack.cost:
            return Response(
                {'error': f'Vous n\'avez pas assez d\'argent. Coût: {pack.cost}, Argent: {player.money}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        player.money -= pack.cost
        await player.asave()
        
        cards_obtained = []

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
        
        for _ in range(pack.cards_count):
            rand = random.random()
            cumulative = 0
            rarity = 'common'
            
            for rar, prob in probabilities.items():
                cumulative += prob
                if rand < cumulative:
                    rarity = rar
                    break
            
            available_cards = [card async for card in Card.objects.filter(rarity=rarity)]
            if available_cards:
                card = random.choice(available_cards)
                card_instance = await CardInstance.objects.acreate(card=card, owner=player)
                cards_obtained.append(card_instance)
        
        serializer = PackOpenSerializer({
            'cards': cards_obtained,
            'message': f'Félicitations! Vous avez obtenu {len(cards_obtained)} cartes!'
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def merge_cards(request):

    player = await sync_to_async(lambda: request.user.player)()

    card_id_1 = request.data.get('card_instance_id_1')
    card_id_2 = request.data.get('card_instance_id_2')

    if not card_id_1 or not card_id_2:
        return Response(
            {'error': 'Vous devez fournir deux IDs de cartes'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        card_1 = await CardInstance.objects.select_related('card').aget(id=card_id_1, owner=player)
        card_2 = await CardInstance.objects.select_related('card').aget(id=card_id_2, owner=player)
    except CardInstance.DoesNotExist:
        return Response(
            {'error': 'Une ou plusieurs cartes n\'existent pas ou ne vous appartiennent pas'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if card_1.card.id != card_2.card.id:
        return Response(
            {'error': 'Vous ne pouvez fusionner que deux cartes identiques'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ── Calcul du nouveau niveau ──────────────────────────────
    new_level = card_1.level + card_2.level

    # ── Boost des stats : +10% par niveau au-dessus de 1 ─────
    # Exemple : niveau 2 → ×1.10, niveau 4 → ×1.30
    boost = 1 + (new_level - 1) * 0.10

    base_card = card_1.card
    card_1.level = new_level

    # On stocke les stats boostées directement sur la CardInstance
    # via des champs bonus (on les calcule et on les renvoie dans la réponse)
    boosted_gout       = round(base_card.gout       * boost)
    boosted_technique  = round(base_card.technique  * boost)
    boosted_esthetique = round(base_card.esthetique * boost)

    await card_1.asave()
    await card_2.adelete()

    serializer = CardInstanceSerializer(card_1)
    return Response(
        {
            'message': f'Fusion réussie ! Niveau {new_level} (+{round((boost - 1) * 100)}% de stats)',
            'merged_card': serializer.data,
            'stats_boostees': {
                'niveau':      new_level,
                'boost':       f'+{round((boost - 1) * 100)}%',
                'gout':        boosted_gout,
                'technique':   boosted_technique,
                'esthetique':  boosted_esthetique,
            }
        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def list_marketplace_listings(request):

    player = await sync_to_async(lambda: request.user.player)()
    _listing_related = ('card_instance', 'card_instance__card', 'seller', 'seller__user', 'buyer', 'buyer__user')
    listings = [listing async for listing in MarketplaceListing.objects.filter(status='active').exclude(seller=player).select_related(*_listing_related)]

    serializer = MarketplaceListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def list_own_marketplace_listings(request):

    player = await sync_to_async(lambda: request.user.player)()
    _listing_related = ('card_instance', 'card_instance__card', 'seller', 'seller__user', 'buyer', 'buyer__user')
    listings = [listing async for listing in MarketplaceListing.objects.filter(seller=player).select_related(*_listing_related)]
    
    serializer = MarketplaceListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
async def create_marketplace_listing(request):

    player = await sync_to_async(lambda: request.user.player)()
    
    serializer = MarketplaceListingCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    card_instance_id = serializer.validated_data['card_instance_id']
    price = serializer.validated_data['price']
    
    # Vérifier que la carte appartient au joueur
    try:
        card_instance = await CardInstance.objects.select_related('card').aget(id=card_instance_id, owner=player)
    except CardInstance.DoesNotExist:
        return Response(
            {'error': 'Cette carte n\'existe pas ou ne vous appartient pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier qu'il n'y a pas déjà une annonce active pour cette carte
    existing_listing = await MarketplaceListing.objects.filter(
        card_instance=card_instance,
        status='active'
    ).aexists()
    
    if existing_listing:
        return Response(
            {'error': 'Cette carte est déjà en vente'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que la carte n'est pas utilisée dans une équipe
    if (await card_instance.team_base.aexists() or 
        await card_instance.team_cream.aexists() or 
        await card_instance.team_filling.aexists() or 
        await card_instance.team_glaze.aexists() or 
        await card_instance.team_decorations.aexists()):
        return Response(
            {'error': 'Vous ne pouvez pas vendre une carte en cours d\'utilisation dans une équipe'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Créer l'annonce
    listing = await MarketplaceListing.objects.acreate(
        card_instance=card_instance,
        seller=player,
        price=price,
        status='active'
    )
    listing = await MarketplaceListing.objects.select_related(
        'card_instance', 'card_instance__card', 'seller', 'seller__user', 'buyer', 'buyer__user'
    ).aget(id=listing.id)

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
async def buy_marketplace_listing(request, listing_id):

    buyer = await sync_to_async(lambda: request.user.player)()

    # Limite d'inventaire: maximum 40 cartes
    inventory_count = await CardInstance.objects.filter(owner=buyer).acount()
    if inventory_count >= MAX_INVENTORY_CARDS:
        return Response(
            {'error': f'Inventaire plein ({MAX_INVENTORY_CARDS} cartes maximum). Fusionnez/vendez des cartes avant d\'acheter.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        listing = await MarketplaceListing.objects.select_related(
            'seller', 'card_instance', 'card_instance__card', 'buyer', 'buyer__user'
        ).aget(id=listing_id, status='active')
    except MarketplaceListing.DoesNotExist:
        return Response(
            {'error': 'Cette annonce n\'existe pas ou n\'est pas disponible'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if listing.seller == buyer:
        return Response(
            {'error': 'Vous ne pouvez pas acheter votre propre carte'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if buyer.money < listing.price:
        return Response(
            {'error': f'Vous n\'avez pas assez d\'argent. Vous en avez {buyer.money}, le prix est {listing.price}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    seller = listing.seller
    card_instance = listing.card_instance
    
    buyer.money -= listing.price
    await buyer.asave()

    seller.money += listing.price
    await seller.asave()
    
    card_instance.owner = buyer
    await card_instance.asave()
    
    listing.status = 'sold'
    listing.buyer = buyer
    await listing.asave()
    
    listing = await MarketplaceListing.objects.select_related(
        'card_instance', 'card_instance__card', 'seller', 'seller__user', 'buyer', 'buyer__user'
    ).aget(id=listing.id)
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
async def cancel_marketplace_listing(request, listing_id):
    seller = await sync_to_async(lambda: request.user.player)()
    
    try:
        listing = await MarketplaceListing.objects.aget(id=listing_id, seller=seller)
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
    
    listing.status = 'cancelled'
    await listing.asave()
    
    return Response(
        {
            'message': 'Annonce annulée avec succès',
            'listing_id': listing.id
        },
        status=status.HTTP_200_OK
    )

