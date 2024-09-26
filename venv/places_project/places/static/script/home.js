document.addEventListener('DOMContentLoaded', () => {
    const homeButtons = document.querySelectorAll('.search-buttons button');

    function applyButtonColor(buttons, activeColor, inactiveColor) {
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => {
                    if (btn === button) {
                        btn.style.backgroundColor = activeColor;
                    } else {
                        btn.style.backgroundColor = inactiveColor;
                    }
                });

                buttons.forEach(btn => {
                    btn.style.transition = 'background-color 0.3s ease';
                });
            });
        });
    }
    applyButtonColor(homeButtons, '#fff', 'rgba(85, 153, 89, 0.6)');
});


