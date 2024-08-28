var globalRetirementAmountNeeded = 0;
var globalEpfFinalAmount = 0;
var globalRealEstateAmount = 0;
var globalStockFinalAmount = 0;
var globalStockAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
   
    document.getElementById('calculateButton').addEventListener('click', calculateStockInvestment);
    document.getElementById('progressButton').addEventListener('click', toggleLifeProgress);
    document.getElementById('toggleStockCalculatorButton').addEventListener('click', toggleStockCalculator);
    document.getElementById('nextButton').addEventListener('click', goToNextPage);
    const stockcalculator = document.getElementById('stockcalculator');

    // Add event listeners to all input fields
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
    });


});

function handleInputChange() {
    if (validateInputs()) {
        calculateStockInvestment();
    }
}

function validateInputs() {
    const inputs = [
        'currentAge',
        'retirementAge',
        'monthlyInvestment',
        'growthRate',
        'dividendRate',
        'currentStockValue'
    ];

    for (const inputId of inputs) {
        const value = parseFloat(document.getElementById(inputId).value);
        if (isNaN(value)) {
            return false;
        }
    }
    return true;
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    errorElement.textContent = message;
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error')) {
        errorElement.remove();
    }
}



function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
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
    updateProgressInfo();

    const inputs = [
        { id: 'currentAge', label: '现在年龄' },
        { id: 'retirementAge', label: '退休年龄' },
        { id: 'monthlyInvestment', label: '每月投资额' },
        { id: 'growthRate', label: '增长率' },
        { id: 'dividendRate', label: '股息率' },
        { id: 'currentStockValue', label: '现有股票价值' }
    ];

    let hasError = false;

    inputs.forEach(input => {
        const value = parseFloat(document.getElementById(input.id).value);
        if (isNaN(value)) {
            showError(input.id, `请为${input.label}输入有效的数值。`);
            hasError = true;
        } else {
            clearError(input.id);
        }
    });

    if (hasError) {
        return false;
    }

    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
    const dividendRate = parseFloat(document.getElementById('dividendRate').value) / 100;
    const currentStockValue = parseFloat(document.getElementById('currentStockValue').value);

    const yearsUntilRetirement = retirementAge - currentAge;

    globalStockAmount = generateTable(currentAge, yearsUntilRetirement, monthlyInvestment, growthRate, dividendRate, currentStockValue);
    updateProgressInfo();

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
        row.insertCell(2).textContent = formatNumber(stockValue);
        row.insertCell(3).textContent = formatNumber(yearlyInvestment);
        row.insertCell(4).textContent = formatNumber(thisYearStockValue);
        row.insertCell(5).textContent = formatNumber(dividend);
        row.insertCell(6).textContent = formatNumber(appreciation);
        row.insertCell(7).textContent = formatNumber(yearEndStockValue);

        stockValue = yearEndStockValue;
    }

    updateProgressInfo(stockValue);
    return stockValue;
}

function updateProgressInfo() {
    // Ensure we're using the most up-to-date stock amount
    const totalAmount = globalEpfFinalAmount + globalRealEstateAmount + globalStockAmount;
    const progressPercentage = (totalAmount / globalRetirementAmountNeeded) * 100;
    // Update KPI values
    updateElementContent('displayRetirementGoal', `RM ${formatNumber(globalRetirementAmountNeeded)}`);
    updateElementContent('epfAmount', `RM ${formatShortNumber(globalEpfFinalAmount)}`);
    updateElementContent('realEstateAmount', `RM ${formatShortNumber(globalRealEstateAmount)}`);
    updateElementContent('stockAmount', `RM ${formatShortNumber(globalStockAmount)}`);
    updateElementContent('targetRetirementAmount', `RM ${formatShortNumber(globalRetirementAmountNeeded)}`);
    updateElementContent('totalAmount', `RM ${formatShortNumber(totalAmount)}`);
    
    const shortfall = Math.max(0, globalRetirementAmountNeeded - totalAmount);
    updateElementContent('shortfall', `RM ${formatShortNumber(shortfall)}`);
    
    const monthlyEstimate = (totalAmount * 0.04) / 12;
    updateElementContent('monthlyEstimate', `RM ${formatShortNumber(monthlyEstimate)}`);

    // Update the completion percentage
    const roundedPercentage = progressPercentage.toFixed(2);
    
    // Update the progress text
    updateElementContent('progressText', `您已完成 ${roundedPercentage}% 的退休储蓄目标`);

    // Update the progress bar segments
    const epfPercentage = (globalEpfFinalAmount / globalRetirementAmountNeeded) * 100;
    const realEstatePercentage = (globalRealEstateAmount / globalRetirementAmountNeeded) * 100;
    const stockPercentage = (globalStockAmount / globalRetirementAmountNeeded) * 100;
    updateElementStyle('.progress-segment.epf', 'width', `${epfPercentage}%`);
    updateElementStyle('.progress-segment.real-estate', 'width', `${realEstatePercentage}%`);
    updateElementStyle('.progress-segment.stocks', 'width', `${stockPercentage}%`);

    const remainingPercentage = Math.max(0, 100 - epfPercentage - realEstatePercentage - stockPercentage);
    updateElementStyle('.progress-segment.remaining', 'width', `${remainingPercentage}%`);

}

function updateElementContent(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    } else {
        console.error(`Element with id '${id}' not found`);
    }
}

function updateElementStyle(selector, property, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.style[property] = value;
    } else {
        console.error(`Element with selector '${selector}' not found`);
    }
}

function updateLifeProgress() {
    const totalAmount = globalEpfFinalAmount + globalRealEstateAmount + globalStockFinalAmount;
    const progressPercentage = (totalAmount / globalRetirementAmountNeeded) * 100;

    updateElementContent('stockAmount', `RM ${formatShortNumber(globalStockFinalAmount)}`);
    updateElementContent('totalAmount', `RM ${formatShortNumber(totalAmount)}`);
    
    const shortfall = Math.max(0, globalRetirementAmountNeeded - totalAmount);
    updateElementContent('shortfall', `RM ${formatShortNumber(shortfall)}`);

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
    const progressInfo = document.getElementById('progressInfo');
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
        if (calculator.style.display === 'none'|| calculator.style.display === '') {
            calculator.style.display = 'block';
            button.textContent = '隐藏 股票 计算器';
        } else {
            calculator.style.display = 'none';
            button.textContent = '显示 股票 计算器';
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
    // Save the current stock investment data to localStorage
    localStorage.setItem('stockFinalAmount', globalStockAmount.toString());

    // Save other relevant data if not already saved
    localStorage.setItem('retirementAmountNeeded', globalRetirementAmountNeeded.toString());
    localStorage.setItem('epfFinalAmount', globalEpfFinalAmount.toString());
    localStorage.setItem('realEstateAmount', globalRealEstateAmount.toString());
    
    // Add these lines where you calculate stock investment
    localStorage.setItem('monthlyStockInvestment', document.getElementById('monthlyInvestment').value);
    localStorage.setItem('dividendRate', document.getElementById('dividendRate').value);
    localStorage.setItem('growthRate', document.getElementById('growthRate').value);

    // Navigate to the conclusion page
    window.location.href = 'conclusion.html';
}