
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
    document.getElementById('monthlySpending').value = urlParams.get('monthlySpending') || '';
    document.getElementById('currentSalary').value = urlParams.get('currentSalary') || '';

    

    const retirementAmount = urlParams.get('retirementAmountNeeded') || '0';

    document.getElementById('retirementAmountNeeded').value = retirementAmount;

    let retirementGoal = document.getElementById('displayRetirementGoal').textContent;
    if (!retirementGoal) {
        retirementGoal = urlParams.get('retirementAmountNeeded') || '0'; // Default to 0 if not provided
    }
    
    retirementGoal = parseFloat(retirementGoal.replace(/[^\d.-]/g, '')); // Remove any non-numeric characters
    
    if (isNaN(retirementGoal)) {
        retirementGoal = 0; // Fallback to 0 if parsing fails
    }
    
    const formattedRetirementGoal = formatFullNumber(retirementGoal);
    document.getElementById('displayRetirementGoal').textContent = 'RM ' + formattedRetirementGoal;
   
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

function updateElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
        element.title = `完整数值：${content}`;
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

    updateProgressInfo(finalAmount, retirementNeeded);

    document.getElementById('progressInfo').style.display = 'block';
    document.getElementById('epfCalculator').style.display = 'block';

    return true;
}
function updateProgressInfo(currentAmount, targetAmount) {
    const epfPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
    const totalPercentage = epfPercentage;

    // Update KPI values with hard-coded "RM " prefix
    updateElementContent('targetRetirementAmountShort', `RM ${formatShortNumber(targetAmount)}`);
    updateElementContent('epfAmountShort', `RM ${formatShortNumber(currentAmount)}`);
    updateElementContent('totalAmountShort', `RM ${formatShortNumber(currentAmount)}`);
    
    const shortfall = Math.max(0, targetAmount - currentAmount);
    updateElementContent('shortfallShort', `RM ${formatShortNumber(shortfall)}`);

    const monthlyEstimate = (currentAmount * 0.04) / 12;
    updateElementContent('monthlyEstimateShort', `RM ${formatShortNumber(monthlyEstimate)}`);

    // Update the progress bar
    document.querySelector('.progress-segment.epf').style.width = `${epfPercentage}%`;
    document.querySelector('.progress-segment.remaining').style.width = `${Math.max(0, 100 - epfPercentage)}%`;

    // Update the completion percentage
    document.getElementById('completionPercentage').textContent = totalPercentage.toFixed(1);
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

    const buttonGroup = document.querySelector('.button-group');
    const progressButton = buttonGroup.children[0];
    const toggleEpfButton = buttonGroup.children[1];
    const progressInfo = document.getElementById('progressInfo');
    const epfCalculator = document.getElementById('epfCalculator');

    if (progressButton && progressInfo) {
        progressButton.addEventListener('click', function() {
            if (progressInfo.style.display === 'none' || progressInfo.style.display === '') {
                progressInfo.style.display = 'block';
                this.textContent = '隐藏目标进度';
            } else {
                progressInfo.style.display = 'none';
                this.textContent = '目标进度';
            }
        });
    }

    if (toggleEpfButton && epfCalculator) {
        toggleEpfButton.addEventListener('click', function() {
            if (epfCalculator.style.display === 'none' || epfCalculator.style.display === '') {
                epfCalculator.style.display = 'block';
                this.textContent = '隐藏 EPF 计算器';
            } else {
                epfCalculator.style.display = 'none';
                this.textContent = '显示 EPF 计算器';
            }
        });
    }


    if (nextButton) {
        nextButton.addEventListener('click', goToNextPage);
      } else {
        console.error('Next button not found');
      }


    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            if (validateForm()) {
                calculateEPF();
            }
        });
    }




});

function exportToPDF() {
    try {
        const doc = new jspdf.jsPDF();

        const name = document.getElementById('name').value || 'User';

        // Add title
        doc.setFontSize(18);
        doc.text('EPF Calculator Summary', 105, 15, { align: 'center' });

        // Add user information
        doc.setFontSize(12);
        doc.text(`Name: ${name}`, 20, 30);
        doc.text(`Current Age: ${document.getElementById('currentAge').value || 'N/A'}`, 20, 40);
        doc.text(`Retirement Age: ${document.getElementById('retirementAge').value || 'N/A'}`, 20, 50);
        doc.text(`Years Needed: ${document.getElementById('yearsNeeded').value || 'N/A'}`, 20, 60);
        doc.text(`Inflation Rate: ${document.getElementById('inflationRate').value || '0'}%`, 20, 70);
        doc.text(`Current EPF Balance: RM ${document.getElementById('currentEpf').value || '0'}`, 20, 80);
        doc.text(`EPF Interest Rate: ${document.getElementById('epfRate').value || '0'}%`, 20, 90);
        doc.text(`Current Salary: RM ${document.getElementById('currentSalary').value || '0'}`, 20, 100);

        // Add progress information
        doc.setFontSize(14);
        doc.text('Retirement Progress', 105, 120, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Target Retirement Amount: ${document.getElementById('targetRetirementAmount').textContent || 'N/A'}`, 20, 130);
        doc.text(`EPF Amount: ${document.getElementById('epfAmount').textContent || 'N/A'}`, 20, 140);
        doc.text(`Total: ${document.getElementById('totalAmount').textContent || 'N/A'}`, 20, 150);
        doc.text(`Shortfall to Retirement Goal: ${document.getElementById('shortfall').textContent || 'N/A'}`, 20, 160);
        doc.text(`Estimated Monthly after Retirement: ${document.getElementById('monthlyEstimate').textContent || 'N/A'}`, 20, 170);

        // Add EPF table
        doc.addPage();
        doc.setFontSize(14);
        doc.text('EPF Calculation Table', 105, 15, { align: 'center' });
        
        const table = document.getElementById('epfTable');
        if (table) {
            doc.autoTable({ 
                html: table, 
                startY: 20
            });
        } else {
            doc.text('EPF table data not available', 20, 20);
        }

        // Save the PDF
        doc.save(`${name}_EPF_Summary.pdf`);
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Error generating PDF. Please check the console for more information.');
    }
}

function goToNextPage() {
    const retirementAmountNeededElement = document.getElementById('retirementAmountNeeded');
    const epfTableLastRow = document.querySelector('#epfTable tbody tr:last-child');

    if (!retirementAmountNeededElement || !epfTableLastRow) {
        alert('请先完成 EPF 计算。');
        return;
    }

    const retirementAmountNeeded = retirementAmountNeededElement.value;
    const epfFinalAmount = epfTableLastRow.cells[6].textContent;

    const confirmationMessage = `
        退休需要的钱: RM ${retirementAmountNeeded}
        EPF 最终金额: RM ${epfFinalAmount}
        
        确认这些数据并继续到房屋投资计算器吗？
    `;

    if (confirm(confirmationMessage)) {
        localStorage.setItem('retirementAmountNeeded', retirementAmountNeeded);
        localStorage.setItem('epfFinalAmount', epfFinalAmount);
        localStorage.setItem('currentAge', document.getElementById('currentAge').value);
        localStorage.setItem('retirementAge', document.getElementById('retirementAge').value);
        localStorage.setItem('yearsNeeded', document.getElementById('yearsNeeded').value);
        // Add these lines where you calculate EPF
        localStorage.setItem('currentSalary', document.getElementById('currentSalary').value);
        localStorage.setItem('epfRate', document.getElementById('epfRate').value);
        localStorage.setItem('salaryIncreaseRate', document.getElementById('salaryIncreaseRate').value);
        window.location.href = 'house.html';
    }
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatShortNumber(number) {
    const units = ['', 'K', 'M', 'B'];
    let unitIndex = 0;
    let scaledNumber = number;

    while (scaledNumber >= 1000 && unitIndex < units.length - 1) {
        scaledNumber /= 1000;
        unitIndex++;
    }

    return scaledNumber.toFixed(1) + units[unitIndex];
}

function formatFullNumber(number) {
    return number.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateKPIValue(elementId, value) {
    const element = document.getElementById(elementId);
    const shortValue = formatShortNumber(value);
    element.textContent = shortValue;
    element.title = `完整数值：${value.toLocaleString()}`;
}

