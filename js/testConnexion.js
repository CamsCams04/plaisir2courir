function handleOffline(){
    window.location.href = "../view/error_internet.html";
}

function handleOnline(){
    window.location.href = "../view/welcome.html";
}

window.addEventListener("load", ()=>{
    if(!navigator.onLine){
        handleOffice();
    }
})

window.addEventListener("offline", handleOffline);
window.addEventListener("online", handleOnline);