/*
    Different type of email :
        - bug : it's mail to notify a bug
        - message : it's mail to notify a new message
        - delete : it's mail to notify delete an activity

    content :
    {
        - redirectUrl,
        - cc,
        - message,
        - location,
        - title,
        - date,
    }

 */
export class Email {
    constructor(senderEmail, type, receiver, content, username) {
        this.senderEmail = senderEmail;
        this.type = type;
        this.receiver = receiver;
        this.content = content; // content sera un objet contenant toutes les informations nécessaires
        this.username = username;
    }

    sendEmail() {
        const emailData = {
            Titre: this.getSubject(),
            message: this.generateMessage(),
            _next: this.content.redirectUrl,
            _captcha: false,
            _subject: this.getSubject(),
        };

        if (this.content.redirectUrl){
            emailData._next = this.content.redirectUrl;
        }

        if (this.content.cc && Array.isArray(this.content.cc)) {
            emailData._cc = this.content.cc.join(',');
        }

        this.submitForm(emailData);
    }

    getSubject() {
        switch (this.type) {
            case 'bug':
                return 'Notification de bug P2C';
            case 'message':
                return 'Nouveau message Plaisir2Courir';
            case 'delete':
                return 'Attention : évenement supprimé ! Plaisir2Courir';
            default:
                throw new Error('Type de mail inconnu');
        }
    }

    generateMessage() {
        switch (this.type) {
            case 'bug':
                return `Un bug a été signalé par ${this.senderEmail}.\n Détails :\n ${this.content.message}`;
            case 'message':
                return `Vous avez un nouveau message de ${this.username}.\n
Contenu :\n ${this.content.message}\n\n
Pour répondre, rendez-vous dans votre messagerie Plaisir de Courir !`;
            case 'delete':
                return `Bonjour,\n
Nous tenons à vous informer que l'événement suivant a été annulé :\n
    - Titre de l'événement : ${this.content.title}, \n
    - Lieu de l'événement : ${this.content.location},\n
    - Date de l'événement : ${this.content.date}\n
Nous nous excusons pour tout inconvénient que cela pourrait causer et vous remercions de votre compréhension.
\n\n
Cordialement,\n
L'équipe Plaisir2Courir`;
            default:
                return 'Aucun contenu disponible';
        }
    }

    load_message(){
        const mess_loader = document.getElementById("mess_loader");
        switch (this.type){
            case 'bug':
                mess_loader.innerText = "Envoi du mail...";
                break;
            case 'message':
                mess_loader.innerText = "Envoi message...";
                break;
            case 'delete':
                mess_loader.innerText = "Suppression de l'événement...";
                break;
            default:
                return'Aucun contenu disponible';
        }
    }

    submitForm(data) {
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'flex';

        this.load_message();

        const form = document.createElement('form');
        form.action = "https://formsubmit.co/" + this.receiver;
        form.method = "POST";

        for (const key in data) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();

        form.addEventListener('submit', () => {
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);
        });

        document.body.removeChild(form);
    }

}
