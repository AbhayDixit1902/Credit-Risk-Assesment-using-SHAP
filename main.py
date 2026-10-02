import os
from contextlib import asynccontextmanager
from typing import Literal, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator, model_validator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FEATURE_ORDER = [
    'person_age', 'person_income', 'person_emp_length', 'loan_amnt',
    'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length',
    'person_home_ownership', 'loan_intent', 'loan_grade', 'cb_person_default_on_file',
]

ml_model = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_model['model'] = joblib.load(os.path.join(BASE_DIR, 'credit_risk_model.pkl'))
    ml_model['threshold'] = float(joblib.load(os.path.join(BASE_DIR, 'best_threshold.pkl')))
    yield
    ml_model.clear()


app = FastAPI(title="Credit Risk API", lifespan=lifespan)


class LoanApplication(BaseModel):  # Pydantic model (validation)
    
    person_age: int = Field(ge=18, le=100)
    person_income: float = Field(gt=0)
    person_home_ownership: Literal['RENT', 'OWN', 'MORTGAGE', 'OTHER']
    
    person_emp_length: Optional[float] = Field(default=None, ge=0, le=60)
    loan_intent: Literal['PERSONAL', 'EDUCATION', 'MEDICAL', 'VENTURE',
                         'HOMEIMPROVEMENT', 'DEBTCONSOLIDATION']
    loan_grade: Literal['A', 'B', 'C', 'D', 'E', 'F', 'G']
    loan_amnt: float = Field(gt=0)
    loan_int_rate: Optional[float] = Field(default=None, ge=0, le=100)
    
    loan_percent_income: Optional[float] = Field(default=None, ge=0, le=1)
    cb_person_default_on_file: Literal['Y', 'N']
    cb_person_cred_hist_length: int = Field(ge=0, le=60)

    
    @field_validator('person_home_ownership', 'loan_intent', 'loan_grade',
                     'cb_person_default_on_file', mode='before')
    @classmethod
    def normalize_text(cls, v):
        return v.strip().upper() if isinstance(v, str) else v

    @model_validator(mode='after')
    def check_consistency(self):
        if self.person_emp_length is not None and self.person_emp_length > self.person_age:
            raise ValueError('person_emp_length cannot be greater than person_age')
        return self


@app.get('/health')
def health():
    return {'status': 'ok', 'model_loaded': 'model' in ml_model}


@app.post('/predict')
def predict(data: LoanApplication):
    record = data.model_dump()

    
    if record['loan_percent_income'] is None:
        record['loan_percent_income'] = round(record['loan_amnt'] / record['person_income'], 2)

    
    input_df = pd.DataFrame([record])[FEATURE_ORDER].fillna(value=np.nan)

    try:
        probability = float(ml_model['model'].predict_proba(input_df)[:, 1][0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Prediction failed: {e}')

    threshold = ml_model['threshold']
    prediction = int(probability >= threshold)

    return {
        'default_probability': round(probability, 4),
        'default_prediction': prediction,
        'threshold': round(threshold, 4),
        'Result': 'High Risk' if prediction == 1 else 'Low Risk',
    }



app.mount('/', StaticFiles(directory=os.path.join(BASE_DIR, 'static'), html=True), name='static')