// ✅ Step 1: Add your Firebase Config here
const firebaseConfig = {
  apiKey: "PASTE-YOUR-API-KEY-HERE",
  authDomain: "PASTE-YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "PASTE-YOUR-PROJECT-ID",
  storageBucket: "PASTE-YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "PASTE-YOUR-SENDER-ID",
  appId: "PASTE-YOUR-APP-ID"
};

// ✅ Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Step 2: Replace this with your UID after you log in and check the console
const ADMIN_UID = "YOUR_ADMIN_UID";

// Authentication State Listener
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Your UID is:", user.uid); // 👈 Copy this UID and put it above
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

// ✅ Save Word to Firestore
function saveWord(word, meaning) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save words.");
    return;
  }

  db.collection("dictionary").add({
    word: word,
    meaning: meaning,
    uid: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("Word saved successfully!");
    loadDictionary();
  }).catch(error => {
    console.error("Error saving word:", error);
  });
}

// ✅ Load Words from Firestore
function loadDictionary() {
  db.collection("dictionary").orderBy("timestamp", "desc").get()
    .then(snapshot => {
      dictionaryContainer.innerHTML = "";
      snapshot.forEach(doc => {
        const entry = doc.data();
        const div = document.createElement("div");
        div.textContent = entry.word + " = " + entry.meaning;
        dictionaryContainer.appendChild(div);
      });
    });
}


