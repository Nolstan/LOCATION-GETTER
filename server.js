const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to reverse geocode coordinates (using Nominatim OpenStreetMap)
app.get('/api/location', async (req, res) => {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data.error) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        res.json({
            address: data.display_name,
            road: data.address?.road || 'Unknown road',
            suburb: data.address?.suburb || data.address?.neighbourhood || 'Unknown area',
            city: data.address?.city || data.address?.town || data.address?.village || 'Unknown city',
            state: data.address?.state || 'Unknown state',
            country: data.address?.country,
            postcode: data.address?.postcode,
            lat: lat,
            lon: lon
        });
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Failed to get location information' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
});