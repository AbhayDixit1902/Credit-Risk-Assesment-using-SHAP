const loanForm = document.getElementById("loanForm");

const resetBtn = document.getElementById("resetBtn");
const predictBtn = document.getElementById("predictBtn");
const newAssessmentBtn = document.getElementById("newAssessmentBtn");

const loading = document.getElementById("loading");
const resultCard = document.getElementById("resultCard");

const riskResult = document.getElementById("riskResult");
const probability = document.getElementById("probability");
const threshold = document.getElementById("threshold");


const incomeInput = document.getElementById("person_income");
const loanInput = document.getElementById("loan_amnt");
const ratioInput = document.getElementById("loan_percent_income");

function calculateLoanIncomeRatio() {
    const income = parseFloat(incomeInput.value);
    const loan = parseFloat(loanInput.value);

    if (income > 0 && loan > 0) {
        ratioInput.value = (loan / income).toFixed(2);
    } else {
        ratioInput.value = "";
    }
}

incomeInput.addEventListener("input", calculateLoanIncomeRatio);
loanInput.addEventListener("input", calculateLoanIncomeRatio);

function getNumberValue(id) {
    const value = document.getElementById(id).value.trim();

    if (value === "") {
        return null;
    }

    return Number(value);
}


function getStringValue(id) {
    return document.getElementById(id).value;
}


loanForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const payload = {

        person_age: getNumberValue("person_age"),

        person_income: getNumberValue("person_income"),

        person_emp_length: getNumberValue("person_emp_length"),

        person_home_ownership:
            getStringValue("person_home_ownership"),

        loan_intent:
            getStringValue("loan_intent"),

        loan_grade:
            getStringValue("loan_grade"),

        loan_amnt:
            getNumberValue("loan_amnt"),

        loan_int_rate:
            getNumberValue("loan_int_rate"),

        loan_percent_income:
            getNumberValue("loan_percent_income"),

        cb_person_default_on_file:
            getStringValue("cb_person_default_on_file"),

        cb_person_cred_hist_length:
            getNumberValue("cb_person_cred_hist_length")
    };




    predictBtn.disabled = true;
    predictBtn.textContent = "Analyzing...";

    loading.classList.remove("hidden");
    resultCard.classList.add("hidden");


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        });


        const data = await response.json();


       

        if (!response.ok) {

            let errorMessage = "Prediction failed.";

            if (data.detail) {

                if (Array.isArray(data.detail)) {

                    errorMessage = data.detail
                        .map(error => error.msg)
                        .join("\n");

                } else {

                    errorMessage = data.detail;
                }
            }

            throw new Error(errorMessage);
        }



        const isHighRisk = data.default_prediction === 1;

        riskResult.textContent = data.Result;

        probability.textContent =
            `${(data.default_probability * 100).toFixed(2)}%`;

        threshold.textContent =
            `${(data.threshold * 100).toFixed(2)}%`;


  

        riskResult.classList.remove(
            "risk-low",
            "risk-high"
        );


    

        if (isHighRisk) {

            riskResult.classList.add("risk-high");

        } else {

            riskResult.classList.add("risk-low");
        }


        resultCard.classList.remove("hidden");

    
        resultCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    catch (error) {

        alert(error.message);

    }


    finally {

        loading.classList.add("hidden");

        predictBtn.disabled = false;

        predictBtn.textContent = "Assess Credit Risk";
    }

});




resetBtn.addEventListener("click", function () {

    loanForm.reset();

    resultCard.classList.add("hidden");

    riskResult.classList.remove(
        "risk-low",
        "risk-high"
    );

});



newAssessmentBtn.addEventListener("click", function () {

    loanForm.reset();

    resultCard.classList.add("hidden");

    riskResult.classList.remove(
        "risk-low",
        "risk-high"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});