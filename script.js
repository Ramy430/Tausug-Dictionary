// ====== Your Firebase Config ======
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ====== DOM Elements ======
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMessage = document.getElementById("welcomeMessage");
const addWordContainer = document.querySelector(".add-word-container");
const addWordBtn = document.getElementById("addWordBtn");
const newTausugInput = document.getElementById("newTausug");
const newEnglishInput = document.getElementById("newEnglish");
const dictionaryDiv = document.getElementById("dictionary");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");

// ====== Define Admin Emails ======
const adminEmails = ["youradmin@gmail.com"]; // change this to your admin email(s)

// ====== Login ======
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      console.log("User logged in:", result.user.email);
    })
    .catch(error => {
      console.error("Login failed:", error.message);
      alert("Login failed: " + error.message);
    });
});

// ====== Logout ======
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// ====== Auth State ======
auth.onAuthStateChanged(user => {
  if (user) {
    welcomeMessage.textContent = `Welcome! Assalaamu Alykum, ${user.displayName || user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    // Show Add Word only for admin
    if (adminEmails.includes(user.email)) {
      addWordContainer.style.display = "flex";
    } else {
      addWordContainer.style.display = "none";
    }

    loadWords();
  } else {
    welcomeMessage.textContent = "Please log in to continue.";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    addWordContainer.style.display = "none";
    dictionaryDiv.innerHTML = "";
  }
});

// ====== Load Words ======
function loadWords() {
  db.collection("dictionary").orderBy("tausug").onSnapshot(snapshot => {
    dictionaryDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const word = doc.data();
      const wordCard = document.createElement("div");
      wordCard.className = "word-card";
      wordCard.innerHTML = `<strong>${word.tausug}</strong> - ${word.english}`;
      dictionaryDiv.appendChild(wordCard);
    });
  });
}

// ====== Add Word ======
addWordBtn.addEventListener("click", async () => {
  const tausugWord = newTausugInput.value.trim();
  const englishWord = newEnglishInput.value.trim();

  if (!tausugWord || !englishWord) {
    alert("Please enter both Tausug and English words.");
    return;
  }

  try {
    await db.collection("dictionary").add({
      tausug: tausugWord,
      english: englishWord,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    newTausugInput.value = "";
    newEnglishInput.value = "";
  } catch (error) {
    console.error("Error adding word:", error);
    alert("Error adding word: " + error.message);
  }
});

// ====== Search ======
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const words = dictionaryDiv.querySelectorAll(".word-card");
  words.forEach(card => {
    if (card.textContent.toLowerCase().includes(query)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});
