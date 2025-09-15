// ----------------------
// Modular Firebase imports
// ----------------------
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// ----------------------
// Firebase configuration
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCgAEuD8F41dH5nUeoVxMot4-rTp4olmr8",
  authDomain: "tausug-dictionary-online.firebaseapp.com", // ✅ must match authorized domain
  projectId: "tausug-dictionary-online",
  storageBucket: "tausug-dictionary-online.appspot.com",
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
// Admin UID (replace with your Google UID after first login)
// ----------------------
let ADMIN_UID = "YOUR_ADMIN_UID";

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

// ----------------------
// Login & Logout
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
  alert("Thank you very much. May Allah reward you goodness.");
  await signOut(auth);
});

// ----------------------
// Auth State
// ----------------------
onAuthStateChanged(auth, user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    welcomeMessage.textContent = "Welcome! Assalaamu Alykum, " + user.displayName;

    if (ADMIN_UID === "YOUR_ADMIN_UID") {
      ADMIN_UID = user.uid;
      console.log("Admin UID set to:", ADMIN_UID);
    }

    loadDictionary();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    welcomeMessage.textContent = "";
    dictionaryContainer.innerHTML = "";
  }
});

// ----------------------
// Load Dictionary
// ----------------------
function loadDictionary() {
  const colRef = collection(db, 'TausugDictionary');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  onSnapshot(q, snapshot => {
    dictionaryContainer.innerHTML = "";

    snapshot.forEach(docSnap => {
      const entry = docSnap.data();
      const div = document.createElement('div');
      div.className = "word-entry";

      div.innerHTML = `
        <div class="word-texts">
          <span class="tausug">${entry.tausug}</span> - 
          <span class="english">${entry.english}</span>
          ${entry.status === 'pending' ? ' (Pending)' : ''}
        </div>
        <div class="word-buttons"></div>
      `;

      const buttonsDiv = div.querySelector(".word-buttons");

      // Admin buttons
      if (auth.currentUser.uid === ADMIN_UID) {
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.onclick = () => approveWord(docSnap.id);
        buttonsDiv.appendChild(approveBtn);

        const denyBtn = document.createElement('button');
        denyBtn.textContent = 'Deny';
        denyBtn.onclick = () => deleteWord(docSnap.id);
        buttonsDiv.appendChild(denyBtn);
      }

      // User buttons for their own pending words
      if (entry.userId === auth.currentUser.uid && entry.status === 'pending') {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editWord(docSnap.id, entry.tausug, entry.english);
        buttonsDiv.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteWord(docSnap.id);
        buttonsDiv.appendChild(delBtn);
      }

      dictionaryContainer.appendChild(div);
    });
  });
}

// ----------------------
// Add Word
// ----------------------
addWordBtn.addEventListener('click', async () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return alert("Both fields are required.");

  await addDoc(collection(db, 'TausugDictionary'), {
    tausug,
    english,
    status: 'pending',
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  newTausug.value = '';
  newEnglish.value = '';
});

// ----------------------
// Approve Word (Admin)
// ----------------------
async function approveWord(docId) {
  const docRef = doc(db, 'TausugDictionary', docId);
  await updateDoc(docRef, { status: 'approved' });
}

// ----------------------
// Delete Word
// ----------------------
async function deleteWord(docId) {
  const docRef = doc(db, 'TausugDictionary', docId);
  await deleteDoc(docRef);
}

// ----------------------
// Edit Word (User)
// ----------------------
function editWord(docId, oldTausug, oldEnglish) {
  const newT = prompt("Edit Tausug word:", oldTausug);
  const newE = prompt("Edit English translation:", oldEnglish);
  if (newT && newE) {
    const docRef = doc(db, 'TausugDictionary', docId);
    updateDoc(docRef, { tausug: newT, english: newE });
  }
}

// ----------------------
// Search
// ----------------------
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.toLowerCase();
  const snapshot = await getDocs(collection(db, 'TausugDictionary'));
  dictionaryContainer.innerHTML = "";

  snapshot.forEach(docSnap => {
    const entry = docSnap.data();
    if (entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term)) {
      const div = document.createElement('div');
      div.className = "word-entry";
      div.innerHTML = `<div>${entry.tausug} - ${entry.english} ${entry.status === 'pending' ? '(Pending)' : ''}</div>`;
      dictionaryContainer.appendChild(div);
    }
  });
});
