// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getAuth, deleteUser, signOut, onAuthStateChanged, updateEmail, updatePassword } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, query, where, getDocs, deleteDoc,  writeBatch, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

// Configuration de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIPaCM8FeIy2QLPMrd8Ibdl8Lj8aujkuA",
    authDomain: "plaisir2courir-17ea7.firebaseapp.com",
    projectId: "plaisir2courir-17ea7",
    storageBucket: "plaisir2courir-17ea7.appspot.com",
    messagingSenderId: "944232074293",
    appId: "1:944232074293:web:3e9a0c1915a96455d1357c"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", ()=>{
    onAuthStateChanged(auth, (user)=>{
      if (user){
          const usersCollection = collection(db, "users");
          const queryUsers = query(usersCollection, where("id", "==", user.uid));

          onSnapshot(queryUsers, (snapshot) => {
              snapshot.forEach((doc) => {
                  const userRole = doc.data();
                  console.log(userRole.role);
                  if (userRole.role === "admin" || userRole.role === "SUPERADMIN"){
                      console.log(userRole.role);
                      const ongletAdmin = document.getElementById("li_admin");
                      ongletAdmin.classList.remove("d-none");


                  }
              });
          });
      }
    })

});