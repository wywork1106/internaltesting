document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    updateSummary();
    createDistributionChart();
    createGrowthChart();
    calculateMilestones();
    setupWhatIfScenarios();

    console.log('Stored Data:');
    console.log('Monthly Spending:', localStorage.getItem('monthlySpending'));
    console.log('Current Salary:', localStorage.getItem('currentSalary'));
    console.log('EPF Rate:', localStorage.getItem('epfRate'));
    console.log('Salary Increase Rate:', localStorage.getItem('salaryIncreaseRate'));
    console.log('House Price:', localStorage.getItem('housePrice'));
    console.log('Rent Amount:', localStorage.getItem('rentAmount'));
    console.log('House Appreciation Rate:', localStorage.getItem('houseAppreciationRate'));
    console.log('Additional Payment Percentage:', localStorage.getItem('additionalPaymentPercentage'));
    console.log('Monthly Stock Investment:', localStorage.getItem('monthlyStockInvestment'));
    console.log('Dividend Rate:', localStorage.getItem('dividendRate'));
    console.log('Growth Rate:', localStorage.getItem('growthRate'));
});

function formatShortNumber(number) {
    if (typeof number !== 'number' || isNaN(number)) {
        return '0';
    }
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    } else {
        return number.toFixed(0);
    }
}

function formatNumber(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function loadDataFromStorage() {
    window.retirementData = {
        targetRetirementAmount: parseFloat(localStorage.getItem('retirementAmountNeeded')) || 0,
        epfAmount: parseFloat(localStorage.getItem('epfFinalAmount')) || 0,
        realEstateAmount: parseFloat(localStorage.getItem('realEstateAmount')) || 0,
        stockAmount: parseFloat(localStorage.getItem('stockFinalAmount')) || 0,
        epf: {
            initialAmount: parseFloat(localStorage.getItem('epfInitialAmount')) || 0,
            finalAmount: parseFloat(localStorage.getItem('epfFinalAmount')) || 0,
            annualContribution: parseFloat(localStorage.getItem('epfAnnualContribution')) || 0,
            dividendRate: parseFloat(localStorage.getItem('epfDividendRate')) || 0
        },
        realEstate: {
            initialAmount: parseFloat(localStorage.getItem('realEstateInitialAmount')) || 0,
            finalAmount: parseFloat(localStorage.getItem('realEstateAmount')) || 0,
            appreciationRate: parseFloat(localStorage.getItem('houseAppreciationRate')) || 0,
            monthlyRental: parseFloat(localStorage.getItem('monthlyRental')) || 0
        },
        stocks: {
            initialAmount: parseFloat(localStorage.getItem('stockInitialAmount')) || 0,
            finalAmount: parseFloat(localStorage.getItem('stockFinalAmount')) || 0,
            monthlyInvestment: parseFloat(localStorage.getItem('monthlyStockInvestment')) || 0,
            expectedReturn: parseFloat(localStorage.getItem('stockExpectedReturn')) || 0
        },
        userName: localStorage.getItem('name') || '用户',
        currentAge: parseInt(localStorage.getItem('currentAge')) || 30,
        retirementAge: parseInt(localStorage.getItem('retirementAge')) || 60,
        yearsNeeded: parseInt(localStorage.getItem('yearsNeeded')) || 30
    };
}

function updateSummary() {
    const data = window.retirementData;
    const totalAmount = (data.epfAmount || 0) + (data.realEstateAmount || 0) + (data.stockAmount || 0);
    const progressPercentage = data.targetRetirementAmount > 0 ? (totalAmount / data.targetRetirementAmount) * 100 : 0;
    const shortfall = Math.max(0, data.targetRetirementAmount - totalAmount);
    const monthlyEstimate = (totalAmount * 0.04) / 12; // Assuming 4% annual withdrawal rate

    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const completionMessage = document.getElementById('completionMessage');


    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    progressText.textContent = `${progressPercentage.toFixed(2)}%`;


    const epfPercentage = totalAmount > 0 ? ((data.epfAmount || 0) / totalAmount * 100).toFixed(1) : 0;
    const realEstatePercentage = totalAmount > 0 ? ((data.realEstateAmount || 0) / totalAmount * 100).toFixed(1) : 0;
    const stockPercentage = totalAmount > 0 ? ((data.stockAmount || 0) / totalAmount * 100).toFixed(1) : 0;

    document.getElementById('progressFill').style.width = `${Math.min(progressPercentage, 100)}%`;
    document.getElementById('targetRetirementAmount').textContent = `RM ${formatShortNumber(data.targetRetirementAmount)}`;
    document.getElementById('totalAmount').textContent = `RM ${formatShortNumber(totalAmount)}`;
    document.getElementById('epfAmount').textContent = `RM ${formatShortNumber(data.epfAmount)}`;
    document.getElementById('realEstateAmount').textContent = `RM ${formatShortNumber(data.realEstateAmount)}`;
    document.getElementById('stockAmount').textContent = `RM ${formatShortNumber(data.stockAmount)}`;
    document.getElementById('shortfall').textContent = `RM ${formatShortNumber(shortfall)}`;
    document.getElementById('monthlyEstimate').textContent = `RM ${formatShortNumber(monthlyEstimate)}`;

    // Calculate and display the comparison
    const baseInvestment = totalAmount;
    const extraInvestment = baseInvestment * 1.01; // 1% extra
    const difference = extraInvestment - baseInvestment;

    document.getElementById('baseInvestment').textContent = `RM ${formatShortNumber(baseInvestment)}`;
    document.getElementById('extraInvestment').textContent = `RM ${formatShortNumber(extraInvestment)}`;
    document.getElementById('investmentDifference').textContent = `RM ${formatShortNumber(difference)}`;

    document.getElementById('userName').textContent = `${data.userName}的退休计划进度`;


    document.getElementById('epfAmount').textContent = `RM ${formatShortNumber(data.epfAmount)}`;
    document.getElementById('epfPercentage').textContent = `${epfPercentage}%`;
    
    document.getElementById('realEstateAmount').textContent = `RM ${formatShortNumber(data.realEstateAmount)}`;
    document.getElementById('realEstatePercentage').textContent = `${realEstatePercentage}%`;
    
    document.getElementById('stockAmount').textContent = `RM ${formatShortNumber(data.stockAmount)}`;
    document.getElementById('stockPercentage').textContent = `${stockPercentage}%`;


    
    if (progressPercentage >= 100) {
        completionMessage.textContent = `恭喜您！您已经达到了退休目标。`;
    } else {
        completionMessage.textContent = `您已经完成了 ${progressPercentage.toFixed(2)}% 的退休目标。继续努力！`;
    }

    // Calculate and display the extra 1% investment comparison
    const yearsUntilRetirement = data.retirementAge - data.currentAge;
    const fixedExtraInvestment = calculateExtraInvestment(baseInvestment, 0.01, yearsUntilRetirement, false);
    const increasingExtraInvestment = calculateExtraInvestment(baseInvestment, 0.01, yearsUntilRetirement, true);
    const extraInvestmentDifference = increasingExtraInvestment - fixedExtraInvestment;

    document.getElementById('fixedExtraInvestment').textContent = `RM ${formatShortNumber(fixedExtraInvestment)}`;
    document.getElementById('increasingExtraInvestment').textContent = `RM ${formatShortNumber(increasingExtraInvestment)}`;
    document.getElementById('extraInvestmentDifference').textContent = `RM ${formatShortNumber(extraInvestmentDifference)}`;
}

function createDistributionChart() {
    const data = window.retirementData;
    const ctx = document.getElementById('distributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['EPF', '房地产', '股票'],
            datasets: [{
                data: [data.epfAmount, data.realEstateAmount, data.stockAmount],
                backgroundColor: ['#45B7D1', '#FF6B6B', '#4ECDC4']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        callback: function(value) {
                            return 'RM ' + formatShortNumber(value);
                        }
                    }
                },
                y: {
                    ticks: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

function createGrowthChart() {
    const data = window.retirementData;
    const ctx = document.getElementById('growthChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['起始', 'EPF', '+ 房地产', '+ 股票'],
            datasets: [{
                label: 'EPF',
                data: [0, data.epfAmount, data.epfAmount, data.epfAmount],
                backgroundColor: '#45B7D1'
            }, {
                label: '房地产',
                data: [0, 0, data.realEstateAmount, data.realEstateAmount],
                backgroundColor: '#FF6B6B'
            }, {
                label: '股票',
                data: [0, 0, 0, data.stockAmount],
                backgroundColor: '#4ECDC4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: 'white'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        callback: function(value) {
                            return 'RM ' + formatShortNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function calculateExtraInvestment(baseAmount, initialPercentage, years, isIncreasing) {
    let totalAmount = baseAmount;
    let currentPercentage = initialPercentage;

    for (let i = 0; i < years; i++) {
        totalAmount += totalAmount * currentPercentage;
        if (isIncreasing) {
            currentPercentage += initialPercentage;
        }
    }

    return totalAmount;
}

function calculateMilestones() {
    const data = window.retirementData;
    console.log('Retirement Data:', data);

    const milestones = [25, 50, 75, 100];
    const milestoneTracker = document.getElementById('milestoneTracker');
    console.log('Milestone Tracker element:', milestoneTracker);

    if (!milestoneTracker) {
        console.error('Milestone Tracker element not found');
        return;
    }

    milestoneTracker.innerHTML = '';

    let currentTotal = data.epf.initialAmount + data.realEstate.initialAmount + data.stocks.initialAmount;
    let yearsToMilestone = {};

    console.log('Initial Total:', currentTotal);

    for (let year = 1; year <= data.yearsNeeded; year++) {
        currentTotal += (data.epf.annualContribution + 
                         data.realEstate.monthlyRental * 12 + 
                         data.stocks.monthlyInvestment * 12);
        
        currentTotal *= (1 + data.epf.dividendRate / 100);
        currentTotal *= (1 + data.realEstate.appreciationRate / 100);
        currentTotal *= (1 + data.stocks.expectedReturn / 100);

        const progressPercentage = (currentTotal / data.targetRetirementAmount) * 100;
        
        console.log(`Year ${year}: Total: ${currentTotal}, Progress: ${progressPercentage}%`);

        milestones.forEach(milestone => {
            if (progressPercentage >= milestone && !yearsToMilestone[milestone]) {
                yearsToMilestone[milestone] = year;
            }
        });
    }

    console.log('Years to Milestones:', yearsToMilestone);

    milestones.forEach(milestone => {
        const milestoneElement = document.createElement('div');
        milestoneElement.className = 'milestone';
        milestoneElement.innerHTML = `
            <span>${milestone}% of goal:</span>
            <span>${yearsToMilestone[milestone] ? `Year ${yearsToMilestone[milestone]}` : 'Not reached'}</span>
        `;
        milestoneTracker.appendChild(milestoneElement);
    });
}

function setupWhatIfScenarios() {
    const calculateButton = document.getElementById('calculateWhatIf');
    calculateButton.addEventListener('click', calculateWhatIfScenario);

    // Load previous values
    const additionalPaymentPercentage = localStorage.getItem('additionalPaymentPercentage') || '0';
    const monthlyInvestment = localStorage.getItem('monthlyStockInvestment') || '0';

    document.getElementById('additionalPaymentPercentage').value = additionalPaymentPercentage;
    document.getElementById('monthlyInvestment').value = monthlyInvestment;
}

function calculateWhatIfScenario() {
    const data = window.retirementData;
    const additionalPaymentPercentage = parseFloat(document.getElementById('additionalPaymentPercentage').value) / 100;
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const propertyAppreciation = parseFloat(document.getElementById('propertyAppreciation').value) / 100;
    const stockReturn = parseFloat(document.getElementById('stockReturn').value) / 100;

    let propertyTotal = data.realEstate.finalAmount;
    let stockTotal = data.stocks.finalAmount;

    // Recalculate property value
    for (let year = 1; year <= data.yearsNeeded; year++) {
        const extraPayment = data.realEstate.monthlyRental * 12 * additionalPaymentPercentage;
        propertyTotal += extraPayment;
        propertyTotal *= (1 + propertyAppreciation);
    }

    // Recalculate stock value
    for (let year = 1; year <= data.yearsNeeded; year++) {
        stockTotal += monthlyInvestment * 12;
        stockTotal *= (1 + stockReturn);
    }

    const totalAmount = data.epfAmount + propertyTotal + stockTotal;
    const originalTotal = data.epfAmount + data.realEstateAmount + data.stockAmount;
    const difference = totalAmount - originalTotal;

    const resultsElement = document.getElementById('whatIfResults');
    if (resultsElement) {
        resultsElement.innerHTML = `
            <p>新总额: RM ${formatNumber(totalAmount)}</p>
            <p>原始总额: RM ${formatNumber(originalTotal)}</p>
            <p>差额: RM ${formatNumber(difference)} (${((difference / originalTotal) * 100).toFixed(2)}%)</p>
        `;
    } else {
        console.error('Element with id "whatIfResults" not found');
    }
    
}