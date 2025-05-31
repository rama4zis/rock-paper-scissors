const playerSelection = document.querySelectorAll('.player-selection')

playerSelection.forEach(player => {
    player.addEventListener('click', function () {
        const selectedPlayer = this.dataset.value;
        console.log('Selected Player:', selectedPlayer);

        // change the background color of the selected player
        playerSelection.forEach(p => {
            p.classList.remove('bg-red-400', 'selected');
            p.classList.add('bg-gray-200');
        }
        );
        this.classList.add('bg-red-400', 'selected');
        this.classList.remove('bg-gray-200');
    });
}
);
