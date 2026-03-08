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
  apple: { top: '#d0e590b7', bottom: '#65161d' },
  
};


const rarityBorders = {
  common: 'none',
  uncommon: '#CD7F32',
  rare: '#C0C0C0',
  epic: '#FFD700',
};

function getFlavorVisual(flavor) {
  const key = (flavor || 'neutral').toLowerCase();
  return {
    colors: flavorsColors[key] || flavorsColors.neutral,
  };
}


function safe(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
        stroke="${borderColor !== 'none' ? borderColor : '#c0927c'}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="round" />

      <circle cx="40" cy="140" r="1.5" fill="#D4A574" opacity="0.3" />
      <circle cx="160" cy="160" r="1" fill="#D4A574" opacity="0.3" />
      <circle cx="100" cy="130" r="2" fill="#FFFFFF" opacity="0.2" />

      <text x="112" y="152" text-anchor="middle" font-size="14" font-weight="bold" fill="#3E2723" font-family="sans-serif">
        ${safe(card.name).toUpperCase()}
      </text>
    </svg>
  `;
}

function renderGenoise(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
    const gradId = `spongeGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; height: 100%; background: transparent; preserveAspectRatio: xMidYMid meet;">

          <defs>
              <!-- Dégradé principal -->
              <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="${colors.top}"/>
                  <stop offset="100%" stop-color="${colors.bottom}"/>
              </linearGradient>

              <!-- Highlight du dessus -->
              <linearGradient id="topHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
              </linearGradient>

              <!-- Ombre interne douce -->
              <radialGradient id="innerShadow">
                  <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
                  <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
              </radialGradient>

              <!-- Texture légère -->
              <linearGradient id="cakeTexture" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
                  <stop offset="50%" stop-color="rgba(255,255,255,0.05)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0.15)"/>
              </linearGradient>
          </defs>

          <!-- Ombre au sol (plus douce) -->
          <ellipse cx="100" cy="128" rx="82" ry="28" fill="#000" opacity="0.18"/>

          <!-- Corps de la génoise -->
          <rect x="35" y="88" width="130" height="40"
                fill="url(#${gradId})"
                stroke="${borderColor !== 'none' ? borderColor : '#b88247'}"
                stroke-width="${strokeWidth}" rx="6"/>

          <!-- Ombre interne pour donner du volume -->
          <ellipse cx="100" cy="108" rx="60" ry="14"
                  fill="url(#innerShadow)" opacity="0.35"/>

          <!-- Texture horizontale subtile -->
          <rect x="40" y="95" width="120" height="25"
                fill="url(#cakeTexture)" opacity="0.25"/>

          <!-- Dessus de la génoise -->
          <ellipse cx="100" cy="88" rx="65" ry="18"
                  fill="${colors.top}"
                  stroke="${borderColor !== 'none' ? borderColor : '#d19a58'}"
                  stroke-width="${strokeWidth}"/>

          <!-- Highlight du dessus -->
          <ellipse cx="100" cy="84" rx="55" ry="10"
                  fill="url(#topHighlight)" opacity="0.55"/>

          <!-- Stries -->
          <g stroke="#e6a85f" stroke-width="2.5" opacity="0.75">
              <line x1="45" y1="84" x2="155" y2="90" />
              <line x1="45" y1="95" x2="155" y2="101" />
          </g>

          <!-- Nom -->
          <text x="112" y="30" text-anchor="middle"
                font-size="13" font-weight="bold"
                fill="#6b3f24" font-family="sans-serif">
              ${card.name.toUpperCase()}
          </text>

      </svg>

    `;
}
function renderBiscuit(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
    const gradId = `biscuitGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; background: transparent; preserveAspectRatio: xMidYMid meet;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>

                <!-- Ombre douce sous le biscuit -->
                <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
                    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
                </radialGradient>
            </defs>

            <!-- Ombre au sol -->
            <ellipse cx="100" cy="135" rx="70" ry="18" fill="url(#shadowGrad)" opacity="0.45"/>

            <!-- Base du biscuit -->
            <ellipse cx="100" cy="118" rx="72" ry="16" fill="${colors.bottom}"
                stroke="${borderColor !== 'none' ? borderColor : '#b87333'}" stroke-width="${strokeWidth}"/>

            <!-- Corps du biscuit -->
            <rect x="28" y="100" width="144" height="20" rx="10" ry="10"
                fill="url(#${gradId})"
                stroke="${borderColor !== 'none' ? borderColor : '#b87333'}"
                stroke-width="${strokeWidth}"/>

            <!-- Dessus du biscuit -->
            <ellipse cx="100" cy="100" rx="72" ry="16" fill="${colors.top}"
                stroke="${borderColor !== 'none' ? borderColor : '#b87333'}" stroke-width="${strokeWidth}"/>

            <!-- Reflet léger pour donner du volume -->
            <ellipse cx="100" cy="95" rx="55" ry="10" fill="white" opacity="0.15"/>

            <!-- Texture améliorée -->
            <g fill="#d29a63" opacity="0.55">
                <circle cx="70" cy="94" r="1.6"/>
                <circle cx="84" cy="101" r="1.9"/>
                <circle cx="100" cy="92" r="1.6"/>
                <circle cx="116" cy="98" r="1.6"/>
                <circle cx="128" cy="103" r="1.3"/>
                <circle cx="62" cy="104" r="1.6"/>
                <circle cx="80" cy="108" r="1.3"/>
                <circle cx="108" cy="106" r="1.7"/>
                <circle cx="124" cy="109" r="1.2"/>
            </g>

            <!-- Nom -->
            <text x="100" y="60" text-anchor="middle" font-size="10" font-weight="bold"
                fill="#6b3f24" font-family="sans-serif" letter-spacing="1">
                ${card.name.toUpperCase()}
            </text>
        </svg>

    `;
}

function renderDacquoise(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
    const gradId = `dacqGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%; display: block;">
            <defs>
                <!-- Dégradé principal -->
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>

                <!-- Ombre douce -->
                <radialGradient id="softShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
                    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
                </radialGradient>
            </defs>

            <!-- Ombre au sol -->
            <ellipse cx="100" cy="135" rx="75" ry="22" fill="url(#softShadow)" opacity="0.45"/>

            <!-- Forme principale de l'entremet -->
            <ellipse cx="100" cy="115" rx="82" ry="40" fill="url(#${gradId})"
                    stroke="${borderColor !== 'none' ? borderColor : '#a0826d'}"
                    stroke-width="${strokeWidth}"/>

            <!-- Reflet supérieur pour donner du volume -->
            <ellipse cx="100" cy="100" rx="60" ry="18" fill="white" opacity="0.15"/>

            <!-- Courbe brillante -->
            <path d="M25,112 C45,95 75,100 100,110 C125,120 155,124 175,112"
                stroke="#fff4dc" stroke-width="3" opacity="0.55" fill="none"/>

            <!-- Texture subtile -->
            <g fill="#d2b48c" opacity="0.35">
                <circle cx="70" cy="116" r="2"/>
                <circle cx="95" cy="123" r="2"/>
                <circle cx="125" cy="114" r="1.8"/>
                <circle cx="140" cy="126" r="1.8"/>
                <circle cx="55" cy="110" r="1.6"/>
                <circle cx="115" cy="128" r="1.4"/>
            </g>

            <!-- Nom -->
            <text x="112" y="55" text-anchor="middle" font-size="14" font-weight="bold"
                fill="#6f4e37" font-family="sans-serif" letter-spacing="1">
                ${card.name.toUpperCase()}
            </text>

            <!-- Stats (si tu veux les réactiver plus tard) -->
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#6f4e37">
            </g>
        </svg>
    `;
}
function renderGlaze(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const uid = card.id || Math.floor(Math.random() * 100000);
  const gradId = `glazeGrad-${uid}`;

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.top}" />
          <stop offset="70%" stop-color="${colors.bottom}" />
        </linearGradient>
        <filter id="shadow-glaze">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
          <feOffset dx="0" dy="3" result="offsetblur" />
          <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      
      <path d="M-5,-5 L205,-5 L205,75 C190,75 182,105 170,105 C158,105 150,75 135,75 C120,75 115,140 90,140 C65,140 60,75 40,75 C25,75 15,120 -5,120 Z"
        fill="url(#${gradId})"
        stroke="transparent"
        stroke-width="${strokeWidth}"
        stroke-linejoin="round"
        filter="url(#shadow-glaze)" />
      
      <path d="M20,15 Q100,22 180,15" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.25" fill="none" />
      <ellipse cx="90" cy="125" rx="6" ry="3" fill="white" opacity="0.2" />
      
      <g style="text-shadow: 1px 1px 3px rgba(0,0,0,0.4)">
        <text x="100" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="white" font-family="sans-serif">${safe(card.name).toUpperCase()}</text>
      </g>
      
    </svg>
  `;
}

function renderCream(card, borderColor, strokeWidth) {
  const { colors } = getFlavorVisual(card.flavor);
  const uid = card.id || Math.floor(Math.random() * 1000000);

  return `
    <svg viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; background: transparent; preserveAspectRatio: xMidYMid meet;">
      <defs>
        <linearGradient id="Grad1_${uid}" gradientUnits="userSpaceOnUse" x1="1363.43" y1="1108.2" x2="1402.53" y2="821.435">
          <stop offset="0" stop-color="${colors.bottom}"/>
          <stop offset="1" stop-color="${colors.top}"/>
        </linearGradient>
        <linearGradient id="Grad2_${uid}" gradientUnits="userSpaceOnUse" x1="1521.43" y1="1250.35" x2="1345.8" y2="1512.24">
          <stop offset="0" stop-color="${colors.bottom}"/>
          <stop offset="1" stop-color="${colors.top}"/>
        </linearGradient>
        <linearGradient id="Grad3_${uid}" gradientUnits="userSpaceOnUse" x1="849.989" y1="1268.41" x2="372.217" y2="1662.35">
          <stop offset="0" stop-color="${colors.bottom}"/>
          <stop offset="1" stop-color="${colors.top}"/>
        </linearGradient>
        <linearGradient id="Grad4_${uid}" gradientUnits="userSpaceOnUse" x1="1858.94" y1="968.799" x2="418.811" y2="1037.19">
          <stop offset="0" stop-color="${colors.bottom}"/>
          <stop offset="1" stop-color="${colors.top}"/>
        </linearGradient>
      </defs>
      <path fill="url(#Grad4_${uid})" stroke="${borderColor !== 'none' ? borderColor : 'transparent'}" stroke-width="${strokeWidth}" d="M 413.474 977.543 C 416.021 973.883 414.655 931.041 415.114 922.013 C 421.041 805.479 495.708 704.742 586.324 636.956 C 637.072 598.993 695.347 579.536 741.118 538.279 C 759.932 521.317 777.819 503.354 794.7 484.468 C 828.906 446.25 860.651 407.459 899.927 373.942 C 910.501 364.919 919.684 353.565 931.101 345.078 C 956.179 326.436 981.036 307.603 1007.4 290.761 C 1010.83 288.559 1018.35 282.758 1021.91 284.301 C 1026.2 286.163 1031.96 291.874 1034.32 295.829 C 1045.99 307.317 1057.21 319.775 1069.18 330.861 C 1105.62 364.617 1150.09 389.547 1195.45 409.18 C 1209.92 415.442 1224.81 420.029 1238.42 428.055 C 1310.58 469.522 1381.35 543.55 1410.03 622.354 C 1418.85 646.609 1422.75 680.648 1422.97 706.504 C 1423.15 727.729 1417.71 755.352 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1720.67 1030.59 1721.1 1030.97 1719.87 1031.91 C 1712.26 1037.78 1697.25 1043.66 1688.53 1047.45 C 1694.42 1048.48 1700.45 1049.37 1706.19 1050.98 C 1716.31 1052.97 1747.03 1060.96 1753.37 1067.73 C 1759.9 1084.37 1738.8 1198.19 1733.46 1220.26 C 1779.36 1230.98 1841.58 1251.52 1871.06 1289.4 C 1874.87 1294.26 1879 1300.17 1877.49 1306.59 C 1870.41 1336.59 1829.69 1356.63 1808.15 1373.67 C 1794.75 1383.39 1770.75 1398.07 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1750.29 1598.57 1629.59 1576.69 1573.65 1568.84 C 1578.83 1603.45 1579.74 1618.27 1568.64 1652.27 C 1550.7 1707.22 1537.08 1679.7 1508.05 1690.14 C 1443.01 1713.54 1386.26 1724.98 1317.11 1712.12 C 1280.43 1705.29 1237.74 1690.53 1203.45 1675.43 C 1196.85 1672.53 1185.31 1665.74 1178.25 1667.36 C 1176.93 1671.43 1164.2 1680.64 1159.88 1683.78 C 1118.21 1713.49 1071.81 1735.89 1022.64 1750.03 C 912.803 1781.57 825.758 1762.61 727.184 1708.65 C 711.581 1699.99 696.12 1691.08 680.806 1681.92 C 671.492 1676.22 661.748 1669.47 652.298 1664.3 L 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 C 295.339 1565.42 281.779 1550.86 273.427 1542.41 C 226.593 1495.02 189.961 1438.94 176.237 1372.83 C 163.42 1311.09 174.172 1241.59 199.834 1184.2 C 206.075 1170.24 225.291 1138.38 234.946 1124.76 C 269.221 1076.44 318.443 1033.12 368.141 1001.06 C 380.233 993.264 399.779 980.2 413.474 977.543 z"/>
      <path fill="url(#Grad3_${uid})" d="M 304.018 1572.29 C 295.339 1565.42 281.779 1550.86 273.427 1542.41 C 226.593 1495.02 189.961 1438.94 176.237 1372.83 C 163.42 1311.09 174.172 1241.59 199.834 1184.2 C 206.075 1170.24 225.291 1138.38 234.946 1124.76 C 269.221 1076.44 318.443 1033.12 368.141 1001.06 C 380.233 993.264 399.779 980.2 413.474 977.543 C 413.9 981.503 415.468 985.13 415.821 988.883 C 418.026 1012.33 425.457 1032.77 431.427 1055.04 C 448.163 1098.63 473.896 1155.15 518.889 1175.35 C 532.96 1181.67 543.339 1182.19 558.388 1181.99 C 563.376 1251.35 583.589 1315.81 639.327 1360.53 C 738.595 1440.18 865.889 1487.94 978.117 1545.86 C 1021.04 1567.99 1062.98 1591.98 1103.82 1617.77 C 1120.84 1628.4 1141.65 1640.42 1157.64 1652.1 C 1161.21 1654.32 1176.45 1663.14 1177.97 1666.03 L 1177.93 1666.99 L 1178.25 1667.36 C 1176.93 1671.43 1164.2 1680.64 1159.88 1683.78 C 1118.21 1713.49 1071.81 1735.89 1022.64 1750.03 C 912.803 1781.57 825.758 1762.61 727.184 1708.65 C 711.581 1699.99 696.12 1691.08 680.806 1681.92 C 671.492 1676.22 661.748 1669.47 652.298 1664.3 L 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 z"/>
      <path fill="rgb(224,209,178)" d="M 431.427 1055.04 C 448.163 1098.63 473.896 1155.15 518.889 1175.35 C 532.96 1181.67 543.339 1182.19 558.388 1181.99 C 563.376 1251.35 583.589 1315.81 639.327 1360.53 C 738.595 1440.18 865.889 1487.94 978.117 1545.86 C 1021.04 1567.99 1062.98 1591.98 1103.82 1617.77 C 1120.84 1628.4 1141.65 1640.42 1157.64 1652.1 C 1153.84 1652.54 1145.87 1647.39 1141.73 1645.55 C 1126.01 1638.54 1109.04 1631.4 1092.84 1625.74 C 1022.51 1601.16 948.569 1588.76 879.697 1560.25 C 798.7 1526.72 729.544 1467.08 659.154 1415.52 C 610.787 1379.99 561.066 1346.79 518.43 1304.51 C 456.261 1242.87 429.484 1164.02 429.792 1077.6 C 429.812 1072.12 429.476 1059.69 431.427 1055.04 z"/>
      <path fill="rgb(224,209,178)" d="M 475.364 1538.11 C 515.288 1569.72 559.514 1598 600.314 1628.63 C 616.238 1640.58 636.302 1650.78 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 C 304.606 1572.31 305.195 1572.31 305.783 1572.33 C 316.134 1572.77 343.566 1583.79 354.653 1587.22 C 382.733 1595.93 486.862 1626.31 509.987 1605.72 C 512.953 1603.08 514.397 1599.58 514.369 1595.63 C 514.253 1579.45 485.855 1551.22 475.364 1538.11 z"/>
      <path fill="rgb(237,219,185)" d="M 1019.13 1274.15 C 1053.4 1273.61 1095.41 1279.29 1129.51 1284.26 C 1143.42 1286.28 1161.16 1290.67 1174.36 1292.12 C 1180.24 1294.52 1199.25 1298.03 1206.16 1299.47 C 1219.94 1302.24 1233.61 1305.56 1247.13 1309.4 C 1264.64 1314.19 1282.08 1319.26 1299.43 1324.59 C 1303.18 1325.77 1325.46 1333.19 1327.79 1333.47 C 1345.7 1339.42 1363.42 1345.93 1380.92 1353 C 1387.95 1355.89 1395.42 1358.83 1402.31 1361.97 C 1423.24 1371.54 1445.27 1374.71 1467.75 1379.46 C 1543.48 1395.47 1619.54 1418.36 1697.45 1419.04 C 1711.14 1419.16 1725.02 1417.5 1738.33 1414.46 C 1742.93 1413.4 1755.92 1407.1 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1750.29 1598.57 1629.59 1576.69 1573.65 1568.84 C 1571.04 1566.68 1557.86 1562 1553.74 1560.24 C 1525.44 1548.24 1496.7 1543.85 1466.12 1546.57 C 1298.12 1561.51 1150.95 1471.59 997.972 1417.66 C 925.748 1392.21 849.832 1374.87 778.723 1344.65 C 781.817 1338.06 753.809 1303.33 816.91 1300.06 C 831.69 1299.29 852.691 1297.39 868.014 1296.44 L 868.68 1295.13 C 872.645 1295.06 881.578 1296.06 886.597 1296.16 C 901.372 1296.41 916.146 1295.64 930.816 1293.86 C 951.927 1291.13 970.924 1285.52 991.653 1281.54 C 994.446 1281 1002.8 1281.96 1006.24 1282.15 C 1002.24 1279.12 1003.78 1280.04 998.332 1279.33 C 1007.64 1276.93 1007.61 1274.8 1019.13 1274.15 z"/>
      <path fill="url(#Grad2_${uid})" d="M 1019.13 1274.15 C 1053.4 1273.61 1095.41 1279.29 1129.51 1284.26 C 1143.42 1286.28 1161.16 1290.67 1174.36 1292.12 C 1180.24 1294.52 1199.25 1298.03 1206.16 1299.47 C 1219.94 1302.24 1233.61 1305.56 1247.13 1309.4 C 1264.64 1314.19 1282.08 1319.26 1299.43 1324.59 C 1303.18 1325.77 1325.46 1333.19 1327.79 1333.47 C 1345.7 1339.42 1363.42 1345.93 1380.92 1353 C 1387.95 1355.89 1395.42 1358.83 1402.31 1361.97 C 1423.24 1371.54 1445.27 1374.71 1467.75 1379.46 C 1543.48 1395.47 1619.54 1418.36 1697.45 1419.04 C 1711.14 1419.16 1725.02 1417.5 1738.33 1414.46 C 1742.93 1413.4 1755.92 1407.1 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1796.6 1570.62 1785.5 1570.24 1779.11 1569.38 C 1674.86 1555.44 1591.29 1482.63 1501.37 1434.94 C 1349.65 1354.49 1176.87 1301.25 1006.24 1282.15 C 1002.24 1279.12 1003.78 1280.04 998.332 1279.33 C 1007.64 1276.93 1007.61 1274.8 1019.13 1274.15 z"/>
      <path fill="url(#Grad1_${uid})" d="M 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1720.67 1030.59 1721.1 1030.97 1719.87 1031.91 C 1712.26 1037.78 1697.25 1043.66 1688.53 1047.45 C 1694.42 1048.48 1700.45 1049.37 1706.19 1050.98 C 1702.24 1052.92 1699.66 1050.96 1695.24 1052.05 C 1697.41 1052.71 1697.68 1052.76 1699.85 1053.14 C 1701.62 1055.41 1701.77 1056.31 1702.81 1058.97 C 1706.69 1062.12 1709.38 1061.66 1712.47 1065.58 C 1707.67 1069.07 1689.41 1069.41 1682.9 1071.52 C 1649.85 1082.28 1618.65 1097.74 1596.22 1125.14 C 1592.25 1129.99 1586.87 1138.42 1582.36 1142.31 C 1581.11 1139 1579.45 1135.87 1577.74 1132.77 C 1572.22 1122.82 1563.15 1110.37 1552.22 1106.22 C 1540.37 1101.73 1466.28 1099.45 1448.18 1098.12 C 1395.49 1094.25 1342.07 1088.91 1291.18 1074.09 C 1235.31 1057.82 1080.87 997.917 1053.97 948.071 C 1035.04 912.985 1057.93 879.802 1080.29 853.186 C 1092.53 838.628 1105.67 824.852 1119.64 811.937 C 1124.45 807.46 1140.22 794.491 1141.71 789.423 C 1145.53 787.288 1148.68 786.186 1152.7 784.641 C 1149.56 807.383 1159.93 818.714 1175.22 833.327 C 1190.58 848.006 1203.17 855.634 1222.16 864.421 C 1264.37 820.508 1316.63 802.416 1373.99 786.356 C 1383.45 783.707 1404.19 777.617 1413.11 776.337 z"/>
      <path fill="rgb(237,219,185)" d="M 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1593.4 931.126 1575.32 929.462 1568.12 928.53 C 1533.46 924.036 1498.19 923.506 1463.52 920.131 C 1385.55 912.541 1301.69 896.277 1228.82 867.513 C 1227.06 866.187 1224.31 865.296 1222.16 864.421 C 1264.37 820.508 1316.63 802.416 1373.99 786.356 C 1383.45 783.707 1404.19 777.617 1413.11 776.337 z"/>
      <path fill="rgb(249,249,245)" d="M 1228.82 867.513 C 1301.69 896.277 1385.55 912.541 1463.52 920.131 C 1498.19 923.506 1533.46 924.036 1568.12 928.53 C 1575.32 929.462 1593.4 931.126 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1699.7 1009.91 1686.86 991.946 1658.47 978.19 C 1602.5 951.062 1539.99 949.187 1479.73 940.731 C 1411.61 931.17 1343.25 918.344 1279.33 892.486 C 1270.14 888.766 1234.88 873.989 1227.9 868.656 L 1228.82 867.513 z"/>
      <path fill="rgb(249,249,245)" d="M 1141.71 789.423 C 1140.22 794.491 1124.45 807.46 1119.64 811.937 C 1105.67 824.852 1092.53 838.628 1080.29 853.186 C 1057.93 879.802 1035.04 912.985 1053.97 948.071 C 1080.87 997.917 1235.31 1057.82 1291.18 1074.09 C 1342.07 1088.91 1395.49 1094.25 1448.18 1098.12 C 1466.28 1099.45 1540.37 1101.73 1552.22 1106.22 C 1563.15 1110.37 1572.22 1122.82 1577.74 1132.77 C 1579.45 1135.87 1581.11 1139 1582.36 1142.31 C 1583.11 1144.49 1583.81 1146.69 1584.44 1148.9 C 1591.84 1175.15 1580.12 1196.86 1567.85 1218.87 C 1551.24 1137.69 1453.84 1173.5 1393.49 1168.55 C 1253.91 1157.08 1096.83 1107.91 980.185 1030.47 C 963.875 1018.55 942.634 999.038 934.001 980.602 C 898.28 904.322 1000.24 853.198 1053.13 827.348 C 1056.53 826.886 1098.99 808.156 1104.32 805.606 C 1116.75 800.128 1129.21 794.733 1141.71 789.423 z"/>
      <path fill="rgb(224,209,178)" d="M 1034.32 295.829 C 1045.99 307.317 1057.21 319.775 1069.18 330.861 C 1105.62 364.617 1150.09 389.547 1195.45 409.18 C 1209.92 415.442 1224.81 420.029 1238.42 428.055 C 1310.58 469.522 1381.35 543.55 1410.03 622.354 C 1418.85 646.609 1422.75 680.648 1422.97 706.504 C 1423.15 727.729 1417.71 755.352 1413.11 776.337 C 1404.19 777.617 1383.45 783.707 1373.99 786.356 C 1316.63 802.416 1264.37 820.508 1222.16 864.421 C 1203.17 855.634 1190.58 848.006 1175.22 833.327 C 1159.93 818.714 1149.56 807.383 1152.7 784.641 C 1148.68 786.186 1145.53 787.288 1141.71 789.423 C 1129.21 794.733 1116.75 800.128 1104.32 805.606 C 1104.41 804.51 1104.8 802.777 1105.74 802.102 C 1141.37 776.41 1164.26 739.725 1169.43 695.596 C 1175.53 643.563 1158.86 590.769 1131.26 546.772 C 1129.81 544.455 1125.72 540.323 1125.6 538.009 C 1128.01 538.652 1127.97 539.313 1129.62 541.137 C 1180.99 597.93 1238.7 716.391 1168.11 779.084 C 1206.46 778.436 1237.2 796.226 1273.74 791.987 C 1353.86 782.695 1342.58 687.016 1319.76 633.463 C 1293.56 571.998 1254.18 520.278 1206.2 474.457 C 1184.91 454.127 1160.88 438.341 1138.47 419.451 C 1107.14 393.214 1080.03 363.521 1055.35 331.027 C 1049.07 322.789 1035.53 305.5 1034.32 295.829 z"/>
      <path fill="rgb(224,209,178)" d="M 1085.33 1243.62 L 1084.29 1242.69 C 1064.06 1225.02 1033.52 1213.96 1009.35 1202.09 C 973.047 1184.73 938.534 1162.44 901.71 1146.27 C 877.506 1135.65 851.587 1125.52 826.754 1116.53 C 751.315 1089.2 681.292 1031.64 674.028 946.544 C 666.127 853.975 744.63 805.348 822.631 781.848 C 754.111 816.578 693.191 881.234 701.955 961.509 C 706.425 1002.46 722.521 1031.4 755.564 1057.16 C 825.299 1109.57 908.823 1144.54 989.784 1176.05 C 1052.64 1200.52 1121.79 1220.24 1189.35 1225.24 C 1201.84 1226.17 1217.42 1222.98 1230.15 1223.33 C 1261.16 1223.41 1292.75 1222.49 1323.54 1226.53 C 1332.14 1227.66 1343.48 1230.58 1351.78 1230.38 L 1352.46 1231.64 C 1351.43 1232.18 1350.41 1232.71 1349.39 1233.25 C 1322.87 1232.2 1300.89 1227.15 1273.9 1231.03 C 1231.05 1237.19 1189.14 1253.3 1151.91 1275.49 C 1149.62 1276.86 1139.36 1283.16 1138.87 1283.88 C 1146.32 1287.36 1170.19 1288.07 1174.36 1292.12 C 1161.16 1290.67 1143.42 1286.28 1129.51 1284.26 C 1095.41 1279.29 1053.4 1273.61 1019.13 1274.15 L 1015.42 1272.32 C 1021.18 1266.48 1074.46 1246.98 1085.33 1243.62 z"/>
      <path fill="rgb(224,209,178)" d="M 1327.79 1333.47 C 1337.97 1330.91 1379.7 1339.78 1392.53 1341.71 C 1424.14 1346.14 1455.8 1350.15 1487.52 1353.74 C 1531.92 1358.87 1591.13 1360.62 1635.52 1357.78 C 1706.43 1353.24 1739.87 1345.3 1808.15 1373.67 C 1794.75 1383.39 1770.75 1398.07 1759.56 1406.96 C 1755.92 1407.1 1742.93 1413.4 1738.33 1414.46 C 1725.02 1417.5 1711.14 1419.16 1697.45 1419.04 C 1619.54 1418.36 1543.48 1395.47 1467.75 1379.46 C 1445.27 1374.71 1423.24 1371.54 1402.31 1361.97 C 1395.42 1358.83 1387.95 1355.89 1380.92 1353 C 1363.42 1345.93 1345.7 1339.42 1327.79 1333.47 z"/>
      <path fill="rgb(224,209,178)" d="M 980.185 1030.47 L 978.994 1031.18 C 972.613 1027.59 968.294 1021.36 963.42 1019.34 C 963.556 1021.86 963.645 1022.75 962.793 1025.13 C 963.801 1028.44 977.072 1032.69 981.622 1035.25 L 981.046 1036.09 C 953.692 1025.31 907.8 1001.64 891.558 979.383 C 815.714 875.456 936.417 841.789 1017.41 831.565 C 1028.16 830.207 1043.35 826.36 1053.13 827.348 C 1000.24 853.198 898.28 904.322 934.001 980.602 C 942.634 999.038 963.875 1018.55 980.185 1030.47 z"/>
      <path fill="rgb(224,209,178)" d="M 629.829 1179.9 C 686.82 1180.49 719.218 1229.95 765.507 1256.15 C 801.2 1276.35 829.301 1285.95 868.68 1295.13 L 868.014 1296.44 C 852.691 1297.39 831.69 1299.29 816.91 1300.06 C 753.809 1303.33 781.817 1338.06 778.723 1344.65 C 765.004 1338.81 750.847 1324.95 739.825 1314.64 C 700.75 1278.07 653.85 1227.98 629.829 1179.9 z"/>
      <path fill="rgb(249,249,245)" d="M 1871.06 1289.4 C 1865.3 1288.96 1857.3 1284.85 1852.09 1282.14 C 1817.94 1264.36 1782.35 1255.5 1745.03 1246.22 C 1709.13 1237.28 1672.48 1231.74 1635.55 1229.67 C 1622.3 1228.81 1587.88 1228.22 1576.82 1226.14 C 1588.86 1221.43 1717.04 1229.01 1733.46 1220.26 C 1779.36 1230.98 1841.58 1251.52 1871.06 1289.4 z"/>
      <g font-family="sans-serif" text-anchor="middle" fill="#4E342E">
        <text x="1010" y="620" font-size="150" font-weight="bold" style="text-shadow: 4px 4px 10px rgba(255,255,255,0.8)">${safe(card.name).toUpperCase()}</text>
      </g>
    </svg>
  `;
}

function renderFilling(card, borderColor, strokeWidth) {
  
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
      
      <ellipse cx="100" cy="125" rx="60" ry="9" fill="#c8bba5" opacity="0.35"/>
      <ellipse cx="100" cy="118" rx="58" ry="9" fill="url(#${gradId})" stroke="${borderColor !== 'none' ? borderColor : 'transparent'}" stroke-width="${strokeWidth}"/>
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
      
      <text x="100" y="61" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.bottom}" font-family="sans-serif">${safe(card.name).toUpperCase()}</text>
      
    </svg>
  `;
}

function getDecorationImagePath(cardName) {
  const nameMap = {
    'fruits rouges': 'fruits_rouges.png',
    'fraises': 'fraises.png',
    'framboises': 'framboises.png',
    'myrtilles': 'myrtilles.png',
    'macarons': 'macarons.png',
    'or alimentaire': 'or_alimentaire.png',
    'noisettes grillées': 'hazelnut.png',
    'amandes effilées': 'amndes_effilées.png',
    'pépites chocolat': 'pépites_chocolat.png',
    'pistaches concassées': 'pistache.png'
  };
  
  const name = (cardName || '').toLowerCase();
  const filename = nameMap[name];
  
  return filename ? `/generated_decorations/${filename}` : null;
}

function renderDecoration(card, borderColor, strokeWidth) {
  const imagePath = getDecorationImagePath(card.name);
  
  if (imagePath) {
    return `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
        <defs>
          <filter id="decoShadow-${card.id || 'default'}">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <circle cx="100" cy="100" r="56" fill="#ffffff" stroke="${borderColor !== 'none' ? borderColor : '#9ca3af'}" stroke-width="${strokeWidth}" opacity="0.9"/>
        
        <image href="${imagePath}" x="40" y="40" width="120" height="120" filter="url(#decoShadow-${card.id || 'default'})" preserveAspectRatio="xMidYMid meet"/>
        
        <text x="100" y="25" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151" font-family="sans-serif">${safe(card.name).toUpperCase()}</text>
      </svg>
    `;
  }
  
  // Fallback si l'image n'est pas trouvée
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <defs>
        <radialGradient id="decoGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f0f0f0"/>
        </radialGradient>
      </defs>
      
      <circle cx="100" cy="100" r="52" fill="url(#decoGrad)" stroke="${borderColor !== 'none' ? borderColor : '#9ca3af'}" stroke-width="${strokeWidth}"/>
      
      <g opacity="0.45" fill="#ffffff">
        <circle cx="82" cy="86" r="8"/>
        <circle cx="110" cy="78" r="6"/>
        <circle cx="122" cy="104" r="7"/>
      </g>
      
      <text x="100" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151" font-family="sans-serif">${safe(card.name).toUpperCase()}</text>

    </svg>
  `;
}

function renderFallback(card, borderColor, strokeWidth) {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: 100%;">
      <rect x="20" y="20" width="160" height="160" rx="16"
            fill="${colors.bottom}"
            stroke="${borderColor !== 'none' ? borderColor : '#9ca3af'}"
            stroke-width="${strokeWidth}" />
      <text x="100" y="105" text-anchor="middle" font-size="12" font-weight="bold" fill="#111827">
        ${safe(card.name)}
      </text>
    </svg>
  `;
}

export function generateCardSVG(card) {
  const borderColor = rarityBorders[(card.rarity || 'common').toLowerCase()] || 'none';
  const strokeWidth = borderColor === 'none' ? 0 : ((card.rarity || '').toLowerCase() === 'epic' ? 5 : 3);
  const family = (card.family || '').toLowerCase();

  if (family === 'base') {
    if (card.name.toLowerCase().includes('génoise')) {
        return renderGenoise(card, borderColor, strokeWidth);
    }
    if (card.name.toLowerCase().includes('biscuit')) {
        return renderBiscuit(card, borderColor, strokeWidth);
    }
    if (card.name.toLowerCase().includes('dacquoise')) {
        return renderDacquoise(card, borderColor, strokeWidth);
    }
    return renderBase(card, borderColor, strokeWidth);
  }
  if (family === 'glaze') {
    return renderGlaze(card, borderColor, strokeWidth);
  }
  if (family === 'cream') {
    return renderCream(card, borderColor, strokeWidth);
  }
  if (family === 'filling') {
    return renderFilling(card, borderColor, strokeWidth);
  }
  if (family === 'decoration') {
    return renderDecoration(card, borderColor, strokeWidth);
  }

  return renderFallback(card, borderColor, strokeWidth);
}
