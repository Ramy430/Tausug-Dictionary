// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgAEuD8F41dH5nUeoVxMot4-rTp4olmr8",
  authDomain: "tausug-dictionary-online.firebaseapp.com",
  projectId: "tausug-dictionary-online",
  storageBucket: "tausug-dictionary-online.firebasestorage.app",
  messagingSenderId: "919499038754",
  appId: "1:919499038754:web:051037787db5a6123c2a7b",
  measurementId: "G-LBKT0624FT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Replace with your Admin UID
const ADMIN_UID = "YOUR_ADMIN_UID";

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('auth-message');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');
const addWordBtn = document.getElementById('addWordBtn');
const resultsDiv = document.getElementById('results');

// Old Dictionary Data
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

// Login/Logout
loginBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); } 
  catch (err) { alert("Login failed: " + err.message); }
});

logoutBtn.addEventListener('click', async () => {
  alert("Thank you very much. May Allah reward you goodness.");
  await auth.signOut();
});

// Auth State
auth.onAuthStateChanged(async user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    authMessage.textContent = `Welcome! Assalaamu Alykum, ${user.displayName}`;
    await importOldDictionary();
    loadDictionary();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    authMessage.textContent = "";
    resultsDiv.innerHTML = "";
  }
});

// Import Old Dictionary if empty
async function importOldDictionary() {
  const snapshot = await db.collection('TausugDictionary').get();
  if (snapshot.empty) {
    for (let entry of oldDictionaryData) {
      await db.collection('TausugDictionary').add(entry);
    }
  }
}

// Load Dictionary Real-time
function loadDictionary() {
  db.collection('TausugDictionary').orderBy('tausug').onSnapshot(snapshot => {
    resultsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement('div');
      div.className = "word-entry";
      div.innerHTML = `
        <span class="tausug">${entry.tausug}</span> - 
        <span class="english">${entry.english}</span>
        ${auth.currentUser && auth.currentUser.uid === ADMIN_UID ? '<div class="admin-buttons"><button class="editBtn">Edit</button><button class="deleteBtn">Delete</button></div>' : ''}
      `;

      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        div.querySelector('.editBtn').addEventListener('click', async () => {
          const newT = prompt("Edit Tausug word:", entry.tausug);
          const newE = prompt("Edit English translation:", entry.english);
          if (newT && newE) {
            await db.collection('TausugDictionary').doc(doc.id).update({ tausug: newT, english: newE });
          }
        });

        div.querySelector('.deleteBtn').addEventListener('click', async () => {
          if (confirm(`Delete "${entry.tausug} - ${entry.english}"?`)) {
            await db.collection('TausugDictionary').doc(doc.id).delete();
          }
        });
      }

      resultsDiv.appendChild(div);
    });
  });
}

// Add Word
addWordBtn.addEventListener('click', async () => {
  if (!auth.currentUser) { alert("Please login first!"); return; }
  if (auth.currentUser.uid !== ADMIN_UID) { alert("Only Admin can add new words!"); return; }
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;
  await db.collection('TausugDictionary').
