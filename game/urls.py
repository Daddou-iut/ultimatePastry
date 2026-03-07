"""
URL configuration for game project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from cards import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('cards.urls')),
    path('', views.login_view, name='login'),
    path('login.html', views.login_view, name='login-page'),
    path('game.html', views.game_view, name='game'),
    path('inventory.html', views.inventory_view, name='inventory'),
    path('teams.html', views.teams_view, name='teams'),
    path('matches.html', views.matches_view, name='matches'),
    path('packs.html', views.packs_view, name='packs'),
    path('marketplace.html', views.marketplace_view, name='marketplace'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)