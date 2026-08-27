// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs, writeBatch, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import {Telephone} from "./Classe/Telephone.js";
import { beginLoading, endLoading } from "./Classe/LoadingOverlay.js";

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

// Liste des comptes actifs (disabled === false) et des comptes désactivés (disabled === true)
const usersList = [];
const disabledUsersList = [];

// Évite de réinitialiser plusieurs fois le panneau admin si le document de l'utilisateur connecté change
let adminPanelInitialized = false;

// Évite de signaler la fin du chargement plusieurs fois (le rôle peut être vérifié à nouveau plus tard)
let roleCheckResolved = false;

document.addEventListener("DOMContentLoaded", () => {
    beginLoading("Chargement du calendrier...");

    onAuthStateChanged(auth, (user) => {
        if (!user) return;

        const usersCollection = collection(db, "users");
        const queryUsers = query(usersCollection, where("id", "==", user.uid));

        onSnapshot(queryUsers, async (snapshot) => {
            snapshot.forEach(async (docSnapshot) => {
                const userRole = docSnapshot.data();

                if (userRole.role === "admin" || userRole.role === "SUPERADMIN") {
                    document.getElementById("li_admin").classList.remove("d-none");

                    if (adminPanelInitialized) return;
                    adminPanelInitialized = true;

                    // Corrige une bonne fois pour toutes les comptes créés avant l'ajout du champ "disabled"
                    // (sans ce correctif, ces anciens comptes n'apparaissent dans aucun des deux onglets)
                    await fixLegacyAccountsMissingDisabledField(usersCollection);

                    initAdminTabs();
                    listenActiveUsers(usersCollection);
                    listenDisabledUsers(usersCollection);
                }
            });

            if (!roleCheckResolved) {
                roleCheckResolved = true;
                endLoading();
            }
        });
    });
});

// -------------------------------------------------------------------------
// Migration : ajoute "disabled: false" aux comptes qui n'ont pas ce champ
// -------------------------------------------------------------------------
async function fixLegacyAccountsMissingDisabledField(usersCollection) {
    try {
        const snapshot = await getDocs(usersCollection);
        const batch = writeBatch(db);
        let hasFixes = false;

        snapshot.forEach((docUser) => {
            const data = docUser.data();
            if (typeof data.disabled === "undefined") {
                batch.update(docUser.ref, { disabled: false });
                hasFixes = true;
            }
        });

        if (hasFixes) {
            await batch.commit();
            console.log("Anciens comptes mis à jour avec le champ 'disabled'.");
        }
    } catch (error) {
        console.error("Erreur lors de la correction des anciens comptes :", error);
    }
}

// -------------------------------------------------------------------------
// Modales (remplacent les confirm()/alert() natifs du navigateur)
// -------------------------------------------------------------------------
function showFeedbackModal(message, title = "Information") {
    document.getElementById("adminFeedbackModalLabel").textContent = title;
    document.getElementById("adminFeedbackModalBody").innerHTML = message.replace(/\n/g, "<br>");

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("adminFeedbackModal"));
    modal.show();
}

function showConfirmModal(message, title = "Confirmation") {
    return new Promise((resolve) => {
        const modalEl = document.getElementById("adminConfirmModal");
        document.getElementById("adminConfirmModalLabel").textContent = title;
        document.getElementById("adminConfirmModalBody").innerHTML = message.replace(/\n/g, "<br>");

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        const confirmBtn = document.getElementById("adminConfirmModalConfirmBtn");
        const cancelBtn = document.getElementById("adminConfirmModalCancelBtn");

        let confirmed = false;

        const onConfirm = () => { confirmed = true; };
        const onCancel = () => { confirmed = false; };
        const onHidden = () => {
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
            modalEl.removeEventListener("hidden.bs.modal", onHidden);
            resolve(confirmed);
        };

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
        modalEl.addEventListener("hidden.bs.modal", onHidden);

        modal.show();
    });
}

// -------------------------------------------------------------------------
// Onglets "Comptes actifs" / "Comptes désactivés"
// -------------------------------------------------------------------------
function initAdminTabs() {
    const tabActiveBtn = document.getElementById("tab-active-btn");
    const tabDisabledBtn = document.getElementById("tab-disabled-btn");
    const tableActive = document.getElementById("table_admin");
    const tableDisabled = document.getElementById("table_admin_disabled");
    const searchInput = document.getElementById("searchInput");

    tabActiveBtn.addEventListener("click", () => {
        tabActiveBtn.classList.add("active");
        tabDisabledBtn.classList.remove("active");
        tableActive.classList.remove("d-none");
        tableDisabled.classList.add("d-none");
        searchInput.value = "";
        renderActiveUsers(usersList);
    });

    tabDisabledBtn.addEventListener("click", () => {
        tabDisabledBtn.classList.add("active");
        tabActiveBtn.classList.remove("active");
        tableDisabled.classList.remove("d-none");
        tableActive.classList.add("d-none");
        searchInput.value = "";
        renderDisabledUsers(disabledUsersList);
    });

    searchInput.addEventListener("input", (e) => {
        const searchQuery = e.target.value.toLowerCase();
        const isDisabledTabActive = !tableDisabled.classList.contains("d-none");

        if (isDisabledTabActive) {
            renderDisabledUsers(filterUsers(disabledUsersList, searchQuery));
        } else {
            renderActiveUsers(filterUsers(usersList, searchQuery));
        }
    });
}

function filterUsers(list, searchQuery) {
    if (!searchQuery) return list;
    return list.filter((user) => (user.firstname + " " + user.lastname).toLowerCase().includes(searchQuery));
}

function sortUsers(list) {
    list.sort((a, b) => {
        const nameA = a.lastname + " " + a.firstname;
        const nameB = b.lastname + " " + b.firstname;
        return nameA.localeCompare(nameB);
    });
}

// -------------------------------------------------------------------------
// Comptes actifs
// -------------------------------------------------------------------------
function listenActiveUsers(usersCollection) {
    const activeUsersQuery = query(usersCollection, where("disabled", "==", false));

    onSnapshot(activeUsersQuery, (snapshot) => {
        usersList.length = 0;

        snapshot.forEach((docUser) => {
            const userData = docUser.data();
            if (userData.role === "SUPERADMIN") return;

            usersList.push({
                id: docUser.id,
                lastname: userData.lastname,
                firstname: userData.firstname,
                email: userData.email,
                role: userData.role || "Aucun",
                username: userData.lastname.toUpperCase() + " " + userData.firstname
            });
        });

        sortUsers(usersList);
        renderActiveUsers(usersList);
    });
}

function renderActiveUsers(list) {
    const tbody = document.querySelector("#table_admin tbody");
    tbody.innerHTML = "";

    list.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <a class="text-secondary btn btn-light btn-modifier" data-user-id="${user.id}"><i class="fa-solid fa-pen"></i></a>
                <a class="text-danger btn btn-light btn-delete" data-user-id="${user.id}"><i class="fa-solid fa-trash"></i></a>
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachModifierButtons(tbody);
    attachDeleteButtons(tbody);
}

function attachDeleteButtons(tbody) {
    tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const userIdToDelete = btn.getAttribute("data-user-id");

            const confirmed = await showConfirmModal(
                "L'utilisateur ne pourra plus se connecter et ses événements/messages seront supprimés. " +
                "Le compte restera visible dans l'onglet \"Comptes désactivés\" et pourra être réactivé plus tard si besoin.",
                "Désactiver ce compte ?"
            );

            if (confirmed) {
                await deactivateUserAccount(userIdToDelete);
            }
        });
    });
}

// -------------------------------------------------------------------------
// Comptes désactivés
// -------------------------------------------------------------------------
function listenDisabledUsers(usersCollection) {
    const disabledUsersQuery = query(usersCollection, where("disabled", "==", true));

    onSnapshot(disabledUsersQuery, (snapshot) => {
        disabledUsersList.length = 0;

        snapshot.forEach((docUser) => {
            const userData = docUser.data();
            if (userData.role === "SUPERADMIN") return;

            disabledUsersList.push({
                id: docUser.id,
                lastname: userData.lastname,
                firstname: userData.firstname,
                email: userData.email,
                role: userData.role || "Aucun",
                username: userData.lastname.toUpperCase() + " " + userData.firstname
            });
        });

        sortUsers(disabledUsersList);

        const tableDisabled = document.getElementById("table_admin_disabled");
        if (!tableDisabled.classList.contains("d-none")) {
            renderDisabledUsers(disabledUsersList);
        }
    });
}

function renderDisabledUsers(list) {
    const tbody = document.querySelector("#table_admin_disabled tbody");
    tbody.innerHTML = "";

    list.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button type="button" class="btn btn-success btn-sm btn-reactivate" data-user-id="${user.id}">
                    <i class="fa-solid fa-rotate-left"></i> Réactiver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-reactivate").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const userId = btn.getAttribute("data-user-id");
            const user = disabledUsersList.find((u) => u.id === userId);
            if (!user) return;

            const confirmed = await showConfirmModal(
                "Un email lui sera envoyé pour qu'il définisse un nouveau mot de passe.",
                `Réactiver le compte de ${user.username} ?`
            );

            if (confirmed) {
                await reactivateUserAccount(userId, user.email);
            }
        });
    });
}

// -------------------------------------------------------------------------
// Actions : désactivation / réactivation
// -------------------------------------------------------------------------
async function deactivateUserAccount(userIdToDelete) {
    const userDocRef = doc(db, "users", userIdToDelete);

    try {
        // Supprimer les données associées à l'utilisateur dans Firestore
        await deleteUserData(userIdToDelete);

        await setDoc(userDocRef, { disabled: true }, { merge: true });
        console.log('Compte désactivé et données associées supprimées.');
    } catch (error) {
        console.error('Erreur lors de la désactivation du compte :', error);
        showFeedbackModal("Une erreur est survenue lors de la désactivation du compte.", "Erreur");
    }
}

async function reactivateUserAccount(userId, email) {
    const userDocRef = doc(db, "users", userId);

    try {
        await setDoc(userDocRef, { disabled: false }, { merge: true });

        if (email) {
            try {
                await sendPasswordResetEmail(auth, email);
                showFeedbackModal(
                    "Compte réactivé. Un email de réinitialisation de mot de passe a été envoyé à l'utilisateur.\n\n" +
                    "Astuce : cet email arrive parfois dans les spams. Si vous cliquez plusieurs fois sur Réactiver, " +
                    "seul le lien du dernier email envoyé reste valide.",
                    "Compte réactivé"
                );
            } catch (emailError) {
                console.error("Erreur lors de l'envoi de l'email de réinitialisation :", emailError);
                showFeedbackModal(
                    "Le compte a été réactivé, mais l'email de réinitialisation n'a pas pu être envoyé.",
                    "Compte réactivé"
                );
            }
        } else {
            showFeedbackModal("Compte réactivé.", "Compte réactivé");
        }
    } catch (error) {
        console.error('Erreur lors de la réactivation du compte :', error);
        showFeedbackModal("Une erreur est survenue lors de la réactivation du compte.", "Erreur");
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

// -------------------------------------------------------------------------
// Modification d'un compte (nom, rôle, etc.) - utilisée par les deux onglets
// -------------------------------------------------------------------------
function attachModifierButtons(tbody) {
    tbody.querySelectorAll(".btn-modifier").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const userId = btn.getAttribute("data-user-id");
            userToUpdateId = userId;

            try {
                const userSnapshot = await getDoc(doc(db, "users", userId));
                if (!userSnapshot.exists()) return;

                const userData = userSnapshot.data();
                const numTel = new Telephone(userData.telephone);
                document.getElementById("modal_lastname").value = userData.lastname;
                document.getElementById("modal_firstname").value = userData.firstname;
                document.getElementById("modal_email").value = userData.email;
                document.getElementById("modal_telephone").value = numTel.formatWithDashes();
                document.getElementById("modal_role").value = userData.role;

                const userModal = new bootstrap.Modal(document.getElementById("userModal"));
                userModal.show();
            } catch (error) {
                console.error("Erreur lors du chargement du compte :", error);
            }
        });
    });
}

document.getElementById("btn_edit_role").addEventListener("click", async () => {
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
});
