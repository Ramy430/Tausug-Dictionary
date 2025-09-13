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

// Function to display dictionary entries
function displayDictionary(entries) {
  dictionaryContainer.innerHTML = '';
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<span class="tausug">${entry.tausug}</span><span class="english">${entry.english}</span>`;
    dictionaryContainer.appendChild(div);
  });
}

// Initial display
displayDictionary(dictionary);

// Search function
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = dictionary.filter(entry =>
    entry.tausug.toLowerCase().includes(query) ||
    entry.english.toLowerCase().includes(query)
  );
  displayDictionary(filtered);
});

// Add new word function
addWordBtn.addEventListener('click', () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();

  if (tausug && english) {
    const newEntry = { tausug, english };
    dictionary.push(newEntry);
    displayDictionary(dictionary);

    newTausug.value = '';
    newEnglish.value = '';
  }
});

