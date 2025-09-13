// 🔹 Firebase config (replace with your own!)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// 🔹 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔹 Add word
async function addWord() {
  const tausug = document.getElementById("tausugWord").value.trim();
  const english = document.getElementById("englishWord").value.trim();

  if (!tausug || !english) {
    alert("Please enter both Tausug and English words.");
    return;
  }

  await db.collection("dictionary").add({
    tausug,
    english
  });

  alert("Word added!");
  document.getElementById("tausugWord").value = "";
  document.getElementById("englishWord").value = "";
}

// 🔹 Search word
async function searchWord() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "";

  const snapshot = await db.collection("dictionary").get();
  let found = false;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.tausug.toLowerCase().includes(query) || data.english.toLowerCase().includes(query)) {
      resultsDiv.innerHTML += `<p><b>${data.tausug}</b> → ${data.english}</p>`;
      found = true;
    }
  });

  if (!found) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
  }
}

// 🔹 Export dictionary to JSON
async function exportDictionary() {
  const snapshot = await db.collection("dictionary").get();
  const words = [];
  snapshot.forEach(doc => {
    words.push(doc.data());
  });

  const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.getElementById("downloadLink");
  downloadLink.href = url;
  downloadLink.download = "tausug_dictionary.json";
  downloadLink.style.display = "block";
  downloadLink.innerText = "Click to Download JSON";
}
