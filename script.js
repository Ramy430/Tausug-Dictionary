// =====================
// 1️⃣ Firebase Config
// =====================
// REPLACE the values below with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyEXAMPLE1234567890",
  authDomain: "tausug-dictionary.firebaseapp.com",
  projectId: "tausug-dictionary",
  storageBucket: "tausug-dictionary.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// =====================
// 2️⃣ Admin UID
// =====================
// REPLACE this with the UID of your admin account from Firebase Authentication
const ADMIN_UID = "XxYyZz1234567890ABCDEF";

// =====================
// 3️⃣ DOM Elements
// =====================
const dictionaryContainer = document.getElementById("dictionary");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn"); // optional
const addWordBtn = document.getElementById("addWordBtn");
const newTausug = document.getElementById("newTausug");
const newEnglish = document.getElementById("newEnglish");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMessage = document.getElementById("welcomeMessage");

// =====================
// 4️⃣ Authentication
// =====================
loginBtn.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); } 
  catch (err) { alert("Login failed: " + err.message); }
});

logoutBtn.addEventListener("click", async () => {
  welcomeMessage.textContent = "Thank you very much. May Allah reward you goodness.";
  welcomeMessage.style.opacity = "1";
  setTimeout(() => {
    let fade = setInterval(() => {
      if (!welcomeMessage.style.opacity) welcomeMessage.style.opacity = "1";
      if (welcomeMessage.style.opacity > 0) welcomeMessage.style.opacity -= 0.05;
      else { clearInterval(fade); welcomeMessage.textContent=""; welcomeMessage.style.opacity="1"; }
    },50);
  },2000);
  await auth.signOut();
});

// =====================
// 5️⃣ Auth State Change
// =====================
auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    welcomeMessage.style.opacity="0";
    welcomeMessage.textContent = "Welcome! Assalaamu Alykum, " + user.displayName;
    setTimeout(()=>welcomeMessage.style.opacity="1",100);
    subscribeDictionary();
  } else {
    loginBtn.style.display="inline";
    logoutBtn.style.display="none";
    welcomeMessage.textContent="";
    dictionaryContainer.innerHTML="";
  }
});

// =====================
// 6️⃣ Render Dictionary Entry
// =====================
function renderEntry(doc, justAdded=false){
  const entry=doc.data();
  const div=document.createElement("div");
  div.className="entry word-entry";
  if(justAdded) div.classList.add("highlight");
  div.innerHTML=`
    <div class="word-texts">
      <span class="tausug">${entry.tausug}</span>
      <span class="english">${entry.english}</span>
    </div>
    <div class="word-buttons">
      ${auth.currentUser && auth.currentUser.uid===ADMIN_UID?`<button class="editBtn">Edit</button>`:""}
      ${auth.currentUser && auth.currentUser.uid===entry.uid?`<button class="deleteBtn">Delete</button>`:""}
    </div>
  `;

  // Edit
  if(auth.currentUser && auth.currentUser.uid===ADMIN_UID){
    div.querySelector(".editBtn")?.addEventListener("click", async ()=>{
      const newT=prompt("Edit Tausug word:", entry.tausug);
      const newE=prompt("Edit English translation:", entry.english);
      if(newT && newE) await db.collection("dictionary").doc(doc.id).update({tausug:newT,english:newE});
    });
  }

  // Delete
  if(auth.currentUser && auth.currentUser.uid===entry.uid){
    div.querySelector(".deleteBtn")?.addEventListener("click", async ()=>{
      if(confirm(`Delete "${entry.tausug}"?`)){
        div.style.transition="opacity 0.5s ease, transform 0.5s ease";
        div.style.opacity="0";
        div.style.transform="translateX(-20px)";
        setTimeout(async ()=>{await db.collection("dictionary").doc(doc.id).delete();},500);
      }
    });
  }

  // Fade in animation
  div.style.opacity="0";
  div.style.transform="translateY(10px)";
  dictionaryContainer.appendChild(div);
  setTimeout(()=>{div.style.opacity="1"; div.style.transform="translateY(0)";},50);
}

// =====================
// 7️⃣ Real-Time Dictionary
// =====================
function subscribeDictionary(){
  dictionaryContainer.innerHTML = "";
  db.collection("dictionary")
    .orderBy("createdAt")
    .onSnapshot(snapshot => {
      dictionaryContainer.innerHTML = "";
      snapshot.forEach(doc => renderEntry(doc));
    });
}

// =====================
// 8️⃣ Add Word
// =====================
addWordBtn.addEventListener("click", async () => {
  if (!auth.currentUser) return alert("Please login first!");
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return alert("Both fields are required!");
  
  try {
    const docRef = await db.collection("dictionary").add({
      tausug,
      english,
      uid: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    newTausug.value = "";
    newEnglish.value = "";

    const newDoc = await docRef.get();
    renderEntry(newDoc, true); // highlight newly added word
  } catch (err) {
    alert("Error adding word: " + err.message);
  }
});

// =====================
// 9️⃣ Search
// =====================
searchBtn.addEventListener("click", async () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return subscribeDictionary();
  const snapshot = await db.collection("dictionary").get();
  dictionaryContainer.innerHTML = "";
  snapshot.forEach(doc => {
    const entry = doc.data();
    if (entry.tausug.toLowerCase().includes(term) || entry.english.toLowerCase().includes(term)) {
      renderEntry(doc);
    }
  });
});

// Clear search (optional)
clearSearchBtn?.addEventListener("click", () => {
  searchInput.value = "";
  subscribeDictionary();
});

// Enter key support
searchInput.addEventListener("keyup", event => {
  if (event.key === "Enter") searchBtn.click();
});

[newTausug, newEnglish].forEach(input => {
  input.addEventListener("keyup", event => {
    if (event.key === "Enter") addWordBtn.click();
  });
});

