// Initial dictionary entries
let dictionary = JSON.parse(localStorage.getItem('dictionary')) || [
  { tausug: "buli'", english: "gluteus", protected: true },
  { tausug: "unud bi'tis", english: "calf muscle", protected: true },
  { tausug: "unud duwa-ow", english: "biceps muscle (2 heads)", protected: false }
];

const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');
const exportBtn = document.getElementById('exportBtn');

// Save to localStorage
function saveDictionary() {
  localStorage.setItem('dictionary', JSON.stringify(dictionary));
}

// Render dictionary entries
function renderDictionary(entries) {
  dictionaryContainer.innerHTML = '';
  entries.forEach((entry, index) => {
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
    div.querySelector('.editBtn').addEventListener('click', () => {
      const newT = prompt("Edit Tausug word:", entry.tausug);
      const newE = prompt("Edit English translation:", entry.english);
      if (newT && newE) {
        entry.tausug = newT;
        entry.english = newE;
        saveDictionary();
        renderDictionary(dictionary);
      }
    });

    // Delete
    div.querySelector('.deleteBtn').addEventListener('click', () => {
      if (entry.protected) {
        alert("This word is protected and cannot be deleted.");
        return;
      }
      dictionary.splice(index, 1);
      saveDictionary();
      renderDictionary(dictionary);
    });

    dictionaryContainer.appendChild(div);
  });
}

// Add new word
addWordBtn.addEventListener('click', () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (!tausug || !english) return;

  dictionary.push({ tausug, english, protected: false });
  saveDictionary();
  renderDictionary(dictionary);

  newTausug.value = '';
  newEnglish.value = '';
});

// Search
searchBtn.addEventListener('click', () => {
  const term = searchInput.value.trim().toLowerCase();
  const results = dictionary.filter(entry =>
    entry.tausug.toLowerCase().includes(term) ||
    entry.english.toLowerCase().includes(term)
  );
  renderDictionary(results);
});

// Export dictionary
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(dictionary, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "tausug_dictionary.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Initial render
renderDictionary(dictionary);
