// Initial dictionary data
const dictionary = [
  { tausug: "bitikan ugat ha kakidkiran", english: "nervous system in the dorsal cavity, including brain, spinal cord, and meninges" },
  { tausug: "Dorsal (ha taykud)", english: "located on or toward the back" },
  { tausug: "Gawunggang Kulakub", english: "cranial cavity, houses the brain" },
  { tausug: "Gawunggang tangkkal", english: "spinal cavity or vertebral canal, houses the spinal cord" },
  { tausug: "Meninges", english: "three protective membrane layers surrounding the brain" },
  { tausug: "Sabaw utuk-tangkal (cerebrospinal fluid)", english: "fluid between the meningeal layers providing extra cushion and protection for CNS" },
  { tausug: "Ventral", english: "located at the front of the body" },
  { tausug: "Ventral organs", english: "ventral cavity contains organs like lungs, heart, liver, digestive organs, and reproductive organs..." },
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "unud buktun tuw-ow (3 heads) niya", english: "triceps muscle (3 heads). Located at the upper arm (posterior), opposite the biceps at the front. Its main function is to extend the elbow joint so the arm straightens away from the body. Heads: Long head, Lateral head, Medial head. Other functions include moving or stabilizing the upper arm and shoulder." },
  { tausug: "unud buli'", english: "gluteus muscle" },
  { tausug: "unud duwa-ow (2 heads) kabaakan ha unahan sin buktun ha taas", english: "biceps muscle (2 heads). Located at the anterior upper arm. Its function is to flex or pull the forearm toward the body." }
];

// DOM elements
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

// Search functionality
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  const results = dictionary.filter(entry => 
    entry.tausug.toLowerCase().includes(query) ||
    entry.english.toLowerCase().includes(query)
  );

  displayDictionary(results);
});

// Add new word functionality
addWordBtn.addEventListener('click', () => {
  const tausug = newTausug.value.trim();
  const english = newEnglish.value.trim();

  if (tausug && english) {
    const newEntry = { tausug, english };
    dictionary.push(newEntry);

    // Display updated dictionary
    displayDictionary(dictionary);

    // Clear input fields
    newTausug.value = '';
    newEnglish.value = '';
  }
});
