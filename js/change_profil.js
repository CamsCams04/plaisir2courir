// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, deleteUser, signOut, onAuthStateChanged, updateEmail, updatePassword } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, query, where, getDocs, deleteDoc,  writeBatch, getDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

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
                document.getElementById('lastname').value = userData.lastname || '';
                document.getElementById("firstname").value = userData.firstname || "";
                document.getElementById('email').value = userData.email || '';
                document.getElementById('profile-pic').src = userData.img || '../img/photo_profil.png';
                document.getElementById('change_img').src = userData.img || '../img/photo_profil.png';
                document.getElementById('file_img').dataset.base64 = userData.img || '';
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


// Gestionnaire d'événements pour la modification du profil
document.getElementById('form_profil').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    const userDocRef = doc(db, 'users', user.uid);

    const lastname = document.getElementById('lastname').value;
    const firstname = document.getElementById("firstname").value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const profileImage = document.getElementById('file_img').dataset.base64; // Obtient la valeur base64 stockée

    const updates = {};

    if (lastname && lastname !== user.lastname) {
        updates.lastname = lastname;
    }

    if (firstname && firstname !== user.firstname) {
        updates.firstname = firstname;
    }

    if (email && email !== user.email) {
        try {
            await updateEmail(user, email);
            updates.email = email;
        } catch (error) {
            document.getElementById('profile-error').textContent = `Erreur lors de la mise à jour de l'email : ${error.message}`;
            if (error.code === 'auth/requires-recent-login') {
                alert('Pour des raisons de sécurité, veuillez vous reconnecter et réessayer.');
                window.location.href = 'login.html';
            }
            return;
        }
    }

    if (password) {
        if (confirmPassword && password === confirmPassword) {
            try {
                await updatePassword(user, password);
            } catch (error) {
                document.getElementById('profile-error').textContent = `Erreur lors de la mise à jour du mot de passe : ${error.message}`;
                return;
            }
        } else {
            document.getElementById('profile-error').textContent = "Les mots de passe ne correspondent pas !";
            return;
        }
    }

    // Ajoute l'image base64 aux mises à jour si elle existe
    if (profileImage) {
        updates.img = profileImage;
    }

    try {
        if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
        }

        document.getElementById('profile-success').textContent = "Profil mis à jour avec succès !";
    } catch (error) {
        document.getElementById('profile-error').textContent = `Erreur lors de la mise à jour du profil : ${error.message}`;
    }
});

// Deconnection
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location = '../index.html'; // Redirection vers index.html après la déconnexion
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
});


// Delete account

const firestore = getFirestore();

async function deleteUserData(uid) {
    // Crée une instance de batch pour les suppressions en lot
    const batch = writeBatch(firestore);

    try {
        // Suppression des événements associés
        const eventsSnapshot = await getDocs(query(collection(firestore, 'events'), where('userId', '==', uid)));
        eventsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Suppression des inscriptions associées
        const registrationsSnapshot = await getDocs(query(collection(firestore, 'registrations'), where('userId', '==', uid)));
        registrationsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Suppression du document utilisateur
        const userDocRef = doc(firestore, 'users', uid);
        batch.delete(userDocRef);

        // Exécution des suppressions en lot
        await batch.commit();
        console.log('Données de l\'utilisateur supprimées avec succès.');

    } catch (error) {
        console.error('Erreur lors de la suppression des données utilisateur:', error);
    }
}

async function deleteUserAccount() {
    const user = auth.currentUser;

    if (user) {
        try {
            // Supprimer les données associées à l'utilisateur
            await deleteUserData(user.uid);

            // Supprimer l'utilisateur de Firebase Authentication
            await user.delete();
            console.log('Compte utilisateur et données supprimés avec succès.');
            window.location = '../index.html';
        } catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
        }
    } else {
        console.log('Aucun utilisateur connecté.');
    }
}

document.getElementById('delete_account').addEventListener('click', async () => {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
    if (confirmDelete) {
        await deleteUserAccount();
    }
});

document.getElementById("change_img").addEventListener("click", () => {
    const file_img = document.getElementById("file_img");
    file_img.click();
});

// Gestionnaire d'événements pour le changement d'image
document.getElementById("file_img").addEventListener("change", () => {
    const fileInput = document.getElementById("file_img").files[0];
    if (fileInput) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement("canvas");
                const maxWidth = 800; // Définissez une largeur maximale pour l'image
                const maxHeight = 800; // Définissez une hauteur maximale pour l'image
                let width = img.width;
                let height = img.height;

                // Redimensionner l'image si elle dépasse les dimensions maximales
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.floor(height * (maxWidth / width));
                        width = maxWidth;
                    } else {
                        width = Math.floor(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir le canvas en base64
                const base64String = canvas.toDataURL("image/jpeg", 0.7); // Qualité de 70%

                // Mettre à jour les images de profil
                document.getElementById("profile-pic").src = base64String;
                document.getElementById("change_img").src = base64String;
                document.getElementById("file_img").dataset.base64 = base64String;
            };
        };
        reader.readAsDataURL(fileInput);
    } else {
        alert("Veuillez sélectionner une image.");
    }
});
