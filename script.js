// Data: Muscles and Cavities
const dictionary = [
  // Muscles
  { category: "Muscles", tausug: "buli'", english: "gluteus" },
  { category: "Muscles", tausug: "unud buli'", english: "gluteus muscle" },
  { category: "Muscles", tausug: "unud bi'tis", english: "calf muscle" },
  { category: "Muscles", tausug: "unud buktun tuw-ow (3 heads) niya...", english: "triceps muscle (3 heads). Located at the upper arm (posterior), opposite the biceps at the front. Its main function is to extend the elbow joint so the arm straightens away from the body. Heads: Long head, Lateral head, Medial head. Other functions include moving or stabilizing the upper arm and shoulder." },
  { category: "Muscles", tausug: "unud duwa-ow (2 heads) kabaakan ha unahan sin buktun ha taas...", english: "biceps muscle (2 heads). Located at the anterior upper arm. Its function is to flex or pull the forearm toward the body." },

  // Cavities
  { category: "Cavities", tausug: "Dorsal (ha taykud)", english: "located on or toward the back" },
  { category: "Cavities", tausug: "Ventral", english: "located at the front of the body" },
  { category: "Cavities", tausug: "Ventral organs = manga anggawta’ ha dampal unahan sin badan...", english: "ventral cavity contains organs like lungs, heart, liver, digestive organs, and reproductive organs..." },
  { category: "Cavities", tausug: "Gawunggang Kulakub", english: "cranial cavity, houses the brain" },
  { category: "Cavities", tausug: "Gawunggang tangkkal", english: "spinal cavity or vertebral canal, houses the spinal cord" },
  { category: "Cavities", tausug: "Meninges", english: "three protective membrane layers surrounding the brain" },
  { category: "Cavities", tausug: "Sabaw utuk-tangkal (cerebrospinal fluid)", english: "fluid between the meningeal layers providing extra cushion and protection for CNS" },
  { category: "Cavities", tausug: "bitikan ugat ha kakidkiran", english: "nervous system in the dorsal cavity, including brain, spinal cord, and meninges" }
];

// Function to render dictionary
function renderDictionary(filter = "") {
  const container = document.getElementById("dictionary");
  container.innerHTML = ""; // Clear previous entries

  // Filter & sort alphabetically
  const filtered = dictionary
    .filter(entry => entry.tausug.toLowerCase().includes(filter.toLowerCase()) || entry.english.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.tausug.localeCompare(b.tausug));

  // Group by category
  const categories = [...new Set(filtered.map(e => e.category))];

  categories.forEach(cat => {
    const section = document.createElement("div");
    section.classList.add("section");

    const title = document.createElement("h2");
    title.textContent = cat;
    section.appendChild(title);

    filtered.filter(e => e.category === cat).forEach(entry => {
      const div = document.createElement("div");
      div.classList.add("entry");

      const tausugDiv = document.createElement("div");
      tausugDiv.classList.add("tausug");
      tausugDiv.textContent = entry.tausug;

      const englishDiv = document.createElement("div");
      englishDiv.classList.add("english");
      englishDiv.textContent = entry.english;

      div.appendChild(tausugDiv);
      div.appendChild(englishDiv);
      section.appendChild(div);
    });

    container.appendChild(section);
  });
}

// Search functionality
document.getElementById("search").addEventListener("input", (e) => {
  renderDictionary(e.target.value);
});

// Initial render
renderDictionary();