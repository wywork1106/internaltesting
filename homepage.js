function validateForm() {
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
    const monthlySpending = parseFloat(document.getElementById('monthlySpending').value);
    const inflationRate = parseInt(document.getElementById('inflationRate').value) / 100;
    const yearsNeeded = parseInt(document.getElementById('yearsNeeded').value);
    const yearlySpending = monthlySpending * 12;
    const yearlySpendingR = yearlySpending * Math.pow(1 + inflationRate, yearsNeeded);
    const monthlySpendingR = yearlySpendingR / 12;
    const retirementAmountNeeded = yearlySpending * 25; // Using the rule of 25
    const retirementAmountNeededR = yearlySpendingR * 25; // Using the rule of 25

    document.getElementById('yearlySpending').value = yearlySpending.toFixed(2);
    document.getElementById('monthlySpendingR').value = monthlySpendingR.toFixed(2);
    document.getElementById('yearlySpendingR').value = yearlySpendingR.toFixed(2);
    document.getElementById('retirementAmountNeeded').value = retirementAmountNeeded.toFixed(2);
    document.getElementById('retirementAmountNeededR').value = retirementAmountNeededR.toFixed(2);
}