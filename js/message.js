document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("open_users");
    const userList = document.querySelector(".user-list");
    const chatArea = document.querySelector(".chat-area");
    const sendMessageBtn = document.getElementById("send-message");

    openBtn.addEventListener("click", () => {
        if (userList.classList.contains("show")) {
            userList.classList.remove("show");
            setTimeout(() => {
                userList.classList.add("d-none");
            }, 300); // Correspond au temps de la transition
            openBtn.style.color = "black";
        } else {
            userList.classList.remove("d-none");
            userList.classList.add("show");
            openBtn.style.color = "white";
        }
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener("click", (event) => {
        if (!userList.contains(event.target) && !openBtn.contains(event.target)) {
            userList.classList.remove("show");
            setTimeout(() => {
                userList.classList.add("d-none");
            }, 300); // Correspond au temps de la transition
            openBtn.style.color = "black";
        }
    });
    function updateButtonText() {
        const screenWidth = window.innerWidth;

        if (screenWidth < 500) {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
        } else if (screenWidth < 700) {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
        } else {
            sendMessageBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>
                                            Envoyer`;
        }
    }

    updateButtonText();

    window.addEventListener("resize", updateButtonText);
});
