import json
from django.core.management.base import BaseCommand
from cards.models import Card

class Command(BaseCommand):
    help = 'Load cards from JSON file'

    def handle(self, *args, **options):
        with open('cards/data/cards.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Charger toutes les cartes
        for family, cards in data.items():
            for card_data in cards:
                Card.objects.create(
                    name=card_data['name'],
                    family=card_data['family'],
                    rarity=card_data['rarity'],
                    level=card_data['level'],
                    flavor=card_data['flavor'],
                    gout=card_data['stats']['gout'],
                    technique=card_data['stats']['technique'],
                    esthetique=card_data['stats']['esthetique'],
                )
        
        self.stdout.write('Cards loaded successfully')