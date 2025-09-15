// ----------------------
// Firebase v9+ Modular Imports
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ----------------------
// Firebase Config
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

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ----------------------
// DOM Elements
// ----------------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMessage = document.getElementById("welcomeMessage");
const newTausug = document.getElementById("newTausug");
const newEnglish = document.getElementById("newEnglish");
const addWordBtn = document.getElementById("addWordBtn");
const dictionaryContainer = document.getElementById("dictionary");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const pendingWordsContainer = document.getElementById("pending-words-container");
const pendingWordsDiv = document.getElementById("pending-words");
const adminPendingContainer = document.getElementById("admin-pending-container");
const adminPendingWordsDiv = document.getElementById("admin-pending-words");

// ----------------------
// Admin UID
// ----------------------
let ADMIN_UID = "YOUR_ADMIN_UID"; // replace with admin UID

// ----------------------
// Old Dictionary Data
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
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("Thank you very much. May Allah reward you goodness.");
});

// ----------------------
// On Auth State Changed
// ----------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    welcomeMessage.textContent = "Welcome! Assalaamu Alykum, " + user.displayName;

    // Set ADMIN UID if first time
    if (ADMIN_UID === "YOUR_ADMIN_UID") {
      ADMIN_UID = user.uid;
    }

    importOldDictionary();
    loadDictionary();
    loadUserPendingWords();
    if (user.uid === ADMIN_UID) loadAdminPendingWords();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    welcomeMessage.textContent = "";
    dictionaryContainer.innerHTML = "";
    pendingWordsDiv.innerHTML = "";
    adminPendingWordsDiv.innerHTML = "";
  }
});

// ----------------------
// Import Old Dictionary
// ----------------------
async function importOldDictionary() {
  const snapshot = await getDocs(collection(db, "TausugDictionary"));
  if (snapshot.empty) {
    for (let entry of oldDictionaryData) {
      await addDoc(collection(db, "TausugDictionary"), { ...entry, status: "approved", author: "admin", timestamp: Date.now() });
    }
  }
}

// ----------------------
// Load Dictionary
// ----------------------
function loadDictionary() {
  const q = query(collection(db, "TausugDictionary"), orderBy("tausug"));
  onSnapshot(q, (snapshot) => {
    dictionaryContainer.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status !== "approved") return; // Only show approved
      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `<span class="tausug">${data.tausug}</span> - <span class="english">${data.english}</span>`;
      dictionaryContainer.appendChild(div);
    });
  });
}

// ----------------------
// Add New Word
// ----------------------
addWordBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please login first!");
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;
  await addDoc(collection(db, "TausugDictionary"), {
    tausug,
    english,
    author: user.uid,
    status: "pending",
    timestamp: Date.now()
  });
  newTausug.value = "";
  newEnglish.value = "";
});

// ----------------------
// Search
// ----------------------
searchBtn.addEventListener("click", async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await getDocs(collection(db, "TausugDictionary"));
  dictionaryContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status !== "approved") return;
    if (data.tausug.toLowerCase().includes(term) || data.english.toLowerCase().includes(term)) {
      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `<span class="tausug">${data.tausug}</span> - <span class="english">${data.english}</span>`;
      dictionaryContainer.appendChild(div);
    }
  });
});

// ----------------------
// Load User Pending Words
// ----------------------
function loadUserPendingWords() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "TausugDictionary"), where("author", "==", user.uid));
  onSnapshot(q, (snapshot) => {
    pendingWordsDiv.innerHTML = "";
    let hasPending = false;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status === "approved") return;
      hasPending = true;

      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `<span class="tausug">${data.tausug}</span> - <span class="english">${data.english}</span> <span class="status">(${data.status})</span>`;

      // Edit / Delete buttons
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = async () => {
        const newT = prompt("Edit Tausug word:", data.tausug);
        const newE = prompt("Edit English translation:", data.english);
        if (newT && newE) await updateDoc(doc(db, "TausugDictionary", docSnap.id), { tausug: newT, english: newE, status: "pending" });
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async () => {
        if (confirm("Delete this word?")) await deleteDoc(doc(db, "TausugDictionary", docSnap.id));
      };

      div.appendChild(editBtn);
      div.appendChild(deleteBtn);
      pendingWordsDiv.appendChild(div);
    });

    pendingWordsContainer.style.display = hasPending ? "block" : "none";
  });
}

// ----------------------
// Load Admin Pending Words
// ----------------------
function loadAdminPendingWords() {
  const q = query(collection(db, "TausugDictionary"), where("status", "==", "pending"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    adminPendingWordsDiv.innerHTML = "";
    let hasPending = false;

    snapshot.forEach(docSnap => {
      hasPending = true;
      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "word-entry";
      div.innerHTML = `<span class="tausug">${data.tausug}</span> - <span class="english">${data.english}</span>`;

      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = async () => {
        await updateDoc(doc(db, "TausugDictionary", docSnap.id), { status: "approved" });
      };

      const denyBtn = document.createElement("button");
      denyBtn.textContent = "Deny";
      denyBtn.onclick = async () => {
        await updateDoc(doc(db, "TausugDictionary", docSnap.id), { status: "denied" });
      };

      div.appendChild(approveBtn);
      div.appendChild(denyBtn);
      adminPendingWordsDiv.appendChild(div);
    });

    adminPendingContainer.style.display = hasPending ? "block" : "none";
  });
}
