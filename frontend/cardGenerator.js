// Force UTF-8
document.charset = "UTF-8";

const flavorsColors = {
    'caramel': { top: '#d97706', bottom: '#92400e' },
    'strawberry': { top: '#fb7185', bottom: '#be123c' },
    'chocolate': { top: '#634832', bottom: '#3e2723' },
    'pistachio': { top: '#a3e635', bottom: '#4d7c0f' },
    'vanilla': { top: '#fffbeb', bottom: '#fef3c7' },
    'lemon': { top: '#fef08a', bottom: '#facc15' },
    'blueberry': { top: '#6366f1', bottom: '#312e81' },
    'raspberry': { top: '#e11d48', bottom: '#881337' },
    'cherry': { top: '#991b1b', bottom: '#450a0a' },
    'butter': { top: '#fef3d7a4', bottom: '#fffa9f56' },
    'cream': { top: '#f3f4f6', bottom: '#e5e7eb' },
    'fruit': { top: '#f472b6', bottom: '#ec4899' },
    'nut': { top: '#d4a373', bottom: '#92582a' },
    'coffee': { top: '#78360fb0', bottom: '#451a0398' },
    'almond': { top: '#d2b48c', bottom: '#a0826d' },
    'hazelnut': { top: '#b5851f', bottom: '#78491f' },
    'neutral': { top: '#e5e7eb', bottom: '#d1d5db' }
};

const flavorIcons = {
    'caramel': '🍯',
    'strawberry': '🍓',
    'chocolate': '🍫',
    'pistachio': '🌿',
    'vanilla': '🌼',
    'lemon': '🍋',
    'blueberry': '🫐',
    'raspberry': '🍇',
    'cherry': '🍒',
    'butter': '🧈',
    'cream': '🥛',
    'fruit': '🍎',
    'nut': '🌰',
    'coffee': '☕',
    'almond': '🌰',
    'hazelnut': '🌰',
    'neutral': '🍰'
};

function getFlavorVisual(flavor) {
    const key = (flavor || 'neutral').toLowerCase();
    return {
        colors: flavorsColors[key] || flavorsColors['neutral'],
        icon: flavorIcons[key] || flavorIcons['neutral']
    };
}

const fruitColors = {
    'raspberry': { top: '#e11d48', bottom: '#881337', shine: '#fb7185' },
    'strawberry': { top: '#f43f5e', bottom: '#9f1239', shine: '#fda4af' },
    'cherry': { top: '#991b1b', bottom: '#450a0a', shine: '#f87171' }
};
const rarityBorders = {
    'common': 'none',
    'uncommon': '#CD7F32',
    'rare': '#C0C0C0',
    'epic': '#FFD700'
};
function generateCardSVG(card) {        
    const bgColor = (flavorsColors[card.flavor] || flavorsColors[card.family] || flavorsColors['neutral']);
    const borderColor = rarityBorders[card.rarity];
    const borderWidth = borderColor === 'none' ? 0 : 4;

    switch(card.family) {
        // SI c'est un glaçage, on dessine du coulis
        case 'base': {
            const baseName = (card.name || '').toLowerCase();
            if (baseName.includes('génoise')) return displaySpongCakeCard(card, bgColor, borderColor, borderWidth);
            if (baseName.includes('biscuit')) return displayBiscuitCard(card, bgColor, borderColor, borderWidth);
            if (baseName.includes('dacquoise')) return displayDacquoiseCard(card, bgColor, borderColor, borderWidth);
            if (baseName.includes('feuillet') || baseName.includes('puff')) return displayPuffPastry(card, bgColor, borderColor, borderWidth);
            return displayBaseCard(card, bgColor, borderColor, borderWidth);
        }
        case 'glaze' :
            
            return displayGlazeCard(card, bgColor, borderColor, borderWidth);
        case 'cream':
            return displayCreamCard(card, bgColor, borderColor, borderWidth);
        case 'filling':
            return displayFillingCard(card, bgColor, borderColor, borderWidth);
        case 'decoration':
            return displayDecorationCard(card, bgColor, borderColor, borderWidth);
        default : 
            return `
                <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="180" height="260" fill="${bgColor.bottom || '#d1d5db'}" rx="10"
                        ${borderColor !== 'none' ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : ''}
                    />
                    <text x="100" y="100" text-anchor="middle" font-size="16" font-weight="bold" fill="#000">
                        ${card.name}
                    </text>
                </svg>
            `;

    }
}
function displaySpongCakeCard(card, bgColor, borderColor, borderWidth) {
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 4);
    const { colors, icon } = getFlavorVisual(card.flavor);
    const gradId = `spongeGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>
            </defs>

            <ellipse cx="100" cy="126" rx="82" ry="30" fill="#c89455" opacity="0.35"/>
            <rect x="35" y="88" width="130" height="40" fill="url(#${gradId})"
                stroke="${borderColor !== 'none' ? borderColor : '#b88247'}" stroke-width="${strokeWidth}" rx="4"/>
            <ellipse cx="100" cy="88" rx="65" ry="18" fill="${colors.top}"
                stroke="${borderColor !== 'none' ? borderColor : '#d19a58'}" stroke-width="${strokeWidth}"/>

            <g stroke="#e6a85f" stroke-width="2.5" opacity="0.75">
                <line x1="45" y1="84" x2="155" y2="90" />
                <line x1="45" y1="95" x2="155" y2="101" />
            </g>

            <ellipse cx="86" cy="82" rx="32" ry="9" fill="#f8d9a0" opacity="0.65"/>

            <text x="72" y="30" text-anchor="middle" font-size="13">${icon}</text>
            <text x="112" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#6b3f24" font-family="sans-serif">
                ${card.name.toUpperCase()}
            </text>
            <text x="100" y="146" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#a0522d'}" font-family="sans-serif">
                ${card.rarity.toUpperCase()}
            </text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#6b3f24">
                <text x="40" y="188">G:${Math.round(card.gout)}</text>
                <text x="90" y="188">T:${Math.round(card.technique)}</text>
                <text x="140" y="188">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;
}

function displayBiscuitCard(card, bgColor, borderColor, borderWidth) {
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 4);
    const { colors, icon } = getFlavorVisual(card.flavor);
    const gradId = `biscuitGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>
            </defs>

            <ellipse cx="100" cy="130" rx="72" ry="16" fill="#c8bba5" opacity="0.35"/>
            <ellipse cx="100" cy="116" rx="72" ry="15" fill="${colors.bottom}"/>
            <rect x="28" y="102" width="144" height="18" fill="url(#${gradId})"
                stroke="${borderColor !== 'none' ? borderColor : '#b87333'}" stroke-width="${strokeWidth}"/>
            <ellipse cx="100" cy="102" rx="72" ry="15" fill="${colors.top}"
                stroke="${borderColor !== 'none' ? borderColor : '#b87333'}" stroke-width="${strokeWidth}"/>

            <g fill="#d29a63" opacity="0.55">
                <circle cx="70" cy="96" r="1.5"/>
                <circle cx="84" cy="102" r="1.8"/>
                <circle cx="100" cy="94" r="1.5"/>
                <circle cx="116" cy="100" r="1.5"/>
                <circle cx="128" cy="104" r="1.2"/>
                <circle cx="62" cy="106" r="1.5"/>
                <circle cx="80" cy="110" r="1.2"/>
                <circle cx="108" cy="108" r="1.6"/>
                <circle cx="124" cy="111" r="1.1"/>
            </g>

            <text x="72" y="30" text-anchor="middle" font-size="13">${icon}</text>
            <text x="112" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#6b3f24" font-family="sans-serif">
                ${card.name.toUpperCase()}
            </text>
            <text x="100" y="146" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#a0522d'}" font-family="sans-serif">
                ${card.rarity.toUpperCase()}
            </text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#6b3f24">
                <text x="40" y="188">G:${Math.round(card.gout)}</text>
                <text x="90" y="188">T:${Math.round(card.technique)}</text>
                <text x="140" y="188">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;
}

function displayDacquoiseCard(card, bgColor, borderColor, borderWidth) {
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 4);
    const { colors, icon } = getFlavorVisual(card.flavor);
    const gradId = `dacqGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>
            </defs>
            <ellipse cx="100" cy="115" rx="82" ry="40" fill="url(#${gradId})"
                     stroke="${borderColor !== 'none' ? borderColor : '#a0826d'}" stroke-width="${strokeWidth}"/>
            <path d="M25,112 C45,95 75,100 100,110 C125,120 155,124 175,112" stroke="#fff4dc" stroke-width="3" opacity="0.5" fill="none"/>
            <g fill="#d2b48c" opacity="0.35">
                <circle cx="70" cy="116" r="2"/><circle cx="95" cy="123" r="2"/><circle cx="125" cy="114" r="1.8"/><circle cx="140" cy="126" r="1.8"/>
            </g>
            <text x="72" y="55" text-anchor="middle" font-size="13">${icon}</text>
            <text x="112" y="55" text-anchor="middle" font-size="13" font-weight="bold" fill="#6f4e37" font-family="sans-serif">${card.name.toUpperCase()}</text>
            <text x="100" y="168" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#8b6b4a'}" font-family="sans-serif">${card.rarity.toUpperCase()}</text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#6f4e37">
                <text x="40" y="190">G:${Math.round(card.gout)}</text>
                <text x="90" y="190">T:${Math.round(card.technique)}</text>
                <text x="140" y="190">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;
}

function displayPuffPastry(card, bgColor, borderColor, borderWidth) {
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 4);
    const { colors, icon } = getFlavorVisual(card.flavor);
    const gradId = `puffGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>
            </defs>
            <rect x="20" y="70" width="160" height="78" rx="10" fill="url(#${gradId})"
                  stroke="${borderColor !== 'none' ? borderColor : '#b8860b'}" stroke-width="${strokeWidth}"/>
            <g stroke="#e6b85c" stroke-width="2" opacity="0.7">
                <line x1="26" y1="86" x2="174" y2="86"/><line x1="26" y1="102" x2="174" y2="102"/><line x1="26" y1="118" x2="174" y2="118"/><line x1="26" y1="134" x2="174" y2="134"/>
            </g>
            <path d="M25,70 Q100,45 175,70" fill="#ffe7b3" opacity="0.45"/>
            <text x="72" y="52" text-anchor="middle" font-size="13">${icon}</text>
            <text x="112" y="52" text-anchor="middle" font-size="13" font-weight="bold" fill="#7a4e1d" font-family="sans-serif">${card.name.toUpperCase()}</text>
            <text x="100" y="166" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#a9702c'}" font-family="sans-serif">${card.rarity.toUpperCase()}</text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#7a4e1d">
                <text x="40" y="190">G:${Math.round(card.gout)}</text>
                <text x="90" y="190">T:${Math.round(card.technique)}</text>
                <text x="140" y="190">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;
}
function displayBaseCard(card, bgColor, borderColor, borderWidth) {
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 5 : 3);
    const { colors, icon } = getFlavorVisual(card.flavor);
    const gradId = `baseGrad-${card.id || Math.floor(Math.random() * 100000)}`;
    
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.top};" />
                    <stop offset="100%" style="stop-color:${colors.bottom};" />
                </linearGradient>

                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
                    <feDiffuseLighting in="noise" lighting-color="#D4A574" surfaceScale="2">
                        <feDistantLight azimuth="45" elevation="35" />
                    </feDiffuseLighting>
                </filter>
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

            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#D4A574">
                <text x="50" y="185" text-anchor="middle">G:${Math.round(card.gout)}</text>
                <text x="100" y="185" text-anchor="middle">T:${Math.round(card.technique)}</text>
                <text x="150" y="185" text-anchor="middle">E:${Math.round(card.esthetique)}</text>
            </g>

            <text x="72" y="145" text-anchor="middle" font-size="13">${icon}</text>
            <text x="112" y="145" text-anchor="middle" font-size="14" font-weight="bold" fill="#3E2723" font-family="sans-serif">
                ${card.name.toUpperCase()}
            </text>
            
            <text x="100" y="160" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#D4A574'}" font-family="sans-serif">
                ${card.rarity.toUpperCase()}
            </text>
        </svg>
    `;
}
function displayGlazeCard(card, bgColor, borderColor, borderWidth) {
    const flavor = card.flavor || 'chocolate';
    const colors = flavorsColors[flavor] || flavorsColors['chocolate'];
    const gradId = `grad-${(card.name || 'card').replace(/\s+/g, '-')}-${card.id || Math.floor(Math.random() * 1000)}`;

    const stats = {
        G: Math.round(card.gout || 0),
        T: Math.round(card.technique || 0),
        E: Math.round(card.esthetique || 0)
    };

    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 5 : 3);

    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.top};" />
                    <stop offset="70%" style="stop-color:${colors.bottom};" />
                </linearGradient>
                <filter id="shadow-rich">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
                    <feOffset dx="0" dy="3" result="offsetblur" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d="M-5,-5 L205,-5 L205,75 C190,75 182,105 170,105 C158,105 150,75 135,75 C120,75 115,140 90,140 C65,140 60,75 40,75 C25,75 15,120 -5,120 Z"
                fill="url(#${gradId})"
                stroke="${borderColor !== 'none' ? borderColor : 'transparent'}"
                stroke-width="${strokeWidth}"
                stroke-linejoin="round"
                filter="url(#shadow-rich)" />
            <path d="M20,15 Q100,22 180,15" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.25" fill="none" />
            <ellipse cx="90" cy="125" rx="6" ry="3" fill="white" opacity="0.2" />
            <g style="text-shadow: 1px 1px 3px rgba(0,0,0,0.4)">
                <text x="100" y="32" text-anchor="middle" font-size="14" font-weight="bold" fill="white" font-family="sans-serif">${card.name.toUpperCase()}</text>
                <text x="100" y="158" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : 'rgba(255,255,255,0.8)'}" font-family="sans-serif">${card.rarity.toUpperCase()}</text>
            </g>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="white">
                <text x="40" y="190">G:${stats.G}</text>
                <text x="90" y="190">T:${stats.T}</text>
                <text x="140" y="190">E:${stats.E}</text>
            </g>
        </svg>
    `;

    // const flavor = card.flavor || 'chocolate';
    // const colors = glazeFlavors[flavor] || glazeFlavors['chocolate'];
    // const gradId = `grad-${card.name.replace(/\s+/g, '-')}`;
    
    // // Stats arrondies
    // const stats = {
    //     G: Math.round(card.gout || 0),
    //     T: Math.round(card.technique || 0),
    //     E: Math.round(card.esthetique || 0)
    // };

    // const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 5 : 3);

    // return `
    //     <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
    //         <defs>
    //             <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
    //                 <stop offset="0%" style="stop-color:${colors.top};" />
    //                 <stop offset="70%" style="stop-color:${colors.bottom};" />
    //             </linearGradient>
                
    //             <filter id="shadow-rich">
    //                 <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
    //                 <feOffset dx="0" dy="3" result="offsetblur" />
    //                 <feComponentTransfer>
    //                     <feFuncA type="linear" slope="0.5" />
    //                 </feComponentTransfer>
    //                 <feMerge>
    //                     <feMergeNode />
    //                     <feMergeNode in="SourceGraphic" />
    //                 </feMerge>
    //             </filter>
    //         </defs>
            
    //         <path d="M-5,-5 L205,-5 L205,60 
    //                  C190,60 185,110 170,110 C155,110 150,60 135,60 
    //                  C120,60 115,165 90,165 C65,165 60,60 40,60 
    //                  C25,60 15,130 -5,130 Z" 
    //             fill="url(#${gradId})" 
    //             stroke="${borderColor !== 'none' ? borderColor : 'transparent'}"
    //             stroke-width="${strokeWidth}"
    //             stroke-linejoin="round"
    //             filter="url(#shadow-rich)" />
            
    //         <path d="M20,15 Q100,22 180,15" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.25" fill="none" />
    //         <ellipse cx="90" cy="150" rx="6" ry="3" fill="white" opacity="0.2" />

    //         <g style="text-shadow: 1px 1px 3px rgba(0,0,0,0.4)">
    //             <text x="100" y="32" text-anchor="middle" font-size="14" font-weight="bold" fill="white" font-family="sans-serif">
    //                 ${card.name.toUpperCase()}
    //             </text>
    //             <text x="100" y="48" text-anchor="middle" font-size="8" font-weight="900" 
    //                   fill="${borderColor !== 'none' ? borderColor : 'rgba(255,255,255,0.8)'}" font-family="sans-serif">
    //                 ${card.rarity.toUpperCase()}
    //             </text>
    //         </g>

    //         <g font-family="sans-serif" font-weight="bold" font-size="10">
    //             <rect x="5" y="40" width="30" height="14" rx="7" fill="rgba(0,0,0,0.2)" />
    //             <text x="20" y="50" text-anchor="middle" fill="white">G:${stats.G}</text>

    //             <rect x="75" y="100" width="30" height="14" rx="7" fill="rgba(0,0,0,0.2)" />
    //             <text x="90" y="110" text-anchor="middle" fill="white">T:${stats.T}</text>

    //             <rect x="167" y="40" width="30" height="14" rx="7" fill="rgba(0,0,0,0.2)" />
    //             <text x="180" y="50" text-anchor="middle" fill="white">E:${stats.E}</text>
    //         </g>
    //     </svg>
    // `;
}

function displayCreamCard(card, bgColor, borderColor, borderWidth) {
    const flavor = card.flavor || 'vanilla';
    const colors = flavorsColors[flavor] || { top: 'rgb(238,238,224)', bottom: 'rgb(227,215,187)' };
    const uid = card.id || Math.floor(Math.random() * 1000000);
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 4);

    return `
        <svg viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg" style="display: block; background: transparent;">
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
                <text x="1024" y="1050" font-size="120" font-weight="bold" style="text-shadow: 4px 4px 10px rgba(255,255,255,0.8)">${card.name.toUpperCase()}</text>
                <text x="1024" y="1180" font-size="70" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#795548'}">${card.rarity.toUpperCase()}</text>
                <text x="1024" y="1850" font-size="80" font-weight="bold">G:${Math.round(card.gout)} · T:${Math.round(card.technique)} · E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;

    // const flavor = card.flavor || 'vanilla';
    // const colors = glazeFlavors[flavor] || { top: 'rgb(238,238,224)', bottom: 'rgb(227,215,187)' };
    
    // // ID unique pour ne pas mélanger les dégradés entre les cartes
    // const uid = card.id || Math.floor(Math.random() * 1000000);
    // const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 35 : 20);

    // return `
    //     <svg viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg" style="display: block; background: transparent;">
    //         <defs>
    //             <linearGradient id="Grad1_${uid}" gradientUnits="userSpaceOnUse" x1="1363.43" y1="1108.2" x2="1402.53" y2="821.435">
    //                 <stop offset="0" stop-color="${colors.bottom}"/>
    //                 <stop offset="1" stop-color="${colors.top}"/>
    //             </linearGradient>
    //             <linearGradient id="Grad2_${uid}" gradientUnits="userSpaceOnUse" x1="1521.43" y1="1250.35" x2="1345.8" y2="1512.24">
    //                 <stop offset="0" stop-color="${colors.bottom}"/>
    //                 <stop offset="1" stop-color="${colors.top}"/>
    //             </linearGradient>
    //             <linearGradient id="Grad3_${uid}" gradientUnits="userSpaceOnUse" x1="849.989" y1="1268.41" x2="372.217" y2="1662.35">
    //                 <stop offset="0" stop-color="${colors.bottom}"/>
    //                 <stop offset="1" stop-color="${colors.top}"/>
    //             </linearGradient>
    //             <linearGradient id="Grad4_${uid}" gradientUnits="userSpaceOnUse" x1="1858.94" y1="968.799" x2="418.811" y2="1037.19">
    //                 <stop offset="0" stop-color="${colors.bottom}"/>
    //                 <stop offset="1" stop-color="${colors.top}"/>
    //             </linearGradient>
    //         </defs>

    //         <path fill="url(#Grad4_${uid})" stroke="${borderColor !== 'none' ? borderColor : 'transparent'}" stroke-width="${strokeWidth}" d="M 413.474 977.543 C 416.021 973.883 414.655 931.041 415.114 922.013 C 421.041 805.479 495.708 704.742 586.324 636.956 C 637.072 598.993 695.347 579.536 741.118 538.279 C 759.932 521.317 777.819 503.354 794.7 484.468 C 828.906 446.25 860.651 407.459 899.927 373.942 C 910.501 364.919 919.684 353.565 931.101 345.078 C 956.179 326.436 981.036 307.603 1007.4 290.761 C 1010.83 288.559 1018.35 282.758 1021.91 284.301 C 1026.2 286.163 1031.96 291.874 1034.32 295.829 C 1045.99 307.317 1057.21 319.775 1069.18 330.861 C 1105.62 364.617 1150.09 389.547 1195.45 409.18 C 1209.92 415.442 1224.81 420.029 1238.42 428.055 C 1310.58 469.522 1381.35 543.55 1410.03 622.354 C 1418.85 646.609 1422.75 680.648 1422.97 706.504 C 1423.15 727.729 1417.71 755.352 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1720.67 1030.59 1721.1 1030.97 1719.87 1031.91 C 1712.26 1037.78 1697.25 1043.66 1688.53 1047.45 C 1694.42 1048.48 1700.45 1049.37 1706.19 1050.98 C 1716.31 1052.97 1747.03 1060.96 1753.37 1067.73 C 1759.9 1084.37 1738.8 1198.19 1733.46 1220.26 C 1779.36 1230.98 1841.58 1251.52 1871.06 1289.4 C 1874.87 1294.26 1879 1300.17 1877.49 1306.59 C 1870.41 1336.59 1829.69 1356.63 1808.15 1373.67 C 1794.75 1383.39 1770.75 1398.07 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1750.29 1598.57 1629.59 1576.69 1573.65 1568.84 C 1578.83 1603.45 1579.74 1618.27 1568.64 1652.27 C 1550.7 1707.22 1537.08 1679.7 1508.05 1690.14 C 1443.01 1713.54 1386.26 1724.98 1317.11 1712.12 C 1280.43 1705.29 1237.74 1690.53 1203.45 1675.43 C 1196.85 1672.53 1185.31 1665.74 1178.25 1667.36 C 1176.93 1671.43 1164.2 1680.64 1159.88 1683.78 C 1118.21 1713.49 1071.81 1735.89 1022.64 1750.03 C 912.803 1781.57 825.758 1762.61 727.184 1708.65 C 711.581 1699.99 696.12 1691.08 680.806 1681.92 C 671.492 1676.22 661.748 1669.47 652.298 1664.3 L 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 C 295.339 1565.42 281.779 1550.86 273.427 1542.41 C 226.593 1495.02 189.961 1438.94 176.237 1372.83 C 163.42 1311.09 174.172 1241.59 199.834 1184.2 C 206.075 1170.24 225.291 1138.38 234.946 1124.76 C 269.221 1076.44 318.443 1033.12 368.141 1001.06 C 380.233 993.264 399.779 980.2 413.474 977.543 z"/>
    //         <path fill="url(#Grad3_${uid})" d="M 304.018 1572.29 C 295.339 1565.42 281.779 1550.86 273.427 1542.41 C 226.593 1495.02 189.961 1438.94 176.237 1372.83 C 163.42 1311.09 174.172 1241.59 199.834 1184.2 C 206.075 1170.24 225.291 1138.38 234.946 1124.76 C 269.221 1076.44 318.443 1033.12 368.141 1001.06 C 380.233 993.264 399.779 980.2 413.474 977.543 C 413.9 981.503 415.468 985.13 415.821 988.883 C 418.026 1012.33 425.457 1032.77 431.427 1055.04 C 448.163 1098.63 473.896 1155.15 518.889 1175.35 C 532.96 1181.67 543.339 1182.19 558.388 1181.99 C 563.376 1251.35 583.589 1315.81 639.327 1360.53 C 738.595 1440.18 865.889 1487.94 978.117 1545.86 C 1021.04 1567.99 1062.98 1591.98 1103.82 1617.77 C 1120.84 1628.4 1141.65 1640.42 1157.64 1652.1 C 1161.21 1654.32 1176.45 1663.14 1177.97 1666.03 L 1177.93 1666.99 L 1178.25 1667.36 C 1176.93 1671.43 1164.2 1680.64 1159.88 1683.78 C 1118.21 1713.49 1071.81 1735.89 1022.64 1750.03 C 912.803 1781.57 825.758 1762.61 727.184 1708.65 C 711.581 1699.99 696.12 1691.08 680.806 1681.92 C 671.492 1676.22 661.748 1669.47 652.298 1664.3 L 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 z"/>
    //         <path fill="rgb(224,209,178)" d="M 431.427 1055.04 C 448.163 1098.63 473.896 1155.15 518.889 1175.35 C 532.96 1181.67 543.339 1182.19 558.388 1181.99 C 563.376 1251.35 583.589 1315.81 639.327 1360.53 C 738.595 1440.18 865.889 1487.94 978.117 1545.86 C 1021.04 1567.99 1062.98 1591.98 1103.82 1617.77 C 1120.84 1628.4 1141.65 1640.42 1157.64 1652.1 C 1153.84 1652.54 1145.87 1647.39 1141.73 1645.55 C 1126.01 1638.54 1109.04 1631.4 1092.84 1625.74 C 1022.51 1601.16 948.569 1588.76 879.697 1560.25 C 798.7 1526.72 729.544 1467.08 659.154 1415.52 C 610.787 1379.99 561.066 1346.79 518.43 1304.51 C 456.261 1242.87 429.484 1164.02 429.792 1077.6 C 429.812 1072.12 429.476 1059.69 431.427 1055.04 z"/>
    //         <path fill="rgb(224,209,178)" d="M 475.364 1538.11 C 515.288 1569.72 559.514 1598 600.314 1628.63 C 616.238 1640.58 636.302 1650.78 651.189 1663.7 C 633.001 1666.46 604.503 1666.67 585.999 1667.08 C 502.294 1668.94 432.282 1662.92 360.479 1615.44 C 342.384 1603.48 319.663 1587.79 304.018 1572.29 C 304.606 1572.31 305.195 1572.31 305.783 1572.33 C 316.134 1572.77 343.566 1583.79 354.653 1587.22 C 382.733 1595.93 486.862 1626.31 509.987 1605.72 C 512.953 1603.08 514.397 1599.58 514.369 1595.63 C 514.253 1579.45 485.855 1551.22 475.364 1538.11 z"/>
    //         <path fill="rgb(237,219,185)" d="M 1019.13 1274.15 C 1053.4 1273.61 1095.41 1279.29 1129.51 1284.26 C 1143.42 1286.28 1161.16 1290.67 1174.36 1292.12 C 1180.24 1294.52 1199.25 1298.03 1206.16 1299.47 C 1219.94 1302.24 1233.61 1305.56 1247.13 1309.4 C 1264.64 1314.19 1282.08 1319.26 1299.43 1324.59 C 1303.18 1325.77 1325.46 1333.19 1327.79 1333.47 C 1345.7 1339.42 1363.42 1345.93 1380.92 1353 C 1387.95 1355.89 1395.42 1358.83 1402.31 1361.97 C 1423.24 1371.54 1445.27 1374.71 1467.75 1379.46 C 1543.48 1395.47 1619.54 1418.36 1697.45 1419.04 C 1711.14 1419.16 1725.02 1417.5 1738.33 1414.46 C 1742.93 1413.4 1755.92 1407.1 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1750.29 1598.57 1629.59 1576.69 1573.65 1568.84 C 1571.04 1566.68 1557.86 1562 1553.74 1560.24 C 1525.44 1548.24 1496.7 1543.85 1466.12 1546.57 C 1298.12 1561.51 1150.95 1471.59 997.972 1417.66 C 925.748 1392.21 849.832 1374.87 778.723 1344.65 C 781.817 1338.06 753.809 1303.33 816.91 1300.06 C 831.69 1299.29 852.691 1297.39 868.014 1296.44 L 868.68 1295.13 C 872.645 1295.06 881.578 1296.06 886.597 1296.16 C 901.372 1296.41 916.146 1295.64 930.816 1293.86 C 951.927 1291.13 970.924 1285.52 991.653 1281.54 C 994.446 1281 1002.8 1281.96 1006.24 1282.15 C 1002.24 1279.12 1003.78 1280.04 998.332 1279.33 C 1007.64 1276.93 1007.61 1274.8 1019.13 1274.15 z"/>
    //         <path fill="url(#Grad2_${uid})" d="M 1019.13 1274.15 C 1053.4 1273.61 1095.41 1279.29 1129.51 1284.26 C 1143.42 1286.28 1161.16 1290.67 1174.36 1292.12 C 1180.24 1294.52 1199.25 1298.03 1206.16 1299.47 C 1219.94 1302.24 1233.61 1305.56 1247.13 1309.4 C 1264.64 1314.19 1282.08 1319.26 1299.43 1324.59 C 1303.18 1325.77 1325.46 1333.19 1327.79 1333.47 C 1345.7 1339.42 1363.42 1345.93 1380.92 1353 C 1387.95 1355.89 1395.42 1358.83 1402.31 1361.97 C 1423.24 1371.54 1445.27 1374.71 1467.75 1379.46 C 1543.48 1395.47 1619.54 1418.36 1697.45 1419.04 C 1711.14 1419.16 1725.02 1417.5 1738.33 1414.46 C 1742.93 1413.4 1755.92 1407.1 1759.56 1406.96 C 1780.03 1438.69 1800.09 1470.58 1816.99 1504.37 C 1833.18 1536.75 1836.07 1554.32 1801.96 1573.48 C 1796.6 1570.62 1785.5 1570.24 1779.11 1569.38 C 1674.86 1555.44 1591.29 1482.63 1501.37 1434.94 C 1349.65 1354.49 1176.87 1301.25 1006.24 1282.15 C 1002.24 1279.12 1003.78 1280.04 998.332 1279.33 C 1007.64 1276.93 1007.61 1274.8 1019.13 1274.15 z"/>
    //         <path fill="url(#Grad1_${uid})" d="M 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1720.67 1030.59 1721.1 1030.97 1719.87 1031.91 C 1712.26 1037.78 1697.25 1043.66 1688.53 1047.45 C 1694.42 1048.48 1700.45 1049.37 1706.19 1050.98 C 1702.24 1052.92 1699.66 1050.96 1695.24 1052.05 C 1697.41 1052.71 1697.68 1052.76 1699.85 1053.14 C 1701.62 1055.41 1701.77 1056.31 1702.81 1058.97 C 1706.69 1062.12 1709.38 1061.66 1712.47 1065.58 C 1707.67 1069.07 1689.41 1069.41 1682.9 1071.52 C 1649.85 1082.28 1618.65 1097.74 1596.22 1125.14 C 1592.25 1129.99 1586.87 1138.42 1582.36 1142.31 C 1581.11 1139 1579.45 1135.87 1577.74 1132.77 C 1572.22 1122.82 1563.15 1110.37 1552.22 1106.22 C 1540.37 1101.73 1466.28 1099.45 1448.18 1098.12 C 1395.49 1094.25 1342.07 1088.91 1291.18 1074.09 C 1235.31 1057.82 1080.87 997.917 1053.97 948.071 C 1035.04 912.985 1057.93 879.802 1080.29 853.186 C 1092.53 838.628 1105.67 824.852 1119.64 811.937 C 1124.45 807.46 1140.22 794.491 1141.71 789.423 C 1145.53 787.288 1148.68 786.186 1152.7 784.641 C 1149.56 807.383 1159.93 818.714 1175.22 833.327 C 1190.58 848.006 1203.17 855.634 1222.16 864.421 C 1264.37 820.508 1316.63 802.416 1373.99 786.356 C 1383.45 783.707 1404.19 777.617 1413.11 776.337 z"/>
    //         <path fill="rgb(237,219,185)" d="M 1413.11 776.337 C 1462.56 762.914 1553.95 762.927 1601.23 782.039 C 1611.63 811.869 1603.23 900.134 1599.76 933.44 C 1593.4 931.126 1575.32 929.462 1568.12 928.53 C 1533.46 924.036 1498.19 923.506 1463.52 920.131 C 1385.55 912.541 1301.69 896.277 1228.82 867.513 C 1227.06 866.187 1224.31 865.296 1222.16 864.421 C 1264.37 820.508 1316.63 802.416 1373.99 786.356 C 1383.45 783.707 1404.19 777.617 1413.11 776.337 z"/>
    //         <path fill="rgb(249,249,245)" d="M 1228.82 867.513 C 1301.69 896.277 1385.55 912.541 1463.52 920.131 C 1498.19 923.506 1533.46 924.036 1568.12 928.53 C 1575.32 929.462 1593.4 931.126 1599.76 933.44 C 1642.88 944.888 1685.52 957.599 1710.14 999.442 C 1715.41 1008.47 1718.95 1018.41 1720.57 1028.74 C 1699.7 1009.91 1686.86 991.946 1658.47 978.19 C 1602.5 951.062 1539.99 949.187 1479.73 940.731 C 1411.61 931.17 1343.25 918.344 1279.33 892.486 C 1270.14 888.766 1234.88 873.989 1227.9 868.656 L 1228.82 867.513 z"/>
    //         <path fill="rgb(249,249,245)" d="M 1141.71 789.423 C 1140.22 794.491 1124.45 807.46 1119.64 811.937 C 1105.67 824.852 1092.53 838.628 1080.29 853.186 C 1057.93 879.802 1035.04 912.985 1053.97 948.071 C 1080.87 997.917 1235.31 1057.82 1291.18 1074.09 C 1342.07 1088.91 1395.49 1094.25 1448.18 1098.12 C 1466.28 1099.45 1540.37 1101.73 1552.22 1106.22 C 1563.15 1110.37 1572.22 1122.82 1577.74 1132.77 C 1579.45 1135.87 1581.11 1139 1582.36 1142.31 C 1583.11 1144.49 1583.81 1146.69 1584.44 1148.9 C 1591.84 1175.15 1580.12 1196.86 1567.85 1218.87 C 1551.24 1137.69 1453.84 1173.5 1393.49 1168.55 C 1253.91 1157.08 1096.83 1107.91 980.185 1030.47 C 963.875 1018.55 942.634 999.038 934.001 980.602 C 898.28 904.322 1000.24 853.198 1053.13 827.348 C 1056.53 826.886 1098.99 808.156 1104.32 805.606 C 1116.75 800.128 1129.21 794.733 1141.71 789.423 z"/>
    //         <path fill="rgb(224,209,178)" d="M 1034.32 295.829 C 1045.99 307.317 1057.21 319.775 1069.18 330.861 C 1105.62 364.617 1150.09 389.547 1195.45 409.18 C 1209.92 415.442 1224.81 420.029 1238.42 428.055 C 1310.58 469.522 1381.35 543.55 1410.03 622.354 C 1418.85 646.609 1422.75 680.648 1422.97 706.504 C 1423.15 727.729 1417.71 755.352 1413.11 776.337 C 1404.19 777.617 1383.45 783.707 1373.99 786.356 C 1316.63 802.416 1264.37 820.508 1222.16 864.421 C 1203.17 855.634 1190.58 848.006 1175.22 833.327 C 1159.93 818.714 1149.56 807.383 1152.7 784.641 C 1148.68 786.186 1145.53 787.288 1141.71 789.423 C 1129.21 794.733 1116.75 800.128 1104.32 805.606 C 1104.41 804.51 1104.8 802.777 1105.74 802.102 C 1141.37 776.41 1164.26 739.725 1169.43 695.596 C 1175.53 643.563 1158.86 590.769 1131.26 546.772 C 1129.81 544.455 1125.72 540.323 1125.6 538.009 C 1128.01 538.652 1127.97 539.313 1129.62 541.137 C 1180.99 597.93 1238.7 716.391 1168.11 779.084 C 1206.46 778.436 1237.2 796.226 1273.74 791.987 C 1353.86 782.695 1342.58 687.016 1319.76 633.463 C 1293.56 571.998 1254.18 520.278 1206.2 474.457 C 1184.91 454.127 1160.88 438.341 1138.47 419.451 C 1107.14 393.214 1080.03 363.521 1055.35 331.027 C 1049.07 322.789 1035.53 305.5 1034.32 295.829 z"/>
    //         <path fill="rgb(224,209,178)" d="M 1085.33 1243.62 L 1084.29 1242.69 C 1064.06 1225.02 1033.52 1213.96 1009.35 1202.09 C 973.047 1184.73 938.534 1162.44 901.71 1146.27 C 877.506 1135.65 851.587 1125.52 826.754 1116.53 C 751.315 1089.2 681.292 1031.64 674.028 946.544 C 666.127 853.975 744.63 805.348 822.631 781.848 C 754.111 816.578 693.191 881.234 701.955 961.509 C 706.425 1002.46 722.521 1031.4 755.564 1057.16 C 825.299 1109.57 908.823 1144.54 989.784 1176.05 C 1052.64 1200.52 1121.79 1220.24 1189.35 1225.24 C 1201.84 1226.17 1217.42 1222.98 1230.15 1223.33 C 1261.16 1223.41 1292.75 1222.49 1323.54 1226.53 C 1332.14 1227.66 1343.48 1230.58 1351.78 1230.38 L 1352.46 1231.64 C 1351.43 1232.18 1350.41 1232.71 1349.39 1233.25 C 1322.87 1232.2 1300.89 1227.15 1273.9 1231.03 C 1231.05 1237.19 1189.14 1253.3 1151.91 1275.49 C 1149.62 1276.86 1139.36 1283.16 1138.87 1283.88 C 1146.32 1287.36 1170.19 1288.07 1174.36 1292.12 C 1161.16 1290.67 1143.42 1286.28 1129.51 1284.26 C 1095.41 1279.29 1053.4 1273.61 1019.13 1274.15 L 1015.42 1272.32 C 1021.18 1266.48 1074.46 1246.98 1085.33 1243.62 z"/>
    //         <path fill="rgb(224,209,178)" d="M 1327.79 1333.47 C 1337.97 1330.91 1379.7 1339.78 1392.53 1341.71 C 1424.14 1346.14 1455.8 1350.15 1487.52 1353.74 C 1531.92 1358.87 1591.13 1360.62 1635.52 1357.78 C 1706.43 1353.24 1739.87 1345.3 1808.15 1373.67 C 1794.75 1383.39 1770.75 1398.07 1759.56 1406.96 C 1755.92 1407.1 1742.93 1413.4 1738.33 1414.46 C 1725.02 1417.5 1711.14 1419.16 1697.45 1419.04 C 1619.54 1418.36 1543.48 1395.47 1467.75 1379.46 C 1445.27 1374.71 1423.24 1371.54 1402.31 1361.97 C 1395.42 1358.83 1387.95 1355.89 1380.92 1353 C 1363.42 1345.93 1345.7 1339.42 1327.79 1333.47 z"/>
    //         <path fill="rgb(224,209,178)" d="M 980.185 1030.47 L 978.994 1031.18 C 972.613 1027.59 968.294 1021.36 963.42 1019.34 C 963.556 1021.86 963.645 1022.75 962.793 1025.13 C 963.801 1028.44 977.072 1032.69 981.622 1035.25 L 981.046 1036.09 C 953.692 1025.31 907.8 1001.64 891.558 979.383 C 815.714 875.456 936.417 841.789 1017.41 831.565 C 1028.16 830.207 1043.35 826.36 1053.13 827.348 C 1000.24 853.198 898.28 904.322 934.001 980.602 C 942.634 999.038 963.875 1018.55 980.185 1030.47 z"/>
    //         <path fill="rgb(224,209,178)" d="M 629.829 1179.9 C 686.82 1180.49 719.218 1229.95 765.507 1256.15 C 801.2 1276.35 829.301 1285.95 868.68 1295.13 L 868.014 1296.44 C 852.691 1297.39 831.69 1299.29 816.91 1300.06 C 753.809 1303.33 781.817 1338.06 778.723 1344.65 C 765.004 1338.81 750.847 1324.95 739.825 1314.64 C 700.75 1278.07 653.85 1227.98 629.829 1179.9 z"/>
    //         <path fill="rgb(249,249,245)" d="M 1871.06 1289.4 C 1865.3 1288.96 1857.3 1284.85 1852.09 1282.14 C 1817.94 1264.36 1782.35 1255.5 1745.03 1246.22 C 1709.13 1237.28 1672.48 1231.74 1635.55 1229.67 C 1622.3 1228.81 1587.88 1228.22 1576.82 1226.14 C 1588.86 1221.43 1717.04 1229.01 1733.46 1220.26 C 1779.36 1230.98 1841.58 1251.52 1871.06 1289.4 z"/>

    //         <g font-family="sans-serif" text-anchor="middle" fill="#4E342E">
    //             <text x="1024" y="1050" font-size="120" font-weight="bold" style="text-shadow: 4px 4px 10px rgba(255,255,255,0.8)">
    //                 ${card.name.toUpperCase()}
    //             </text>
    //             <text x="1024" y="1180" font-size="70" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#795548'}">
    //                 ${card.rarity.toUpperCase()}
    //             </text>
    //             <text x="1024" y="1850" font-size="80" font-weight="bold">
    //                 G:${Math.round(card.gout)} · T:${Math.round(card.technique)} · E:${Math.round(card.esthetique)}
    //             </text>
    //         </g>
    //     </svg>
    // `;
}
function displayFillingCard(card, bgColor, borderColor, borderWidth) {
    const flavor = card.flavor || 'fruit';
    if (flavor === 'fruit') {
        return displayFruitCard(card, bgColor, borderColor, borderWidth);
    }

    const colors = flavorsColors[flavor] || { top: '#f9c784', bottom: '#c17c54' };
    const uid = card.id || Math.floor(Math.random() * 1000000);
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 7 : 4);

    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <linearGradient id="fillingGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors.top}"/>
                    <stop offset="100%" stop-color="${colors.bottom}"/>
                </linearGradient>
            </defs>
            <ellipse cx="100" cy="125" rx="60" ry="9" fill="#c8bba5" opacity="0.35"/>
            <ellipse cx="100" cy="118" rx="58" ry="9" fill="url(#fillingGrad_${uid})" stroke="${borderColor !== 'none' ? borderColor : 'transparent'}" stroke-width="${strokeWidth}"/>
            <rect x="42" y="110" width="116" height="8" fill="${colors.bottom}"/>
            <ellipse cx="100" cy="110" rx="58" ry="9" fill="url(#fillingGrad_${uid})"/>
            <g fill="${colors.bottom}" opacity="0.55">
                <circle cx="75" cy="106" r="1"/>
                <circle cx="90" cy="109" r="1.2"/>
                <circle cx="105" cy="105" r="1"/>
                <circle cx="120" cy="108" r="1"/>
                <circle cx="130" cy="111" r="0.9"/>
                <circle cx="65" cy="112" r="1"/>
                <circle cx="85" cy="115" r="0.9"/>
                <circle cx="110" cy="114" r="1.1"/>
                <circle cx="125" cy="116" r="0.8"/>
            </g>
            <g fill="${colors.bottom}" opacity="0.7">
                <circle cx="50" cy="110" r="2.5"/>
                <circle cx="60" cy="120" r="2.5"/>
                <circle cx="80" cy="121" r="3"/>
                <circle cx="102" cy="113" r="2.5"/>
                <circle cx="125" cy="107" r="3"/>
                <circle cx="150" cy="110" r="2.5"/>
            </g>
            <ellipse cx="70" cy="110" rx="28" ry="8" fill="${colors.bottom}" opacity="0.45"/>
            <ellipse cx="130" cy="110" rx="22" ry="6" fill="${colors.bottom}" opacity="0.35"/>
            <text x="100" y="35" text-anchor="middle" font-size="12" font-weight="bold" fill="${colors.bottom}" font-family="sans-serif">${card.name.toUpperCase()}</text>
            <text x="100" y="152" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : colors.bottom}" font-family="sans-serif">${card.rarity.toUpperCase()}</text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="${colors.bottom}">
                <text x="40" y="188">G:${Math.round(card.gout)}</text>
                <text x="90" y="188">T:${Math.round(card.technique)}</text>
                <text x="140" y="188">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;

// const flavor = card.flavor || 'strawberry';
//     const colors = glazeFlavors[flavor] || { top: 'rgb(252,195,202)', bottom: 'rgb(126,135,168)' };
    
//     // Génération d'un ID unique pour éviter les conflits de dégradés entre cartes
//     const uid = card.id || Math.floor(Math.random() * 1000000);
//     const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 35 : 20);

//     return `
//         <svg viewBox="0 0 2048 1650" xmlns="http://www.w3.org/2000/svg" style="display: block; background: transparent;">
//             <defs>
//                 <linearGradient id="Grad4_${uid}" gradientUnits="userSpaceOnUse" x1="825.354" y1="1315.28" x2="812.212" y2="1310.57">
//                     <stop offset="0" stop-color="${colors.bottom}"/>
//                     <stop offset="1" stop-color="${colors.top}"/>
//                 </linearGradient>
//                 <linearGradient id="Grad10_${uid}" gradientUnits="userSpaceOnUse" x1="755.028" y1="914.024" x2="367.754" y2="487.008">
//                     <stop offset="0" stop-color="${colors.bottom}"/>
//                     <stop offset="1" stop-color="${colors.top}"/>
//                 </linearGradient>
                
//                 <linearGradient id="Grad8_${uid}" gradientUnits="userSpaceOnUse" x1="1750.28" y1="1180.36" x2="1562.19" y2="901.534">
//                     <stop offset="0" stop-color="rgb(118,147,80)"/><stop offset="1" stop-color="rgb(143,172,96)"/>
//                 </linearGradient>
//                 </defs>

//             <g>
//                 <path fill="url(#Grad10_${uid})" stroke="${borderColor !== 'none' ? borderColor : 'transparent'}" stroke-width="${strokeWidth}" d="M 508.675 354.678 C 520.186 362.937 532.309 374.573 543.59 382.012 C 600.609 419.612 635.889 434.072 667.901 497.756 C 671.99 489.883 672.044 482.023 675.556 473.245 L 676.919 472.717 C 693.452 478.387 730.662 520.833 739.754 536.255 C 748.108 550.424 752.877 567.08 756.649 582.969 C 774.417 578.112 768.799 577.591 780.332 567.729 C 787.429 568.012 790.607 578.462 793.545 584.258 C 804.456 605.776 810.005 625.138 810.001 649.326 C 819.206 651.424 829.697 655.707 838.676 659.058 C 816.846 618.143 799.666 569.725 805.952 521.741 C 807.785 507.749 816.04 475.667 842.914 496.259 C 847.909 500.087 838.415 519.23 837.18 527.561 C 831.635 564.943 839.797 615.596 862.144 647.561 L 863.005 648.782 C 876.996 584.306 930.107 577.295 954.886 524.658 C 958.979 515.965 960.357 504.722 961.506 495.278 C 983.059 527.621 988.004 566.396 965.673 599.564 C 998.657 589.767 1029.27 573.431 1046 542.283 C 1046.63 541.116 1047.86 540.521 1049.02 540.06 L 1050.85 541.511 C 1053.01 547.399 1051.94 563.284 1050.34 569.78 C 1043.53 597.581 1029.78 607.167 1007.84 621.483 C 1075.13 623.905 1119.58 636.277 1168.79 687.034 C 1195.74 714.824 1232.29 782.602 1237.3 820.708 C 1237.58 824.123 1237.45 824.608 1238.68 827.886 C 1240.41 831.522 1240.42 831.781 1241.3 835.765 L 1243.88 846.445 L 1244.21 853.333 C 1244.82 856.994 1245.37 861.301 1246.34 864.815 C 1249.79 884.782 1254.14 916.436 1253.08 936.797 C 1252.27 943.363 1249.72 955.397 1252.8 960.691 C 1253.17 973.003 1251.77 1011.74 1248.21 1022.59 C 1247.51 1025.75 1246.29 1029.92 1246.74 1032.95 C 1246.98 1041.71 1244.58 1050.44 1243.91 1058.9 C 1241.78 1059.53 1240.19 1060.06 1238 1060.47 C 1222.17 1067.7 1217.68 1071.73 1208.54 1087.01 C 1193.08 1092.36 1184.79 1096.22 1174.53 1109.79 C 1172.65 1113.82 1171 1116.93 1169.86 1121.24 C 1170.02 1123.38 1170.51 1125.6 1168.46 1127.17 C 1139.23 1149.62 1135.63 1179.92 1156.6 1210.1 L 1155.52 1213.95 C 1152.18 1213.64 1152.39 1212.95 1149.19 1210.49 C 1134.67 1195.24 1128.89 1198.14 1111.82 1194.27 L 1111.32 1192.39 C 1107.47 1184.41 1105.25 1180.51 1100.2 1173.31 C 1082.81 1157.16 1067.24 1150.54 1043.82 1158.38 C 1030.6 1130.87 1007.2 1121.15 978.562 1132.44 C 956.21 1119.41 939.584 1121.75 919.326 1136.73 C 909.383 1136.72 897.853 1136.46 888.577 1139.85 C 885.441 1140.73 877.761 1145.77 874.479 1147.84 C 873.762 1143.36 873.841 1142.83 874.278 1138.25 C 872.038 1121.04 864.428 1105.05 846.772 1099.66 C 841.652 1072.22 831.4 1053.47 800.237 1052.08 C 792.507 1027.52 781.104 1015.22 755.153 1010.46 L 745.847 1010.74 C 742.22 1011.41 741.87 1012.19 739.482 1010.76 C 735.174 1000.15 733.924 995 723.953 988.32 C 708.77 978.148 695.778 978.259 678.601 980.821 C 658.744 972.877 644.032 968.521 624.59 981.516 C 589.807 977.106 566.906 988.57 555.586 1022.75 C 552.542 1016.48 555.97 974.447 557.387 965.242 L 557.952 966.633 L 558.952 967.053 C 588.532 947.728 594.661 952.469 627.45 952.105 C 651.216 951.842 661.202 946.84 686.264 954.946 C 688.622 962.133 684.108 970.186 690.403 975.763 L 691.999 974.886 C 702.831 953.52 675.706 854.045 646.256 850.079 C 644.689 853.156 645.564 852.501 643.089 854.325 C 637.01 847.944 623.63 802.831 623.956 793.157 C 635.283 796.744 662.025 819.392 669.743 828.732 C 671.679 831.076 672.809 832.634 674.385 831.906 C 677.278 822.959 680.126 817.31 684.641 809.14 C 687.969 800.717 696.892 788.512 699.416 779.978 L 698.229 778.468 L 494.295 400.488 C 501.34 383.438 504.224 372.286 508.675 354.678 z" />

//                 <path fill="rgb(187,63,58)" d="M 1007.84 621.483 C 1075.13 623.905 1119.58 636.277 1168.79 687.034 C 1195.74 714.824 1232.29 782.602 1237.3 820.708 C 1237.58 824.123 1237.45 824.608 1238.68 827.886 C 1240.41 831.522 1240.42 831.781 1241.3 835.765 L 1243.88 846.445 L 1244.21 853.333 C 1244.82 856.994 1245.37 861.301 1246.34 864.815 C 1249.79 884.782 1254.14 916.436 1253.08 936.797 C 1252.27 943.363 1249.72 955.397 1252.8 960.691 C 1253.17 973.003 1251.77 1011.74 1248.21 1022.59 C 1247.51 1025.75 1246.29 1029.92 1246.74 1032.95 C 1246.98 1041.71 1244.58 1050.44 1243.91 1058.9 C 1241.78 1059.53 1240.19 1060.06 1238 1060.47 C 1238.26 1050.51 1240.9 1036 1241.69 1025.33 C 1243.89 998.749 1246.99 971.428 1246.89 944.727 C 1246.43 823.118 1200.09 665.528 1065.38 634.962 C 1057.63 633.204 1049.13 629.734 1041.19 629.039 C 1025.68 627.681 1009.63 628.67 994.007 628.946 L 996.819 626.233 C 999.671 625.998 1005.22 622.883 1007.84 621.483 z" />
//                 <path fill="url(#Grad8_${uid})" d="M 1391.22 754.056 C 1401.59 742.586 1412.91 736.584 1428.65 735.897 C 1439.61 735.383 1450.52 737.637 1460.37 742.452 C 1481.21 733.368 1504.21 730.754 1518.45 752.043 C 1550.03 755.134 1578.34 780.686 1574.51 814.165 C 1574.2 816.713 1573.84 819.254 1573.42 821.786 C 1601.13 836.765 1606.89 869.392 1597.79 897.446 C 1608.31 905.471 1607.64 910.08 1609.96 922.511 C 1618.62 915.08 1644.01 908.753 1654.98 906.102 C 1654.33 914.512 1653.96 920.925 1653.99 929.335 C 1691.79 910.872 1718.71 911.934 1759.71 909.11 C 1767.26 908.59 1794.77 900.283 1798.59 903.503 C 1798.67 908.306 1796.42 914.5 1795.01 919.295 C 1784.87 969.884 1782.31 1030.49 1744.75 1068.01 C 1749.66 1068.05 1767.12 1067.07 1769.94 1067.71 C 1772.27 1072.76 1767.19 1077.76 1770.04 1081.95 L 1771.76 1082.26 C 1770.52 1082.65 1769.39 1082.59 1769.12 1083.86 C 1761.33 1120.06 1751.04 1144.2 1718.12 1165.51 C 1725.21 1167.85 1735.84 1170.94 1742.21 1174.22 C 1732.16 1190.29 1724.56 1203.18 1711.16 1216.84 C 1705.5 1222.6 1688.8 1231.33 1686.08 1235.98 C 1683.23 1238.47 1683.14 1238.23 1679.51 1238.71 L 1673.96 1237.81 L 1671.92 1238.52 C 1654 1231.46 1648.39 1230.58 1629.75 1228.02 L 1627.12 1228 C 1600.86 1227.9 1581.82 1232.69 1558.25 1244.96 C 1550.59 1248.95 1539.1 1259.32 1532.05 1265.09 C 1531.51 1264.99 1530.97 1264.88 1530.43 1264.78 C 1534.9 1249.49 1537.25 1229.49 1529.78 1214.76 C 1524.06 1203.49 1521.74 1208.78 1526.33 1197.07 L 1527.32 1194.47 C 1530.71 1182.64 1529.49 1173.27 1526.37 1161.7 L 1525.03 1158.07 L 1522.36 1153.09 L 1519.95 1149.63 L 1518.65 1147.67 L 1516.78 1144.95 C 1513.7 1141.13 1510.72 1138.46 1507.19 1135.1 C 1513.26 1108.69 1509.51 1092.99 1490.13 1073.94 C 1488.32 1072.89 1487.45 1072.23 1485.75 1071.01 C 1479.62 1067.43 1475.36 1065.94 1468.44 1064.66 C 1450.5 1045.86 1440.14 1038.96 1413.4 1044.44 C 1397.37 1035.88 1388.42 1035.23 1370.73 1036.3 L 1368.58 1036.7 C 1359.2 1040.31 1354.8 1042.49 1346.96 1048.91 C 1337.66 1043.71 1334.6 1042.4 1323.89 1040.66 L 1315.75 1039.83 C 1296.23 1042.57 1291.45 1045.28 1277.08 1058.92 L 1272.6 1063.41 L 1271.71 1063.33 C 1260.94 1058.58 1255.18 1058.53 1243.91 1058.9 C 1244.58 1050.44 1246.98 1041.71 1246.74 1032.95 C 1246.29 1029.92 1247.51 1025.75 1248.21 1022.59 C 1251.77 1011.74 1253.17 973.003 1252.8 960.691 C 1249.72 955.397 1252.27 943.363 1253.08 936.797 C 1254.14 916.436 1249.79 884.782 1246.34 864.815 C 1245.37 861.301 1244.82 856.994 1244.21 853.333 L 1243.88 846.445 L 1241.3 835.765 C 1240.42 831.781 1240.41 831.522 1238.68 827.886 C 1237.45 824.608 1237.58 824.123 1237.3 820.708 L 1247.84 815.096 C 1261.03 785.809 1280.09 774.58 1312.43 780.56 C 1331.1 750.183 1358.11 742.532 1391.22 754.056 z" />
//             </g>

//             <g font-family="sans-serif" text-anchor="middle" fill="#312e81">
//                 <text x="1024" y="950" font-size="120" font-weight="bold" style="text-shadow: 4px 4px 10px white">
//                     ${card.name.toUpperCase()}
//                 </text>
//                 <text x="1024" y="1080" font-size="70" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#4338ca'}">
//                     ${card.rarity.toUpperCase()}
//                 </text>
//                 <text x="1024" y="1600" font-size="90" font-weight="bold" fill="white">
//                     G:${Math.round(card.gout)} · T:${Math.round(card.technique)} · E:${Math.round(card.esthetique)}
//                 </text>
//             </g>
//         </svg>
//     `;
    
}
function displayFruitCard(card, bgColor, borderColor, borderWidth) {
    const uid = card.id || Math.floor(Math.random() * 1000);
    const lowName = (card.name || '').toLowerCase();
    let flavor = card.flavor || 'fruit';
    if (flavor === 'fruit') {
        if (lowName.includes('frambo')) flavor = 'raspberry';
        else if (lowName.includes('fraise')) flavor = 'strawberry';
        else if (lowName.includes('cerise')) flavor = 'cherry';
        else flavor = 'strawberry';
    }

    const colors = fruitColors[flavor] || fruitColors['strawberry'];
    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 8 : 4);

    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <radialGradient id="fruitGrad_${uid}" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                    <stop offset="0%" style="stop-color:${colors.top};" />
                    <stop offset="100%" style="stop-color:${colors.bottom};" />
                </radialGradient>
                <filter id="fruitShadow_${uid}">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="4" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
                    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <path d="M100,40 C130,40 160,60 160,100 C160,150 120,170 100,180 C80,170 40,150 40,100 C40,60 70,40 100,40 Z"
                fill="url(#fruitGrad_${uid})"
                stroke="${borderColor !== 'none' ? borderColor : 'transparent'}"
                stroke-width="${strokeWidth}"
                filter="url(#fruitShadow_${uid})" />
            <ellipse cx="80" cy="75" rx="15" ry="10" fill="white" opacity="0.3" transform="rotate(-30 80 75)" />
            <g fill="rgba(0,0,0,0.2)">
                <circle cx="90" cy="110" r="1.5" />
                <circle cx="110" cy="120" r="1.5" />
                <circle cx="100" cy="140" r="1.5" />
                <circle cx="80" cy="130" r="1.5" />
            </g>
            <g font-family="sans-serif" text-anchor="middle" fill="white">
                <text x="100" y="105" font-size="14" font-weight="bold" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.5)">${card.name.toUpperCase()}</text>
                <text x="100" y="120" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#fff'}">${card.rarity.toUpperCase()}</text>
                <text x="100" y="195" font-size="10" font-weight="bold" fill="#333">G:${Math.round(card.gout)} · T:${Math.round(card.technique)} · E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;

    // const flavor = card.flavor || 'strawberry';
    // const colors = fruitColors[flavor] || fruitColors['strawberry'];
    // const uid = card.id || Math.floor(Math.random() * 1000);
    // const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 8 : 4);

    // return `
    //     <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
    //         <defs>
    //             <radialGradient id="fruitGrad_${uid}" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
    //                 <stop offset="0%" style="stop-color:${colors.top};" />
    //                 <stop offset="100%" style="stop-color:${colors.bottom};" />
    //             </radialGradient>
                
    //             <filter id="fruitShadow_${uid}">
    //                 <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
    //                 <feOffset dx="0" dy="4" />
    //                 <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
    //                 <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    //             </filter>
    //         </defs>

    //         <path d="M100,40 
    //                  C130,40 160,60 160,100 
    //                  C160,150 120,170 100,180 
    //                  C80,170 40,150 40,100 
    //                  C40,60 70,40 100,40 Z" 
    //             fill="url(#fruitGrad_${uid})" 
    //             stroke="${borderColor !== 'none' ? borderColor : 'transparent'}"
    //             stroke-width="${strokeWidth}"
    //             filter="url(#fruitShadow_${uid})" />

    //         <ellipse cx="80" cy="75" rx="15" ry="10" fill="white" opacity="0.3" transform="rotate(-30 80 75)" />
            
    //         <g fill="rgba(0,0,0,0.2)">
    //             <circle cx="90" cy="110" r="1.5" />
    //             <circle cx="110" cy="120" r="1.5" />
    //             <circle cx="100" cy="140" r="1.5" />
    //             <circle cx="80" cy="130" r="1.5" />
    //         </g>

    //         <g font-family="sans-serif" text-anchor="middle" fill="white">
    //             <text x="100" y="105" font-size="14" font-weight="bold" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.5)">
    //                 ${card.name.toUpperCase()}
    //             </text>
    //             <text x="100" y="120" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#fff'}">
    //                 ${card.rarity.toUpperCase()}
    //             </text>
    //             <text x="100" y="195" font-size="10" font-weight="bold" fill="#333">
    //                 G:${Math.round(card.gout)} · T:${Math.round(card.technique)} · E:${Math.round(card.esthetique)}
    //             </text>
    //         </g>
    //     </svg>
    // `;
}

function displayDecorationCard(card, bgColor, borderColor, borderWidth) {
    if (card.flavor === 'fruit') {
        return displayFruitCard(card, bgColor, borderColor, borderWidth);
    }

    const strokeWidth = borderColor === 'none' ? 0 : (card.rarity === 'epic' ? 6 : 3);
    return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <radialGradient id="decoGrad" cx="50%" cy="40%" r="65%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="${bgColor}"/>
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="52" fill="url(#decoGrad)" stroke="${borderColor !== 'none' ? borderColor : '#9ca3af'}" stroke-width="${strokeWidth}"/>
            <g opacity="0.45" fill="#ffffff">
                <circle cx="82" cy="86" r="8"/><circle cx="110" cy="78" r="6"/><circle cx="122" cy="104" r="7"/>
            </g>
            <text x="100" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151" font-family="sans-serif">${card.name.toUpperCase()}</text>
            <text x="100" y="162" text-anchor="middle" font-size="8" font-weight="900" fill="${borderColor !== 'none' ? borderColor : '#6b7280'}" font-family="sans-serif">${card.rarity.toUpperCase()}</text>
            <g font-family="sans-serif" font-weight="bold" font-size="10" fill="#374151">
                <text x="40" y="188">G:${Math.round(card.gout)}</text>
                <text x="90" y="188">T:${Math.round(card.technique)}</text>
                <text x="140" y="188">E:${Math.round(card.esthetique)}</text>
            </g>
        </svg>
    `;

    // if (card.flavor === 'fruit') {
    //     return displayFruitCard(card, bgColor, borderColor, borderWidth);
    // }
    // return `
    //     <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    //         <path d="M100,40 Q120,40 120,60 Q120,80 100,80 Q80,80 80,60 Q80,40 100,40" 
    //             fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />
            
    //         <text x="100" y="95" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">
    //             ${card.name}
    //         </text>
    //     </svg>
    // `;
}