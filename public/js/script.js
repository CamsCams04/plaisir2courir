// Changement entre les formulaires d'inscription et de connexion
document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('inscription').style.display = 'none';
    document.getElementById('connexion').style.display = 'block';
});

document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('connexion').style.display = 'none';
    document.getElementById('inscription').style.display = 'block';
});

// Fonction pour basculer la visibilité du mot de passe
function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(iconId);

    toggleIcon.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    });
}

// Initialiser la fonction pour les champs de mot de passe
togglePasswordVisibility('password', 'toggle-password-register');
togglePasswordVisibility('confirm_password', 'toggle-password-confirm');
togglePasswordVisibility('login_password', 'toggle-password-login');
