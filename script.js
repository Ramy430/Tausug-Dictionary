// Initial dictionary entries
const dictionary = [
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "unud duwa-ow", english: "biceps muscle (2 heads)" }
];

const dictionaryContainer = document.getElementById('dictionary');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');

// Function to render dictionary entries
function renderDictionary(entries) {
  dictionaryContainer.innerHTML = '';
  entries.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <span class="tausug">${entry.tausug}</span>
      <span class="english">${entry.english}</span>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;
    // Edit button
    div.querySelector('.editBtn').addEventListener('click', () => {
      const newT = prompt("Edit Tausug word:", entry.tausug);
      const newE = prompt("Edit English translation:", entry.english);
      if (newT && newE) {
        entry.tausug = newT;
        entry.english = newE;
        renderDictionary(dictionary);
      }
    });
    // Delete button
    div.querySelector('.deleteBtn').addEventListener('click', () => {
      dictionary.splice(index, 1);
      renderDictionary(dictionary);
    });
    dictionaryContainer.appendChild(div);
  });
}

// Add new word
addWordBtn.addEventListener('click', () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();
  if (tausug && english) {
    dictionary.push({ tausug, english });
    renderDictionary(dictionary);
    newTausug.value = '';
    newEnglish.value = '';
  }
});

// Search functionality
searchBtn.addEventListener('click', () => {
  const term = searchInput.value.trim().toLowerCase();
  const results = dictionary.filter(entry =>
    entry.tausug.toLowerCase().includes(term) ||
    entry.english.toLowerCase().includes(term)
  );
  renderDictionary(results);
});
const addWordBtn = document.getElementById('addWordBtn');
const newTausug = document.getElementById('newTausug');
const newEnglish = document.getElementById('newEnglish');

// Initial render
renderDictionary(dictionary);
addWordBtn.addEventListener('click', () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();

  if (!tausug || !english) return;

  dictionary.push({ tausug, english });
  renderDictionary(dictionary);

  // Clear input fields
  newTausug.value = '';
  newEnglish.value = '';
});

