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

        ],
        eventDidMount: function(info) {
            const eventType = info.event.extendedProps.type;
            if (eventType) {
                info.el.classList.add(eventType);
            }
        }
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

    const form_activity = document.getElementById('activity-form');

    form_activity.addEventListener('submit', function(event) {
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
            }
        }

        calendar.addEvent(newEvent);

        const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
        modal.hide();
    });

    /* afficahge légende */
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
