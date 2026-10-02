# Credit Risk Assessment System

A Machine Learning project that predicts the **credit risk of a loan
applicant** using classification techniques.

The project also includes **threshold optimization, probability
calibration, and SHAP explainability** to make the predictions more
useful and interpretable.

## Live Demo

The Credit Risk Assessment System has been deployed and is available for live testing. Explore the applicatio and test the model using the link below.

**Try Demo:**[Click Here <3](https://credit-risk-assesment-using-shap-kj5p.onrender.com/)

## Features

-   Credit risk classification
-   Threshold optimization
-   Probability calibration
-   SHAP-based model explainability
-   Model evaluation using accuracy, precision, recall, F1-score, and confusion matrix
-   Saved trained model for prediction

## Optimized Threshold

The optimized classification threshold used in this project is:

``` text
0.563
```

The threshold is saved in:

``` text
best_threshold.pkl
```
## Brier score

Optimised from 0.0629 -> 0.0510 (19.0% better)

## Project Structure

``` text
Credit-Risk/
│
├── static/
├── .gitignore
├── Credit_Risk.ipynb
├── best_threshold.pkl
├── credit_risk_dataset.csv
├── credit_risk_model.pkl
├── main.py
├── requirements.txt
├── runtime.txt
└── README.md
```

## Technologies Used

-   Python
-   Pandas
-   NumPy
-   scipy
-   Scikit-learn
-   Logistic-Regression
-   XGBoost
-   SHAP
-   Matplotlib
-   Seaborn
-   Joblib

## How to Run

Install the dependencies:

``` bash
pip install -r requirements.txt
```

Then run:

``` bash
python main.py
```

The trained model and optimized threshold are loaded from the `.pkl`
files, so the model does not need to be trained again.

## Model Files

``` python
import joblib

model = joblib.load("credit_risk_model.pkl")
threshold = joblib.load("best_threshold.pkl")
```

## Purpose

This project was created as a **Machine Learning portfolio project** to
demonstrate practical skills in classification, model evaluation,
threshold optimization, probability calibration, and Explainable AI using SHAP.

## Author

**Abhay Dixit**

GitHub: AbhayDixit1902