function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

function setupAutoReflect() {
    const inputs = ['name', 'currentAge', 'retirementAge', 'inflationRate', 'monthlySpending'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', autoUpdate);
        }
    });
}

function validateForm() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    if (isNaN(currentAge) || isNaN(retirementAge)) {
        return false;
    }
    if (retirementAge <= currentAge) {
        alert('退休年龄必须大于当前年龄');
        return false;
    }
    calculateYearsNeeded();
    calculateSpending();
    return true;
}

function calculateYearsNeeded() {
    const currentAge = parseFormattedNumber(document.getElementById('currentAge').value);
    const retirementAge = parseFormattedNumber(document.getElementById('retirementAge').value);
    const yearsNeeded = retirementAge - currentAge;
    document.getElementById('yearsNeeded').value = Math.round(yearsNeeded);
}

function calculateSpending() {
    const monthlySpending = parseFloat(document.getElementById('monthlySpending').value.replace(/,/g, '')) || 0;
    const inflationRate = (parseFloat(document.getElementById('inflationRate').value.replace(/,/g, '')) || 0) / 100;
    const yearsNeeded = parseInt(document.getElementById('yearsNeeded').value.replace(/,/g, '')) || 0;
    
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

function parseFormattedNumber(value) {
    return parseFloat(value.replace(/,/g, ''));
}

function setFormattedValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        if (typeof value === 'number' && !isNaN(value)) {
            element.value = formatNumber(value);
        } else if (typeof value === 'string') {
            // If it's a string, remove commas and try to parse it
            const parsedValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(parsedValue)) {
                element.value = formatNumber(parsedValue);
            } else {
                element.value = ''; // Set to empty string if parsing fails
            }
        } else {
            element.value = ''; // Set to empty string for other invalid types
        }
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

function goToNextPage() {
    const retirementAmountNeededR = document.getElementById('retirementAmountNeededR').value;
    window.location.href = `epf.html?retirementNeededR=${encodeURIComponent(retirementAmountNeededR)}`;
}

// Auto-reflect values
function setupAutoUpdate() {
    const inputs = ['name', 'currentAge', 'retirementAge', 'inflationRate', 'monthlySpending'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', autoUpdate);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupAutoReflect();
});


function autoUpdate() {
    if (validateForm()) {
        calculateYearsNeeded();
        calculateSpending();
    }
}