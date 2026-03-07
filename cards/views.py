from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from cards.models import Card, Player, CardInstance
from cards.serializers import CardSerializer, PlayerSerializer, CardInstanceSerializer


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Player.objects.none()
        return Player.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def upload_picture(self, request):
        """Upload profile picture for the authenticated user's player"""
        try:
            # Get the player for the authenticated user
            player = Player.objects.get(user=request.user)
            
            if 'profile_picture' not in request.FILES:
                return Response(
                    {'error': 'No picture file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the profile picture
            player.profile_picture = request.FILES['profile_picture']
            player.save()
            
            # Return updated player data
            serializer = self.get_serializer(player)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def cheat_add_money(self, request):
        """Cheat code: Add 1000 coins to the player"""
        try:
            player = Player.objects.get(user=request.user)
            player.money += 1000
            player.save()
            
            serializer = self.get_serializer(player)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CardInstanceViewSet(viewsets.ModelViewSet):
    queryset = CardInstance.objects.all()
    serializer_class = CardInstanceSerializer


# Views pour servir les pages HTML
def login_view(request):
    return render(request, 'login.html')


def game_view(request):
    return render(request, 'game.html')


def inventory_view(request):
    return render(request, 'inventory.html')


def teams_view(request):
    return render(request, 'teams.html')


def matches_view(request):
    return render(request, 'matches.html')


def packs_view(request):
    return render(request, 'packs.html')


def marketplace_view(request):
    return render(request, 'marketplace.html')