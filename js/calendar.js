// Importation des modules Firebase
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
const date_modal = document.getElementById("activity-date");

document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');
    let selectedDate = null;
    let selectedEvent = null;

    let calendar = new FullCalendar.Calendar(calendarEl, {
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
        events: [],
        eventDidMount: function (info) {
            const eventType = info.event.extendedProps.type;
            if (eventType) {
                info.el.classList.add(eventType);
            }
        },
        eventClick: function (info) {
            if (selectedEvent && eventsAreEqual(selectedEvent, info.event)) {
                selectedEvent = null;
                info.el.classList.remove('selected-event');
                resetEventModal();
            } else {
                if (selectedEvent) {
                    let prevEl = document.querySelector('.selected-event');
                    if (prevEl) {
                        prevEl.classList.remove('selected-event');
                    }
                }
                selectedEvent = info.event;
                info.el.classList.add('selected-event');
                populateEventModal(info.event);
            }
            if (auth.currentUser.uid === info.event.extendedProps.userId) {
                document.getElementById("edit_activity").classList.remove("d-none");
                document.getElementById("delete_activity").classList.remove("d-none");
            } else {
                document.getElementById("edit_activity").classList.add("d-none");
                document.getElementById("delete_activity").classList.add("d-none");
            }
            const summaryModal = new bootstrap.Modal(document.getElementById('eventSummaryModal'));
            summaryModal.show();

            document.getElementById('edit_activity').addEventListener("click", () => {
                populateEventModal(info.event);
            });
            populateSummaryModal(info.event);
        },
        dateClick: function (info) {
            const clickedDate = info.dateStr;
            if (selectedDate === clickedDate) {
                selectedDate = null;
                date_modal.value = '';
                info.dayEl.classList.remove('selected-day');
            } else {
                if (selectedDate) {
                    const prevSelectedEl = document.querySelector(`[data-date="${selectedDate}"]`);
                    if (prevSelectedEl) {
                        prevSelectedEl.classList.remove('selected-day');
                    }
                }
                selectedDate = clickedDate;
                date_modal.value = clickedDate;
                info.dayEl.classList.add('selected-day')
            }
        }
    });

    calendar.render();

    function eventsAreEqual(event1, event2) {
        return event1.start.toISOString() === event2.start.toISOString() &&
            event1.end.toISOString() === event2.end.toISOString() &&
            event1.title === event2.title;
    }

    function resetEventModal() {
        document.getElementById('activity-edit-name').value = '';
        document.getElementById('activity-edit-description').value = '';
        document.getElementById('activity-edit-type').value = '';
        document.getElementById('activity-edit-location').value = '';
        document.getElementById('activity-edit-date').value = '';
        document.getElementById('activity-edit-start-time').value = '';
        document.getElementById('activity-edit-end-time').value = '';
        document.getElementById('activity-edit-repeat').checked = false;
        document.getElementById('activity-edit-id').value = ''; // Réinitialiser l'ID
    }

    function populateEventModal(event) {
        document.getElementById('activity-edit-name').value = event.title || '';
        document.getElementById('activity-edit-description').value = event.extendedProps.description || '';
        document.getElementById('activity-edit-type').value = event.extendedProps.type || '';
        document.getElementById('activity-edit-location').value = event.extendedProps.location || '';
        if (event.start) {
            let startDate = new Date(event.start);
            document.getElementById('activity-edit-date').value = startDate.toISOString().split('T')[0];
            document.getElementById('activity-edit-start-time').value = startDate.toTimeString().substring(0, 5);
        } else {
            document.getElementById('activity-edit-date').value = '';
            document.getElementById('activity-edit-start-time').value = '';
        }
        if (event.end) {
            let endDate = new Date(event.end);
            document.getElementById('activity-edit-end-time').value = endDate.toTimeString().substring(0, 5);
        } else {
            document.getElementById('activity-edit-end-time').value = '';
        }
        document.getElementById('activity-edit-repeat').checked = event.extendedProps.repeat || false;
        document.getElementById('activity-edit-id').value = ''; // L'ID n'est pas nécessaire ici
    }

    async function populateSummaryModal(event) {
        document.getElementById('summary-name').textContent = event.title || '';
        document.getElementById('summary-type').textContent = event.extendedProps.type || '';
        document.getElementById('summary-location').textContent = event.extendedProps.location || '';
        document.getElementById('summary-description').textContent = event.extendedProps.description || '';

        if (event.start) {
            let startDate = new Date(event.start);
            document.getElementById('summary-date').textContent = startDate.toLocaleDateString('fr-FR');
            document.getElementById('summary-start-time').textContent = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('summary-date').textContent = '';
            document.getElementById('summary-start-time').textContent = '';
        }
        if (event.end) {
            let endDate = new Date(event.end);
            document.getElementById('summary-end-time').textContent = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('summary-end-time').textContent = '';
        }

        try {
            const registrationsCollection = collection(db, 'registrations');
            const eventRegistrationsQuery = query(registrationsCollection, where('eventId', '==', event.id));

            // Écoute en temps réel
            onSnapshot(eventRegistrationsQuery, (snapshot) => {
                document.getElementById("summary-inscription").textContent = snapshot.size;
            }, (error) => {
                console.error("Erreur lors de la récupération des inscriptions en temps réel:", error);
            });

            await updateRegistrationButton(event.id);
        } catch (error) {
            console.error("Erreur lors de la récupération des inscriptions:", error);
        }
        try {
            const userId = event.extendedProps.userId;
            if (userId) {
                const usersCollection = collection(db, 'users');
                const creatorUserQuery = query(usersCollection, where('id', '==', userId));

                const querySnapshot = await getDocs(creatorUserQuery);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        document.getElementById('summary-creator').textContent = userData.username || 'Nom inconnu';
                    });
                } else {
                    console.error('Aucun utilisateur trouvé pour cet ID.');
                    document.getElementById('summary-creator').textContent = 'Utilisateur inconnu';
                }
            } else {
                console.error('User ID est indéfini.');
                document.getElementById('summary-creator').textContent = 'Utilisateur inconnu';
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du créateur :", error);
        }
    }


    // Fonction check inscription
    async function checkUserRegistered(eventId) {
        try {
            const userId = auth.currentUser.uid;
            const registrationSnapshot = await getDocs(query(collection(db, 'registrations'), where('eventId', '==', eventId), where('userId', '==', userId)));
            return !registrationSnapshot.empty; // Retourne true si l'utilisateur est déjà inscrit
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'inscription:', error);
            return false;
        }
    }

    // Fonction changement de bouton
    async function updateRegistrationButton(eventId) {
        const isRegistered = await checkUserRegistered(eventId);
        const registerButton = document.getElementById('register_event');

        if (isRegistered) {
            registerButton.textContent = "Se désinscrire";
            registerButton.classList.add('btn-outline-danger');
            registerButton.classList.remove('btn-outline-primary');
            registerButton.onclick = () => unsubscribeFromEvent(eventId); // Lien vers la fonction de désinscription
        } else {
            registerButton.textContent = 'S\'inscrire';
            registerButton.classList.add('btn-outline-primary');
            registerButton.classList.remove('btn-outline-danger');
            registerButton.onclick = () => subscribeToEvent(eventId); // Lien vers la fonction d'inscription
        }
    }

    // Charger tous les événements depuis Firestore
    const eventsCollection = collection(db, 'events');

    // Écoute en temps réel pour tous les événements
    onSnapshot(eventsCollection, (snapshot) => {
        // Supprimer tous les événements du calendrier avant de les recharger
        calendar.removeAllEvents();

        snapshot.forEach((doc) => {
            const eventData = doc.data();
            calendar.addEvent({
                id: doc.id,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                description: eventData.description,
                location: eventData.location,
                extendedProps: {
                    type: eventData.extendedProps.type
                },
                userId: eventData.userId
            });
        });
    }, (error) => {
        console.error('Erreur lors de la récupération des événements en temps réel:', error);
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
        const nb_repeat = parseInt(document.getElementById("repeat-weeks").value, 10);

        const initialStartDate = new Date(`${date}T${startTime}`);
        const initialEndDate = new Date(`${date}T${endTime}`);

        try {
            console.log(`Création d'événements : ${nb_repeat} répétitions`);
            for (let i = 0; i < nb_repeat; i++) {
                const currentStartDate = new Date(initialStartDate);
                const currentEndDate = new Date(initialEndDate);
                currentStartDate.setDate(currentStartDate.getDate() + (i * 7));
                currentEndDate.setDate(currentEndDate.getDate() + (i * 7));

                // Formatage des dates en ISO string
                const formattedStart = currentStartDate.toISOString();
                const formattedEnd = currentEndDate.toISOString();

                console.log(`Ajout événement - Début: ${formattedStart}, Fin: ${formattedEnd}`);

                const newEvent = {
                    title: name,
                    start: formattedStart,
                    end: formattedEnd,
                    description: description,
                    location: location,
                    extendedProps: {
                        type: type
                    },
                    repeat: repeat,
                    userId: auth.currentUser.uid
                };

                const docRef = await addDoc(collection(db, 'events'), newEvent);

                calendar.addEvent({
                    id: docRef.id,
                    title: name,
                    start: formattedStart,
                    end: formattedEnd,
                    description: description,
                    location: location,
                    extendedProps: {
                        type: type
                    },
                    userId: auth.currentUser.uid
                });
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
            modal.hide();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'événement:', error);
            alert('Erreur lors de l\'ajout de l\'événement. Veuillez réessayer.');
        }
    });

    // Fonction pour éditer un événement
    document.getElementById('activity-edit-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('activity-edit-name').value;
        const type = document.getElementById('activity-edit-type').value;
        const date = document.getElementById('activity-edit-date').value;
        const startTime = document.getElementById('activity-edit-start-time').value;
        const endTime = document.getElementById('activity-edit-end-time').value;
        const location = document.getElementById('activity-edit-location').value;
        const description = document.getElementById('activity-edit-description').value;
        const repeat = document.getElementById('activity-edit-repeat').checked;
        const nb_repeat = parseInt(document.getElementById('repeat-edit-weeks').value, 10);

        console.log(nb_repeat);

        const updatedEvent = {
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

        if (!selectedEvent) {
            console.error('Aucun événement sélectionné pour la mise à jour.');
            alert('Erreur : Aucun événement sélectionné.');
            return;
        }

        try {
            const eventId = selectedEvent.id;

            // Supprimer les anciens événements répétés sauf l'événement principal
            if (selectedEvent.extendedProps.repeat) {
                const querySnapshot = await getDocs(query(
                    collection(db, 'events'),
                    where('userId', '==', auth.currentUser.uid),
                    where('repeat', '==', true),
                    where('start', '>', selectedEvent.start), // On garde l'événement principal
                    where('start', '<=', new Date(selectedEvent.end).toISOString())
                ));

                const deletePromises = [];
                querySnapshot.forEach(doc => {
                    deletePromises.push(deleteDoc(doc.ref));
                });
                await Promise.all(deletePromises);
            }

            // Mettre à jour l'événement principal
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, updatedEvent);

            // Ajouter les nouveaux événements répétés si nécessaire
            if (repeat) {
                const initialStartDate = new Date(updatedEvent.start);
                const initialEndDate = new Date(updatedEvent.end);

                for (let i = 1; i < nb_repeat; i++) { // Commence à 1 pour éviter de recréer l'événement principal
                    const currentStartDate = new Date(initialStartDate);
                    const currentEndDate = new Date(initialEndDate);
                    currentStartDate.setDate(currentStartDate.getDate() + (i * 7)); // Ajouter 7 jours pour chaque itération
                    currentEndDate.setDate(currentEndDate.getDate() + (i * 7)); // Ajouter 7 jours pour chaque itération

                    const formattedStart = currentStartDate.toISOString();
                    const formattedEnd = currentEndDate.toISOString();

                    const newEvent = {
                        title: name,
                        start: formattedStart,
                        end: formattedEnd,
                        description: description,
                        location: location,
                        extendedProps: {
                            type: type
                        },
                        repeat: repeat,
                        userId: auth.currentUser.uid
                    };

                    await addDoc(collection(db, 'events'), newEvent);
                }
            }

            // Mettre à jour l'événement principal sur le calendrier
            selectedEvent.setProp('title', name);
            selectedEvent.setProp('start', updatedEvent.start);
            selectedEvent.setProp('end', updatedEvent.end);
            selectedEvent.setExtendedProp('description', description);
            selectedEvent.setExtendedProp('location', location);
            selectedEvent.setExtendedProp('type', type);
            selectedEvent.setExtendedProp('repeat', repeat);

            const modal = bootstrap.Modal.getInstance(document.getElementById('activityEditModal'));
            modal.hide();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            alert('Erreur lors de la mise à jour de l\'événement. Veuillez réessayer.');
        }
    });

    // Fonction pour supprimer un événement
    document.getElementById('delete_activity').addEventListener('click', async function() {
        if (selectedEvent) {
            const eventId = selectedEvent.id;
            const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            confirmDeleteModal.show();
            document.getElementById('confirm_delete').addEventListener("click", async () => {
                try {
                    const eventRef = doc(db, 'events', eventId);
                    await deleteDoc(eventRef);
                    selectedEvent.remove();
                    selectedEvent = null;
                    const modal = bootstrap.Modal.getInstance(document.getElementById('eventSummaryModal'));
                    modal.hide();
                } catch (error) {
                    console.error('Erreur lors de la suppression de l\'événement:', error);
                    alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.');
                }
                confirmDeleteModal.hide();
            });
        } else {
            console.error('Aucun événement sélectionné pour suppression.');
            alert('Erreur : Aucun événement sélectionné.');
        }
    });

    // Fonction pour mettre à jour la barre d'outils en fonction de la taille de la fenêtre
    function updateHeaderToolbar() {
        let isMobile = window.innerWidth <= 600;
        calendar.setOption('headerToolbar', {
            left: isMobile ? 'title' : 'prev,next today',
            center: isMobile ? 'prev,dayGridMonth,timeGridWeek,timeGridDay,next' : 'title',
            right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
        });
    }

    // Fonction inscription
    async function subscribeToEvent(eventId) {
        try {
            const userId = auth.currentUser.uid;
            await addDoc(collection(db, 'registrations'), {
                userId: userId,
                eventId: eventId
            });
            updateRegistrationButton(eventId); // Met à jour le bouton après inscription
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            alert('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
    }

    // Fonction désinscription
    async function unsubscribeFromEvent(eventId) {
        try {
            const userId = auth.currentUser.uid;
            const registrationSnapshot = await getDocs(query(collection(db, 'registrations'), where('eventId', '==', eventId), where('userId', '==', userId)));
            if (!registrationSnapshot.empty) {
                const registrationId = registrationSnapshot.docs[0].id; // Récupérer l'ID du document d'inscription
                await deleteDoc(doc(db, 'registrations', registrationId));
                updateRegistrationButton(eventId); // Met à jour le bouton après désinscription
            }
        } catch (error) {
            console.error('Erreur lors de la désinscription:', error);
            alert('Erreur lors de la désinscription. Veuillez réessayer.');
        }
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

    const legendToggleActivitie = document.getElementById('legend-toggle-activitie');
    const eventLegendActivitie = document.getElementById('event-legend-activitie');

// Fonction pour afficher ou masquer l'élément `event-legend`
    function toggleLegend(eventLegend) {
        if (eventLegend.style.display === 'none' || eventLegend.style.display === '') {
            eventLegend.style.display = 'block';
        } else {
            eventLegend.style.display = 'none';
        }
    }

    // Gestionnaire de clic pour le bouton `legend-toggle`
        legendToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Empêche la propagation du clic au document
            toggleLegend(eventLegend);
        });

    // Gestionnaire de clic pour le bouton `legend-toggle-activitie`
    legendToggleActivitie.addEventListener('click', function(event) {
        event.stopPropagation(); // Empêche la propagation du clic au document
        toggleLegend(eventLegendActivitie);
    });

    // Fonction pour gérer le clic sur le document
        function handleClickOutside(event) {
            if (!eventLegend.contains(event.target) && event.target !== legendToggle) {
                eventLegend.style.display = 'none';
            }
            if (!eventLegendActivitie.contains(event.target) && event.target !== legendToggleActivitie) {
                eventLegendActivitie.style.display = 'none';
            }
        }

    // Ajouter le gestionnaire de clic au document
    document.addEventListener('click', handleClickOutside);

    // Assurez-vous de masquer `event-legend` lorsqu'il est initialement invisible
    eventLegend.style.display = 'none';
    eventLegendActivitie.style.display = 'none';
});

// Fonction pour charger les activités du calendrier
export async function loadCalendarActivities() {
    let calendarEl = document.getElementById('calendar_activitie');
    let selectedDate = null;
    let selectedEvent = null;

    // Créer une instance de FullCalendar
    let calendar = new FullCalendar.Calendar(calendarEl, {
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
        events: [], // Initialisation vide des événements
        eventDidMount: function (info) {
            const eventType = info.event.extendedProps.type;
            if (eventType) {
                info.el.classList.add(eventType);
            }
        },
        eventClick: function (info) {
            if (selectedEvent && eventsAreEqual(selectedEvent, info.event)) {
                selectedEvent = null;
                info.el.classList.remove('selected-event');
                resetEventModal();
            } else {
                if (selectedEvent) {
                    let prevEl = document.querySelector('.selected-event');
                    if (prevEl) {
                        prevEl.classList.remove('selected-event');
                    }
                }
                selectedEvent = info.event;
                info.el.classList.add('selected-event');
                populateEventModal(info.event);
            }
            /*if (auth.currentUser.uid === info.event.extendedProps.userId) {
                document.getElementById("edit_activity").classList.remove("d-none");
                document.getElementById("delete_activity").classList.remove("d-none");
            } else {
                document.getElementById("edit_activity").classList.add("d-none");
                document.getElementById("delete_activity").classList.add("d-none");
            }*/
            const summaryModal = new bootstrap.Modal(document.getElementById('eventSummaryModal'));
            summaryModal.show();

            document.getElementById('edit_activity').addEventListener("click", () => {
                populateEventModal(info.event);
            });
            populateSummaryModal(info.event);
        },
        dateClick: function (info) {
            const clickedDate = info.dateStr;
            if (selectedDate === clickedDate) {
                selectedDate = null;
                date_modal.value = '';
                info.dayEl.classList.remove('selected-day');
            } else {
                if (selectedDate) {
                    const prevSelectedEl = document.querySelector(`[data-date="${selectedDate}"]`);
                    if (prevSelectedEl) {
                        prevSelectedEl.classList.remove('selected-day');
                    }
                }
                selectedDate = clickedDate;
                date_modal.value = clickedDate;
                info.dayEl.classList.add('selected-day')
            }
        }
    });

    // Récupérer les événements de Firestore
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("L'utilisateur n'est pas connecté.");
            return;
        }

        // Référence à la collection des inscriptions
        const registrationRef = collection(db, 'registrations');
        const queryRegistration = query(registrationRef, where("userId", "==", user.uid));

        // Obtenir les inscriptions de l'utilisateur
        const querySnapshot = await getDocs(queryRegistration);

        if (querySnapshot.empty) {
            console.log("Aucune inscription trouvée pour cet utilisateur.");
            calendar.render();
            return;
        }

        // Collecter les IDs des événements auxquels l'utilisateur est inscrit
        const eventIds = querySnapshot.docs.map(doc => doc.data().eventId);

        if (eventIds.length === 0) {
            console.log("Aucun événement trouvé pour les inscriptions de l'utilisateur.");
            calendar.render();
            return;
        }

        // Référence à la collection des événements
        const eventsRef = collection(db, 'events');

        // Créer une requête pour obtenir les événements basés sur les IDs collectés
        const eventsQuery = query(eventsRef, where(documentId(), "in", eventIds));

        // Obtenir les événements
        const eventsSnapshot = await getDocs(eventsQuery);

        if (eventsSnapshot.empty) {
            console.log("Aucune events trouvée.");
        } else {
            eventsSnapshot.forEach((doc) => {
                const eventData = doc.data();
                calendar.addEvent({
                    id: doc.id,
                    title: eventData.title,
                    start: eventData.start,
                    end: eventData.end,
                    description: eventData.description,
                    location: eventData.location,
                    extendedProps: {
                        type: eventData.extendedProps.type
                    },
                    userId: eventData.userId
                });
            });
        }
        calendar.render();

    } catch (error) {
        console.error("Erreur lors du chargement des activités du calendrier : ", error);
    }

    function eventsAreEqual(event1, event2) {
        return event1.start.toISOString() === event2.start.toISOString() &&
            event1.end.toISOString() === event2.end.toISOString() &&
            event1.title === event2.title;
    }

    function resetEventModal() {
        document.getElementById('activity-edit-name').value = '';
        document.getElementById('activity-edit-description').value = '';
        document.getElementById('activity-edit-type').value = '';
        document.getElementById('activity-edit-location').value = '';
        document.getElementById('activity-edit-date').value = '';
        document.getElementById('activity-edit-start-time').value = '';
        document.getElementById('activity-edit-end-time').value = '';
        document.getElementById('activity-edit-repeat').checked = false;
        document.getElementById('activity-edit-id').value = ''; // Réinitialiser l'ID
    }

    function populateEventModal(event) {
        document.getElementById('activity-edit-name').value = event.title || '';
        document.getElementById('activity-edit-description').value = event.extendedProps.description || '';
        document.getElementById('activity-edit-type').value = event.extendedProps.type || '';
        document.getElementById('activity-edit-location').value = event.extendedProps.location || '';
        if (event.start) {
            let startDate = new Date(event.start);
            document.getElementById('activity-edit-date').value = startDate.toISOString().split('T')[0];
            document.getElementById('activity-edit-start-time').value = startDate.toTimeString().substring(0, 5);
        } else {
            document.getElementById('activity-edit-date').value = '';
            document.getElementById('activity-edit-start-time').value = '';
        }
        if (event.end) {
            let endDate = new Date(event.end);
            document.getElementById('activity-edit-end-time').value = endDate.toTimeString().substring(0, 5);
        } else {
            document.getElementById('activity-edit-end-time').value = '';
        }
        document.getElementById('activity-edit-repeat').checked = event.extendedProps.repeat || false;
        document.getElementById('activity-edit-id').value = ''; // L'ID n'est pas nécessaire ici
    }

    async function populateSummaryModal(event) {
        document.getElementById('summary-name').textContent = event.title || '';
        document.getElementById('summary-type').textContent = event.extendedProps.type || '';
        document.getElementById('summary-location').textContent = event.extendedProps.location || '';
        document.getElementById('summary-description').textContent = event.extendedProps.description || '';

        if (event.start) {
            let startDate = new Date(event.start);
            document.getElementById('summary-date').textContent = startDate.toLocaleDateString('fr-FR');
            document.getElementById('summary-start-time').textContent = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('summary-date').textContent = '';
            document.getElementById('summary-start-time').textContent = '';
        }
        if (event.end) {
            let endDate = new Date(event.end);
            document.getElementById('summary-end-time').textContent = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('summary-end-time').textContent = '';
        }

        try {
            const registrationsCollection = collection(db, 'registrations');
            const eventRegistrationsQuery = query(registrationsCollection, where('eventId', '==', event.id));

            // Écoute en temps réel
            onSnapshot(eventRegistrationsQuery, (snapshot) => {
                document.getElementById("summary-inscription").textContent = snapshot.size;
            }, (error) => {
                console.error("Erreur lors de la récupération des inscriptions en temps réel:", error);
            });

            await updateRegistrationButton(event.id);
        } catch (error) {
            console.error("Erreur lors de la récupération des inscriptions:", error);
        }
        try {
            const userId = event.extendedProps.userId;
            if (userId) {
                const usersCollection = collection(db, 'users');
                const creatorUserQuery = query(usersCollection, where('id', '==', userId));

                const querySnapshot = await getDocs(creatorUserQuery);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        document.getElementById('summary-creator').textContent = userData.username || 'Nom inconnu';
                    });
                } else {
                    console.error('Aucun utilisateur trouvé pour cet ID.');
                    document.getElementById('summary-creator').textContent = 'Utilisateur inconnu';
                }
            } else {
                console.error('User ID est indéfini.');
                document.getElementById('summary-creator').textContent = 'Utilisateur inconnu';
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du créateur :", error);
        }
    }

    // Fonction check inscription
    async function checkUserRegistered(eventId) {
        try {
            const userId = auth.currentUser.uid;
            const registrationSnapshot = await getDocs(query(collection(db, 'registrations'), where('eventId', '==', eventId), where('userId', '==', userId)));
            return !registrationSnapshot.empty; // Retourne true si l'utilisateur est déjà inscrit
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'inscription:', error);
            return false;
        }
    }

    // Fonction désinscription
    async function unsubscribeFromEvent(eventId) {
        try {
            const userId = auth.currentUser.uid;
            const registrationSnapshot = await getDocs(query(collection(db, 'registrations'), where('eventId', '==', eventId), where('userId', '==', userId)));
            if (!registrationSnapshot.empty) {
                const registrationId = registrationSnapshot.docs[0].id; // Récupérer l'ID du document d'inscription
                await deleteDoc(doc(db, 'registrations', registrationId));
                updateRegistrationButton(eventId); // Met à jour le bouton après désinscription
            }
        } catch (error) {
            console.error('Erreur lors de la désinscription:', error);
            alert('Erreur lors de la désinscription. Veuillez réessayer.');
        }
    }

    // Fonction changement de bouton
    async function updateRegistrationButton(eventId) {
        const isRegistered = await checkUserRegistered(eventId);
        const registerButton = document.getElementById('register_event');

        if (isRegistered) {
            registerButton.textContent = "Se désinscrire";
            registerButton.classList.add('btn-outline-danger');
            registerButton.classList.remove('btn-outline-primary');
            registerButton.onclick = () => unsubscribeFromEvent(eventId); // Lien vers la fonction de désinscription
        } else {
            registerButton.classList.add("d-none");
            await loadCalendarActivities();
        }
    }

    // Appel initial pour définir la disposition correcte
    updateHeaderToolbar();

    // Écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        updateHeaderToolbar();
    });

    // Fonction pour mettre à jour la barre d'outils en fonction de la taille de la fenêtre
    function updateHeaderToolbar() {
        let isMobile = window.innerWidth <= 600;
        calendar.setOption('headerToolbar', {
            left: isMobile ? 'title' : 'prev,next today',
            center: isMobile ? 'prev,dayGridMonth,timeGridWeek,timeGridDay,next' : 'title',
            right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
        });
    }
}

