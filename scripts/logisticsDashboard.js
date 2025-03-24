// 图表实例
let dailyChart, monthlyChart, overdueChart;

// 多语言支持
const translations = {
    zh: {
        chartLabels: {
            pending: '待发货',
            shipped: '已发货',
            received: '已签收',
            overdue7to14: '7-14天',
            overdue15to30: '15-30天',
            overdueOver30: '超过30天'
        },
        dashboardTitle: '物流动态看板',
        dailyStatus: '日发货状态',
        monthlyStatus: '月发货状态',
        overdueAlert: '超期发货警告',
        totalOrders: '总订单数',
        pendingOrders: '待发货',
        shippedOrders: '已发货',
        receivedOrders: '已签收',
        totalOverdue: '总超期订单',
        viewAllOverdue: '查看全部超期订单',
        selectDate: '选择日期',
        selectMonth: '选择月份'
    },
    en: {
        chartLabels: {
            pending: 'Pending',
            shipped: 'Shipped',
            received: 'Received',
            overdue7to14: '7-14 Days',
            overdue15to30: '15-30 Days',
            overdueOver30: 'Over 30 Days'
        },
        dashboardTitle: 'Logistics Dashboard',
        dailyStatus: 'Daily Shipping Status',
        monthlyStatus: 'Monthly Shipping Status',
        overdueAlert: 'Overdue Shipping Alert',
        totalOrders: 'Total Orders',
        pendingOrders: 'Pending',
        shippedOrders: 'Shipped',
        receivedOrders: 'Received',
        totalOverdue: 'Total Overdue',
        viewAllOverdue: 'View All Overdue Orders',
        selectDate: 'Select Date',
        selectMonth: 'Select Month'
    }
};

// 切换语言
function switchLanguage(lang) {
    // 保存语言选择到本地存储
    localStorage.setItem('preferredLanguage', lang);
    
    // 切换显示的语言元素
    document.querySelectorAll('.lang-zh, .lang-en').forEach(el => {
        el.classList.add('d-none');
    });
    
    document.querySelectorAll(`.lang-${lang}`).forEach(el => {
        el.classList.remove('d-none');
    });
    
    // 更新图表标签
    updateChartLabels(lang);
}

// 更新图表标签
function updateChartLabels(lang) {
    const labels = translations[lang].chartLabels;
    
    // 更新日发货状态图表
    dailyChart.data.labels = [labels.pending, labels.shipped, labels.received];
    dailyChart.update();
    
    // 更新月发货状态图表
    monthlyChart.data.labels = [labels.pending, labels.shipped, labels.received];
    monthlyChart.update();
    
    // 更新超期发货警告图表
    overdueChart.data.labels = [labels.overdue7to14, labels.overdue15to30, labels.overdueOver30];
    overdueChart.update();
}

// 模拟数据生成函数
function generateMockData() {
    const mockData = {
        daily: {
            totalOrders: Math.floor(Math.random() * 100) + 50,
            pendingOrders: Math.floor(Math.random() * 30),
            shippedOrders: Math.floor(Math.random() * 40),
            receivedOrders: Math.floor(Math.random() * 30)
        },
        monthly: {
            totalOrders: Math.floor(Math.random() * 1000) + 500,
            pendingOrders: Math.floor(Math.random() * 300),
            shippedOrders: Math.floor(Math.random() * 400),
            receivedOrders: Math.floor(Math.random() * 300)
        },
        overdue: {
            totalOverdue: Math.floor(Math.random() * 50),
            overdue7to14: Math.floor(Math.random() * 20),
            overdue15to30: Math.floor(Math.random() * 15),
            overdueOver30: Math.floor(Math.random() * 15)
        }
    };
    return mockData;
}

// 初始化日期选择器
function initializeDatePickers() {
    const today = new Date();
    const dashboardDate = document.getElementById('dashboardDate');
    const dashboardMonth = document.getElementById('dashboardMonth');
    
    // 设置日期选择器的默认值为今天
    dashboardDate.value = today.toISOString().split('T')[0];
    
    // 设置月份选择器的默认值为当前月份
    dashboardMonth.value = today.toISOString().slice(0, 7);
    
    // 添加日期变化事件监听器
    dashboardDate.addEventListener('change', () => {
        loadDailyData();
        updateCharts();
    });
    
    dashboardMonth.addEventListener('change', () => {
        loadMonthlyData();
        updateCharts();
    });
}

// 初始化图表
function initializeCharts() {
    // 日发货状态图表
    const dailyCtx = document.getElementById('dailyStatusChart').getContext('2d');
    dailyChart = new Chart(dailyCtx, {
        type: 'doughnut',
        data: {
            labels: ['待发货', '已发货', '已签收'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#f44336', '#2196F3', '#66bb6a'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            cutout: '70%'
        }
    });
    
    // 月发货状态图表
    const monthlyCtx = document.getElementById('monthlyStatusChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: ['待发货', '已发货', '已签收'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#f44336', '#2196F3', '#66bb6a'],
                borderRadius: 8,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // 超期发货警告图表
    const overdueCtx = document.getElementById('overdueAlertChart').getContext('2d');
    overdueChart = new Chart(overdueCtx, {
        type: 'pie',
        data: {
            labels: ['7-14天', '15-30天', '超过30天'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#ffa726', '#fb8c00', '#f44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// 加载日发货数据
function loadDailyData() {
    // 这里使用模拟数据，实际项目中应该从API获取数据
    const data = generateMockData().daily;
    
    // 更新图表数据
    dailyChart.data.datasets[0].data = [
        data.pendingOrders,
        data.shippedOrders,
        data.receivedOrders
    ];
    dailyChart.update();
    
    // 更新统计数据
    document.getElementById('totalOrdersDaily').textContent = data.totalOrders;
    document.getElementById('pendingOrdersDaily').textContent = data.pendingOrders;
    document.getElementById('shippedOrdersDaily').textContent = data.shippedOrders;
    document.getElementById('receivedOrdersDaily').textContent = data.receivedOrders;
}

// 加载月发货数据
function loadMonthlyData() {
    // 这里使用模拟数据，实际项目中应该从API获取数据
    const data = generateMockData().monthly;
    
    // 更新图表数据
    monthlyChart.data.datasets[0].data = [
        data.pendingOrders,
        data.shippedOrders,
        data.receivedOrders
    ];
    monthlyChart.update();
    
    // 更新统计数据
    document.getElementById('totalOrdersMonthly').textContent = data.totalOrders;
    document.getElementById('pendingOrdersMonthly').textContent = data.pendingOrders;
    document.getElementById('shippedOrdersMonthly').textContent = data.shippedOrders;
    document.getElementById('receivedOrdersMonthly').textContent = data.receivedOrders;
}

// 加载超期订单数据
function loadOverdueData() {
    // 这里使用模拟数据，实际项目中应该从API获取数据
    const data = generateMockData().overdue;
    
    // 更新图表数据
    overdueChart.data.datasets[0].data = [
        data.overdue7to14,
        data.overdue15to30,
        data.overdueOver30
    ];
    overdueChart.update();
    
    // 更新统计数据
    document.getElementById('totalOverdueOrders').textContent = data.totalOverdue;
    document.getElementById('overdue7to14days').textContent = data.overdue7to14;
    document.getElementById('overdue15to30days').textContent = data.overdue15to30;
    document.getElementById('overdueOver30days').textContent = data.overdueOver30;
}

// 更新所有图表
function updateCharts() {
    loadDailyData();
    loadMonthlyData();
    loadOverdueData();
}

// 查看全部超期订单
document.getElementById('viewOverdueOrdersBtn').addEventListener('click', () => {
    window.parent.location.href = 'orderList.html?filter=overdue';
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化日期选择器
    initializeDatePickers();
    
    // 初始化图表
    initializeCharts();
    
    // 加载初始数据
    updateCharts();
    
    // 设置自动刷新（每5分钟）
    setInterval(updateCharts, 5 * 60 * 1000);
    
    // 初始化语言切换
    initLanguageSwitcher();
});

// 初始化语言切换功能
function initLanguageSwitcher() {
    // 从本地存储中获取之前的语言选择，默认为中文
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'zh';
    
    // 初始设置语言
    switchLanguage(savedLanguage);
    
    // 绑定语言切换按钮事件
    document.querySelectorAll('[data-lang]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = button.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
} 