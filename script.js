// ----------------------
// 1️⃣ Firebase Configuration
// ----------------------
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "YOUR_REAL_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_REAL_PROJECT_ID",
  storageBucket: "YOUR_REAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_REAL_SENDER_ID",
  appId: "YOUR_REAL_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ----------------------
// 2️⃣ Admin UID (replace after first login)
// ----------------------
const ADMIN_UID = "YOUR_ADMIN_UID"; // Copy this from console after login

// ----------------------
// 3️⃣ DOM Elements
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
// 4️⃣ Old Dictionary Data (optional import)
// ----------------------
const oldDictionaryData = [
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "unud duwa-ow", english: "biceps muscle (2 heads)" },
  { tausug: "Lasa", english: "Love" },
  { tausug: "Itum", english: "Black" },
  { tausug: "Jantung", english: "Heart" }
];

// ----------------------
// 5️⃣ Authentication
// ----------------------
loginBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  await auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', async () => {
  alert("Thank you very much. May Allah reward you goodness.");
  await auth.signOut();
});

// Detect login state
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Your UID is:", user.uid); // Copy this UID into ADMIN_UID
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
// 6️⃣ Import Old Dictionary (only if empty)
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
// 7️⃣ Load Dictionary (real-time)
// ----------------------
function loadDictionary() {
  db.collection('dictionary').orderBy('tausug').onSnapshot(snapshot => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement('div');
      div.className = 'word-entry';
      div.innerHTML = `
        <span class="tausug">${entry.tausug || entry.word}</span> - 
        <span class="english">${entry.english || entry.meaning}</span>
        ${auth.currentUser && auth.currentUser.uid === ADMIN_UID ? '<button class="deleteBtn">Delete</button>' : ''}
      `;

      // Delete button for admin
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
// 8️⃣ Add New Word
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


