// script.js

// Scroll parallax for orbs
window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
});

// Demo events database
const sampleEvents = [
  { id:1, title:"Rooftop Sunset Cocktails", shortDesc:"City views, craft drinks, chill vibe", interests:["drinks","outdoors","chill"], budget:"medium", location:"~8 min drive", startsIn:"Tonight 7 PM", price:"$18–35" },
  { id:2, title:"Live Mariachi & Tacos", shortDesc:"Food truck + music pop-up", interests:["food","music","outdoors"], budget:"cheap", location:"~12 min walk", startsIn:"25 min", price:"$9–18" },
  { id:3, title:"Trivia Night at Cozy Bar", shortDesc:"Drinks, laughs, easy teams", interests:["games","drinks"], budget:"cheap", location:"~10 min drive", startsIn:"50 min", price:"$5–15" },
  { id:4, title:"Quiet Bookstore Acoustic Set", shortDesc:"Low-key tunes + coffee", interests:["music","chill"], budget:"free", location:"~9 min drive", startsIn:"1 hour", price:"Free" }
];

let selectedEvent = null;

function getMatchingEvents(interests, time, budget, desc, zip) {
  return sampleEvents
    .map(ev => {
      let score = interests.filter(i => ev.interests.includes(i)).length * 15;
      if (budget && ev.budget === budget) score += 12;
      if (desc && (ev.title + ev.shortDesc).toLowerCase().includes(desc.toLowerCase())) score += 25;
      return { event: ev, score };
    })
    .sort((a,b) => b.score - a.score)
    .map(item => item.event)
    .slice(0,4);
}

function renderResults(events) {
  const grid = document.getElementById('event-grid');
  grid.innerHTML = '';
  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${ev.shortDesc}</p>
      <p class="event-meta">${ev.startsIn} • ${ev.location} • ${ev.price}</p>
      <button class="im-in-btn btn" data-id="${ev.id}">I'm In! Let's Go →</button>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.im-in-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      selectedEvent = sampleEvents.find(e => e.id === id);
      document.getElementById('modal-event-title').textContent = `Confirm: ${selectedEvent.title}`;
      document.getElementById('user-modal').style.display = 'flex';
    });
  });
}

// Main form submit
document.getElementById('date-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const zip = formData.get('zip') || '76010';
  const interests = formData.getAll('interest');
  const time = formData.get('time');
  const budget = formData.get('budget');
  const description = formData.get('description').trim();

  document.getElementById('loading-text').textContent = `🔍 Finding matches within ~10 miles of ${zip}...`;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';

  setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
    const matches = getMatchingEvents(interests, time, budget, description, zip);
    renderResults(matches);
    document.getElementById('results-header').textContent = `Spontaneous vibes near ${zip} 🔥`;
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  }, 1400);
});

// Modal form submit
document.getElementById('user-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const age = document.getElementById('user-age').value;
  if (!name || !email || !age) return alert("Please fill name, email, and age.");
  closeModal();

  document.getElementById('success-text').innerHTML = `You're booked for <strong>${selectedEvent.title}</strong>!<br><br>Details sent to ${email}. Have fun! 🎉`;
  document.getElementById('success-message').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('success-message').scrollIntoView({ behavior: 'smooth' });
});

function closeModal() {
  document.getElementById('user-modal').style.display = 'none';
}

function newSearch() {
  document.getElementById('results').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
  document.getElementById('loading').style.display = 'none';
  document.getElementById('user-modal').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('date-form')?.reset();
}