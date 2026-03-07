document.addEventListener('DOMContentLoaded', async () => {
	const bottomNavPlaceholder = document.getElementById('bottom-nav-placeholder');
	if (!bottomNavPlaceholder) return;

	try {
		const response = await fetch('/static/bottomNav.html');
		const html = await response.text();
		bottomNavPlaceholder.innerHTML = html;

		const activeTab = bottomNavPlaceholder.dataset.active;
		if (activeTab) {
			const activeButton = bottomNavPlaceholder.querySelector(`[data-nav-target="${activeTab}"]`);
			if (activeButton) {
				activeButton.classList.remove('bg-pink-200', 'border-pink-300', 'hover:bg-pink-400', 'hover:text-white');
				activeButton.classList.add('bg-pink-400', 'border-pink-500', 'text-white');
			}
		}
	} catch (error) {
		console.error('Erreur lors du chargement de la navigation commune:', error);
	}
});
