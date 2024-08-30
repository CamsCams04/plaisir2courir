// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

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

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'fr',
        buttonText: {
            today: 'Aujourd\'hui',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour'
        },
        events: [], // Les événements seront ajoutés dynamiquement
        eventDidMount: function(info) {
            //console.log('Event mounted:', info.event);
            const eventType = info.event.extendedProps.type;
            if (eventType) {
               // console.log('Adding class for type:', eventType);
                info.el.classList.add(eventType);
            } else {
                console.log('No type found for event.');
            }
        }

    });

    calendar.render();

    // Charger les événements depuis Firestore pour l'utilisateur connecté
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const snapshot = await getDocs(query(collection(db, 'events'), where('userId', '==', user.uid)));

                snapshot.forEach(doc => {
                    const eventData = doc.data();
                    calendar.addEvent({
                        title: eventData.title,
                        start: eventData.start,
                        end: eventData.end,
                        description: eventData.description,
                        location: eventData.location,
                        extendedProps: {
                            type: eventData.extendedProps.type
                        }
                    });
                });
            } catch (error) {
                console.error('Erreur lors de la récupération des événements:', error);
            }
        } else {
            console.log('Utilisateur non authentifié');
        }
    });
    // Fonction pour ajouter un événement
    document.getElementById('activity-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('activity-name').value;
        const type = document.getElementById('activity-type').value;
        const date = document.getElementById('activity-date').value;
        const startTime = document.getElementById('activity-start-time').value;
        const endTime = document.getElementById('activity-end-time').value;
        const location = document.getElementById('activity-location').value;
        const description = document.getElementById('activity-description').value;
        const repeat = document.getElementById('activity-repeat').checked;

        const newEvent = {
            title: name,
            start: `${date}T${startTime}`,
            end: `${date}T${endTime}`,
            description: description,
            location: location,
            extendedProps: {
                type: type
            },
            repeat: repeat,
            userId: auth.currentUser.uid
        };

        try {
            // Ajouter l'événement à Firestore
            await addDoc(collection(db, 'events'), newEvent);

            // Ajouter l'événement au calendrier
            calendar.addEvent(newEvent);

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
            modal.hide();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'événement:', error);
            alert('Erreur lors de l\'ajout de l\'événement. Veuillez réessayer.');
        }
    });

    // Fonction pour mettre à jour la barre d'outils en fonction de la taille de la fenêtre
    function updateHeaderToolbar() {
        var isMobile = window.innerWidth <= 600;
        calendar.setOption('headerToolbar', {
            left: isMobile ? 'title' : 'prev,next today',
            center: isMobile ? 'prev,dayGridMonth,timeGridWeek,timeGridDay,next' : 'title',
            right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
        });
    }

    // Appel initial pour définir la disposition correcte
    updateHeaderToolbar();

    // Écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        updateHeaderToolbar();
    });

    // Affichage de la légende
    const legendToggle = document.getElementById('legend-toggle');
    const eventLegend = document.getElementById('event-legend');

    legendToggle.addEventListener('click', function() {
        // Alterne la visibilité de la légende
        if (eventLegend.style.display === 'none' || eventLegend.style.display === '') {
            eventLegend.style.display = 'block';
        } else {
            eventLegend.style.display = 'none';
        }
    });
});
