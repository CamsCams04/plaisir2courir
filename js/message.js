// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'; // Importer getAuth
import { Telephone } from "./Classe/Telephone.js";
import {sendEmailMessage} from "./email.js";

let USERNAME;
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
const db = getFirestore(app);
const auth = getAuth(app); // Initialiser auth

// Fonction pour afficher les utilisateurs dans la liste
async function loadUsers() {
    try {
        const userList = document.getElementById('ul_users');
        userList.innerHTML = '';

        // Ajouter le canal de groupe
        const groupChannel = document.createElement('li');
        groupChannel.classList.add('user-item');
        groupChannel.dataset.userId = 'group'; // ID du canal de groupe

        const groupImg = document.createElement('img');
        groupImg.classList.add('photo_profil');
        groupImg.src = '../img/logo%20rond.png';
        groupImg.style.backgroundColor = "white";

        groupChannel.appendChild(groupImg);
        groupChannel.appendChild(document.createTextNode('Canal de groupe'));

        userList.appendChild(groupChannel);

        // Écouter les clics sur le canal de groupe
        groupChannel.addEventListener('click', () => {
            const chatHeader = document.getElementById('chat-header');
            const messageInput = document.getElementById('message-input');
            const chatMessages = document.getElementById('chat-messages');

            // Supprimer les anciens messages d'erreur s'il y en a
            const errorMessage = document.querySelector('.error-message');
            if (errorMessage) {
                chatMessages.removeChild(errorMessage);
            }

            // Mettre à jour l'en-tête du chat avec le nom "Groupe"
            chatHeader.textContent = 'Canal de groupe';
            messageInput.dataset.receiverId = 'group'; // ID spécial pour le canal de groupe

            // Charger les messages du canal de groupe
            loadMessages('group');
        });

        // Charger les utilisateurs normalement
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);

        const other_users = document.createElement("div");
        other_users.id = "other_users";
        other_users.style.display = "none"; // Initialiser comme caché

        const btn_other_users = document.createElement("li");
        btn_other_users.id = "btn_other_users";
        btn_other_users.classList.add("user-item");
        btn_other_users.appendChild(document.createTextNode("Autres utilisateurs"));

        const arrowIcon = document.createElement("i");
        arrowIcon.className = "fas fa-chevron-down";
        arrowIcon.style.marginLeft = "10px";

        btn_other_users.appendChild(arrowIcon);

        btn_other_users.addEventListener('click', () => {
            if (other_users) {
                if (other_users.classList.contains('show')) {
                    other_users.classList.remove('show');
                    arrowIcon.classList.remove('rotate');
                    setTimeout(() => {
                        other_users.style.display = "none";
                    }, 500);
                } else {
                    other_users.style.display = "block";
                    setTimeout(() => {
                        other_users.classList.add('show');
                        arrowIcon.classList.add('rotate');
                    }, 10);
                }
            }
        });

        userSnapshot.forEach(doc => {
            const userData = doc.data();
            if(userData.id !== auth.currentUser.uid) {
                const li = document.createElement('li');
                li.classList.add('user-item');
                li.dataset.userId = doc.id;

                const img = document.createElement('img');
                img.classList.add('photo_profil');
                img.src = userData.img || '../img/photo_profil.png'; // Image de profil par défaut

                const infoUser = document.createElement("div");
                infoUser.classList.add("user-info");

                li.appendChild(img);
                if (userData.lastname && userData.firstname) {
                    infoUser.appendChild(document.createTextNode(userData.lastname + " " + userData.firstname));
                } else {
                    infoUser.appendChild(document.createTextNode('Utilisateur sans nom'));
                }

                const phoneElement = document.createElement('small');
                if (userData.telephone) {
                    const telephone = new Telephone(userData.telephone)
                    phoneElement.textContent = telephone.formatWithDashes();
                } else {
                    phoneElement.textContent = '';
                }
                phoneElement.style.display = 'block';
                phoneElement.style.fontSize = '0.8em';
                infoUser.appendChild(phoneElement);
                li.appendChild(infoUser);

                // Ajouter chaque utilisateur à la div des autres utilisateurs
                other_users.appendChild(li);

                // Ajouter un écouteur pour sélectionner un utilisateur
                li.addEventListener('click', () => {
                    const chatHeader = document.getElementById('chat-header');
                    const messageInput = document.getElementById('message-input');
                    const chatMessages = document.getElementById('chat-messages');

                    // Supprimer le message d'erreur s'il existe
                    const errorMessage = document.querySelector('.error-message');
                    if (errorMessage) {
                        chatMessages.removeChild(errorMessage);
                    }

                    // Mettre à jour le nom du destinataire
                    chatHeader.textContent = userData.lastname + " " + userData.firstname;
                    messageInput.dataset.receiverId = doc.id; // ID du destinataire
                    USERNAME = userData.lastname + " " + userData.firstname;

                    // Charger les messages de l'utilisateur sélectionné
                    loadMessages(doc.id);
                });
            }
        });

        // Ajouter le bouton "Autres utilisateurs" et la liste des autres utilisateurs à la liste
        userList.appendChild(btn_other_users);
        userList.appendChild(other_users); // Ajouter la div après que les utilisateurs aient été ajoutés

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
}



// Fonction pour envoyer un message
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    const user = auth.currentUser; // Utilisateur connecté
    const receiverId = messageInput.dataset.receiverId; // ID du destinataire (peut être "group")
    const chatMessages = document.getElementById('chat-messages');

    // Supprimer les anciens messages d'erreur
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        chatMessages.removeChild(errorMessage);
    }

    if (!receiverId) {
        // Si aucun destinataire n'est sélectionné, afficher un message d'erreur
        const errorElement = document.createElement('div');
        errorElement.classList.add('message', 'error-message');
        errorElement.style.color = 'red';
        errorElement.textContent = 'Aucune discussion sélectionnée ! Veuillez sélectionner un utilisateur ou un groupe pour envoyer un message.';
        chatMessages.appendChild(errorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    if (message && user && receiverId) {
        try {
            // Récupérer le lastname de l'utilisateur à partir de Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            let senderName = 'Utilisateur';
            if (userData.lastname && userData.firstname) {
                senderName = userData.lastname + " " + userData.firstname;
            }
            const messagesCollection = collection(db, 'messages');
            await addDoc(messagesCollection, {
                senderId: user.uid,
                senderName: senderName,  // Ajouter le nom d'utilisateur ici
                receiverId: receiverId, // Le receiverId peut être "group" pour le canal de groupe
                message: message,
                timestamp: serverTimestamp(),
            });

            // Ajouter le message à la zone de chat
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sender'); // Classe pour les messages envoyés
            messageElement.textContent = message; // Ajouter le message
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Faire défiler vers le bas

            messageInput.value = ''; // Réinitialiser le champ de saisie
            console.log('Message envoyé avec succès !');

           
           const usersCollection = collection(db, "users");
           const userEmails = [];
           if(receiverId === "group"){
                const querySnapshot = await getDocs(usersCollection);
                querySnapshot.forEach((doc) => {
                    userEmails.push(doc.data().email);
                });
                console.log("Tous les emails : ", userEmails);
                
                sendEmailMessage(senderName, message, userEmails);
            }else{
                const userDocRef = doc(usersCollection, receiverId);
                const userDoc = await getDoc(userDocRef);
            
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmails.push(userData.email)
                    console.log("Email de l'utilisateur : ", userEmails);
                    sendEmailMessage(senderName, message, userEmails);
                } else {
                    console.log("Aucun utilisateur trouvé avec cet ID.");
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    } else {
        console.error('Le message est vide ou l\'utilisateur n\'est pas connecté.');
    }
}


// Écouter l'événement de clic sur le bouton d'envoi
document.getElementById('send-message').addEventListener('click', sendMessage);

// Fonction pour charger les messages
async function loadMessages(receiverId) {
    const chatMessages = document.getElementById('chat-messages');
    const user = auth.currentUser;

    if (user && receiverId) {
        try {
            const messagesCollection = collection(db, 'messages');

            let messagesQuery;

            if (receiverId === 'group') {
                // Charger tous les messages du canal de groupe
                messagesQuery = query(messagesCollection,
                    where('receiverId', '==', 'group'),
                    orderBy('timestamp', 'asc')
                );
            } else {
                messagesQuery = query(messagesCollection,
                    where('receiverId', 'in', [user.uid, receiverId]),
                    where('senderId', 'in', [user.uid, receiverId]),
                    orderBy('timestamp', 'asc') // Tri des messages par date dans l'ordre croissant
                );
            }

            onSnapshot(messagesQuery, (snapshot) => {
                chatMessages.innerHTML = '';
                snapshot.forEach(doc => {
                    const messageData = doc.data();
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message');

                    // Créer un conteneur pour le message avec les informations de l'expéditeur et la date
                    const messageContent = document.createElement('div');
                    messageContent.classList.add('message-content');
                    messageContent.textContent = messageData.message;

                    const senderName = document.createElement('div');
                    senderName.classList.add('message-sender');
                    senderName.textContent = messageData.senderId === user.uid ? 'Moi' : messageData.senderName || 'Utilisateur inconnu';

                    const divInfo = document.createElement("div");
                    divInfo.classList.add("divInfo");

                    const messageDate = document.createElement('div');
                    messageDate.classList.add('message-date');
                    const date = messageData.timestamp ? new Date(messageData.timestamp.toDate()).toLocaleString() : 'Date inconnue';
                    messageDate.textContent = date;

                    messageElement.appendChild(senderName);
                    messageElement.appendChild(messageContent);
                    divInfo.appendChild(messageDate);

                    if (messageData.senderId === user.uid) {
                        messageElement.classList.add('sender'); // Messages envoyés par l'utilisateur
                    } else {
                        messageElement.classList.add('receiver'); // Messages reçus
                    }

                    let usersCollection = collection(db, "users");
                    let queryUser = query(usersCollection, where("id", "==", messageData.senderId));

                    onSnapshot(queryUser, (snapshotUser)=>{
                        snapshotUser.forEach(doc =>{
                            let userTelephone = doc.data();
                            const messageTelephone = document.createElement('div');
                            messageTelephone.classList.add('message-telephone');
                            const telephone = new Telephone(userTelephone.telephone);
                            messageTelephone.textContent = telephone.formatWithDashes();
                            divInfo.appendChild(messageTelephone);
                        })
                    })

                    messageElement.appendChild(divInfo);

                    chatMessages.appendChild(messageElement);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
        }
    }
}


// Charger les messages au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    loadUsers();

    const openBtn = document.getElementById('open_users');
    const userList = document.querySelector('.user-list');
    const chatArea = document.querySelector('.chat-area');
    const sendMessageBtn = document.getElementById('send-message');

    openBtn.addEventListener('click', () => {
        if (userList.classList.contains('show')) {
            userList.classList.remove('show');
            setTimeout(() => {
                userList.classList.add('d-none');
            }, 300); // Correspond au temps de la transition
            openBtn.style.color = 'black';
        } else {
            userList.classList.remove('d-none');
            userList.classList.add('show');
            openBtn.style.color = 'white';
        }
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (event) => {
        if (!userList.contains(event.target) && !openBtn.contains(event.target)) {
            userList.classList.remove('show');
            setTimeout(() => {
                userList.classList.add('d-none');
            }, 300); // Correspond au temps de la transition
            openBtn.style.color = 'black';
        }
    });

    function updateButtonText() {
        const screenWidth = window.innerWidth;

        if (screenWidth < 500) {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
        } else if (screenWidth < 700) {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
        } else {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>
                                        Envoyer`;
        }
    }

    updateButtonText();
    window.addEventListener('resize', updateButtonText);
});
