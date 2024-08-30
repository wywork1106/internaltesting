document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    updateSummary();
    createDistributionChart();
    createGrowthChart();

        const simulateAgainButton = document.getElementById('simulateAgainButton');
        const saveScreenshotButton = document.getElementById('saveScreenshotButton');
      
        simulateAgainButton.addEventListener('click', function() {
          window.location.href = 'welcome.html';
        });
  
        saveScreenshotButton.addEventListener('click', function() {
            // Scroll to the top of the page
            window.scrollTo(0, 0);
    
            // Wait for any scrolling to finish
            setTimeout(function() {
                html2canvas(document.body, {
                    useCORS: true,
                    scale: 2, // Increase resolution
                    logging: false,
                    scrollY: -window.scrollY // Adjust for scroll position
                }).then(function(canvas) {
                    // Convert canvas to blob
                    canvas.toBlob(function(blob) {
                        // Create a temporary URL for the blob
                        const url = URL.createObjectURL(blob);
                        
                        // Create a temporary link and click it
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = '人生模拟结果.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up the temporary URL
                        URL.revokeObjectURL(url);
                    }, 'image/png');
                });
            }, 100); // Small delay to ensure scroll is complete
        });


    function getDataFromLocalStorage() {
        const keys = [
            'currentSalary',
            'monthlySpending',
            'monthlyStockInvestment',
            'rentAmount',
            'additionalPaymentPercentage',
            'epfRate',
            'salaryIncreaseRate',
            'housePrice',
            'houseAppreciationRate',
            'dividendRate',
            'growthRate'
        ];

        const data = {};
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            data[key] = value !== null ? parseFloat(value) : 0;
        });

        return data;
    }

    // 格式化数字的函数
    function formatNumber(number) {
        return new Intl.NumberFormat('zh-CN').format(number);
    }

    // 填充卡片网格的函数
    function populateCardGrid(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                let value = data[key];
                if (typeof value === 'number') {
                    if (['epfRate', 'salaryIncreaseRate', 'houseAppreciationRate', 'dividendRate', 'growthRate'].includes(key)) {
                        // Display these rates as is, without multiplying by 100
                        value = value.toFixed(2) + '%';
                    } else if (key === 'additionalPaymentPercentage') {
                        // This one might already be in percentage form, so just add the % sign
                        value = value.toFixed(2) + '%';
                    } else {
                        // For other numeric values, format as currency
                        value = 'RM ' + formatNumber(value.toFixed(2));
                    }
                }
                element.textContent = value;
            }
        });
    }

    // 创建饼图的函数
    let salaryChart = null; // Global variable to store the chart instance

    function createPieChart() {
        const ctx = document.getElementById('salaryChart').getContext('2d');
        
        if (salaryChart) {
            salaryChart.destroy();
        }
        
        const data = getDataFromLocalStorage();
        const currentSalary = data.currentSalary || 0;
        const monthlySpending = data.monthlySpending || 0;
        const monthlyStockInvestment = data.monthlyStockInvestment || 0;
        const additionalRentPayment = ((data.rentAmount || 0) * (data.additionalPaymentPercentage || 0))/100;
        const totalExpenses = monthlySpending + monthlyStockInvestment + additionalRentPayment;
        const remainingAmount = Math.max(0, currentSalary - totalExpenses);
    
        const totalAmount = monthlySpending + monthlyStockInvestment + additionalRentPayment + remainingAmount;
    
        const chartData = [
            { label: `月度支出: RM ${formatNumber(monthlySpending)} (${((monthlySpending / totalAmount) * 100).toFixed(2)}%)`, value: monthlySpending, color: '#FFD700' },
            { label: `每月股票投资: RM ${formatNumber(monthlyStockInvestment)} (${((monthlyStockInvestment / totalAmount) * 100).toFixed(2)}%)`, value: monthlyStockInvestment, color: '#45B7D1' },
            { label: `额外租金支付: RM ${formatNumber(additionalRentPayment)} (${((additionalRentPayment / totalAmount) * 100).toFixed(2)}%)`, value: additionalRentPayment, color: '#FF6B6B' },
            { label: `剩余金额: RM ${formatNumber(remainingAmount)} (${((remainingAmount / totalAmount) * 100).toFixed(2)}%)`, value: remainingAmount, color: '#4ECDC4' }
        ];
    
        salaryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.map(item => item.label),
                datasets: [{
                    data: chartData.map(item => item.value),
                    backgroundColor: chartData.map(item => item.color),
                    borderColor: '#1C2841',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 80,
                        bottom: 80
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#FFFFFF',
                            font: {
                                size: 14,
                                family: "'Roboto', sans-serif"
                            },
                            padding: 10
                        }
                    },
                    tooltip: {
                        enabled: true
                    },
                
                }
            },
            plugins: [{
                afterDraw: function(chart) {
                    var ctx = chart.ctx;
                    chart.data.datasets.forEach(function(dataset, i) {
                        var meta = chart.getDatasetMeta(i);
                        if (!meta.hidden) {
                            meta.data.forEach(function(element, index) {
                                var dataValue = dataset.data[index];
                                var percentage = ((dataValue / totalAmount) * 100).toFixed(1);
                                
                                var position = element.tooltipPosition();
                                
                                ctx.fillStyle = '#FFFFFF';
                                ctx.font = 'bold 14px Roboto';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                if (percentage <= 9.9) {
                                    // Display outside for small percentages
                                    ctx.fillText(percentage + '%', position.x, position.y);

                                    //      var midAngle = element.startAngle + (element.endAngle - element.startAngle) / 2;
                                   // var x = position.x + Math.cos(midAngle) * (chart.chartArea.width / 2 * 0.55);
                                  //  var y = position.y + Math.sin(midAngle) * (chart.chartArea.height / 2 * 0.55);
                                 //   ctx.fillText(percentage + '%', x, y);
                                } else {
                                    // Display inside for larger percentages
                                    ctx.fillText(percentage + '%', position.x, position.y);
                                }
                            });
                        }
                    });
                }
            }]
        });
    }
    
    
    // Call this function when you want to create or update the chart
    createPieChart();

    // 初始化页面的主函数
    function initializePage() {
        const data = getDataFromLocalStorage();
        populateCardGrid(data);
        createPieChart(data);
    }

    // 调用初始化函数
    initializePage();
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

function updateComparisonItem(id, amount, percentage) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = `RM ${formatShortNumber(amount)} (${percentage}%)`;
    }
}

function updateElementContent(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function updateSummary() {
    const data = window.retirementData;
    const totalAmount = (data.epfAmount || 0) + (data.realEstateAmount || 0) + (data.stockAmount || 0);
    const targetAmount = data.targetRetirementAmount || 1;
    const progressPercentage = data.targetRetirementAmount > 0 ? (totalAmount / data.targetRetirementAmount) * 100 : 0;
    const shortfall = Math.max(0, data.targetRetirementAmount - totalAmount);
    const monthlyEstimate = (totalAmount * 0.04) / 12; // Assuming 4% annual withdrawal rate

    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const completionMessage = document.getElementById('completionMessage');

    if (progressFill && progressText) {
        progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
        progressText.textContent = `${progressPercentage.toFixed(2)}%`;
    }

    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    progressText.textContent = `${progressPercentage.toFixed(2)}%`;


    const epfPercentage = ((data.epfAmount || 0) / targetAmount * 100).toFixed(1);
    const realEstatePercentage = ((data.realEstateAmount || 0) / targetAmount * 100).toFixed(1);
    const stockPercentage = ((data.stockAmount || 0) / targetAmount * 100).toFixed(1);


    updateComparisonItem('epfAmount', data.epfAmount, epfPercentage);
    updateComparisonItem('realEstateAmount', data.realEstateAmount, realEstatePercentage);
    updateComparisonItem('stockAmount', data.stockAmount, stockPercentage);

    updateElementContent('targetRetirementAmount', formatShortNumber(data.targetRetirementAmount));
    updateElementContent('totalAmount', formatShortNumber(totalAmount));
    updateElementContent('shortfall', formatShortNumber(shortfall));
    updateElementContent('monthlyEstimate', formatShortNumber(monthlyEstimate));

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

    document.getElementById('monthlyEstimate2').textContent = `RM ${formatShortNumber(monthlyEstimate)}`;

    if (completionMessage) {
        if (progressPercentage >= 100) {
            completionMessage.textContent = `恭喜您！您已经达到了退休目标。`;
        } else {
            completionMessage.textContent = `您已经完成了 ${progressPercentage.toFixed(2)}% 的退休目标。继续努力！`;
        }
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



