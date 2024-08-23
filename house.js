let globalRetirementAmountNeeded = 0;
let globalEpfFinalAmount = 0;
let globalNetPassiveIncome = 0;
let globalCurrentAge = 0;
let globalRetirementAge = 0;
let globalYearsNeeded = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    document.getElementById('calculateButton').addEventListener('click', calculateHouseInvestment);
    document.getElementById('progressButton').addEventListener('click', toggleLifeProgress);
    document.getElementById('toggleHouseCalculatorButton').addEventListener('click', toggleHouseCalculator);
    document.getElementById('nextButton').addEventListener('click', verifyAndProceed);
});

function formatNumber(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatShortNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    } else {
        return number.toFixed(0);
    }
}

function verifyAndProceed() {
    if (validateInputs()) {
        goToNextPage();
    } else {
        alert('请先填写所有必填字段并计算房屋投资。');
    }
}

function validateInputs() {
    const housePrice = document.getElementById('housePrice').value;
    const rentAmount = document.getElementById('rentAmount').value;
    const houseAppreciationRate = document.getElementById('houseAppreciationRate').value;
    const interestRate = document.getElementById('interestRate').value;
    const additionalPaymentPercentage = document.getElementById('additionalPaymentPercentage').value;

    if (housePrice && rentAmount && houseAppreciationRate && interestRate && additionalPaymentPercentage) {
        return globalNetPassiveIncome > 0; // This ensures that calculations have been performed
    }
    return false;
}

function loadDataFromStorage() {
    const retirementAmountNeeded = localStorage.getItem('retirementAmountNeeded');
    const epfFinalAmount = localStorage.getItem('epfFinalAmount');
    globalCurrentAge = parseInt(localStorage.getItem('currentAge')) || 0;
    globalRetirementAge = parseInt(localStorage.getItem('retirementAge')) || 0;
    globalYearsNeeded = parseInt(localStorage.getItem('yearsNeeded')) || 0;

    if (retirementAmountNeeded && epfFinalAmount) {
        globalRetirementAmountNeeded = parseFloat(retirementAmountNeeded.replace(/,/g, ''));
        globalEpfFinalAmount = parseFloat(epfFinalAmount.replace(/,/g, ''));

        updateElementContent('displayRetirementGoal', `RM (globalRetirementAmountNeeded)}`);
        updateElementContent('epfAmountShort', `RM ${formatShortNumber(globalEpfFinalAmount)}`);

        updateLifeProgress();
    } else {
        alert('未找到所需数据。请先完成 EPF 计算。');
        window.location.href = 'epf.html';
    }
    if (globalCurrentAge === 0 || globalRetirementAge === 0 || globalYearsNeeded === 0) {
        alert('Age information not found. Please complete the EPF calculation first.');
        window.location.href = 'epf.html';
    }
}

function calculateHouseInvestment() {
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    const rentAmount = parseFloat(document.getElementById('rentAmount').value);
    const houseAppreciationRate = parseFloat(document.getElementById('houseAppreciationRate').value) / 100;
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const additionalPaymentPercentage = parseFloat(document.getElementById('additionalPaymentPercentage').value) / 100;
    const yearsUntilRetirement = globalRetirementAge - globalCurrentAge;

    if (isNaN(housePrice) || isNaN(rentAmount) || isNaN(houseAppreciationRate) || 
        isNaN(interestRate) || isNaN(additionalPaymentPercentage)) {
        alert('请输入有效的数值。');
        return false;
    }

    const finalNetPassiveIncome = generateTable(housePrice, rentAmount, 
        houseAppreciationRate, interestRate, globalCurrentAge, yearsUntilRetirement, additionalPaymentPercentage);

    globalNetPassiveIncome = finalNetPassiveIncome;
    updateLifeProgress();
    showElement('houseCalculator');

    return true;
}

function generateTable(housePrice, rentAmount, houseAppreciationRate, 
    interestRate, currentAge, yearsUntilRetirement, additionalPaymentPercentage) {
    const tableBody = document.querySelector('#houseTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return 0;
    }
    tableBody.innerHTML = '';

    let currentHousePrice = housePrice;
    let debtToBank = housePrice;
    let finalNetPassiveIncome = 0;

    const monthlyPayment = rentAmount * (1 + additionalPaymentPercentage);
    const yearlyPayment = monthlyPayment * 12;

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        const row = tableBody.insertRow();

        const yearlyRentalIncome = rentAmount * 12;
        const interestAmount = debtToBank * interestRate;
        const yearEndDebt = Math.max(0, debtToBank - yearlyPayment + interestAmount);
        const netPassiveIncomeYear = yearlyRentalIncome - interestAmount;
        const houseValue = currentHousePrice - yearEndDebt;

        row.insertCell(0).textContent = year;
        row.insertCell(1).textContent = currentAge + year - 1;
        row.insertCell(2).textContent = formatNumber(currentHousePrice);
        row.insertCell(3).textContent = formatNumber(rentAmount);
        row.insertCell(4).textContent = formatNumber(yearlyRentalIncome);
        row.insertCell(5).textContent = formatNumber(debtToBank);
        row.insertCell(6).textContent = formatNumber(interestAmount);
        row.insertCell(7).textContent = formatNumber(monthlyPayment);
        row.insertCell(8).textContent = formatNumber(yearEndDebt);
        row.insertCell(9).textContent = formatNumber(netPassiveIncomeYear);
        row.insertCell(10).textContent = formatNumber(houseValue);

        currentHousePrice *= (1 + houseAppreciationRate);
        rentAmount *= (1 + houseAppreciationRate);
        debtToBank = yearEndDebt;

        if (year === yearsUntilRetirement) {
            finalNetPassiveIncome = houseValue;
        }
    }

    return finalNetPassiveIncome;
}

function updateLifeProgress() {
    const totalAmount = globalEpfFinalAmount + globalNetPassiveIncome;
    const progressPercentage = (totalAmount / globalRetirementAmountNeeded) * 100;

    updateElementContent('epfAmountShort', `RM ${formatShortNumber(globalEpfFinalAmount)}`);
    updateElementContent('realEstateAmount', `RM ${formatShortNumber(globalNetPassiveIncome)}`);
    updateElementContent('displayRetirementGoal', `RM ${formatNumber(globalRetirementAmountNeeded)}`);
    updateElementContent('displayRetirementGoal2', `RM ${formatShortNumber(globalRetirementAmountNeeded)}`);
    updateElementContent('totalAmountShort', `RM ${formatShortNumber(totalAmount)}`);
    
    const shortfall = Math.max(0, globalRetirementAmountNeeded - totalAmount);
    updateElementContent('shortfallShort', `RM ${formatShortNumber(shortfall)}`);
    
    const monthlyEstimate = (totalAmount * 0.04) / 12;
    updateElementContent('monthlyEstimateShort', `RM ${formatShortNumber(monthlyEstimate)}`);

    updateElementContent('completionPercentage', `${Math.min(progressPercentage, 100).toFixed(2)}`);

    const epfPercentage = (globalEpfFinalAmount / globalRetirementAmountNeeded) * 100;
    const realEstatePercentage = (globalNetPassiveIncome / globalRetirementAmountNeeded) * 100;
    
    updateElementStyle('.progress-segment.epf', 'width', `${epfPercentage}%`);
    updateElementStyle('.progress-segment.real-estate', 'width', `${realEstatePercentage}%`);
    updateElementStyle('.progress-segment.remaining', 'width', `${Math.max(0, 100 - epfPercentage - realEstatePercentage)}%`);
}

function toggleLifeProgress() {
    const progressInfo = document.getElementById('progressInfo');
    if (progressInfo.style.display === 'none') {
        progressInfo.style.display = 'block';
        this.textContent = '隐藏人生进度';
    } else {
        progressInfo.style.display = 'none';
        this.textContent = '人生进度';
    }
}

function toggleHouseCalculator() {
    const calculator = document.getElementById('houseCalculator');
    const button = document.getElementById('toggleHouseCalculatorButton');
    if (calculator && button) {
        if (calculator.style.display === 'none') {
            calculator.style.display = 'block';
            button.textContent = '隐藏 房贷 计算器';
        } else {
            calculator.style.display = 'none';
            button.textContent = '显示 房贷 计算器';
        }
    } else {
        console.error('Calculator or button element not found');
    }
}

function updateElementContent(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = content;
    } else {
        console.error(`Element with id '${id}' not found`);
    }
}

function updateElementStyle(selector, property, value) {
    const element = selector.startsWith('.') ? document.querySelector(selector) : document.getElementById(selector);
    if (element) {
        element.style[property] = value;
    } else {
        console.error(`Element with selector '${selector}' not found`);
    }
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    } else {
        console.error(`Element with id '${id}' not found`);
    }
}

function goToNextPage() {
    localStorage.setItem('retirementAmountNeeded', globalRetirementAmountNeeded.toString());
    localStorage.setItem('epfFinalAmount', globalEpfFinalAmount.toString());
    localStorage.setItem('realEstateAmount', globalNetPassiveIncome.toString());
    localStorage.setItem('monthlyEstimate', document.getElementById('monthlyEstimateShort').textContent.replace('RM ', ''));
    localStorage.setItem('currentAge', globalCurrentAge.toString());
    localStorage.setItem('retirementAge', globalRetirementAge.toString());
    localStorage.setItem('yearsNeeded', globalYearsNeeded.toString());
    localStorage.setItem('housePrice', document.getElementById('housePrice').value);
    localStorage.setItem('rentAmount', document.getElementById('rentAmount').value);
    localStorage.setItem('houseAppreciationRate', document.getElementById('houseAppreciationRate').value);
    localStorage.setItem('additionalPaymentPercentage', document.getElementById('additionalPaymentPercentage').value);

    window.location.href = 'stockmarket.html';
}