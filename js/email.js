/*(function() {
    emailjs.init('aWSJgfmnA79gNDPXU');
})();

// Fonction pour envoyer un email
function sendEmail() {
    // Les paramètres à envoyer avec le template
    const templateParams = {
        message_content: document.getElementById('bug-description').value,
        sender_name: "BUG !",
        subject: "Descrition de Bug",
    };

    // Appel de la méthode EmailJS pour envoyer l'email
    emailjs.send('service_ywd4kkv', 'template_kya5cod', templateParams)
        .then(function(response) {
            console.log('Email envoyé avec succès !', response.status, response.text);
            document.getElementById("form-feedback").textContent = 'Email envoyé avec succès !';
            document.getElementById("form-feedback").style.color = "green";
            document.getElementById('bug-description').value = "";
        }, function(error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            document.getElementById("form-feedback").textContent = 'Erreur lors de l\'envoi de l\'email.';
            document.getElementById("form-feedback").style.color = "red";
        });
}*/

import {Email} from "./Classe/Email.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot, documentId  } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

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

const submitBug = document.getElementById("submit-bug");
const returnBtn = document.getElementById("return-btn");

if(submitBug){
    submitBug.addEventListener("click", ()=>{
        const userCollection = collection(db, "users");
        const queryUser = query(userCollection, where("id", "==", auth.currentUser.uid));

        onSnapshot(queryUser, (snapchot)=>{
            snapchot.forEach(doc =>{
                const user = doc.data();
                sendEmailBug(user.email, user.lastname, user.firstname);
            })
        })
    });
}

if(returnBtn){
    window.location = "../view/welcome.html";
}

function sendEmailBug(mail, lastname, firstname){
    const email = new Email(
        mail,
        "bug",
        "noreplyplaisir2courir@gmail.com",
        {
            redirectUrl: "https://camscams04.github.io/plaisir2courir/view/redirectEmail.html",
            message: document.getElementById("bug-description").value,
        },
        `${firstname} ${lastname}`,
    );

    email.sendEmail();
}

export function sendEmailMessage(senderName, message, userEmail){
    const email = new Email(
        "noreplyplaisir2courir@gmail.com",
        "message",
        "noreplyplaisir2courir@gmail.com",
        {
            message: message,
            cc: userEmail,
            redirectUrl: "https://camscams04.github.io/plaisir2courir/view/welcome.html#",
        },
        senderName,
    );

    email.sendEmail();
}

export async function sendEmailSuppr(selectedEvent) {
    if (!selectedEvent) {
        console.log('Aucun événement sélectionné pour envoyer les emails.');
        return;
    }
    const eventId = selectedEvent.id;
    try {
        // Récupérer les inscrits à cet événement depuis Firestore
        const registrationsRef = collection(db, 'registrations');
        const registrationQuery = query(registrationsRef, where('eventId', '==', eventId));
        const querySnapshot = await getDocs(registrationQuery);

        const emails = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            // Créer une requête pour obtenir les détails de l'utilisateur avec l'userId
            const userQuery = query(collection(db, 'users'), where("id", "==", data.userId));
            const querySnapshotUser = await getDocs(userQuery); // Utiliser await ici
            querySnapshotUser.forEach((docUser) => {
                const dataUser = docUser.data();
                if (dataUser.email) {
                    emails.push(dataUser.email); // Ajouter l'email à la liste
                }
            });
        }
        // Vérifie s'il y a des emails à qui envoyer
        if (emails.length === 0) {
            console.log("Aucun inscrit à notifier.");
            return;
        }
        const startDate = new Date(selectedEvent.start);
        const endDate = new Date(selectedEvent.end);
        startDate.toLocaleDateString('fr-FR')
        const date = startDate.toLocaleDateString('fr-FR') + " " +
            startDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) + " / "
            + endDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})

        console.log(selectedEvent);

        const email = new Email(
            "noreplyplaisir2courir@gmail.com",
            "delete",
            "noreplyplaisir2courir@gmail.com",
            {
                cc: emails,
                title: selectedEvent.title,
                date: date,
                location: selectedEvent.extendedProps.location,
                redirectUrl: "https://camscams04.github.io/plaisir2courir/view/welcome.html#",
            }
        );
        email.sendEmail();
    } catch (error) {
        console.error("Erreur lors de la récupération des inscrits :", error);
    }
}