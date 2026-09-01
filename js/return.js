
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';

const firebaseConfig = {
    apiKey: "AIzaSyBIPaCM8FeIy2QLPMrd8Ibdl8Lj8aujkuA",
    authDomain: "plaisir2courir-17ea7.firebaseapp.com",
    projectId: "plaisir2courir-17ea7",
    storageBucket: "plaisir2courir-17ea7.appspot.com",
    messagingSenderId: "944232074293",
    appId: "1:944232074293:web:3e9a0c1915a96455d1357c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Le compte est désactivé : on ne propose plus à l'utilisateur de se réactiver lui-même
// (seul un administrateur peut réactiver un compte depuis la page Admin).
// Bouton : déconnexion et retour à l'accueil.
document.getElementById('cancel-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
});
