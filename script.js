// ----------------------
// Firebase v9+ Modular Imports
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, onSnapshot, orderBy, query, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------------
// DOM Elements
// ----------------------
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');
const addWordBtn = document.getElementById('addWordBtn');

let ADMIN_UID = "YOUR_ADMIN_UID"; // Replace with your UID after first login

const dictionaryRef = collection(db, "TausugDictionary");

// ----------------------
// Old Dictionary Data (to import once)
// ----------------------
const oldDictionaryData = [
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "unud duwa-ow", english: "biceps muscle (2 heads)" },
  { tausug: "Lasa", english: "Love" },
  { tausug: "Itum", english: "Black" },
  { tausug: "Jantung", english: "Heart" },
  { tausug: "buhok", english: "hair" },
  { tausug: "pais", english: "skin" },
  { tausug: "mata", english: "eye" },
  { tausug: "taynga", english: "ear" },
  { tausug: "simod", english: "mouth" },
  { tausug: "labbi'", english: "lip" },
  { tausug: "ipun", english: "tooth" },
  { tausug: "manga ipon", english: "teeth" },
  { tausug: "bilateral", english: "duwa, kaduwa" }
];

// ----------------------
// Authentication
// ----------------------
loginBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  alert("Thank you very much. May Allah reward you goodness.");
});

// ----------------------
// Auth State Change
// ----------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    welcomeMessage.textContent = `Welcome! Assalaamu Alykum, ${user.displayName}`;

    if (ADMIN_UID === "YOUR_ADMIN_UID") ADMIN_UID = user.uid;

    importOldDictionary();
    loadDictionary();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    welcomeMessage.textContent = "";
    dictionaryContainer.innerHTML = "";
  }
});

// ----------------------
// Import Old Dictionary (once if empty)
// ----------------------
async function importOldDictionary() {
  const snapshot = await getDocs(dictionaryRef);
  if (snapshot.empty) {
    for (let entry of oldDictionaryData) {
      await addDoc(dictionaryRef, entry);
    }
    console.log("Old dictionary imported successfully!");
  }
}

// ----------------------
// Load Dictionary (real-time)
// ----------------------
function loadDictionary() {
  const q = query(dictionaryRef, orderBy("tausug"));
  onSnapshot(q, (snapshot) => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const entry = docSnap.data();
      const div = document.createElement('div');
      div.className = 'word-entry';
      div.innerHTML = `
        <div class="word-texts">
          <span class="tausug">${entry.tausug}</span> - 
          <span class="english">${entry.english}</span>
        </div>
        <div class="word-buttons">
          ${auth.currentUser && auth.currentUser.uid === ADMIN_UID ? '<button class="editBtn">Edit</button><button class="deleteBtn">Delete</button>' : ''}
        </div>
      `;

      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        div.querySelector('.editBtn').addEventListener('click', async () => {
          const newT = prompt("Edit Tausug word:", entry.tausug);
          const newE = prompt("Edit English translation:", entry.english);
          if (newT && newE) {
            await updateDoc(doc(db, "TausugDictionary", docSnap.id), { tausug: newT, english: newE });
          }
        });

        div.querySelector('.deleteBtn').addEventListener('click', async () => {
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
// Add New Word
// ----------------------
addWordBtn.addEventListener('click', async () => {
  if (!auth.currentUser) return alert("Please login first!");
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;

  await addDoc(dictionaryRef, { tausug, english });
  newTausug.value = "";
  newEnglish.value = "";
});

// ----------------------
// Search Dictionary
// ----------------------
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await getDocs(dictionaryRef);
  dictionaryContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const entry = docSnap.data();
    if (entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term)) {
      const div = document.createElement('div');
      div.className = 'word-entry';
      div.innerHTML = `<span class="tausug">${entry.tausug}</span> - <span class="english">${entry.english}</span>`;
      dictionaryContainer.appendChild(div);
    }
  });
});
