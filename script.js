
// ----------------------
// Firebase Configuration
// ----------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ----------------------
// Admin UID
// ----------------------
let ADMIN_UID = ""; // Replace with your Firebase UID

// DOM Elements
const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');

// Old Dictionary Data
const oldDictionaryData = [
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "Lasa", english: "Love" },
  { tausug: "Itum", english: "Black" }
];

// ----------------------
// Authentication
// ----------------------
loginBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  await auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', async () => {
  alert("Thank you very much. May Allah reward you goodness.");
  await auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    welcomeMessage.textContent = "Welcome! Assalaamu Alykum, " + user.displayName;

    ADMIN_UID = "YOUR_ADMIN_UID"; // Replace this with your UID
    importOldDictionary();
    loadDictionary();
  } else {
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    welcomeMessage.textContent = "";
    dictionaryContainer.innerHTML = "";
  }
});

// Import old dictionary if empty
async function importOldDictionary() {
  const snapshot = await db.collection('TausugDictionary').get();
  if (snapshot.empty) {
    for (let entry of oldDictionaryData) {
      await db.collection('TausugDictionary').add(entry);
    }
  }
}

// Load dictionary entries
function loadDictionary() {
  db.collection('TausugDictionary').orderBy('tausug').onSnapshot(snapshot => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement('div');
      div.className = 'word-entry';

      let adminButtons = "";
      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        adminButtons = `
          <div class="word-buttons">
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
          </div>
        `;
      }

      div.innerHTML = `
        <span class="tausug">${entry.tausug}</span> - <span class="english">${entry.english}</span>
        ${adminButtons}
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
          if (confirm("Are you sure you want to delete this word?")) {
            await db.collection('TausugDictionary').doc(doc.id).delete();
          }
        });
      }

      dictionaryContainer.appendChild(div);
    });
  });
}

// Add new word
addWordBtn.addEventListener('click', async () => {
  if (!auth.currentUser) return alert("Please login first!");
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;
  await db.collection('TausugDictionary').add({ tausug, english });
  newTausug.value = "";
  newEnglish.value = "";
});

// Search dictionary
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await db.collection('TausugDictionary').get();
  dictionaryContainer.innerHTML = "";
  snapshot.forEach(doc => {
    const entry = doc.data();
    if (entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term)) {
      const div = document.createElement('div');
      div.className = 'word-entry';
      div.innerHTML = `<span class="tausug">${entry.tausug}</span> - <span class="english">${entry.english}</span>`;
      dictionaryContainer.appendChild(div);
    }
  });
});
