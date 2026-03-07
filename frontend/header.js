// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    // Redirection si pas connecté
    if (!token || !username) {
        window.location.replace('/');
        return;
    }

    // Charger les infos du joueur
    await loadPlayerInfo();

    // Appeler la fonction spécifique de la page si elle existe
    if (typeof onPageLoad === 'function') {
        onPageLoad();
    }
});

// Fonction générique pour charger les infos du joueur
async function loadPlayerInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch('http://localhost:8000/api/players/', {
            headers: { 'Authorization': 'Token ' + token }
        });
        
        const players = await response.json();
        if (response.ok && players.length > 0) {
            const player = players[0];
            
            // Mettre à jour tous les money-display présents
            const moneyDisplays = document.querySelectorAll('#money-display');
            moneyDisplays.forEach((moneyDisplay) => {
                moneyDisplay.textContent = player.money;
            });
            
            // Mettre à jour profile picture si présent
            if (player.profile_picture) {
                const fullUrl = player.profile_picture.startsWith('http') ? player.profile_picture : 'http://localhost:8000' + player.profile_picture;
                
                // Pour game.html
                const profilePictureDiv = document.getElementById('profile-picture');
                if (profilePictureDiv) {
                    profilePictureDiv.innerHTML = `<img src="${fullUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
                
                // Pour petit profil si présent
                const profilePicSmall = document.getElementById('profile-pic-small');
                if (profilePicSmall) {
                    profilePicSmall.innerHTML = `<img src="${fullUrl}" class="w-full h-full object-cover rounded-full">`;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des infos du joueur:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.replace('/');
}

function toggleMenu() {
    alert('Menu à venir !');
}

// Cheat code: Ajouter 1000 coins
async function cheatAddMoney() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez être connecté !');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/players/cheat_add_money/', {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const player = await response.json();
            
            // Mettre à jour l'affichage de l'argent
            const moneyDisplays = document.querySelectorAll('#money-display');
            moneyDisplays.forEach((display) => {
                display.textContent = player.money;
            });
            
            // Animation pour montrer qu'il y a eu un changement
            moneyDisplays.forEach((display) => {
                display.style.color = '#22c55e';
                setTimeout(() => {
                    display.style.color = '';
                }, 500);
            });
        }
    } catch (error) {
        console.error('Erreur cheat code:', error);
    }
}