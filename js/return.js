
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
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
const db = getFirestore(app);
const auth = getAuth(app);

// Récupérer l'UID et le prénom depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');
const firstname = urlParams.get('firstname');

// Bouton de réactivation
document.getElementById('reactivate-btn').addEventListener('click', async () => {
    try {
        // Mettre à jour le champ disabled à false dans Firestore
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            disabled: false
        });
        // Rediriger vers welcome.html
        window.location.href = `welcome.html?firstname=${encodeURIComponent(firstname)}`;
    } catch (error) {
        console.error('Erreur lors de la réactivation du compte :', error);
    }
});

// Bouton d'annulation (déconnexion)
document.getElementById('cancel-btn').addEventListener('click', async () => {
    try {
        // Déconnexion de l'utilisateur
        await signOut(auth);
        // Rediriger vers la page d'accueil
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
});
