// Petit gestionnaire partagé pour la navigation entre sections (#main-content).
// Extrait dans son propre module pour que calendar.js puisse aussi déclencher
// une navigation (ex: retour au calendrier depuis l'écran d'une sortie) sans
// créer d'import circulaire avec welcome.js (qui importe déjà calendar.js).

const SECTION_IDS = [
    'section_calendar',
    'messaging',
    'help',
    'section_admin',
    'section_event',
    'section_participants'
];

export function showSection(sectionId) {
    SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
        }
    });

    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('sidebar').style.left = '-250px';
}
