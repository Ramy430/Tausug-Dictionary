// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');

// Login
loginBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Logged in!"))
    .catch(err => alert(err.message));
});

// Sign up
signupBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Account created!"))
    .catch(err => alert(err.message));
});

// Load dictionary
async function loadDictionary() {
  const snapshot = await db.collection('dictionary').get();
  const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderDictionary(entries);
}

// Render dictionary
function renderDictionary(entries) {
  dictionaryContainer.innerHTML = '';
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <div class="word-texts">
        <span class="tausug">${entry.tausug}</span>
        <span class="english">${entry.english}</span>
      </div>
      <div class="word-buttons">
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
      </div>
    `;
    // Edit
    div.querySelector('.editBtn').addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user || (entry.addedBy !== user.uid && user.uid !== 'ADMIN_UID')) {
        alert("You cannot edit this word.");
        return;
      }
      const newT = prompt("Edit Tausug word:", entry.tausug);
      const newE = prompt("Edit English translation:", entry.english);
      if (newT && newE) {
        await db.collection('dictionary').doc(entry.id).update({ tausug: newT, english: newE });
        loadDictionary();
      }
    });
    // Delete
    div.querySelector('.deleteBtn').addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user || (entry.addedBy !== user.uid && user.uid !== 'ADMIN_UID')) {
        alert("You cannot delete this word.");
        return;
      }
      await db.collection('dictionary').doc(entry.id).delete();
      loadDictionary();
    });

    dictionaryContainer.appendChild(div);
  });
}

// Add new word
addWordBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;

  await db.collection('dictionary').add({
    tausug,
    english,
    addedBy: user.uid
  });
  newTausug.value = '';
  newEnglish.value = '';
  loadDictionary();
});

// Search
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await db.collection('dictionary').get();
  const entries = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(entry => entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term));
  renderDictionary(entries);
});

// Load dictionary on page load
window.addEventListener('DOMContentLoaded', () => {
  loadDictionary();
});
