// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, deleteUser, signOut, onAuthStateChanged, updateEmail, updatePassword } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, query, where, getDocs, deleteDoc,  writeBatch, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import {Telephone} from "./Classe/Telephone.js";

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

let userToUpdateId = null;


document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const usersCollection = collection(db, "users");
            const queryUsers = query(usersCollection, where("id", "==", user.uid));

            onSnapshot(queryUsers, (snapshot) => {
                snapshot.forEach((doc) => {
                    const userRole = doc.data();

                    if (userRole.role === "admin" || userRole.role === "SUPERADMIN") {
                        const ongletAdmin = document.getElementById("li_admin");
                        ongletAdmin.classList.remove("d-none");

                        const activeUsersQuery = query(usersCollection, where("disabled", "==", false));

                        onSnapshot(activeUsersQuery, (snapshotUsers) => {
                            const table_admin = document.querySelector("#table_admin tbody");
                            table_admin.innerHTML = "";
                            
                            // Récupérer les utilisateurs dans un tableau
                            const usersList = [];
                            snapshotUsers.forEach((docUser) => {
                                const userData = docUser.data();
                                const userId = docUser.id;
                        
                                if (userData.role !== "SUPERADMIN") {
                                    const username = userData.lastname.toUpperCase() + " " + userData.firstname;
                                    usersList.push({
                                        id: userId,
                                        lastname: userData.lastname,
                                        firstname: userData.firstname,
                                        role: userData.role || "Aucun",
                                        username: username
                                    });
                                }
                            });
                        
                            // Trier les utilisateurs par leur nom (prénom + nom)
                            usersList.sort((a, b) => {
                                const nameA = a.lastname + " " + a.firstname;
                                const nameB = b.lastname + " " + b.firstname;
                                return nameA.localeCompare(nameB);  // Tri alphabétique
                            });
                        
                            // Afficher les utilisateurs triés dans le tableau
                            usersList.forEach((user) => {
                                const tr_admin = document.createElement("tr");
                                tr_admin.innerHTML = `
                                    <td>${user.username}</td>
                                    <td>${user.role}</td>
                                    <td>
                                        <a class="text-secondary btn btn-light btn-modifier" data-user-id="${user.id}"><i class="fa-solid fa-pen"></i></a>
                                        <a class="text-danger btn btn-light btn-delete" data-user-id="${user.id}"><i class="fa-solid fa-trash"></i></a>
                                    </td>
                                `;
                                table_admin.appendChild(tr_admin);
                            });
                        
                            // Gestion des boutons de modification et de suppression
                            const btnsModifier = document.querySelectorAll(".btn-modifier");
                            btnsModifier.forEach((btn) => {
                                btn.addEventListener("click", (e) => {
                                    e.preventDefault();
                                    userToUpdateId = btn.getAttribute("data-user-id");
                                    const userId = btn.getAttribute("data-user-id");
                                    const userModifierQuery = query(usersCollection, where("id", "==", userId));
                        
                                    onSnapshot(userModifierQuery, (snapshotModifier) => {
                                        snapshotModifier.forEach((docUser) => {
                                            const userData = docUser.data();
                                            const numTel = new Telephone(userData.telephone);
                                            document.getElementById("modal_lastname").value = userData.lastname;
                                            document.getElementById("modal_firstname").value = userData.firstname;
                                            document.getElementById("modal_email").value = userData.email;
                                            document.getElementById("modal_telephone").value = numTel.formatWithDashes();
                                            document.getElementById("modal_role").value = userData.role;
                        
                                            const userModal = new bootstrap.Modal(document.getElementById("userModal"));
                                            userModal.show();
                                        });
                                    });
                                });
                            });
                        
                            const btnsDelete = document.querySelectorAll(".btn-delete");
                            btnsDelete.forEach((btn) => {
                                btn.addEventListener("click", async (e) => {
                                    const userIdToDelete = btn.getAttribute("data-user-id");
                        
                                    // Demande de confirmation
                                    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer ce compte utilisateur ? ${userIdToDelete}`);
                                    if (confirmation) {
                                        await deleteUserAccount(userIdToDelete);
                                    }
                                });
                            });
                        });
                        
                    }
                });
            });
        }
    });
});
document.getElementById("btn_edit_role").addEventListener("click", async ()=>{
    if (userToUpdateId) {
        const updatedRole = document.getElementById("modal_role").value;
        const updatedLastname = document.getElementById("modal_lastname").value;
        const updatedFirstname = document.getElementById("modal_firstname").value;
        const updatedEmail = document.getElementById("modal_email").value;
        const updateTelephone = document.getElementById("modal_telephone").value;
        const numTel = new Telephone(updateTelephone);

        const userDocRef = doc(db, "users", userToUpdateId);

        const updates = {
            lastname: updatedLastname,
            firstname: updatedFirstname,
            email: updatedEmail,
            telephone: numTel.formatTelephone(),
            role: updatedRole
        };

        try {
            await setDoc(userDocRef, updates, { merge: true });
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
        }
    }
})

async function deleteUserAccount(userIdToDelete) {
    const userDocRef = doc(db, "users", userIdToDelete);

    try {
        // Supprimer les données associées à l'utilisateur dans Firestore
        await deleteUserData(userIdToDelete);

        await setDoc(userDocRef, { disabled: true }, { merge: true });
        console.log('Compte utilisateur et données supprimés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
    }
}

async function deleteUserData(uid) {
    const batch = writeBatch(db);

    try {
        // Suppression des événements associés
        const eventsSnapshot = await getDocs(query(collection(db, 'events'), where('userId', '==', uid)));
        eventsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Suppression des inscriptions associées
        const registrationsSnapshot = await getDocs(query(collection(db, 'registrations'), where('userId', '==', uid)));
        registrationsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Suppression messages où l'utilisateur est l'expéditeur (sender)
        const messageSenderSnapshot = await getDocs(query(collection(db, "messages"), where("senderId", "==", uid)));
        messageSenderSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Suppression messages où l'utilisateur est le destinataire (receiver)
        const messageReceiverSnapshot = await getDocs(query(collection(db, "messages"), where("receiverId", "==", uid)));
        messageReceiverSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Exécution des suppressions en lot
        await batch.commit();
        console.log('Données de l\'utilisateur supprimées avec succès.');

    } catch (error) {
        console.error('Erreur lors de la suppression des données utilisateur:', error);
    }
}