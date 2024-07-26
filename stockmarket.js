let globalRetirementAmountNeeded = 0;
let globalEpfFinalAmount = 0;
let globalRealEstateAmount = 0;
let globalStockFinalAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    document.getElementById('calculateButton').addEventListener('click', calculateStockInvestment);
    document.getElementById('progressButton').addEventListener('click', toggleLifeProgress);
    document.getElementById('toggleStockCalculatorButton').addEventListener('click', toggleStockCalculator);
    document.getElementById('nextButton').addEventListener('click', goToNextPage);
});

function loadDataFromStorage() {
    const retirementAmountNeeded = localStorage.getItem('retirementAmountNeeded');
    const epfFinalAmount = localStorage.getItem('epfFinalAmount');
    const realEstateAmount = localStorage.getItem('realEstateAmount');
    const monthlyEstimate = localStorage.getItem('monthlyEstimate');
    const currentAge = localStorage.getItem('currentAge');
    const retirementAge = localStorage.getItem('retirementAge');
    const yearsNeeded = localStorage.getItem('yearsNeeded');

    if (currentAge && retirementAge && yearsNeeded) {
        document.getElementById('currentAge').value = currentAge;
        document.getElementById('retirementAge').value = retirementAge;
        document.getElementById('yearsNeeded').value = yearsNeeded;

        // Disable these fields
        document.getElementById('currentAge').disabled = true;
        document.getElementById('retirementAge').disabled = true;
        document.getElementById('yearsNeeded').disabled = true;
    } else {
        console.error('Age and years data not found in localStorage');
    }

    if (retirementAmountNeeded && epfFinalAmount && realEstateAmount && monthlyEstimate) {
        globalRetirementAmountNeeded = parseFloat(retirementAmountNeeded);
        globalEpfFinalAmount = parseFloat(epfFinalAmount);
        globalRealEstateAmount = parseFloat(realEstateAmount);

        updateElementContent('targetRetirementAmount', `RM ${globalRetirementAmountNeeded.toFixed(2)}`);
        updateElementContent('epfAmount', `RM ${globalEpfFinalAmount.toFixed(2)}`);
        updateElementContent('realEstateAmount', `RM ${globalRealEstateAmount.toFixed(2)}`);
        updateElementContent('monthlyEstimate', `RM ${parseFloat(monthlyEstimate).toFixed(2)}`);

        updateLifeProgress();
    } else {
        console.error('Required data not found in localStorage');
    }
}

function calculateStockInvestment() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
    const dividendRate = parseFloat(document.getElementById('dividendRate').value) / 100;
    const currentStockValue = parseFloat(document.getElementById('currentStockValue').value);

    if (isNaN(currentAge) || isNaN(retirementAge) || isNaN(monthlyInvestment) || isNaN(growthRate) || isNaN(dividendRate) || isNaN(currentStockValue)) {
        alert('请输入有效的数值。');
        return false;
    }

    const yearsUntilRetirement = retirementAge - currentAge;

    globalStockFinalAmount = generateTable(currentAge, yearsUntilRetirement, monthlyInvestment, growthRate, dividendRate, currentStockValue);

    updateLifeProgress();
    showElement('investmentProgress');
    showElement('stockCalculator');

    return true;
}

function generateTable(currentAge, yearsUntilRetirement, monthlyInvestment, growthRate, dividendRate, currentStockValue) {
    const tableBody = document.querySelector('#stockTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return 0;
    }
    tableBody.innerHTML = ''; // Clear existing rows

    let stockValue = currentStockValue;

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        const row = tableBody.insertRow();
        
        const yearlyInvestment = monthlyInvestment * 12;
        const thisYearStockValue = stockValue + yearlyInvestment;
        const dividend = thisYearStockValue * dividendRate;
        const appreciation = thisYearStockValue * growthRate;
        const yearEndStockValue = thisYearStockValue + dividend + appreciation;

        row.insertCell(0).textContent = year;
        row.insertCell(1).textContent = currentAge + year;
        row.insertCell(2).textContent = stockValue.toFixed(2);
        row.insertCell(3).textContent = yearlyInvestment.toFixed(2);
        row.insertCell(4).textContent = thisYearStockValue.toFixed(2);
        row.insertCell(5).textContent = dividend.toFixed(2);
        row.insertCell(6).textContent = appreciation.toFixed(2);
        row.insertCell(7).textContent = yearEndStockValue.toFixed(2);

        stockValue = yearEndStockValue;
    }

    updateProgressInfo(stockValue);
    return stockValue;
}

function updateProgressInfo(finalStockValue) {
    const progressPercentage = (finalStockValue / globalRetirementAmountNeeded) * 100;

    updateElementContent('retirementAmountNeeded', `退休需要的钱: <span class="highlight">RM ${globalRetirementAmountNeeded.toFixed(2)}</span>`);
    updateElementContent('stockValue', `股票价值: <span class="highlight">RM ${finalStockValue.toFixed(2)}</span>`);
    updateElementStyle('progressFill', 'width', `${Math.min(progressPercentage, 100)}%`);
    updateElementContent('progressPercentage', `目标完成度: <span class="highlight">${Math.min(progressPercentage, 100).toFixed(2)}%</span>`);
}

function updateLifeProgress() {
    const totalAmount = globalEpfFinalAmount + globalRealEstateAmount + globalStockFinalAmount;
    const progressPercentage = (totalAmount / globalRetirementAmountNeeded) * 100;

    updateElementContent('stockAmount', `RM ${globalStockFinalAmount.toFixed(2)}`);
    updateElementContent('totalAmount', `RM ${totalAmount.toFixed(2)}`);
    
    const shortfall = Math.max(0, globalRetirementAmountNeeded - totalAmount);
    updateElementContent('shortfall', `RM ${shortfall.toFixed(2)}`);

    // Update progress segments
    const epfPercentage = (globalEpfFinalAmount / globalRetirementAmountNeeded) * 100;
    const realEstatePercentage = (globalRealEstateAmount / globalRetirementAmountNeeded) * 100;
    const stockPercentage = (globalStockFinalAmount / globalRetirementAmountNeeded) * 100;
    
    updateElementStyle('.progress-segment.epf', 'width', `${epfPercentage}%`);
    updateElementStyle('.progress-segment.real-estate', 'width', `${realEstatePercentage}%`);
    updateElementStyle('.progress-segment.stocks', 'width', `${stockPercentage}%`);
    updateElementStyle('.progress-segment.remaining', 'width', `${Math.max(0, 100 - epfPercentage - realEstatePercentage - stockPercentage)}%`);
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

function toggleStockCalculator() {
    const calculator = document.getElementById('stockCalculator');
    const button = document.getElementById('toggleStockCalculatorButton');
    if (calculator && button) {
        calculator.classList.toggle('hidden');
        if (calculator.classList.contains('hidden')) {
            button.textContent = '显示 股票 计算器';
        } else {
            button.textContent = '隐藏 股票 计算器';
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
    // Implement navigation to the next page if needed
    console.log('Navigate to next page');
}