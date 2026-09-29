# 🌧️ Vrishti AI – Regime-Aware AI Rainfall Forecasting System

> **Smart India Hackathon (SIH) – Problem Statement: SIH26080**

Vrishti AI is an AI/ML-based rainfall post-processing and forecasting system designed to improve the reliability of numerical weather prediction (NWP) rainfall forecasts by identifying different weather regimes and applying regime-specific bias correction.

The system focuses on **district-level rainfall forecasting for Goa**, combining meteorological observations, NWP forecasts, and atmospheric predictors to generate improved rainfall predictions and heavy-rainfall probabilities.

---

## 🎯 Problem Statement

Numerical Weather Prediction (NWP) models can produce systematic rainfall biases due to complex atmospheric processes, local topography, and varying weather regimes.

A single bias-correction model may not perform equally well under all meteorological conditions.

**Vrishti AI addresses this challenge by:**

1. Identifying the prevailing weather regime.
2. Applying regime-specific rainfall bias correction.
3. Estimating heavy-rainfall probability.
4. Producing district-level rainfall information.
5. Evaluating forecasts using standard verification metrics.

---

## 🚀 Key Features

### 🌦️ Weather Regime Classification

The system identifies rainfall-producing atmospheric regimes such as:

- Active Monsoon
- Break Monsoon
- Monsoon Low / Depression
- Coastal Rainfall
- Orographic Rainfall
- Western Disturbance
- Normal / Mixed

### 🤖 AI-Based Bias Correction

Regime-specific machine learning models are used to correct systematic errors in NWP rainfall forecasts.

### 🌧️ Heavy Rainfall Probability

The system estimates the probability of heavy rainfall events to support early warning and decision-making.

### 📍 District-Level Rainfall Product

Rainfall information is processed to provide localized rainfall predictions for districts/talukas.

### 📊 Forecast Verification

The system supports evaluation using meteorological verification metrics including:

- RMSE
- ETS
- CSI
- POD
- FAR
- FSS

---

# 🧠 System Architecture

```text
                ┌───────────────────────┐
                │   NWP Forecast Data   │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   ERA5 Atmospheric    │
                │      Predictors       │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   IMD Observations    │
                │   / Ground Truth      │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Feature Engineering   │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Weather Regime        │
                │ Classification        │
                └───────────┬───────────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │ Regime-Specific  │         │ Heavy Rainfall   │
    │ Bias Correction  │         │ Probability      │
    └────────┬─────────┘         └────────┬─────────┘
             │                            │
             └──────────────┬─────────────┘
                            ▼
                ┌───────────────────────┐
                │ District-Level        │
                │ Rainfall Forecast     │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Verification &        │
                │ Visualization         │
                └───────────────────────┘
