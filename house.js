function calculateHouseInvestment() {
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    const rentAmount = parseFloat(document.getElementById('rentAmount').value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
    const houseAppreciationRate = parseFloat(document.getElementById('houseAppreciationRate').value) / 100;
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    if (isNaN(housePrice) || isNaN(rentAmount)) {
        alert('请输入有效的数值。');
        return false;
    }

    // Get retirement information from EPF page (you need to implement this)
    const currentAge = 30; // Example value, replace with actual value from EPF page
    const retirementAge = 60; // Example value, replace with actual value from EPF page
    const yearsUntilRetirement = retirementAge - currentAge;

    generateTable(housePrice, rentAmount, monthlyPayment, houseAppreciationRate, interestRate, currentAge, yearsUntilRetirement);

    document.getElementById('investmentProgress').style.display = 'block';
    document.getElementById('houseCalculator').style.display = 'block';

    return true;
}

function generateTable(housePrice, rentAmount, monthlyPayment, houseAppreciationRate, interestRate, currentAge, yearsUntilRetirement) {
    const table = document.getElementById('houseTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear existing rows

    let currentHousePrice = housePrice;
    let debtToBank = housePrice;
    let finalDebt = 0;
    let netPassiveIncome = 0;

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        const row = table.insertRow();
        
        const yearlyRentalIncome = currentHousePrice * houseAppreciationRate;
        const monthlyRentalIncome = yearlyRentalIncome / 12;
        const interestAmount = debtToBank * interestRate;
        const yearEndDebt = debtToBank - (monthlyPayment * 12) + interestAmount;
        const netPassiveIncomeYear = yearlyRentalIncome - interestAmount;

        row.insertCell(0).innerHTML = year;
        row.insertCell(1).innerHTML = currentAge + year;
        row.insertCell(2).innerHTML = currentHousePrice.toFixed(2);
        row.insertCell(3).innerHTML = monthlyRentalIncome.toFixed(2);
        row.insertCell(4).innerHTML = yearlyRentalIncome.toFixed(2);
        row.insertCell(5).innerHTML = debtToBank.toFixed(2);
        row.insertCell(6).innerHTML = interestAmount.toFixed(2);
        row.insertCell(7).innerHTML = yearEndDebt.toFixed(2);
        row.insertCell(8).innerHTML = netPassiveIncomeYear.toFixed(2);

        currentHousePrice *= (1 + houseAppreciationRate);
        debtToBank = yearEndDebt;

        if (year === yearsUntilRetirement) {
            finalDebt = yearEndDebt;
            netPassiveIncome = netPassiveIncomeYear;
        }
    }

    updateProgressBar(finalDebt, housePrice, netPassiveIncome);
}

function updateProgressBar(finalDebt, initialHousePrice, netPassiveIncome) {
    const debtReductionPercentage = Math.max(0, Math.min(100, (1 - finalDebt / initialHousePrice) * 100));
    
    document.getElementById('progressFill').style.width = `${debtReductionPercentage}%`;
    document.getElementById('finalDebt').innerHTML = `年尾欠款: <span class="highlight">RM ${finalDebt.toFixed(2)}</span>`;
    document.getElementById('netPassiveIncome').innerHTML = `净被动收入: <span class="highlight">RM ${netPassiveIncome.toFixed(2)}</span>`;
}