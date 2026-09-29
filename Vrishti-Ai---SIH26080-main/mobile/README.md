# VRISHTI AI Mobile Application (iOS & Android)

A production-grade, native mobile meteorological operations application for the **VRISHTI AI** platform. Built with React Native & Expo to deliver physics-guided precipitation post-processing, high-resolution GIS map intelligence, synoptic regime diagnostics, and conversational meteorological copilot capabilities directly to field officers.

---

## 🛰️ Key Features

1. **Operational Forecast Screen (`ForecastScreen.tsx`)**
   - 6-hour IMD Warning Status Banner (`GREEN`, `YELLOW`, `ORANGE`, `RED`).
   - Side-by-side comparison: **VRISHTI AI Corrected Rainfall (mm)** vs **Raw ECMWF NWP (mm)**.
   - Real-time Model Bias Delta ($\Delta$ mm) and Calibrated Heavy Rain Probability \(P(\text{Rain} > 64.5\text{mm})\).
   - Ground Truth IMD Automatic Rain Gauge (ARG) validation where observations exist.
   - Synoptic Weather Regime Classification with posterior probabilities.
   - Full atmospheric telemetry: 2m Temperature, Relative Humidity, 10m Wind Speed, MSL Pressure, Elevation, Coordinates.

2. **Full GIS District Map (`MapScreen.tsx`)**
   - High-resolution Esri World Imagery (Satellite) & CartoDB Meteorological Dark Canvas.
   - Interactive district markers across all 57 Western Ghats talukas (Goa, Karnataka, Kerala).
   - Layer toggles: **AI Rainfall**, **IMD Warning Alert**, **Heavy Rain Probability**, **Raw NWP**, and **Bias Delta**.
   - Progressive zoom label management preventing visual clutter.
   - Deep telemetry drawer sheet with direct navigation to station forecasts.

3. **Synoptic Regime Diagnostics (`RegimeScreen.tsx`)**
   - Random Forest Physics Classifier benchmark: Overall Accuracy, per-regime Precision, Recall, and F1-Score.
   - Per-regime test set verification metrics with **Heavy Rain Critical Success Index (CSI)** derived directly from model output.
   - Synoptic physical reasoning (Monsoon trough dynamics, low-level jet forcing, offshore convective vortices).

4. **Scientific Model Verification (`VerificationScreen.tsx`)**
   - Continuous Error Metrics: RMSE, MAE, Bias, Pearson \(r\), \(R^2\) Score.
   - Threshold-specific Contingency Matrix & Skill Scores: Hits, Misses, False Alarms, Correct Negatives, POD, FAR, CSI, ETS across IMD thresholds (>0.1mm, >15.6mm, >64.5mm, >115.5mm).
   - Scientific audit verdict and executive summary bullets.

5. **AI Meteorological Copilot (`AIAssistantScreen.tsx`)**
   - Context-aware natural language assistant powered by `/api/advisor/evaluate`.
   - Answers questions regarding current station warnings, heavy precipitation risks, and recommended civil protection actions.

6. **Advanced Operational Tools (`MoreScreen.tsx`)**
   - **Model Ablation Study:** Incremental impact of physics-guided features.
   - **Feature Importance:** Ranked atmospheric predictors (CAPE, PWAT, vorticity, etc.).
   - **Probability Calibration:** Reliability diagrams & Brier scores.
   - **Interactive Model Sandbox:** Simulate what-if weather scenarios in real-time.
   - **Dataset & Provenance Audit:** Quality control checks and station metadata.
   - **Custom Alert Thresholds:** Push notification configuration.
   - **Backend Server Settings:** Dynamic host configuration modal.

---

## 📱 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli` or `npx expo`)
- VRISHTI AI Backend running on port `8000` (`python -u -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`)

### Installation
```bash
cd mobile
npm install
```

### Running on Android (Emulator or Physical Device)
```bash
# Start Metro bundler for Android
npm run android
```
> **Note for Android Emulator:** The app connects to `http://10.0.2.2:8000` by default to reach the host machine.
> **Note for Physical Phone:** Open the app in Expo Go, tap the **LIVE/OFFLINE** pill in the top header, and set your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:8000`).

### Running on iOS (Simulator or Physical Device)
```bash
# Start Metro bundler for iOS
npm run ios
```
> **Note for iOS Simulator:** The app connects to `http://localhost:8000` by default.

### Type Check & Verification
```bash
npm run ts:check
```

---

## 🔒 Data Integrity & Scientific Guarantee
- **Zero Mock / Fake Data:** All forecasts, probabilities, skill metrics, and regime classifications are fetched live from the backend ML models.
- **Graceful Fallbacks:** If data is unavailable for an unmonitored timestamp or partition, the app strictly displays `"Data unavailable"` without fabricating numbers.
