/**
 * Aether — Real-Time Weather Intelligence
 * Project 1 (Ignite Club Week 9)
 * Uses Open-Meteo Geocoding & Weather Forecast APIs (CORS-enabled HTTPS, no key required)
 */

const state = {
  unit: 'metric', // 'metric' (°C, km/h, km) | 'imperial' (°F, mph, mi)
  lastLocation: {
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
  },
  weatherData: null,
};

// Grounded fallback data for New Delhi, India in case of offline environment
const FALLBACK_WEATHER = {
  name: 'New Delhi',
  country: 'India',
  lat: 28.6139,
  lon: 77.2090,
  timezone: 'Asia/Kolkata',
  isFallback: true,
  current: {
    temperature_2m: 23.0,
    apparent_temperature: 22.2,
    relative_humidity_2m: 40,
    wind_speed_10m: 10.0,
    wind_direction_10m: 315,
    surface_pressure: 1014.0,
    weather_code: 1,
    is_day: 0,
    time: new Date().toISOString(),
  },
  visibilityMeters: 10000,
  hourly: {
    time: Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() + i, 0, 0, 0);
      return d.toISOString();
    }),
    temperature_2m: [23, 22, 20, 19, 18, 17, 17, 19, 22, 25, 27, 27],
    weather_code: [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    visibility: Array(12).fill(10000),
  },
  daily: {
    time: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    }),
    weather_code: [1, 0, 0, 1, 2, 0, 1],
    temperature_2m_max: [27.8, 27.2, 26.8, 26.5, 26.0, 26.4, 27.0],
    temperature_2m_min: [14.0, 13.5, 13.2, 13.0, 12.8, 13.1, 13.6],
    sunrise: ['2026-11-18T06:46', '2026-11-19T06:47', '2026-11-20T06:47', '2026-11-21T06:48', '2026-11-22T06:49', '2026-11-23T06:50', '2026-11-24T06:50'],
    sunset: ['2026-11-18T17:26', '2026-11-19T17:26', '2026-11-20T17:25', '2026-11-21T17:25', '2026-11-22T17:25', '2026-11-23T17:24', '2026-11-24T17:24'],
  },
};

// Map WMO weather codes to human labels, icon types, and dynamic background themes
function getWeatherMeta(code, isDay = 1) {
  const day = Boolean(isDay);
  const catalog = {
    0: { label: 'Clear Sky', icon: day ? 'sun' : 'moon', theme: day ? 'theme-clear-day' : 'theme-clear-night' },
    1: { label: 'Mainly Clear', icon: day ? 'sun' : 'moon', theme: day ? 'theme-clear-day' : 'theme-clear-night' },
    2: { label: 'Partly Cloudy', icon: 'partly', theme: 'theme-cloudy' },
    3: { label: 'Overcast Clouds', icon: 'cloud', theme: 'theme-cloudy' },
    45: { label: 'Atmospheric Fog', icon: 'fog', theme: 'theme-fog' },
    48: { label: 'Rime Fog', icon: 'fog', theme: 'theme-fog' },
    51: { label: 'Light Drizzle', icon: 'rain', theme: 'theme-rain' },
    53: { label: 'Moderate Drizzle', icon: 'rain', theme: 'theme-rain' },
    55: { label: 'Dense Drizzle', icon: 'rain', theme: 'theme-rain' },
    61: { label: 'Light Rain', icon: 'rain', theme: 'theme-rain' },
    63: { label: 'Moderate Rain', icon: 'rain', theme: 'theme-rain' },
    65: { label: 'Heavy Rain', icon: 'rain', theme: 'theme-rain' },
    71: { label: 'Slight Snowfall', icon: 'snow', theme: 'theme-snow' },
    73: { label: 'Moderate Snowfall', icon: 'snow', theme: 'theme-snow' },
    75: { label: 'Heavy Snowfall', icon: 'snow', theme: 'theme-snow' },
    80: { label: 'Rain Showers', icon: 'rain', theme: 'theme-rain' },
    81: { label: 'Heavy Showers', icon: 'rain', theme: 'theme-rain' },
    82: { label: 'Violent Showers', icon: 'storm', theme: 'theme-storm' },
    95: { label: 'Thunderstorm', icon: 'storm', theme: 'theme-storm' },
    96: { label: 'Storm with Hail', icon: 'storm', theme: 'theme-storm' },
    99: { label: 'Severe Hailstorm', icon: 'storm', theme: 'theme-storm' },
  };
  return catalog[code] || { label: 'Partly Cloudy', icon: 'partly', theme: day ? 'theme-clear-day' : 'theme-clear-night' };
}

function getWeatherIconSvg(iconKind) {
  const svgs = {
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="#fde047" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5" fill="rgba(253, 224, 71, 0.28)"/><path d="M12 2v2.2"/><path d="M12 19.8V22"/><path d="m4.93 4.93 1.55 1.55"/><path d="m17.52 17.52 1.55 1.55"/><path d="M2 12h2.2"/><path d="M19.8 12H22"/><path d="m4.93 19.07 1.55-1.55"/><path d="m17.52 6.48 1.55-1.55"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(199, 210, 254, 0.22)"/></svg>`,
    partly: `<svg viewBox="0 0 24 24" fill="none" stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" stroke="#fde047"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" fill="rgba(186, 230, 253, 0.22)"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="rgba(226, 232, 240, 0.2)"/></svg>`,
    fog: `<svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="rgba(125, 211, 252, 0.18)"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>`,
    storm: `<svg viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" stroke="#cbd5e1"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  };
  return svgs[iconKind] || svgs.partly;
}

// Formatting Helpers
function formatTemp(celsius) {
  if (celsius === undefined || celsius === null || Number.isNaN(celsius)) return '--';
  if (state.unit === 'imperial') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

function formatSpeed(kmh) {
  if (kmh === undefined || kmh === null || Number.isNaN(kmh)) return '--';
  if (state.unit === 'imperial') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

function formatVisibility(meters) {
  if (meters === undefined || meters === null || Number.isNaN(meters)) return '10.0 km';
  const km = meters / 1000;
  if (state.unit === 'imperial') {
    const miles = km * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

function degToCompass(deg) {
  if (deg === undefined || deg === null || Number.isNaN(deg)) return 'N';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

function describeHumidity(rh) {
  if (rh < 30) return 'Dry atmospheric air';
  if (rh <= 60) return 'Comfortable moisture level';
  return 'Humid surface conditions';
}

function describeVisibility(meters) {
  const km = (meters || 10000) / 1000;
  if (km >= 10) return 'Clear horizontal sightline';
  if (km >= 4) return 'Moderate atmospheric haze';
  return 'Low visibility · Mist/Fog';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 260);
  }, 3000);
}

function setLoading(isLoading) {
  const overlay = document.getElementById('loadingOverlay');
  if (isLoading) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

// Render Dashboard UI
function renderDashboard() {
  const data = state.weatherData;
  if (!data) return;

  const cur = data.current;
  const meta = getWeatherMeta(cur.weather_code, cur.is_day);

  // Update dynamic background theme
  document.body.className = meta.theme;

  // Status pill
  const liveDot = document.getElementById('liveDot');
  const statusText = document.getElementById('statusText');
  if (data.isFallback) {
    liveDot.className = 'status-dot fallback';
    statusText.textContent = 'Offline Snapshot · Open-Meteo';
  } else {
    liveDot.className = 'status-dot live';
    statusText.textContent = 'Live Telemetry · Open-Meteo';
  }

  const parsedTime = cur.time ? new Date(cur.time) : new Date();
  document.getElementById('localTimeLabel').textContent = Number.isNaN(parsedTime.getTime())
    ? 'Updated just now'
    : `Observed ${parsedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Location & Coordinates
  document.getElementById('locationName').textContent = data.country ? `${data.name}, ${data.country}` : data.name;
  const latDir = data.lat >= 0 ? 'N' : 'S';
  const lonDir = data.lon >= 0 ? 'E' : 'W';
  document.getElementById('coordinatesLabel').textContent = `${Math.abs(data.lat).toFixed(2)}°${latDir}, ${Math.abs(data.lon).toFixed(2)}°${lonDir} · ${data.timezone || 'Local'}`;

  document.getElementById('conditionLabel').textContent = meta.label;
  document.getElementById('dayNightBadge').textContent = cur.is_day ? 'Daylight' : 'Nighttime';
  document.getElementById('heroWeatherIcon').innerHTML = getWeatherIconSvg(meta.icon);

  // Temperatures
  const tempFormatted = formatTemp(cur.temperature_2m);
  const feelsFormatted = formatTemp(cur.apparent_temperature ?? cur.temperature_2m);
  document.getElementById('currentTemp').textContent = tempFormatted;
  document.getElementById('feelsLikeTemp').textContent = `Feels like ${feelsFormatted}`;

  if (data.daily && Array.isArray(data.daily.temperature_2m_max)) {
    const hi = formatTemp(data.daily.temperature_2m_max[0]);
    const lo = formatTemp(data.daily.temperature_2m_min[0]);
    document.getElementById('highLowTemp').textContent = `H: ${hi} · L: ${lo}`;
  }

  // 6 Core Metric Cards
  document.getElementById('cardTempValue').textContent = tempFormatted;
  document.getElementById('cardFeelsValue').textContent = feelsFormatted;

  const rh = Math.max(0, Math.min(100, Math.round(cur.relative_humidity_2m || 0)));
  document.getElementById('cardHumidityValue').textContent = `${rh}%`;
  document.getElementById('humidityBar').style.width = `${rh}%`;
  document.getElementById('cardHumidityFooter').textContent = describeHumidity(rh);

  const windDir = degToCompass(cur.wind_direction_10m);
  document.getElementById('cardWindValue').textContent = formatSpeed(cur.wind_speed_10m);
  document.getElementById('cardWindFooter').textContent = `Direction: ${windDir} (${Math.round(cur.wind_direction_10m || 0)}°)`;

  document.getElementById('cardVisibilityValue').textContent = formatVisibility(data.visibilityMeters);
  document.getElementById('cardVisibilityFooter').textContent = describeVisibility(data.visibilityMeters);

  document.getElementById('cardConditionValue').textContent = meta.label;
  const pressureVal = cur.surface_pressure ? `${Math.round(cur.surface_pressure)} hPa` : 'Standard';
  document.getElementById('cardPressureFooter').textContent = `Surface pressure: ${pressureVal}`;

  // Hourly Forecast (12 hours starting from current hour)
  document.getElementById('timezoneBadge').textContent = data.timezone || 'Local Time';
  const hourlyContainer = document.getElementById('hourlyContainer');
  hourlyContainer.innerHTML = '';

  if (data.hourly && Array.isArray(data.hourly.time)) {
    const nowMs = Date.now();
    let startIdx = data.hourly.time.findIndex((t) => new Date(t).getTime() >= nowMs - 3600000);
    if (startIdx < 0) startIdx = 0;

    for (let i = startIdx; i < Math.min(startIdx + 12, data.hourly.time.length); i++) {
      const tDate = new Date(data.hourly.time[i]);
      const isNow = i === startIdx;
      const label = isNow ? 'Now' : tDate.toLocaleTimeString([], { hour: 'numeric' });
      const hCode = data.hourly.weather_code ? data.hourly.weather_code[i] : cur.weather_code;
      const hr = tDate.getHours();
      const hMeta = getWeatherMeta(hCode, hr >= 6 && hr < 18 ? 1 : 0);

      const item = document.createElement('div');
      item.className = `hourly-item ${isNow ? 'now' : ''}`;
      item.innerHTML = `
        <span class="hourly-time">${label}</span>
        <div class="hourly-icon">${getWeatherIconSvg(hMeta.icon)}</div>
        <span class="hourly-temp">${formatTemp(data.hourly.temperature_2m[i])}</span>
      `;
      hourlyContainer.appendChild(item);
    }
  }

  // 7-Day Outlook & Sunrise/Sunset
  const dailyContainer = document.getElementById('dailyContainer');
  dailyContainer.innerHTML = '';

  if (data.daily && Array.isArray(data.daily.time)) {
    data.daily.time.slice(0, 7).forEach((dateStr, idx) => {
      const dObj = new Date(`${dateStr}T12:00:00`);
      const dayLabel = idx === 0 ? 'Today' : dObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      const dCode = data.daily.weather_code ? data.daily.weather_code[idx] : 0;
      const dMeta = getWeatherMeta(dCode, 1);
      const maxT = formatTemp(data.daily.temperature_2m_max[idx]);
      const minT = formatTemp(data.daily.temperature_2m_min[idx]);

      const row = document.createElement('div');
      row.className = 'daily-row';
      row.innerHTML = `
        <span class="daily-day">${dayLabel}</span>
        <div class="daily-icon">${getWeatherIconSvg(dMeta.icon)}</div>
        <span class="daily-cond">${dMeta.label}</span>
        <div class="daily-temps">
          <span>${maxT}</span>
          <span class="daily-low">${minT}</span>
        </div>
      `;
      dailyContainer.appendChild(row);
    });

    if (data.daily.sunrise && data.daily.sunrise[0]) {
      const sr = new Date(data.daily.sunrise[0]);
      const ss = new Date(data.daily.sunset[0]);
      if (!Number.isNaN(sr.getTime())) {
        document.getElementById('sunriseValue').textContent = sr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (!Number.isNaN(ss.getTime())) {
        document.getElementById('sunsetValue').textContent = ss.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
  }
}

// Fetch Live Weather by Coordinates
async function fetchWeatherByCoords(name, country, lat, lon) {
  state.lastLocation = { name, country, lat, lon };
  setLoading(true);
  document.getElementById('errorBanner').classList.add('hidden');

  // Highlight matching quick-city chip if applicable
  document.querySelectorAll('.city-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.name.toLowerCase() === name.toLowerCase());
  });

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!json.current) throw new Error('Invalid weather response');

    // Determine current hour index for visibility (Open-Meteo returns visibility in metres in hourly array)
    let visMeters = 10000;
    if (json.hourly && Array.isArray(json.hourly.visibility) && Array.isArray(json.hourly.time)) {
      const nowMs = Date.now();
      let idx = json.hourly.time.findIndex((t) => new Date(t).getTime() >= nowMs - 3600000);
      if (idx < 0) idx = 0;
      if (json.hourly.visibility[idx] !== undefined && json.hourly.visibility[idx] !== null) {
        visMeters = json.hourly.visibility[idx];
      }
    }

    state.weatherData = {
      name,
      country,
      lat: json.latitude ?? lat,
      lon: json.longitude ?? lon,
      timezone: json.timezone || 'Local',
      isFallback: false,
      current: json.current,
      visibilityMeters: visMeters,
      hourly: json.hourly,
      daily: json.daily,
    };

    renderDashboard();
  } catch (error) {
    const banner = document.getElementById('errorBanner');
    document.getElementById('errorMessage').textContent = `Live weather request failed (${error.message}). Showing fallback telemetry.`;
    banner.classList.remove('hidden');

    if (!state.weatherData) {
      state.weatherData = FALLBACK_WEATHER;
    } else {
      state.weatherData.isFallback = true;
    }
    renderDashboard();
  } finally {
    setLoading(false);
  }
}

// Search City via Open-Meteo Geocoding API
async function handleCitySearch(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    showToast('Please enter a city name to search.', 'error');
    return;
  }

  const resultsRow = document.getElementById('searchResultsRow');
  const resultsList = document.getElementById('searchResultsList');
  resultsRow.classList.add('hidden');
  resultsList.innerHTML = '';

  setLoading(true);
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      setLoading(false);
      showToast(`No locations found matching "${cleanQuery}".`, 'error');
      return;
    }

    const bestMatch = data.results[0];
    await fetchWeatherByCoords(bestMatch.name, bestMatch.country || '', bestMatch.latitude, bestMatch.longitude);

    // Show disambiguation chips if multiple matches exist
    if (data.results.length > 1) {
      resultsRow.classList.remove('hidden');
      data.results.forEach((loc) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'city-chip';
        const region = loc.admin1 ? `, ${loc.admin1}` : '';
        chip.textContent = `${loc.name}${region}${loc.country ? ` (${loc.country})` : ''}`;
        chip.addEventListener('click', () => {
          fetchWeatherByCoords(loc.name, loc.country || '', loc.latitude, loc.longitude);
        });
        resultsList.appendChild(chip);
      });
    }
  } catch (err) {
    setLoading(false);
    showToast('Unable to search city right now. Please try again.', 'error');
  }
}

// Geolocation Detection
function detectCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }

  showToast('Requesting GPS coordinates...');
  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchWeatherByCoords('Current Location', '', latitude, longitude);
      showToast('Updated weather for your current coordinates.');
    },
    () => {
      setLoading(false);
      showToast('Location access was denied. Use the city search bar instead.', 'error');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// Event Listeners Setup
function initEvents() {
  const searchForm = document.getElementById('searchForm');
  const cityInput = document.getElementById('cityInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCitySearch(cityInput.value);
  });

  cityInput.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', cityInput.value.length === 0);
  });

  clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearBtn.classList.add('hidden');
    cityInput.focus();
  });

  document.getElementById('locateBtn').addEventListener('click', detectCurrentLocation);

  document.getElementById('retryBtn').addEventListener('click', () => {
    const { name, country, lat, lon } = state.lastLocation;
    fetchWeatherByCoords(name, country, lat, lon);
  });

  document.querySelectorAll('.city-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const { name, country, lat, lon } = chip.dataset;
      document.getElementById('searchResultsRow').classList.add('hidden');
      fetchWeatherByCoords(name, country, Number(lat), Number(lon));
    });
  });

  const metricBtn = document.getElementById('unitMetricBtn');
  const imperialBtn = document.getElementById('unitImperialBtn');

  metricBtn.addEventListener('click', () => {
    state.unit = 'metric';
    metricBtn.classList.add('active');
    metricBtn.setAttribute('aria-pressed', 'true');
    imperialBtn.classList.remove('active');
    imperialBtn.setAttribute('aria-pressed', 'false');
    renderDashboard();
  });

  imperialBtn.addEventListener('click', () => {
    state.unit = 'imperial';
    imperialBtn.classList.add('active');
    imperialBtn.setAttribute('aria-pressed', 'true');
    metricBtn.classList.remove('active');
    metricBtn.setAttribute('aria-pressed', 'false');
    renderDashboard();
  });
}

// Initialize App
initEvents();
fetchWeatherByCoords('New Delhi', 'India', 28.6139, 77.2090);
