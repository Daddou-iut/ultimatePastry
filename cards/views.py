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
        try:
            player = Player.objects.get(user=request.user)
            if 'profile_picture' not in request.FILES:
                return Response({'error': 'No picture file provided'}, status=status.HTTP_400_BAD_REQUEST)
            player.profile_picture = request.FILES['profile_picture']
            player.save()
            return Response(self.get_serializer(player).data, status=status.HTTP_200_OK)
        except Player.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def cheat_add_money(self, request):
        try:
            player = Player.objects.get(user=request.user)
            player.money += 1000
            player.save()
            return Response(self.get_serializer(player).data, status=status.HTTP_200_OK)
        except Player.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CardInstanceViewSet(viewsets.ModelViewSet):
    queryset = CardInstance.objects.all()
    serializer_class = CardInstanceSerializer