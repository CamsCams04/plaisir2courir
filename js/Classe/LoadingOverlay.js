// Petit gestionnaire partagé pour l'écran de chargement (#overlay).
// Plusieurs scripts (profil, admin, calendrier...) peuvent chacun signaler
// qu'ils ont une tâche en cours avec beginLoading(), et la prévenir qu'elle
// est terminée avec endLoading(). L'overlay ne se masque que lorsque TOUTES
// les tâches en cours sont terminées.

const overlay = document.getElementById('overlay');
const messLoader = document.getElementById('mess_loader');

let pendingTasks = 0;
let safetyTimer = null;

// Filet de sécurité : si un problème réseau/Firestore bloque une tâche
// indéfiniment, on évite de laisser l'utilisateur bloqué sur l'écran de
// chargement pour toujours.
const SAFETY_TIMEOUT_MS = 10000;

function forceHide() {
    pendingTasks = 0;
    overlay.style.display = 'none';
    clearTimeout(safetyTimer);
    safetyTimer = null;
}

export function beginLoading(message) {
    pendingTasks++;

    if (message) {
        messLoader.textContent = message;
    }

    overlay.style.display = 'flex';

    if (!safetyTimer) {
        safetyTimer = setTimeout(() => {
            console.warn("Le chargement initial prend trop de temps, masquage forcé de l'écran de chargement.");
            forceHide();
        }, SAFETY_TIMEOUT_MS);
    }
}

export function endLoading() {
    pendingTasks = Math.max(0, pendingTasks - 1);

    if (pendingTasks === 0) {
        overlay.style.display = 'none';
        clearTimeout(safetyTimer);
        safetyTimer = null;
    }
}
