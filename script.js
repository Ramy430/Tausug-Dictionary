// ----------------------
// Firebase v9+ Modular Imports
// ----------------------
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, orderBy, query, updateDoc, deleteDoc, doc } from "firebase/firestore";

// ----------------------
// Firebase Configuration
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCgAEuD8F41dH5nUeoVxMot4-rTp4olmr8",
  authDomain: "tausug-dictionary-online.firebaseapp.com",
  projectId: "tausug-dictionary-online",
  storageBucket: "tausug-dictionary-online.firebasestorage.app",
  messagingSenderId: "919499038754",
  appId: "1:919499038754:web:051037787db5a6123c2a7b",
  measurementId: "G-LBKT0624FT"
};

// ----------------------
// Initialize Firebase
// ----------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------------
// Admin UID (set manually after first login)
// ----------------------
let ADMIN_UID = "YOUR_ADMIN_UID"; // replace with your Google UID

// ----------------------
// DOM Elements
// ----------------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMessage = document.getElementById("welcomeMessage");
const roleBadge = document.getElementById("roleBadge");
const userInfo = document.getElementById("user-info");
const userInfoMessage = document.getElementById("user-info-message");
const dictionaryContainer = document.getElementById("dictionary");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const newTausug = document.getElementById("newTausug");
const newEnglish = document.getElementById("newEnglish");
const addWordBtn = document.getElementById("addWordBtn");
const addWordContainer = document.getElementById("add-word-container");

// ----------------------
// Login with Google (Domain Restricted)
// ----------------------
loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    hd: "yourdomain.com" // 🔑 replace with your domain (optional)
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Reject if domain not allowed
    if (!user.email.endsWith("@yourdomain.com")) {
      alert("Unauthorized domain. Access denied.");
      await signOut(auth);
      return;
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// ----------------------
// Logout
// ----------------------
logoutBtn.addEventListener("click", async () => {
  alert("Thank you very much. May Allah reward you goodness.");
  await signOut(auth);
});

// ----------------------
// Auth State Change
// ----------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    userInfo.style.display = "block";

    // Show welcome
    welcomeMessage.textContent = `Welcome! Assalaamu Alykum, ${user.displayName}`;

    // Role check
    const isAdmin = user.uid === ADMIN_UID;

    if (isAdmin) {
      roleBadge.textContent = "Admin";
      roleBadge.className = "badge admin";
      userInfoMessage.textContent = "You have full control over the dictionary.";
      addWordContainer.style.display = "block";
    } else {
      roleBadge.textContent = "User";
      roleBadge.className = "badge user";
      userInfoMessage.textContent = "You can search words in the dictionary.";
      addWordContainer.style.display = "none";
    }

    // Load dictionary
    loadDictionary(isAdmin);

  } else {
    loginBtn.style.display = "inline-block";
    userInfo.style.display = "none";
    welcomeMessage.textContent = "";
    roleBadge.textContent = "";
    dictionaryContainer.innerHTML = "";
    addWordContainer.style.display = "none";
  }
});

// ----------------------
// Load Dictionary (Realtime)
// ----------------------
function loadDictionary(isAdmin) {
  const q = query(collection(db, "TausugDictionary"), orderBy("tausug"));
  onSnapshot(q, (snapshot) => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const entry = docSnap.data();
      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `
        <div class="word-texts">
          <span class="tausug">${entry.tausug}</span> - 
          <span class="english">${entry.english}</span>
        </div>
        <div class="word-buttons">
          ${isAdmin ? `
            <button class="editBtn">Edit</button>
            <button class="deleteBtn deleteBtn">Delete</button>
          ` : ""}
        </div>
      `;

      if (isAdmin) {
        div.querySelector(".editBtn").addEventListener("click", async () => {
          const newT = prompt("Edit Tausug word:", entry.tausug);
          const newE = prompt("Edit English translation:", entry.english);
          if (newT && newE) {
            await updateDoc(doc(db, "TausugDictionary", docSnap.id), {
              tausug: newT,
              english: newE
            });
          }
        });

        div.querySelector(".deleteBtn").addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this word?")) {
            await deleteDoc(doc(db, "TausugDictionary", docSnap.id));
          }
        });
      }

      dictionaryContainer.appendChild(div);
    });
  });
}

// ----------------------
// Add New Word (Admin only)
// ----------------------
addWordBtn.addEventListener("click", async () => {
  if (!auth.currentUser) return alert("Please login first!");
  if (auth.currentUser.uid !== ADMIN_UID) return alert("Only Admins can add words!");

  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;

  await addDoc(collection(db, "TausugDictionary"), { tausug, english });
  newTausug.value = "";
  newEnglish.value = "";
});

// ----------------------
// Search Dictionary
// ----------------------
searchBtn.addEventListener("click", async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await getDocs(collection(db, "TausugDictionary"));
  dictionaryContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const entry = docSnap.data();
    if (entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term)) {
      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `<span class="tausug">${entry.tausug}</span> - <span class="english">${entry.english}</span>`;
      dictionaryContainer.appendChild(div);
    }
  });
});
