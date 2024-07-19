function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

function loadURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('name').value = urlParams.get('name') || '';
    document.getElementById('currentAge').value = urlParams.get('currentAge') || '';
    document.getElementById('retirementAge').value = urlParams.get('retirementAge') || '';
    document.getElementById('yearsNeeded').value = urlParams.get('yearsNeeded') || '';
    document.getElementById('inflationRate').value = urlParams.get('inflationRate') || '4';
    document.getElementById('currentSalary').value = urlParams.get('monthlySpending') || '';
    
    const retirementAmount = urlParams.get('retirementAmountNeeded') || '0';
    document.getElementById('retirementAmountNeeded').value = retirementAmount;
}

window.onload = function() {
    loadURLParams();
    document.getElementById('epfForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            calculateEPF();
        }
    });

    // Add event listeners to recalculate on input change
    const inputs = document.querySelectorAll('#epfForm input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (validateForm()) {
                calculateEPF();
            }
        });
    });
}

function validateForm() {
    const inputs = document.querySelectorAll('#epfForm input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (input.value.trim() === '') {
            showError(input, '此字段为必填项');
            isValid = false;
        } else {
            clearError(input);
        }
    });

    return isValid;
}

function showError(input, message) {
    clearError(input);
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    input.parentNode.insertBefore(error, input.nextSibling);
}

function clearError(input) {
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error')) {
        errorElement.remove();
    }
}

function calculateEPF() {
    const currentSalary = parseFloat(document.getElementById('currentSalary').value);
    const salaryIncreaseRate = parseFloat(document.getElementById('salaryIncreaseRate').value) / 100;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
    const currentEpf = parseFloat(document.getElementById('currentEpf').value);
    const epfRate = parseFloat(document.getElementById('epfRate').value) / 100;
    const yearsNeeded = parseInt(document.getElementById('yearsNeeded').value);

    if (isNaN(currentSalary) || isNaN(currentEpf)) {
        alert('请输入有效的数值。');
        return false;
    }

    // Calculate EPF, 现在薪水 (R), and EPF (R)
    const currentEPF = currentSalary * 0.24; // Assuming 24% EPF contribution
    const salaryR = currentSalary * Math.pow(1 + inflationRate, yearsNeeded);
    const epfR = salaryR * 0.24;

    // Set the calculated values
    document.getElementById('epf').value = formatNumber(currentEPF);
    document.getElementById('currentSalaryR').value = formatNumber(salaryR);
    document.getElementById('epfR').value = formatNumber(epfR);

    generateTable(currentSalary, inflationRate, currentEpf, epfRate, salaryIncreaseRate);

    const retirementNeeded = parseFloat(document.getElementById('retirementAmountNeeded').value.replace(/,/g, ''));
    const tableRows = document.getElementById('epfTable').rows;
    const finalAmount = parseFloat(tableRows[tableRows.length - 1].cells[6].innerHTML.replace(/,/g, ''));
    const goalProgressPercentage = (finalAmount / retirementNeeded) * 100;

    let achievedYear = -1;
    let exceededAmount = 0;

    for (let i = 1; i < tableRows.length; i++) {
        const currentAmount = parseFloat(tableRows[i].cells[6].innerHTML.replace(/,/g, ''));
        if (currentAmount >= retirementNeeded && achievedYear === -1) {
            achievedYear = parseInt(tableRows[i].cells[0].innerHTML);
            exceededAmount = currentAmount - retirementNeeded;
            break;
        }
    }

    document.getElementById('goalAmount').innerHTML = `退休目标: <span class="highlight">RM${formatNumber(retirementNeeded)}</span>`;
    document.getElementById('goalProgressPercentage').innerHTML = `目标完成度: <span class="highlight">${Math.min(goalProgressPercentage, 100).toFixed(2)}%</span>`;
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${Math.min(goalProgressPercentage, 100)}%`;
    progressFill.style.backgroundColor = goalProgressPercentage >= 100 ? '#4CAF50' : '#FFA500';

    updateProgressInfo(finalAmount, retirementNeeded);

    if (achievedYear !== -1) {
        document.getElementById('achievedYear').innerHTML = `在第 ${achievedYear} 年达到退休目标`;
        const lastYear = yearsNeeded;
        const exceededPercentage = (exceededAmount / retirementNeeded) * 100;
        document.getElementById('exceededAmount').innerHTML = `<span class="highlight">在最后一年 ${lastYear} 超出金额: RM ${formatNumber(exceededAmount)} (${exceededPercentage.toFixed(2)}%)</span>`;
    } else {
        document.getElementById('achievedYear').innerHTML = '<span class="emphasis">未能在计划年限内达到退休目标</span>';
        const shortfall = retirementNeeded - finalAmount;
        const shortfallPercentage = (shortfall / retirementNeeded) * 100;
        document.getElementById('exceededAmount').innerHTML = `<span class="highlight">在最后一年 ${yearsNeeded} 差额: RM ${formatNumber(shortfall)} (${shortfallPercentage.toFixed(2)}%)</span>`;
    }

    document.getElementById('goalProgress').style.display = 'block';
    document.getElementById('epfCalculator').style.display = 'block';

    return true;
}

function updateProgressInfo(currentAmount, targetAmount) {
    const epfPercentage = (currentAmount / targetAmount) * 100;
    const totalPercentage = Math.min(epfPercentage, 100);

    document.getElementById('targetRetirementAmount').textContent = `RM ${formatNumber(targetAmount)}`;
    document.getElementById('epfAmount').textContent = `RM ${formatNumber(currentAmount)} (${epfPercentage.toFixed(2)}%)`;
    document.getElementById('totalAmount').textContent = `RM ${formatNumber(currentAmount)} (${totalPercentage.toFixed(2)}%)`;
    
    const shortfall = targetAmount - currentAmount;
    const shortfallPercentage = (shortfall / targetAmount) * 100;
    document.getElementById('shortfall').textContent = `RM ${formatNumber(shortfall)} (${shortfallPercentage.toFixed(2)}%)`;

    const monthlyEstimate = (currentAmount * 0.04) / 12;
    document.getElementById('monthlyEstimate').textContent = `RM ${formatNumber(monthlyEstimate)}`;

    document.querySelector('.progress-segment.epf').style.width = `${epfPercentage}%`;
    document.querySelector('.progress-segment.remaining').style.width = `${100 - epfPercentage}%`;
}

function generateTable(currentSalary, inflationRate, currentEpf, epfRate, salaryIncreaseRate) {
    const yearsNeeded = parseInt(document.getElementById('yearsNeeded').value);
    const table = document.getElementById('epfTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    let accumulatedEpf = currentEpf;

    for (let i = 0; i <= yearsNeeded; i++) {
        const row = table.insertRow();
        const monthlyIncome = currentSalary * Math.pow(1 + salaryIncreaseRate, i);
        const yearlyIncome = monthlyIncome * 12;
        const yearlyEpfIncome = yearlyIncome * 0.24;
        accumulatedEpf += yearlyEpfIncome;
        const interest = accumulatedEpf * epfRate;
        const totalWithInterest = accumulatedEpf + interest;

        row.insertCell(0).innerHTML = i;
        row.insertCell(1).innerHTML = formatNumber(monthlyIncome);
        row.insertCell(2).innerHTML = formatNumber(yearlyIncome);
        row.insertCell(3).innerHTML = formatNumber(yearlyEpfIncome);
        row.insertCell(4).innerHTML = formatNumber(accumulatedEpf);
        row.insertCell(5).innerHTML = formatNumber(interest);
        row.insertCell(6).innerHTML = formatNumber(totalWithInterest);

        accumulatedEpf = totalWithInterest;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggleButton').addEventListener('click', function() {
        var calculator = document.getElementById('epfCalculator');
        if (calculator.style.display === 'none' || calculator.style.display === '') {
            calculator.style.display = 'block';
            this.textContent = '隐藏 EPF 计算器';
        } else {
            calculator.style.display = 'none';
            this.textContent = '显示 EPF 计算器';
        }
    });

    document.getElementById('progressButton').addEventListener('click', function() {
        const progressInfo = document.getElementById('progressInfo');
        if (progressInfo.style.display === 'none') {
            progressInfo.style.display = 'block';
            this.textContent = '隐藏人生进度';
        } else {
            progressInfo.style.display = 'none';
            this.textContent = '人生进度';
        }
    });
});
