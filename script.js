// ----------------------
// Firebase Configuration
// ----------------------
const firebaseConfig = {
  apiKey: "PASTE-YOUR-API-KEY-HERE",
  authDomain: "PASTE-YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "PASTE-YOUR-PROJECT-ID",
  storageBucket: "PASTE-YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "PASTE-YOUR-SENDER-ID",
  appId: "PASTE-YOUR-APP-ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ----------------------
// Admin UID (for delete)
// ----------------------
const ADMIN_UID = "PASTE-YOUR-ADMIN-UID";

// ----------------------
// DOM Elements
// ----------------------
const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');

// ----------------------
// Old Dictionary Entries
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

    importOldDictionary();
    loadDictionary();
  } else {
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    welcomeMessage.textContent = "";
    dictionaryContainer.innerHTML = "";
  }
});

// ----------------------
// Import Old Dictionary (only once)
// ----------------------
async function importOldDictionary() {
  const snapshot = await db.collection('dictionary').get();
  if (snapshot.empty) {
    for (let entry of oldDictionaryData) {
      await db.collection('dictionary').add(entry);
      console.log(`Imported: ${entry.tausug} - ${entry.english}`);
    }
    console.log("Old dictionary imported successfully!");
  }
}

// ----------------------
// Load Dictionary (real-time)
// ----------------------
function loadDictionary() {
  db.collection('dictionary').orderBy('tausug').onSnapshot(snapshot => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement('div');
      div.className = 'word-entry';
      div.innerHTML = `
        <div class="word-texts">
          <span class="tausug">${entry.tausug}</span> - 
          <span class="english">${entry.english}</span>
        </div>
        <div class="word-buttons">
          <button class="editBtn">Edit</button>
          ${auth.currentUser && auth.currentUser.uid === ADMIN_UID ? '<button class="deleteBtn">Delete</button>' : ''}
        </div>
      `;

      // Edit button
      div.querySelector('.editBtn').addEventListener('click', async () => {
        const newT = prompt("Edit Tausug word:", entry.tausug);
        const newE = prompt("Edit English translation:", entry.english);
        if (newT && newE) {
          await db.collection('dictionary').doc(doc.id).update({ tausug: newT, english: newE });
        }
      });

      // Delete button (only for Admin)
      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        div.querySelector('.deleteBtn').addEventListener('click', async () => {
          await db.collection('dictionary').doc(doc.id).delete();
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
  await db.collection('dictionary').add({ tausug, english });
  newTausug.value = "";
  newEnglish.value = "";
});

// ----------------------
// Search Dictionary
// ----------------------
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await db.collection('dictionary').get();
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


