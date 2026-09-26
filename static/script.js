// Credit Risk Ledger — front end logic
// Talks to POST /predict, which returns:
//   { default_probability, default_prediction, threshold, Result }

const form = document.getElementById('risk-form');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');

const incomeInput = document.getElementById('person_income');
const loanAmntInput = document.getElementById('loan_amnt');
const percentIncomeInput = document.getElementById('loan_percent_income');

const resultSection = document.getElementById('result-section');
const probValueEl = document.getElementById('prob-value');
const gaugeFill = document.getElementById('gauge-fill');
const gaugeThreshold = document.getElementById('gauge-threshold');
const thresholdLabel = document.getElementById('threshold-label');
const verdictBox = document.getElementById('verdict');
const verdictText = document.getElementById('verdict-text');
const resultNote = document.getElementById('result-note');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('scroll-to-form').addEventListener('click', () => {
  document.getElementById('form-section').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

// --- Auto-calculate "loan as % of income" from the two figures that define it ---
function updatePercentIncome() {
  const income = parseFloat(incomeInput.value);
  const amount = parseFloat(loanAmntInput.value);
  if (income > 0 && amount >= 0) {
    const pct = amount / income;
    percentIncomeInput.value = pct.toFixed(3);
  } else {
    percentIncomeInput.value = '';
  }
}
incomeInput.addEventListener('input', updatePercentIncome);
loanAmntInput.addEventListener('input', updatePercentIncome);

// --- Count-up animation for the headline number ---
function animateNumber(el, toValue, duration = 700) {
  if (prefersReducedMotion) {
    el.textContent = toValue.toFixed(1);
    return;
  }
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (toValue * eased).toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Assessing…' : 'Assess risk';
}

function showError(message) {
  formError.textContent = message;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = {
    person_age: parseInt(document.getElementById('person_age').value, 10),
    person_income: parseFloat(incomeInput.value),
    person_home_ownership: document.getElementById('person_home_ownership').value,
    person_emp_length: parseFloat(document.getElementById('person_emp_length').value),
    loan_intent: document.getElementById('loan_intent').value,
    loan_grade: document.getElementById('loan_grade').value,
    loan_amnt: parseFloat(loanAmntInput.value),
    loan_int_rate: parseFloat(document.getElementById('loan_int_rate').value),
    loan_percent_income: parseFloat(percentIncomeInput.value),
    cb_person_default_on_file: document.getElementById('cb_person_default_on_file').value,
    cb_person_cred_hist_length: parseInt(document.getElementById('cb_person_cred_hist_length').value, 10),
  };

  setLoading(true);

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Server responded ${response.status}: ${detail}`);
    }

    const data = await response.json();
    renderResult(data);
  } catch (err) {
    showError(`Couldn't reach the model: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

function renderResult(data) {
  const probabilityPct = data.default_probability * 100;
  const thresholdPct = data.threshold * 100;
  const isHighRisk = data.default_prediction === 1;

  resultSection.hidden = false;

  animateNumber(probValueEl, probabilityPct);

  requestAnimationFrame(() => {
    gaugeFill.style.width = `${probabilityPct}%`;
    gaugeFill.style.background = isHighRisk ? 'var(--risk-high)' : 'var(--risk-low)';
    gaugeThreshold.style.left = `${thresholdPct}%`;
  });

  thresholdLabel.textContent = `threshold ${thresholdPct.toFixed(0)}`;

  verdictBox.classList.remove('low', 'high');
  verdictBox.classList.add(isHighRisk ? 'high' : 'low');
  verdictText.textContent = data.Result;

  const distance = Math.abs(probabilityPct - thresholdPct).toFixed(1);
  resultNote.textContent = isHighRisk
    ? `This reading sits ${distance} points above the threshold of ${thresholdPct.toFixed(0)}%, which is what tips the entry into "High Risk."`
    : `This reading sits ${distance} points below the threshold of ${thresholdPct.toFixed(0)}%, which is what keeps the entry at "Low Risk."`;

  resultSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}
