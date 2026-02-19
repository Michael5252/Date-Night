// script.js
const interests = [
  "Food & Drinks", "Live Music", "Outdoors", "Bars & Nightlife",
  "Adventure", "Games & Trivia", "Art & Culture", "Just Chill"
];

const bubblesContainer = document.getElementById('bubbles');

interests.forEach(text => {
  const label = document.createElement('label');
  label.className = 'interest-bubble';
  label.innerHTML = `
    <input type="checkbox" name="interest" value="${text.toLowerCase().replace(/ /g,'')}" hidden>
    <span>${text}</span>
  `;
  bubblesContainer.appendChild(label);
});

// Form submit (demo)
document.getElementById('date-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("✅ Form submitted! (In real version this would show results and modal)");
});