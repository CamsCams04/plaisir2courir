// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updatePassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, setDoc, doc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

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
// Gestionnaire d'événement pour l'inscription
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const lastname = document.getElementById('lastname').value;
    const firstname = document.getElementById('firstname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const role = document.getElementById("none");

    if (password !== confirmPassword) {
        document.getElementById('signup-error').textContent = "Les mots de passe ne correspondent pas !";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            lastname: lastname,
            firstname: firstname,
            email: email,
            role: role,
            disabled: false,
        });

        window.location.href = `welcome.html?firstname=${encodeURIComponent(firstname)}`;
    } catch (error) {
        document.getElementById('signup-error').textContent = `Erreur lors de l'inscription : ${error.message}`;
    }
});

// Gestionnaire d'événement pour la connexion
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginInput = document.getElementById('login_input').value;
    const password = document.getElementById('login_password').value;

    try {
        let userEmail;
        let lastname;
        let firstname;

        if (loginInput.includes('@')) {
            userEmail = loginInput;
        } else {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('lastname', '==', loginInput));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Nom d\'utilisateur non trouvé');
            }

            const userDoc = querySnapshot.docs[0].data();
            userEmail = userDoc.email;
            lastname = userDoc.lastname;
            firstname = userDoc.firstname;
        }

        const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
        const user = userCredential.user;

        // Récupérer les informations de l'utilisateur dans Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
            throw new Error('Utilisateur non trouvé dans la base de données');
        }

        const userDoc = userDocSnapshot.data();
        lastname = userDoc.lastname;
        firstname = userDoc.firstname;

        // Vérifier si l'utilisateur est désactivé
        if (userDoc.disabled === true) {
            // Rediriger vers return.html pour confirmation
            window.location.href = `return.html?uid=${user.uid}&firstname=${encodeURIComponent(firstname)}`;
            return;
        }

        // Si l'utilisateur n'est pas désactivé, rediriger vers welcome.html
        window.location.href = `welcome.html?firstname=${encodeURIComponent(firstname)}`;
    } catch (error) {
        document.getElementById('login-error').textContent = `Erreur lors de la connexion : ${error.message}`;
    }
});

// Gestionnaire d'événement pour le lien "Mot de passe oublié"
document.getElementById('forgot-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const loginInput = document.getElementById('login_input').value;

    if (!loginInput) {
        document.getElementById('login-error').textContent = "Veuillez entrer votre email avant de réinitialiser le mot de passe.";
        return;
    }

    try {
        let userEmail;

        if (loginInput.includes('@')) {
            userEmail = loginInput;
        } else {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('lastname', '==', loginInput));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Nom d\'utilisateur non trouvé');
            }

            const userDoc = querySnapshot.docs[0].data();
            userEmail = userDoc.email;
        }

        await sendPasswordResetEmail(auth, userEmail);
        document.getElementById('login-error').textContent = `Un email de réinitialisation du mot de passe a été envoyé à ${userEmail}.`;
    } catch (error) {
        document.getElementById('login-error').textContent = `Erreur lors de la réinitialisation du mot de passe : ${error.message}`;
    }
});
