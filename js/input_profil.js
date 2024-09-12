
// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, query, where, getDocs, getDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

// Configuration de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIPaCM8FeIy2QLPMrd8Ibdl8Lj8aujkuA",
    authDomain: "plaisir2courir-17ea7.firebaseapp.com",
    projectId: "plaisir2courir-17ea7",
    storageBucket: "plaisir2courir-17ea7.appspot.com",
    messagingSenderId: "944232074293",
    appId: "1:944232074293:web:3e9a0c1915a96455d1357c"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fonction pour afficher les informations de l'utilisateur dans les champs
async function displayUserInfo(user) {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Remplir les champs avec les données de l'utilisateur
                document.getElementById('profile-pic').src = userData.img || '';
            } else {
                console.log('Aucun document trouvé pour cet utilisateur.');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
    } else {
        console.error('Utilisateur non authentifié.');
        window.location.href = 'login.html'; // Redirection si l'utilisateur n'est pas connecté
    }
}

// Vérifier l'état de l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            displayUserInfo(user); // Appel de la fonction pour afficher les infos de l'utilisateur
        } else {
            console.log('Aucun utilisateur connecté.');
            window.location.href = 'login.html'; // Redirection si nécessaire
        }
    });
});

document.getElementById("profile-pic").addEventListener("click", ()=>{
    window.location = "profil.html";
});
