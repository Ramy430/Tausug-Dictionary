const dictionary = [
  { tausug: "bitikan ugat ha kakidkiran", english: "peripheral nervous system" },
  { tausug: "Dorsal (ha taykud)", english: "located on or toward the back" },
  { tausug: "Gawunggang Kulakub", english: "cranial cavity, houses the brain" },
  { tausug: "Gawunggang tangkkal", english: "spinal cavity or vertebral canal, houses the spinal cord" },
  { tausug: "Meninges", english: "three protective membrane layers surrounding the brain" },
  { tausug: "Sabaw utuk-tangkal", english: "fluid between the meningeal layers providing extra cushion and protection for CNS" },
  { tausug: "Ventral", english: "located at the front of the body" },
  { tausug: "Ventral organs", english: "ventral cavity contains organs like lungs, heart, liver, digestive organs, and reproductive organs" },
  { tausug: "buli'", english: "gluteus" },
  { tausug: "unud bi'tis", english: "calf muscle" },
  { tausug: "unud buktun tuw-ow (3 heads) niya", english: "triceps muscle (3 heads). Located at the upper arm (posterior), opposite the biceps at the front. Extends elbow joint." },
  { tausug: "unud buli'", english: "gluteus muscle" },
  { tausug: "unud duwa-ow (2 heads)", english: "biceps muscle (2 heads). Located at the anterior upper arm. Flexes forearm toward body." }
];

const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const dictionaryContainer = document.getElementById("dictionary");

function displayEntries(entries) {
  dictionaryContainer.innerHTML = "";
  entries.forEach(entry => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");
    entryDiv.innerHTML = `<span class="tausug">${entry.tausug}</span>
                          <span class="english">${entry.english}</span>`;
    dictionaryContainer.appendChild(entryDiv);
  });
}

// Show all entries by default
displayEntries(dictionary);

function searchDictionary() {
  const query = searchInput.value.toLowerCase();
  const filtered = dictionary.filter(entry => 
    entry.tausug.toLowerCase().includes(query) || entry.english.toLowerCase().includes(query)
  );
  displayEntries(filtered);
}

// Search on button click
searchBtn.addEventListener("click", searchDictionary);

// Search on Enter key
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchDictionary();
});

