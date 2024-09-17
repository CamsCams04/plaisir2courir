import {loadCalendarActivities} from "./calendar.js";

document.getElementById('open-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '0';
});

document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '-250px';
});

const activities = document.getElementById('activities');
const section_calendar = document.getElementById('section_calendar');
const messaging = document.getElementById('messaging');
const help = document.getElementById('help');

function showSection(sectionId) {
    activities.style.display = 'none';
    section_calendar.style.display = 'none';
    messaging.style.display = 'none';
    help.style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('sidebar').style.left = '-250px';
    if(sectionId === "activities"){
        loadCalendarActivities();
    }
}

document.getElementById('a_activities').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#activities"; // Redirige vers welcome.html avec ancre
    } else {
        showSection('activities');
    }
});

document.getElementById('a_calendar').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#calendar"; // Redirige vers welcome.html avec ancre
    } else {
        showSection('section_calendar');
    }
});

document.getElementById('a_messaging').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#messaging"; // Redirige vers welcome.html avec ancre
    } else {
        showSection('messaging');
    }
});

document.getElementById('a_help').addEventListener('click', () => {
    const pathname = location.pathname;
    let pathname_split = pathname.split("/");
    if (pathname_split[pathname_split.length - 1] === "profil.html") {
        window.location.href = "./welcome.html#help"; // Redirige vers welcome.html avec ancre
    } else {
        showSection('help');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash === "#activities") {
        showSection('activities');
    } else if (hash === "#calendar") {
        showSection('section_calendar');
    } else if (hash === "#messaging") {
        showSection('messaging');
    } else if (hash === "#help") {
        showSection('help');
    }
});
