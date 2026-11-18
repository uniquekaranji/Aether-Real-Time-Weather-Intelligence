# Aether — Real-Time Weather Intelligence Website 🌦️

A commercial-grade, responsive weather intelligence web application built with **HTML5**, **CSS3**, and **Vanilla ES6+ JavaScript** for the **Ignite Club Week 9 Web Development Mission (Project 1)**.

## ✨ Key Features

- **Real-Time Weather Telemetry**: Powered by the [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) and [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) with zero API-key setup required.
- **Global City Search & Disambiguation**: Search any city or postal code worldwide with instant matching location chips and quick-pick global hubs (New Delhi, Mumbai, Bengaluru, London, Tokyo, New York).
- **Current Location Detection**: One-click browser GPS lookup using `navigator.geolocation`.
- **Comprehensive Weather Metrics**:
  - **Temperature** (`2m` air temperature)
  - **Feels-Like Temperature** (Apparent thermal index)
  - **Relative Humidity** (`%` with animated gauge bar)
  - **Wind Speed & Direction** (`km/h` or `mph` + compass cardinal & azimuth degrees)
  - **Horizontal Visibility** (`km` or `mi` converted from surface visibility metres)
  - **Weather Conditions & Surface Pressure** (WMO weather codes mapped to custom SVG icons)
- **Dynamic Atmospheric Themes**: Background gradients and ambient lighting automatically adapt to live weather conditions and local day/night cycle (`Clear Day`, `Clear Night`, `Cloudy`, `Rain`, `Thunderstorm`, `Snow`, `Fog`).
- **12-Hour & 7-Day Forecasts**: Hourly temperature strip, 7-day high/low range, and solar sunrise/sunset cycle.
- **Resilient Error Handling & Loading States**: Smooth loading spinner overlay, non-intrusive toast notifications, and automatic offline fallback snapshot.

## 📁 Folder Structure

```text
WEEK-9/Weather-Website/
├── index.html   # Semantic HTML5 layout & SVG iconography
├── style.css    # Custom CSS3 glassmorphism, dynamic themes & responsive grid
├── script.js    # Modular ES6+ API client, unit converter & DOM renderer
└── README.md    # Project documentation
```

## 🚀 How to Run Locally

1. Clone or unzip the `WEEK-9/Weather-Website/` folder.
2. Open `index.html` directly in any modern browser, or serve it with a local static server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
3. Search for any city, click **Current Location**, or toggle between **Metric (`°C · km/h`)** and **Imperial (`°F · mph`)** units.
