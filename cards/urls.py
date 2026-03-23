from django.urls import path, include
from rest_framework.routers import DefaultRouter
from cards.views import CardViewSet, PlayerViewSet, CardInstanceViewSet
from cards.api_views import (
    register, login, get_inventory, get_adversary_teams, merge_cards,
    list_marketplace_listings, list_own_marketplace_listings,
    create_marketplace_listing, buy_marketplace_listing, cancel_marketplace_listing,
    TeamViewSet, MatchViewSet, PackViewSet
)

router = DefaultRouter()
router.register(r'cards', CardViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'card-instances', CardInstanceViewSet)
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'packs', PackViewSet, basename='pack')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('inventory/', get_inventory, name='inventory'),
    path('adversary-teams/', get_adversary_teams, name='adversary-teams'),
    path('merge-cards/', merge_cards, name='merge-cards'),
    path('marketplace/', list_marketplace_listings, name='list-marketplace'),
    path('marketplace/my-listings/', list_own_marketplace_listings, name='my-marketplace-listings'),
    path('marketplace/create/', create_marketplace_listing, name='create-marketplace-listing'),
    path('marketplace/buy/<int:listing_id>/', buy_marketplace_listing, name='buy-marketplace-listing'),
    path('marketplace/cancel/<int:listing_id>/', cancel_marketplace_listing, name='cancel-marketplace-listing'),
]