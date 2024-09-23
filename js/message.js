// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'; // Importer getAuth

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
        userList.innerHTML = ''; // Vider la liste avant d'ajouter les utilisateurs

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

        userSnapshot.forEach(doc => {
            const userData = doc.data();
            const li = document.createElement('li');
            li.classList.add('user-item');
            li.dataset.userId = doc.id;

            const img = document.createElement('img');
            img.classList.add('photo_profil');
            img.src = userData.img || '../img/photo_profil.png'; // Image de profil par défaut

            li.appendChild(img);
            if(userData.lastname && userData.firstname){
                li.appendChild(document.createTextNode(userData.lastname + " " + userData.firstname));
            }else{
                li.appendChild(document.createTextNode('Utilisateur sans nom'));
            }


            userList.appendChild(li);

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
                console.log(doc.id)
                loadMessages(doc.id);
            });
        });
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
                    orderBy('timestamp')
                );
            } else {
                let messagesReceiverQuery = query(messagesCollection,
                    where("receiverId", "in", [user.uid, receiverId]),
                );
                messagesQuery = query(messagesReceiverQuery,
                    where("senderId", "in", [user.uid, receiverId]),
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

                    const messageDate = document.createElement('div');
                    messageDate.classList.add('message-date');
                    const date = messageData.timestamp ? new Date(messageData.timestamp.toDate()).toLocaleString() : 'Date inconnue';
                    messageDate.textContent = date;

                    messageElement.appendChild(senderName);
                    messageElement.appendChild(messageContent);
                    messageElement.appendChild(messageDate);

                    if (messageData.senderId === user.uid) {
                        messageElement.classList.add('sender'); // Messages envoyés par l'utilisateur
                    } else {
                        messageElement.classList.add('receiver'); // Messages reçus
                    }

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
