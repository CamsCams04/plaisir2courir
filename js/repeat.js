document.addEventListener('DOMContentLoaded', function() {
    const repeatCheckbox = document.getElementById('activity-repeat');
    const repeatOptions = document.getElementById('repeat-options');

    repeatCheckbox.addEventListener('change', function() {
        repeatOptions.style.display = repeatCheckbox.checked ? 'block' : 'none';
    });

    // Pour le modal d'édition
    const repeatEditCheckbox = document.getElementById('activity-edit-repeat');
    const repeatEditOptions = document.getElementById('repeat-edit-options');

    repeatEditCheckbox.addEventListener('change', function() {
        repeatEditOptions.style.display = repeatEditCheckbox.checked ? 'block' : 'none';
    });
});
