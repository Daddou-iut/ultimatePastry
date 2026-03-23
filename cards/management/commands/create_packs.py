from django.core.management.base import BaseCommand
from cards.models import Pack

class Command(BaseCommand):
    help = 'Crée les packs par défaut'

    def handle(self, *args, **options):
        packs = [
            {
                'level': 'bronze',
                'cost': 100,
                'rarity_boost': 'common',
                'cards_count': 3
            },
            {
                'level': 'silver',
                'cost': 250,
                'rarity_boost': 'uncommon',
                'cards_count': 5
            },
            {
                'level': 'gold',
                'cost': 500,
                'rarity_boost': 'rare',
                'cards_count': 8
            }
        ]
        
        for pack_data in packs:
            pack, created = Pack.objects.get_or_create(
                level=pack_data['level'],
                defaults={
                    'cost': pack_data['cost'],
                    'rarity_boost': pack_data['rarity_boost'],
                    'cards_count': pack_data['cards_count']
                }
            )
            if created:
                self.stdout.write(f"OK Pack {pack.level.upper()} créé")
            else:
                self.stdout.write(f"OK Pack {pack.level.upper()} existe déjà")
