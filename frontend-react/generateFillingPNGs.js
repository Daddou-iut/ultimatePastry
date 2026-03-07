/**
 * Script de génération de toutes les combinaisons fourrage × saveur en PNG
 * Usage: node generateFillingPNGs.js
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Toutes les saveurs disponibles
const FLAVORS = [
  'caramel', 'strawberry', 'chocolate', 'pistachio', 'vanilla',
  'lemon', 'blueberry', 'raspberry', 'cherry', 'butter',
  'cream', 'fruit', 'nut', 'coffee', 'almond',
  'hazelnut', 'fig', 'apple', 'neutral'
];

const flavorsColors = {
  caramel: { top: '#d97706', bottom: '#92400e' },
  strawberry: { top: '#fb7185', bottom: '#be123c' },
  chocolate: { top: '#634832', bottom: '#3e2723' },
  pistachio: { top: '#a3e635', bottom: '#4d7c0f' },
  vanilla: { top: '#fffbeb', bottom: '#fef3c7' },
  lemon: { top: '#fef08a', bottom: '#facc15' },
  blueberry: { top: '#6366f1', bottom: '#312e81' },
  raspberry: { top: '#e11d48', bottom: '#881337' },
  cherry: { top: '#991b1b', bottom: '#450a0a' },
  butter: { top: '#fef3d7', bottom: '#fef08a' },
  cream: { top: '#f3f4f6', bottom: '#e5e7eb' },
  fruit: { top: '#f472b6', bottom: '#ec4899' },
  nut: { top: '#d4a373', bottom: '#92582a' },
  coffee: { top: '#78360f', bottom: '#451a03' },
  almond: { top: '#d2b48c', bottom: '#a0826d' },
  hazelnut: { top: '#b5851f', bottom: '#78491f' },
  neutral: { top: '#e5e7eb', bottom: '#d1d5db' },
  fig: { top: '#c084fc', bottom: '#7e22ce' },
  apple: { top: '#d0e590b7', bottom: '#65161d' }
};

function getFlavorVisual(flavor) {
  const key = (flavor || 'neutral').toLowerCase();
  return {
    colors: flavorsColors[key] || flavorsColors.neutral
  };
}

function renderFilling(card) {
  const { colors } = getFlavorVisual(card.flavor);
  const uid = card.id || Math.floor(Math.random() * 100000);
  const gradId = `fillingGrad-${uid}`;

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}"/>
          <stop offset="100%" stop-color="${colors.bottom}"/>
        </linearGradient>
      </defs>
      
      <ellipse cx="100" cy="118" rx="58" ry="9" fill="url(#${gradId})" stroke="transparent" stroke-width="2"/>
      <rect x="42" y="110" width="116" height="8" fill="${colors.bottom}"/>
      <ellipse cx="100" cy="110" rx="58" ry="9" fill="url(#${gradId})"/>
      
      <g fill="${colors.bottom}" opacity="0.55">
        <circle cx="75" cy="106" r="1"/>
        <circle cx="90" cy="109" r="1.2"/>
        <circle cx="105" cy="105" r="1"/>
        <circle cx="120" cy="108" r="1"/>
        <circle cx="130" cy="111" r="0.9"/>
      </g>
      
      <ellipse cx="70" cy="110" rx="28" ry="8" fill="${colors.bottom}" opacity="0.45"/>
      <ellipse cx="130" cy="110" rx="22" ry="6" fill="${colors.bottom}" opacity="0.35"/>
    </svg>
  `;
}

function generateFillingSVG(flavor) {
  const card = {
    id: Math.floor(Math.random() * 100000),
    name: `Fourrage ${flavor}`,
    flavor: flavor,
    family: 'filling'
  };

  return renderFilling(card);
}

async function generateAllFillingPNGs() {
  const outputDir = path.join(__dirname, 'generated_fillings');
  
  // Créer le dossier de sortie
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`✅ Dossier créé: ${outputDir}`);
  } catch (error) {
    console.error('Erreur création dossier:', error);
    return;
  }

  let count = 0;
  const total = FLAVORS.length;

  console.log(`🎨 Génération de ${total} images PNG de fourrages...\n`);

  for (const flavor of FLAVORS) {
    const svgContent = generateFillingSVG(flavor);
    const filename = `filling_${flavor}.png`;
    const outputPath = path.join(outputDir, filename);

    try {
      // Convertir SVG en PNG avec sharp
      await sharp(Buffer.from(svgContent))
        .resize(400, 400) // Taille de l'image
        .png()
        .toFile(outputPath);

      count++;
      if (count % 5 === 0) {
        console.log(`📦 ${count}/${total} générées...`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${filename}:`, error.message);
    }
  }

  console.log(`\n✅ Génération terminée: ${count}/${total} images créées dans ${outputDir}`);
}

// Lancer la génération
generateAllFillingPNGs().catch(console.error);
