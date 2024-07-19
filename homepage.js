function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

function validateForm() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    if (retirementAge <= currentAge) {
        alert('退休年龄必须大于当前年龄');
        return false;
    }
    calculateYearsNeeded();
    calculateSpending();
    updateGoalProgress();
    return true;
}

function calculateYearsNeeded() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const yearsNeeded = retirementAge - currentAge;
    document.getElementById('yearsNeeded').value = yearsNeeded;
}

function calculateSpending() {
    const monthlySpending = parseInt(document.getElementById('monthlySpending').value);
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
    const yearsNeeded = parseInt(document.getElementById('yearsNeeded').value);
    const yearlySpending = monthlySpending * 12;
    const yearlySpendingR = yearlySpending * Math.pow(1 + inflationRate, yearsNeeded);
    const monthlySpendingR = yearlySpendingR / 12;
    const retirementAmountNeeded = yearlySpending * 25; // Using the rule of 25
    const retirementAmountNeededR = yearlySpendingR * 25; // Using the rule of 25

    setFormattedValue('yearlySpending', yearlySpending);
    setFormattedValue('monthlySpendingR', monthlySpendingR);
    setFormattedValue('yearlySpendingR', yearlySpendingR);
    setFormattedValue('retirementAmountNeeded', retirementAmountNeeded);
    setFormattedValue('retirementAmountNeededR', retirementAmountNeededR);
}

function setFormattedValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = formatNumber(value);
    }
}

function updateGoalProgress() {
    const retirementAmountNeeded = parseFloat(document.getElementById('retirementAmountNeededR').value.replace(/,/g, ''));
    const currentSavings = 0; // You may want to add an input field for this

    const progressPercentage = (currentSavings / retirementAmountNeeded) * 100;
    const formattedPercentage = Math.min(progressPercentage, 100).toFixed(2);

    document.getElementById('goalProgress').style.display = 'block';
    document.getElementById('goalAmount').textContent = `退休目标: RM${formatNumber(retirementAmountNeeded)}`;
    document.getElementById('goalProgressPercentage').textContent = `目标完成度: ${formattedPercentage}%`;
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${formattedPercentage}%`;
    progressFill.style.backgroundColor = progressPercentage >= 100 ? '#4CAF50' : '#FFA500';
}

// Format the monthly spending display as the user types
document.getElementById('monthlySpending').addEventListener('input', function(e) {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
        document.getElementById('formattedMonthlySpending').textContent = formatNumber(value);
    } else {
        document.getElementById('formattedMonthlySpending').textContent = '';
    }
});

// Initialize formatting on page load
document.addEventListener('DOMContentLoaded', function() {
    const monthlySpendingInput = document.getElementById('monthlySpending');
    if (monthlySpendingInput) {
        monthlySpendingInput.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
                document.getElementById('formattedMonthlySpending').textContent = formatNumber(value);
            } else {
                document.getElementById('formattedMonthlySpending').textContent = '';
            }
        });
    }
});

function goToNextPage() {
    // Get all the input values
    const name = document.getElementById('name').value;
    const currentAge = document.getElementById('currentAge').value;
    const retirementAge = document.getElementById('retirementAge').value;
    const yearsNeeded = document.getElementById('yearsNeeded').value;
    const inflationRate = document.getElementById('inflationRate').value;
    const monthlySpending = document.getElementById('monthlySpending').value;
    const retirementAmountNeeded = document.getElementById('retirementAmountNeededR').value;

    // Create a URL with query parameters
    const url = `epf.html?name=${encodeURIComponent(name)}&currentAge=${currentAge}&retirementAge=${retirementAge}&yearsNeeded=${yearsNeeded}&inflationRate=${inflationRate}&monthlySpending=${monthlySpending}&retirementAmountNeeded=${encodeURIComponent(retirementAmountNeeded)}`;

    // Navigate to the EPF calculator page
    window.location.href = url;
}