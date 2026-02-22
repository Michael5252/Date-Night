export default async function handler(req, res) {
    const { zip, interests, description, time, budget } = req.query;
  
    const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN; // ← Add this in Vercel env vars
  
    if (!EVENTBRITE_TOKEN) {
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    // Step 1: Zip → lat/long (free US Census API)
    const geoRes = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/address?zip=${zip}&benchmark=Public_AR_Current&format=json`
    );
    const geoData = await geoRes.json();
    const match = geoData.result.addressMatches[0];
    if (!match) {
      return res.status(400).json({ error: 'Invalid zip code' });
    }
    const lat = match.coordinates.y;
    const lon = match.coordinates.x;
  
    // Step 2: Eventbrite search (public events near location)
    let url = `https://www.eventbriteapi.com/v3/events/search/?token=${EVENTBRITE_TOKEN}` +
              `&location.latitude=${lat}&location.longitude=${lon}&location.within=16km` + // ~10 miles
              `&sort_by=date&expand=venue,ticket_classes&status=live`;
  
    // Time filter (rough example)
    const today = new Date().toISOString().split('T')[0];
    if (time === 'today') url += `&start_date.range_start=${today}T00:00:00&start_date.range_end=${today}T23:59:59`;
    if (time === 'weekend') {
      const weekendStart = new Date(Date.now() + 86400000 * (5 - new Date().getDay())).toISOString().split('T')[0];
      url += `&start_date.range_start=${weekendStart}T00:00:00`;
    }
  
    // Price filter
    if (budget === 'free') url += '&price=free';
  
    // Interests → categories/keywords
    const categoryMap = {
      food: '110', // Food & Drink
      music: '103', // Music
      outdoors: '119', // Community & Culture or Outdoors
      drinks: '110', // fallback
      adventure: '108', // Sports & Fitness
      games: '113', // Science & Tech or Games
      art: '105', // Visual Arts
      chill: '119' // Community
    };
    if (interests) {
      interests.split(',').forEach(i => {
        if (categoryMap[i]) url += `&categories=${categoryMap[i]}`;
      });
    }
  
    // Description → keyword search
    if (description) url += `&q=${encodeURIComponent(description)}`;
  
    try {
      const ebRes = await fetch(url);
      if (!ebRes.ok) throw new Error('Eventbrite API error');
      const data = await ebRes.json();
      let events = data.events || [];
  
      // Extra filter for free
      if (budget === 'free') events = events.filter(e => e.is_free);
  
      // Return top 6 with useful fields
      const simplified = events.slice(0, 6).map(e => ({
        id: e.id,
        title: e.name.text,
        desc: e.summary || e.description.text.substring(0, 150) + '...',
        url: e.url,
        is_free: e.is_free,
        start: e.start.local,
        venue: e.venue?.name || 'TBD'
      }));
  
      res.json(simplified);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }