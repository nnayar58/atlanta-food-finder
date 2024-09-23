document.addEventListener('DOMContentLoaded', () => {
    const homeButtons = document.querySelectorAll('.search-buttons button');
    const accountButtons = document.querySelectorAll('.account-buttons button');

    function applyButtonLogic(buttons, activeColor, inactiveColor) {
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
    applyButtonLogic(homeButtons, '#fff', 'rgba(85, 153, 89, 0.6)');
    applyButtonLogic(accountButtons, '#a8c4a4', '#bed1bc');

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
        loginButton.addEventListener('click', () => {
            userLogin();
        });

        signupButton.addEventListener('click', () => {
            userLogin();
        });

        function userLogin() {
            signupButton.textContent = 'Hello, User';
            loginButton.remove();
        }
});
