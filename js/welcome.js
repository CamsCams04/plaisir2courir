document.getElementById('open-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '0';
});

document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('sidebar').style.left = '-250px';
});

const activities = document.getElementById('activities');
const calendar = document.getElementById('section_calendar');
const messaging = document.getElementById('messaging');
const help = document.getElementById('help');

document.getElementById('a_activities').addEventListener('click', ()=>{
    activities.style.display = "block";
    calendar.style.display = "none";
    messaging.style.display = "none";
    help.style.display = "none";
    document.getElementById('sidebar').style.left = '-250px';
});

document.getElementById('a_calendar').addEventListener('click', ()=>{
    activities.style.display = "none";
    calendar.style.display = "block";
    messaging.style.display = "none";
    help.style.display = "none";
    document.getElementById('sidebar').style.left = '-250px';
});

document.getElementById('a_messaging').addEventListener('click', ()=>{
    activities.style.display = "none";
    calendar.style.display = "none";
    messaging.style.display = "block";
    help.style.display = "none";
    document.getElementById('sidebar').style.left = '-250px';
});

document.getElementById('a_help').addEventListener('click', ()=>{
    activities.style.display = "none";
    calendar.style.display = "none";
    messaging.style.display = "none";
    help.style.display = "block";
    document.getElementById('sidebar').style.left = '-250px';
});



document.addEventListener('DOMContentLoaded', function() {
    // Initialisez EmailJS avec votre Public Key (User ID)
    emailjs.init('aWSJgfmnA79gNDPXU'); // Remplacez par votre USER ID d'EmailJS

    document.getElementById('bug-report-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const bugDescription = document.getElementById('bug-description').value;
        const fixedEmail = 'votre-email@example.com'; // Remplacez par votre adresse e-mail fixe

        emailjs.send('service_8w27u1b', 'template_dtoi5cr', {
            // Assurez-vous que ces noms de paramètres correspondent aux variables définies dans le modèle
            bug_description: bugDescription,
            from_email: fixedEmail
        })
            .then(function(response) {
                document.getElementById('form-feedback').innerText = 'Votre rapport a été envoyé avec succès.';
                document.getElementById('bug-report-form').reset();
            }, function(error) {
                document.getElementById('form-feedback').innerText = 'Erreur lors de l\'envoi du rapport.';
            });
    });
});

