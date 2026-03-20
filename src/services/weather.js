import axios from 'axios';

const WEATHER_CACHE_KEY = 'farmflux_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
    try {
        const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || '{}');
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < CACHE_DURATION) return entry.data;
        return null;
    } catch { return null; }
}

function setCache(key, data) {
    try {
        const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || '{}');
        cache[key] = { data, timestamp: Date.now() };
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
    } catch { /* storage full */ }
}

export async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve('Delhi'); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    // Free reverse geocoding API to get the city name from coordinates
                    const { data } = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`, { timeout: 8000 });
                    resolve(data.city || data.locality || data.principalSubdivision || 'Delhi');
                } catch { resolve('Delhi'); }
            },
            () => resolve('Delhi'),
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
    });
}

export async function getWeather(location = 'auto') {
    const cacheKey = `weather_${location}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        let lat = 28.6139; // Delhi defaults
        let lon = 77.2090;
        let locName = 'Delhi';

        if (location !== 'auto') {
            const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
            if (geoRes.data.results?.[0]) {
                lat = geoRes.data.results[0].latitude;
                lon = geoRes.data.results[0].longitude;
                locName = geoRes.data.results[0].name;
            } else {
                locName = location;
            }
        }

        // Open-Meteo is a reliable, free API with proper CORS support
        const { data } = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`);

        const current = data.current;
        const daily = data.daily;

        const result = {
            current: {
                temp: Math.round(current.temperature_2m),
                feelsLike: Math.round(current.apparent_temperature),
                humidity: Math.round(current.relative_humidity_2m),
                windSpeed: Math.round(current.wind_speed_10m),
                description: mapWMODesc(current.weather_code),
                icon: mapWMOIcon(current.weather_code),
                precipitation: current.precipitation,
                uvIndex: daily.uv_index_max?.[0] ? Math.round(daily.uv_index_max[0]) : 5,
                visibility: 10, // Not provided directly, default to 10
                pressure: Math.round(current.surface_pressure),
            },
            forecast: daily.time.slice(0, 7).map((date, i) => ({
                date,
                maxTemp: Math.round(daily.temperature_2m_max[i]),
                minTemp: Math.round(daily.temperature_2m_min[i]),
                description: mapWMODesc(daily.weather_code[i]),
                icon: mapWMOIcon(daily.weather_code[i]),
                precipitation: daily.precipitation_sum[i],
                humidity: 60, // Fallback as OpenMeteo daily humidity isn't directly exposed
            })),
            location: locName,
        };

        setCache(cacheKey, result);
        return result;
    } catch (err) {
        console.error('Weather fetching error:', err);
        return getFallbackWeather(location);
    }
}

function mapWMOIcon(code) {
    if ([0].includes(code)) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌧️';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
}

function mapWMODesc(code) {
    if (code === 0) return 'Clear';
    if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
    if ([45, 48].includes(code)) return 'Fog';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';
    return 'Clear';
}

function getFallbackWeather(loc) {
    return {
        current: { temp: 28, feelsLike: 30, humidity: 65, windSpeed: 12, description: 'Partly Cloudy', icon: '⛅', precipitation: 0, uvIndex: 6, visibility: 10, pressure: 1013 },
        forecast: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
            maxTemp: 32, minTemp: 22, description: 'Clear', icon: '☀️', precipitation: 0, humidity: 60,
        })),
        location: loc === 'auto' ? 'Your Location' : loc,
    };
}
