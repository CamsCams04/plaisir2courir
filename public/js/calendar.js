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
        events: [
            // Vos événements ici
        ]
    });

    calendar.render();

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
});