function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

function validateForm() {
    const requiredFields = ['name', 'currentAge', 'retirementAge', 'inflationRate', 'monthlySpending'];
    const missingFields = [];

    for (const field of requiredFields) {
        const value = document.getElementById(field).value.trim();
        if (value === '') {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(field => {
            switch(field) {
                case 'name': return '姓名';
                case 'currentAge': return '当前年龄';
                case 'retirementAge': return '退休年龄';
                case 'inflationRate': return '通胀率';
                case 'monthlySpending': return '每月开销';
                default: return field;
            }
        });
        alert(`请填写以下必填字段：${missingFieldNames.join(', ')}`);
        return false;
    }

    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    if (retirementAge <= currentAge) {
        alert('退休年龄必须大于当前年龄');
        return false;
    }

    calculateYearsNeeded();
    calculateSpending();
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

    // Show the results container
    document.getElementById('resultsContainer').style.display = 'block';

    // Round down the retirement amount
    const roundedRetirementAmount = Math.floor(retirementAmountNeededR);

    // Update the values in the welcome message and dashboard
    document.getElementById('userName').textContent = document.getElementById('name').value;
    document.getElementById('retirementGoal2').textContent = `RM${formatNumber(roundedRetirementAmount)}`;
    
    // Update the financial dashboard // having issueeeeeeee yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    document.getElementById('retirementGoal').textContent = formatDashboardNumber(roundedRetirementAmount);
    document.getElementById('yearsNeeded2').textContent = yearsNeeded;
    document.getElementById('inflationRate2').textContent = `${(inflationRate * 100).toFixed(2)}%`;
}

function setFormattedValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = formatNumber(value);
    }
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

function formatDashboardNumber(number) {
    if (number >= 1000000) {
        return '$' + (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return '$' + (number / 1000).toFixed(1) + 'K';
    } else {
        return '$' + number.toFixed(2);
    }
}

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

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.error(`Element with id '${id}' not found`);
    }
}