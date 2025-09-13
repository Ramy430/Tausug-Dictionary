// Get DOM elements
const searchInput = document.getElementById('search');
const dictionary = document.getElementById('dictionary');
const entries = Array.from(dictionary.getElementsByClassName('entry'));

// Listen for input in the search bar
searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase();

    entries.forEach(entry => {
        const tausug = entry.querySelector('.tausug').textContent.toLowerCase();
        const english = entry.querySelector('.english').textContent.toLowerCase();

        // Show entry if query matches Tausug or English text
        if (tausug.includes(query) || english.includes(query)) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });
});
