import {refreshMainCalendarSize} from "./calendar.js";

document.getElementById('open-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '0';
});

document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '-250px';
});

const section_calendar = document.getElementById('section_calendar');
const messaging = document.getElementById('messaging');
const help = document.getElementById('help');
const section_admin = document.getElementById('section_admin');

function showSection(sectionId) {
    section_calendar.style.display = 'none';
    messaging.style.display = 'none';
    help.style.display = 'none';
    section_admin.style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('sidebar').style.left = '-250px';
    if (sectionId === "section_calendar") {
        // Le calendrier principal a été initialisé pendant que cet onglet était
        // masqué : on recalcule sa taille maintenant qu'il redevient visible.
        refreshMainCalendarSize();
    }
}

document.getElementById('a_calendar').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#calendar";
    } else {
        showSection('section_calendar');
    }
});

document.getElementById('a_messaging').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#messaging";
    } else {
        showSection('messaging');
    }
});

document.getElementById('a_help').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#help";
    } else {
        showSection('help');
    }
});

// Le lien "calendrier" du message "aucune activité" est généré dynamiquement par
// FullCalendar (noEventsContent), donc on écoute les clics au niveau du document
// plutôt que sur l'élément lui-même, qui n'existe pas forcément encore au chargement.
document.addEventListener('click', (e) => {
    const activityLink = e.target.closest('#actToCal');
    if (!activityLink) return;

    e.preventDefault();
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#calendar";
    } else {
        showSection('section_calendar');
    }
});

document.getElementById('logo_title').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#calendar";
    } else {
        showSection('section_calendar'); // Montre le calendrier
    }
});

document.getElementById('a_admin').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#admin";
    } else {
        showSection('section_admin');
    }
});

document.addEventListener('DOMContentLoaded', function() {

    const hash = window.location.hash;
    if (hash === "#calendar") {
        showSection('section_calendar');
    } else if (hash === "#messaging") {
        showSection('messaging');
    } else if (hash === "#help") {
        showSection('help');
    } else if (hash === "#admin") {
        showSection('section_admin');
    } else {
        // Arrivée normale sur le site (pas de lien direct vers un onglet précis) :
        // on affiche le Calendrier par défaut.
        showSection('section_calendar');
    }
});

// Fonction pour fermer la barre latérale si le clic est à l'extérieur
function clickOutside(event) {
    const sidebar = document.getElementById('sidebar');
    const openButton = document.getElementById('open-btn');
    const closeButton = document.getElementById('close-btn');

    // Vérifiez si le clic est en dehors de la barre latérale et des boutons d'ouverture et de fermeture
    if (!sidebar.contains(event.target) &&
        !openButton.contains(event.target) &&
        !closeButton.contains(event.target)) {
        sidebar.style.left = '-250px'; // Ferme la barre latérale
    }
}

// Ajouter le gestionnaire de clic au document
document.addEventListener('click', clickOutside);

document.addEventListener("DOMContentLoaded", ()=>{

});