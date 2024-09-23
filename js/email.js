(function() {
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
}