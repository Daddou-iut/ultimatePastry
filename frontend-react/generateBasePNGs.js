/**
 * Script de génération de toutes les combinaisons base × saveur en PNG
 * Usage: node generateBasePNGs.js
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

// Types de bases
const BASE_TYPES = [
  { name: 'Base', keyword: null },
  { name: 'Génoise', keyword: 'génoise' },
  { name: 'Biscuit', keyword: 'biscuit' },
  { name: 'Dacquoise', keyword: 'dacquoise' }
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



function safe(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFlavorVisual(flavor) {
  const key = (flavor || 'neutral').toLowerCase();
  return {
    colors: flavorsColors[key] || flavorsColors.neutral
  };
}

function renderBase(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const uid = card.id || Math.floor(Math.random() * 100000);
  const gradId = `baseGrad-${uid}`;

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}" />
          <stop offset="100%" stop-color="${colors.bottom}" />
        </linearGradient>
      </defs>

      <path d="M5,195 L195,195 L195,110
               C170,105 150,115 130,110
               C110,105 90,120 70,115
               C50,110 30,120 5,115 Z"
        fill="url(#${gradId})"
        stroke="#c0927c"
        stroke-width="2"
        stroke-linejoin="round" />

      <circle cx="40" cy="140" r="1.5" fill="#D4A574" opacity="0.3" />
      <circle cx="160" cy="160" r="1" fill="#D4A574" opacity="0.3" />
      <circle cx="100" cy="130" r="2" fill="#FFFFFF" opacity="0.2" />
    </svg>
  `;
}

function renderGenoise(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const gradId = `spongeGrad-${card.id || Math.floor(Math.random() * 100000)}`;
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; background: transparent;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}"/>
          <stop offset="100%" stop-color="${colors.bottom}"/>
        </linearGradient>
      </defs>
      <rect x="35" y="88" width="130" height="40" fill="url(#${gradId})"
          stroke="#b88247" stroke-width="2" rx="4"/>
      <ellipse cx="100" cy="88" rx="65" ry="18" fill="${colors.top}"
          stroke="#d19a58" stroke-width="2"/>

      <g stroke="#e6a85f" stroke-width="2.5" opacity="0.75">
        <line x1="45" y1="84" x2="155" y2="90" />
        <line x1="45" y1="95" x2="155" y2="101" />
      </g>
    </svg>
  `;
}

function renderBiscuit(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const gradId = `biscuitGrad-${card.id || Math.floor(Math.random() * 100000)}`;
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; background: transparent;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}"/>
          <stop offset="100%" stop-color="${colors.bottom}"/>
        </linearGradient>
        <radialGradient id="shadowGrad-${card.id}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="118" rx="72" ry="16" fill="${colors.bottom}"
          stroke="#b87333" stroke-width="2"/>
      <rect x="28" y="100" width="144" height="20" rx="10" ry="10"
          fill="url(#${gradId})"
          stroke="#b87333"
          stroke-width="2"/>
      <ellipse cx="100" cy="100" rx="72" ry="16" fill="${colors.top}"
          stroke="#b87333" stroke-width="2"/>
      <ellipse cx="100" cy="95" rx="55" ry="10" fill="white" opacity="0.15"/>

      <g fill="#d29a63" opacity="0.55">
        <circle cx="70" cy="94" r="1.6"/>
        <circle cx="84" cy="101" r="1.9"/>
        <circle cx="100" cy="92" r="1.6"/>
        <circle cx="116" cy="98" r="1.6"/>
        <circle cx="128" cy="103" r="1.3"/>
      </g>
    </svg>
  `;
}

function renderDacquoise(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const gradId = `dacqGrad-${card.id || Math.floor(Math.random() * 100000)}`;
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}"/>
          <stop offset="100%" stop-color="${colors.bottom}"/>
        </linearGradient>
        <radialGradient id="softShadow-${card.id}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="115" rx="82" ry="40" fill="url(#${gradId})"
              stroke="#a0826d"
              stroke-width="2"/>
      <ellipse cx="100" cy="100" rx="60" ry="18" fill="white" opacity="0.15"/>
      <path d="M25,112 C45,95 75,100 100,110 C125,120 155,124 175,112"
          stroke="#fff4dc" stroke-width="3" opacity="0.55" fill="none"/>

      <g fill="#d2b48c" opacity="0.35">
        <circle cx="70" cy="116" r="2"/>
        <circle cx="95" cy="123" r="2"/>
        <circle cx="125" cy="114" r="1.8"/>
      </g>
    </svg>
  `;
}

function generateBaseSVG(baseType, flavor) {
  const card = {
    id: Math.floor(Math.random() * 100000),
    name: `${baseType.name} ${flavor}`,
    flavor: flavor,
    family: 'base'
  };

  const borderColor = 'none';
  const strokeWidth = 2;

  if (baseType.keyword === 'génoise') {
    return renderGenoise(card, borderColor, strokeWidth);
  } else if (baseType.keyword === 'biscuit') {
    return renderBiscuit(card, borderColor, strokeWidth);
  } else if (baseType.keyword === 'dacquoise') {
    return renderDacquoise(card, borderColor, strokeWidth);
  } else {
    return renderBase(card, borderColor, strokeWidth);
  }
}

async function generateAllBasePNGs() {
  const outputDir = path.join(__dirname, 'generated_bases');
  
  // Créer le dossier de sortie
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`✅ Dossier créé: ${outputDir}`);
  } catch (error) {
    console.error('Erreur création dossier:', error);
    return;
  }

  let count = 0;
  const total = BASE_TYPES.length * FLAVORS.length;

  console.log(`🎨 Génération de ${total} images PNG...\n`);

  for (const baseType of BASE_TYPES) {
    for (const flavor of FLAVORS) {
      const svgContent = generateBaseSVG(baseType, flavor);
      const filename = `${baseType.name.toLowerCase().replace(/\s+/g, '_')}_${flavor}.png`;
      const outputPath = path.join(outputDir, filename);

      try {
        // Convertir SVG en PNG avec sharp
        await sharp(Buffer.from(svgContent))
          .resize(400, 400) // Taille de l'image
          .png()
          .toFile(outputPath);

        count++;
        if (count % 10 === 0) {
          console.log(`📦 ${count}/${total} générées...`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${filename}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Génération terminée: ${count}/${total} images créées dans ${outputDir}`);
}

// Lancer la génération
generateAllBasePNGs().catch(console.error);
