let globalRetirementAmountNeeded = 0;
let globalEpfFinalAmount = 0;
let globalNetPassiveIncome = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    document.getElementById('calculateButton').addEventListener('click', calculateHouseInvestment);
    document.getElementById('progressButton').addEventListener('click', toggleLifeProgress);
    document.getElementById('toggleHouseCalculatorButton').addEventListener('click', toggleHouseCalculator);
    document.getElementById('nextButton').addEventListener('click', goToNextPage);
});

function loadDataFromStorage() {
    const retirementAmountNeeded = localStorage.getItem('retirementAmountNeeded');
    const epfFinalAmount = localStorage.getItem('epfFinalAmount');

    if (retirementAmountNeeded && epfFinalAmount) {
        globalRetirementAmountNeeded = parseFloat(retirementAmountNeeded.replace(/,/g, ''));
        globalEpfFinalAmount = parseFloat(epfFinalAmount.replace(/,/g, ''));

        updateElementContent('retirementAmountNeeded', `退休需要的钱: <span class="highlight">RM ${globalRetirementAmountNeeded.toFixed(2)}</span>`);
        updateElementContent('targetRetirementAmount', `RM ${globalRetirementAmountNeeded.toFixed(2)}`);
        updateElementContent('epfAmount', `RM ${globalEpfFinalAmount.toFixed(2)}`);

        updateLifeProgress();
    } else {
        alert('未找到所需数据。请先完成 EPF 计算。');
        window.location.href = 'epf.html';
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function loadDataFromUrl() {
    const retirementAmountNeeded = localStorage.getItem('retirementAmountNeeded');
    const epfFinalAmount = localStorage.getItem('epfFinalAmount');

    console.log("Retirement Amount:", retirementAmountNeeded);
    console.log("EPF Final Amount:", epfFinalAmount);

    if (retirementAmountNeeded) {
        globalRetirementAmountNeeded = parseFloat(retirementAmountNeeded.replace(/,/g, ''));
        updateElementContent('retirementAmountNeeded', `退休需要的钱: <span class="highlight">RM ${globalRetirementAmountNeeded.toFixed(2)}</span>`);
        updateElementContent('targetRetirementAmount', `RM ${globalRetirementAmountNeeded.toFixed(2)}`);
    } else {
        console.error('Retirement amount not found in localStorage');
    }

    if (epfFinalAmount) {
        globalEpfFinalAmount = parseFloat(epfFinalAmount.replace(/,/g, ''));
        updateElementContent('epfAmount', `RM ${globalEpfFinalAmount.toFixed(2)}`);
    } else {
        console.error('EPF final amount not found in localStorage');
    }

    updateLifeProgress();
}

function calculateHouseInvestment() {
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    const rentAmount = parseFloat(document.getElementById('rentAmount').value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
    const houseAppreciationRate = parseFloat(document.getElementById('houseAppreciationRate').value) / 100;
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    if (isNaN(housePrice) || isNaN(rentAmount) || isNaN(monthlyPayment) || isNaN(houseAppreciationRate) || isNaN(interestRate)) {
        alert('请输入有效的数值。');
        return false;
    }

    // Get retirement information (for now, we'll use placeholder values)
    const currentAge = 30; // Example value
    const retirementAge = 60; // Example value
    const yearsUntilRetirement = retirementAge - currentAge;

    const finalNetPassiveIncome = generateTable(housePrice, rentAmount, monthlyPayment, houseAppreciationRate, interestRate, currentAge, yearsUntilRetirement);

    // Update globalNetPassiveIncome after calculation
    globalNetPassiveIncome = finalNetPassiveIncome;
    updateLifeProgress();

    showElement('investmentProgress');
    showElement('houseCalculator');

    return true;
}

function generateTable(housePrice, rentAmount, monthlyPayment, houseAppreciationRate, interestRate, currentAge, yearsUntilRetirement) {
    const tableBody = document.querySelector('#houseTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return 0;
    }
    tableBody.innerHTML = ''; // Clear existing rows

    let currentHousePrice = housePrice;
    let debtToBank = housePrice;
    let finalNetPassiveIncome = 0;

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        const row = tableBody.insertRow();
        
        const yearlyRentalIncome = rentAmount * 12;
        const interestAmount = debtToBank * interestRate;
        const yearEndDebt = Math.max(0, debtToBank - (monthlyPayment * 12) + interestAmount);
        const netPassiveIncomeYear = yearlyRentalIncome - interestAmount;

        row.insertCell(0).textContent = year;
        row.insertCell(1).textContent = currentAge + year;
        row.insertCell(2).textContent = currentHousePrice.toFixed(2);
        row.insertCell(3).textContent = rentAmount.toFixed(2);
        row.insertCell(4).textContent = yearlyRentalIncome.toFixed(2);
        row.insertCell(5).textContent = debtToBank.toFixed(2);
        row.insertCell(6).textContent = interestAmount.toFixed(2);
        row.insertCell(7).textContent = yearEndDebt.toFixed(2);
        row.insertCell(8).textContent = netPassiveIncomeYear.toFixed(2);

        currentHousePrice *= (1 + houseAppreciationRate);
        debtToBank = yearEndDebt;

        if (year === yearsUntilRetirement) {
            finalNetPassiveIncome = netPassiveIncomeYear;
        }
    }

    updateProgressInfo(finalNetPassiveIncome);
    return finalNetPassiveIncome;
}

function updateProgressInfo(finalNetPassiveIncome) {
    const progressPercentage = (finalNetPassiveIncome / globalRetirementAmountNeeded) * 100;

    updateElementContent('retirementAmountNeeded', `退休需要的钱: <span class="highlight">RM ${globalRetirementAmountNeeded.toFixed(2)}</span>`);
    updateElementContent('netPassiveIncome', `净被动收入: <span class="highlight">RM ${finalNetPassiveIncome.toFixed(2)}</span>`);
    updateElementStyle('progressFill', 'width', `${Math.min(progressPercentage, 100)}%`);
    updateElementContent('progressPercentage', `目标完成度: <span class="highlight">${Math.min(progressPercentage, 100).toFixed(2)}%</span>`);
}

function updateLifeProgress() {
    const totalAmount = globalEpfFinalAmount + globalNetPassiveIncome;
    const progressPercentage = (totalAmount / globalRetirementAmountNeeded) * 100;

    updateElementContent('realEstateAmount', `RM ${globalNetPassiveIncome.toFixed(2)}`);
    updateElementContent('totalAmount', `RM ${totalAmount.toFixed(2)}`);
    
    const shortfall = Math.max(0, globalRetirementAmountNeeded - totalAmount);
    updateElementContent('shortfall', `RM ${shortfall.toFixed(2)}`);
    
    const monthlyEstimate = (totalAmount * 0.04) / 12; // Assuming 4% annual withdrawal rate
    updateElementContent('monthlyEstimate', `RM ${monthlyEstimate.toFixed(2)}`);

    // Update progress bar
    updateElementStyle('progressFill', 'width', `${Math.min(progressPercentage, 100)}%`);
    updateElementContent('progressPercentage', `目标完成度: <span class="highlight">${Math.min(progressPercentage, 100).toFixed(2)}%</span>`);

    // Update progress segments
    const epfPercentage = (globalEpfFinalAmount / globalRetirementAmountNeeded) * 100;
    const realEstatePercentage = (globalNetPassiveIncome / globalRetirementAmountNeeded) * 100;
    
    updateElementStyle('.progress-segment.epf', 'width', `${epfPercentage}%`);
    updateElementStyle('.progress-segment.real-estate', 'width', `${realEstatePercentage}%`);
    updateElementStyle('.progress-segment.remaining', 'width', `${Math.max(0, 100 - epfPercentage - realEstatePercentage)}%`);
}

function toggleLifeProgress() {
    const progressInfo = document.getElementById('lifeProgress');
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
        calculator.classList.toggle('hidden');
        if (calculator.classList.contains('hidden')) {
            button.textContent = '显示 房贷 计算器';
            calculator.style.display = 'none';
        } else {
            button.textContent = '隐藏 房贷 计算器';
            calculator.style.display = 'block';
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
    // Get the required data
    const retirementAmountNeeded = globalRetirementAmountNeeded;
    const epfFinalAmount = globalEpfFinalAmount;
    const realEstateAmount = globalNetPassiveIncome;
    const monthlyEstimate = document.getElementById('monthlyEstimate').textContent.replace('RM ', '');

    // Store the data in localStorage
    localStorage.setItem('retirementAmountNeeded', retirementAmountNeeded.toString());
    localStorage.setItem('epfFinalAmount', epfFinalAmount.toString());
    localStorage.setItem('realEstateAmount', realEstateAmount.toString());
    localStorage.setItem('monthlyEstimate', monthlyEstimate);
    localStorage.setItem('currentAge', localStorage.getItem('currentAge'));
    localStorage.setItem('retirementAge', localStorage.getItem('retirementAge'));
    localStorage.setItem('yearsNeeded', localStorage.getItem('yearsNeeded'));

    // Navigate to the stockmarket page
    window.location.href = 'stockmarket.html';
}