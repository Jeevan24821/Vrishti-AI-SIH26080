# Vrishti AI

## Weather-Regime-Aware AI for Improved Rainfall Forecasting Over India

**Team Name:** Garud
**Smart India Hackathon Problem ID:** SIH6080

---

## 1. Overview

Vrishti AI is an AI-driven rainfall forecasting and bias-correction system designed to address the variation in rainfall forecast errors across different weather regimes over India.

Rainfall forecast errors are not uniform across all meteorological conditions. Active monsoon periods, break monsoon conditions, monsoon lows and depressions, orographic rainfall, coastal rainfall, and western disturbances can produce different forecast-error characteristics.

Vrishti AI addresses this challenge through a weather-regime-aware machine learning framework that identifies the prevailing regime and applies an appropriate bias-correction strategy.

---

## 2. Problem Statement

Rainfall forecast errors over India vary with weather regimes such as:

* Active monsoon
* Break monsoon
* Monsoon lows and depressions
* Orographic rainfall
* Coastal rainfall
* Western disturbances

A single bias-correction method may not perform equally well under all these conditions.

The objective of Vrishti AI is to develop a regime-aware rainfall bias-correction framework that can account for these variations and improve the reliability of rainfall forecasts.

---

## 3. Proposed Solution

Vrishti AI follows a multi-stage machine learning pipeline.

```text
Meteorological / Forecast Data
            |
            v
    Data Preprocessing
            |
            v
     Feature Engineering
            |
            v
    Weather Regime Detection
            |
            v
    Regime-Aware Processing
            |
            v
      Bias Correction
            |
            v
    Corrected Rainfall
        Forecast
            |
            v
   Model Evaluation and
      Visualization
```

The key principle is to incorporate weather-regime information into the rainfall correction process rather than treating all rainfall conditions identically.

---

## 4. System Architecture

```text
                 Input Data
                     |
                     v
          +----------------------+
          | Data Preprocessing    |
          +----------+-----------+
                     |
                     v
          +----------------------+
          | Feature Engineering  |
          +----------+-----------+
                     |
                     v
          +----------------------+
          | Regime Classifier     |
          +----------+-----------+
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Regime 1   Regime 2   Regime N
          |          |          |
          +----------+----------+
                     |
                     v
          +----------------------+
          | Bias Correction       |
          | Models                |
          +----------+-----------+
                     |
                     v
          +----------------------+
          | Corrected Rainfall    |
          | Forecast              |
          +----------+-----------+
                     |
                     v
          +----------------------+
          | Evaluation &          |
          | Visualization         |
          +----------------------+
```

---

## 5. Machine Learning Workflow

### 5.1 Data Preprocessing

The input meteorological and rainfall data is prepared for model training and evaluation.

The preprocessing pipeline can include:

* Data cleaning
* Missing-value handling
* Feature preparation
* Target preparation
* Data validation
* Train/test separation

The objective is to maintain consistency between the data used for training and the data used during evaluation.

---

### 5.2 Feature Engineering

Relevant meteorological variables are transformed into features suitable for machine learning.

Feature engineering is performed to capture relationships between atmospheric conditions, rainfall forecasts, observed rainfall, and forecast errors.

---

### 5.3 Weather Regime Classification

The regime classifier determines the prevailing rainfall/weather regime from the available input features.

The classification stage acts as a decision layer for the subsequent bias-correction process.

```text
Meteorological Features
          |
          v
   Regime Classifier
          |
          v
  Identified Weather Regime
          |
          v
 Regime-Aware Correction
```

---

### 5.4 Bias Correction

The bias-correction stage attempts to reduce systematic differences between forecast rainfall and observed rainfall.

Instead of applying one universal correction strategy, the system incorporates the identified weather regime into the correction workflow.

```text
Raw Rainfall Forecast
          |
          v
   Forecast Bias
          |
          v
 Regime-Aware Model
          |
          v
Corrected Rainfall Forecast
```

---

## 6. Models

The project repository contains trained machine learning models used by the application.

These include models for:

* Regime classification
* Global machine-learning correction
* Regime-aware machine-learning correction
* MOS-based correction
* Rainfall-event classification
* Other model variants used for comparison and evaluation

The trained model files are stored under:

```text
backend/models/
```

---

## 7. Model Evaluation

Vrishti AI evaluates model performance using statistical and machine-learning evaluation metrics.

The evaluation framework includes metrics such as:

### R² Score

R² measures how well the model explains the variation in the target variable.

A higher R² generally indicates that the model explains more of the observed variation.

### RMSE

Root Mean Squared Error measures the magnitude of prediction errors while giving greater weight to larger errors.

### MAE

Mean Absolute Error measures the average absolute difference between predicted and observed values.

### Recall

Recall measures how many of the actual positive cases were correctly identified by the classifier.

### F2 Score

F2 Score gives more importance to recall than precision and can therefore be useful when missing important rainfall events is particularly undesirable.

---

## 8. Model Comparison

The system supports comparison between different rainfall correction approaches.

The repository contains trained models corresponding to different approaches, allowing their outputs and evaluation results to be compared.

The purpose of model comparison is to determine whether incorporating weather-regime information provides an advantage over a single global correction approach.

---

## 9. Verification and Scientific Audit

Vrishti AI includes components for evaluating the reliability of the modelling pipeline.

The backend contains modules related to:

```text
backend/app/data/
backend/app/ml/
backend/app/verification/
backend/app/services/
```

These components support data processing, machine-learning workflows, leakage checks, model evaluation, and pipeline execution.

---

## 10. Dashboard

Vrishti AI provides a web-based dashboard for presenting the rainfall forecasting and model-analysis workflow.

The frontend contains interfaces for areas including:

* Operational Forecast
* Regime Intelligence
* Calibration
* Feature Importance
* Model Comparison and Ablation
* Data Methodology
* Scientific Audit
* Verification
* Interactive Sandbox
* Jury Defense

The frontend source code is located in:

```text
frontend/
```

---

## 11. Project Structure

```text
Vrishti-Ai---SIH26080/
|
+-- backend/
|   |
|   +-- app/
|   |   +-- api/
|   |   +-- core/
|   |   +-- data/
|   |   +-- ml/
|   |   +-- services/
|   |   +-- verification/
|   |
|   +-- models/
|   |   +-- trained model files
|   |
|   +-- reports/
|   |   +-- final_test_report.csv
|   |   +-- final_test_report.json
|   |
|   +-- main.py
|   +-- train.py
|   +-- evaluate.py
|   +-- requirements.txt
|   +-- tests/
|
+-- frontend/
|   |
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- services/
|   |   +-- types/
|   |
|   +-- package.json
|   +-- package-lock.json
|   +-- vite.config.ts
|   +-- tailwind.config.js
|
+-- .gitignore
+-- LAST_MODIFIED.txt
+-- README.md
```

---

## 12. Technology Stack

### Backend

* Python
* Machine Learning
* Statistical Evaluation
* Data Processing
* Model Training and Inference

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Machine Learning

The project uses multiple machine-learning approaches for rainfall correction, regime classification, event classification, and model comparison.

---

## 13. Installation

### Clone the repository

```bash
git clone https://github.com/Jeevan24821/Vrishti-Ai---SIH26080.git
cd Vrishti-Ai---SIH26080
```

### Backend

Navigate to the backend:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the backend according to the project's configured entry point.

### Frontend

Navigate to the frontend:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 14. Data Integrity

Vrishti AI is designed around the use of actual meteorological and rainfall datasets.

The project does not rely on randomly generated values for reporting model performance.

Model evaluation should be performed using the underlying dataset and the documented preprocessing and evaluation pipeline.

Any future dataset additions should preserve traceability, reproducibility, and clear documentation of the data source.

---

## 15. Research Motivation

Conventional rainfall bias correction can have difficulty when forecast errors change according to the prevailing meteorological conditions.

Vrishti AI investigates a regime-aware approach in which the system first identifies the weather regime and then incorporates that information into the rainfall correction workflow.

This approach is intended to provide a more context-sensitive framework for rainfall forecast bias correction over India.

---

## 16. Future Scope

Potential future extensions include:

* Expansion of weather-regime classification
* Larger spatial and temporal datasets
* Additional bias-correction techniques
* Improved extreme-rainfall event detection
* Spatial rainfall forecasting
* Uncertainty estimation
* Independent validation datasets
* Operational deployment
* Expanded geographical coverage

---

## 17. Smart India Hackathon

**Project:** Vrishti AI
**Team:** Garud
**SIH Problem ID:** SIH6080

Vrishti AI is developed as a solution for the Smart India Hackathon challenge focused on rainfall forecast errors and weather-regime-dependent bias correction over India.

---

## 18. Team

### Team Garud

Developed for Smart India Hackathon 2026.

---

## 19. License

This project is developed for the Smart India Hackathon. Licensing and redistribution terms should be defined by the project team if the repository is released publicly.

---

## 20. Repository

GitHub:

https://github.com/Jeevan24821/Vrishti-Ai---SIH26080
