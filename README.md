# 🚇 City Mobility Explorer

A high-performance, full-stack geospatial web application for exploring public transport across the Netherlands — built to handle real-world data at scale, not just demo-friendly datasets.

🔗 **Live:** https://milda100.github.io/CityMobilityExplorer  
💻 **GitHub:** https://github.com/Milda100/CityMobilityExplorer

---

## 🧠 Overview

City Mobility Explorer visualizes public transport stops, routes, and near real-time vehicle movement using real-world datasets (GTFS + APIs).

The project focuses on solving a core engineering challenge:

> How do you make massive, messy transport data fast, accurate, and usable in the browser?

---

## ⚙️ Tech Stack

### Frontend
- React
- MapLibre GL
- Custom SVG markers (converted into React components)

### Backend
- Node.js (Express)
- TypeScript

### Data & Infrastructure
- Cloudflare R2 (GeoJSON storage)
- GTFS datasets
- OV transport APIs
- OSRM (Open Source Routing Machine)

---

## 🚀 Key Features

### 🗺️ Interactive Map
- Smooth map rendering with MapLibre  
- Dynamic loading of transport data  
- Responsive zoom and navigation  

---

### 📍 Smart Stop Handling
- Server-generated GeoJSON from TPC data  
- Marker clustering for performance  
- Zoom-to-cluster interaction  
- Request limiting to avoid API blocking  

---

### 🧭 Multi-Layer Route Rendering

A robust, multi-layer fallback system ensures high-fidelity route geometry is always displayed, even when source data is incomplete or missing.

**1. GTFS Shapes (Primary)**  
On-demand fetching of preprocessed GeoJSON from Cloudflare R2, reducing server memory usage and eliminating large in-memory datasets.

**2. Three-Point Matching Algorithm**  
Selects the correct route variant (direction or short-turn) by minimizing Euclidean distance between GTFS shapes and real-time OV API stops at:
- Start point  
- Midpoint  
- End point  

**3. Road-Snapping for Rural Routes (OSRM)**  
When static shapes are missing — most commonly in rural, bus-only routes — stop coordinates are sent to OSRM to generate realistic paths aligned to the road network.  
This avoids unrealistic straight-line rendering where GTFS coverage is limited.

**4. Fallback Rendering (Safety Net)**  
If no geometry source is available (e.g. external API failure), the system gracefully degrades to a simple `LineString` between stops, ensuring the route is always visible.

---

### 🎯 Result

- High-accuracy route rendering in urban areas using GTFS data  
- Realistic road-aligned paths in rural regions  
- Reliable visualization under incomplete or failing data conditions  

---

### 💡 Insight

Fallback scenarios are not random — they occur primarily in **rural transport networks**, where data quality is lower and routes are predominantly bus-based.

By introducing road-snapping specifically for these cases, the system significantly improves visual accuracy while maintaining performance.

---

## 🔄 Near Real-Time Vehicle Tracking (Event-Based)

This project implements a **near real-time vehicle tracking system without GPS**, using stop-based event data from the OV public transport API.

Instead of continuous tracking, the system updates vehicle positions based on **line actuals**, where each update represents the last confirmed stop a vehicle has reached.

---

### 🧠 How It Works

- Vehicles generate events when they arrive at a stop  
- Each event includes:
  - Timestamp  
  - Stop coordinates  
- The system polls updates every ~10 seconds  
- The vehicle marker updates to the latest known stop  

---

### ⚙️ Behavior

- Vehicles appear at the **last observed stop**  
- On each update, the marker jumps to the next confirmed stop  
- This creates a stepwise progression along the route  

---

### 🎯 Result

- Near real-time visibility of vehicle positions  
- Accurate stop-to-stop movement representation  
- Lightweight alternative to continuous GPS tracking  

---

### 💡 Why This Approach

Many public transport systems (including the OV API) do not provide continuous GPS streams.

This approach demonstrates how to:

- Work with **event-driven data instead of live coordinates**  
- Build real-time features under **data constraints**  
- Deliver meaningful tracking with minimal data overhead  

---

### 🚧 Next Step

Planned improvement:

- Interpolating movement between stops to simulate continuous motion  
- Smooth animation of vehicles along route geometry  

This will bridge the gap between discrete updates and full GPS-like tracking.

---

## 🧩 Data Engineering Challenges

### 🧱 From 170MB Blob → Scalable Architecture

**Problem:**  
A massive GeoJSON file caused:
- Server crashes  
- Slow startup times  
- High memory usage  

**Solution:**  
- Split into thousands of small, line-specific `.geojson` files  
- Hosted on Cloudflare R2  
- Loaded on demand  

**Result:**
- ⚡ Fast load times  
- 🧠 Low memory usage  
- 📦 Scalable system design  

---

### 🐢 API Rate Limiting & Preprocessing

**Problem:**
- TPC data lacked coordinates  
- High request volume caused API blocking  
- Slow server initialization  

**Solution:**
- Built a preprocessing pipeline:
  - Fetch TPC details once  
  - Convert to GeoJSON  
  - Store as backend-ready data  

**Result:**
- 🚀 Fast frontend responses  
- 🔒 No rate-limit issues  
- 🧼 Clean, consistent data  

---

### 🧹 Handling Messy Real-World Data

**Issues encountered:**
- ~4.6k stops incorrectly located outside the Netherlands  
- Inconsistent coordinate sources across APIs  

**Solution:**
- Applied geographic boundary filtering  
- Prioritized data correctness over completeness  

> Better missing data than incorrect data.

---

## 🧱 Backend Architecture

- Separation of concerns (`/routes` vs `/services`)  
- Clean and maintainable structure  
- TypeScript for type safety  
- Optimized data fetching (no unnecessary loads)  

---

## 🎯 Performance Optimizations

- Lazy loading of route GeoJSON files  
- Marker clustering  
- Request limiting  
- Preprocessed datasets  
- Cloud-based data delivery  

---

## 🎨 UI Decisions

- SVG-based markers (MapLibre compatibility)  
- Clean, minimal interface  
- Focus on usability and clarity over visual noise  

---

## 📚 What I Learned

- Handling large-scale geospatial datasets  
- Designing fallback systems for unreliable data  
- Building scalable data pipelines  
- Working with real-world API limitations  
- Structuring maintainable backend systems  

---

## 🔮 Future Improvements

- Animated vehicle movement along routes  
- Transport type filtering  
- Route caching  
- Improved mobile experience  
- Enhanced error handling  

---

## 💬 Final Thoughts

This project evolved from a simple map into a full data engineering challenge involving:

- Performance bottlenecks  
- API limitations  
- Data inconsistencies  
- Infrastructure decisions  

It reflects real-world problem-solving — not just implementation, but adaptation.
