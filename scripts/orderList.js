// 全局变量
let allOrders = []; // 所有订单数据
let displayedOrders = []; // 当前显示的订单数据
let currentPage = 1; // 当前页码
const pageSize = 10; // 每页显示的数量
let currentFilters = {}; // 当前筛选条件

// 临时示例数据，用于确保始终有数据可用
const sampleOrders = window.ordersData || [];

// 添加定义缺失的applySearchFilter函数
function applySearchFilter(searchText) {
    const searchLower = (searchText || '').toLowerCase();
    if (!searchLower) return displayedOrders;

    return displayedOrders.filter(order => {
        // 检查订单号、联系人、电话、地址等字段是否包含搜索关键词
        return (
            (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
            (order.contact && order.contact.toLowerCase().includes(searchLower)) ||
            (order.phone && order.phone.toLowerCase().includes(searchLower)) ||
            (order.address && order.address.toLowerCase().includes(searchLower)) ||
            (order.waybillNumber && order.waybillNumber.toLowerCase().includes(searchLower))
        );
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('订单列表页面初始化开始...');
    initPage();
});

// 页面初始化函数
async function initPage() {
    try {
        console.log('执行页面初始化...');
        
        // 加载数据
        await loadOrders();
        
        // 设置日期范围并应用筛选
        setDefaultDateRange();
        filterOrders();
        
        // 绑定事件监听器
        bindEventListeners();
        
        // 应用语言设置
        updateLanguageElements();
        
        // 添加附加按钮
        addLocalStorageButton();
        addKuaidi100SettingButton();
        
        // 处理URL参数，例如预设筛选条件
        handleUrlParams();
        
        console.log('页面初始化完成，共加载 ' + allOrders.length + ' 条记录');
    } catch (error) {
        console.error('初始化失败:', error);
        showErrorMessage('系统初始化失败: ' + error.message);
    }
}

// 加载订单数据
function loadOrders() {
    console.log('加载订单数据...');
    
    // 使用生成测试数据，实际应用中应该从后端API获取
    allOrders = generateMockOrderData(100);
    
    // 应用筛选条件和分页
    filterOrders();
    
    // 设置筛选功能
    setupColumnFilters();
    
    // 处理URL参数中的筛选条件
    handleUrlParams();
}

// 生成模拟订单数据
function generateMockOrderData(count) {
    console.log(`生成${count}条模拟订单数据...`);
    
    const expressCompanies = ['顺丰速运', '圆通速递', '中通快递', '申通快递', '百世快递', '韵达速递', '天天快递'];
    const statusOptions = ['待发货', '已发货', '运输中', '已送达', '已签收', '退回'];
    const templateTypes = ['京东', '淘宝', '拼多多', '1688', '菜鸟', '申通标准', '顺丰标准'];
    
    const mockData = [];
    
    // 生成今天的日期，格式 YYYY-MM-DD
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
        // 随机日期：今天至30天前
        const orderDate = new Date(today);
        orderDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
        
        // 物流状态
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        // 订单
        const order = {
            id: i + 1,
            orderNumber: `ORD${String(Date.now()).slice(-8)}${i}`,
            orderTime: formatDate(orderDate),
            weight: (Math.random() * 10 + 0.1).toFixed(1),
            address: `广东省深圳市南山区科技园${Math.floor(Math.random() * 100) + 1}号`,
            contact: `张${String.fromCharCode(Math.floor(Math.random() * 26) + 65)}`,
            phone: `1${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            expressCompany: expressCompanies[Math.floor(Math.random() * expressCompanies.length)],
            waybillNumber: `SF${String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0')}`,
            waybillTemplate: templateTypes[Math.floor(Math.random() * templateTypes.length)],
            shippingFee: (Math.random() * 20 + 5).toFixed(2),
            logisticsStatus: {
                status: status,
                color: getStatusColor(status)
            }
        };
        
        // 如果已发货，则添加寄件时间
        if (status !== '待发货') {
            const shippingDate = new Date(orderDate);
            shippingDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 3) + 1);
            order.shippingTime = formatDate(shippingDate);
        }
        
        // 如果已送达或已签收，则添加收件时间和签收状态
        if (status === '已送达' || status === '已签收') {
            const receivingDate = new Date(new Date(order.shippingTime));
            receivingDate.setDate(receivingDate.getDate() + Math.floor(Math.random() * 5) + 1);
            order.receivingTime = formatDate(receivingDate);
            order.isSigned = status === '已签收';
        }
        
        mockData.push(order);
    }
    
    console.log('模拟订单数据生成完成');
    return mockData;
}

// 根据状态获取颜色样式
function getStatusColor(status) {
    switch (status) {
        case '待发货':
            return 'warning';
        case '已发货':
        case '运输中':
            return 'info';
        case '已送达':
            return 'primary';
        case '已签收':
            return 'success';
        case '退回':
            return 'danger';
        default:
            return 'secondary';
    }
}

// 设置默认日期范围 - 修改此函数，删除await
function setDefaultDateRange() {
    try {
        console.log('设置默认日期范围');
        const today = new Date();
        
        // 设置结束日期为今天
        const endDateInput = document.getElementById('endDate');
        if (endDateInput) {
            const endDateFormatted = today.toISOString().split('T')[0];
            endDateInput.value = endDateFormatted;
        }
        
        // 设置开始日期为一个月前
        const startDate = new Date();
        startDate.setMonth(today.getMonth() - 1);
        const startDateInput = document.getElementById('startDate');
        if (startDateInput) {
            const startDateFormatted = startDate.toISOString().split('T')[0];
            startDateInput.value = startDateFormatted;
        }
        
        // 更新当前筛选条件
        currentFilters.startDate = startDate.toISOString().split('T')[0];
        currentFilters.endDate = today.toISOString().split('T')[0];
        
        console.log('默认日期范围设置完成');
    } catch (error) {
        console.error('设置默认日期范围出错:', error);
    }
}

// 绑定事件监听器
function bindEventListeners() {
    console.log('绑定事件监听器...');
    
    try {
        // 绑定日期筛选事件
        document.getElementById('startDate').addEventListener('change', filterOrders);
        document.getElementById('endDate').addEventListener('change', filterOrders);
        
        // 绑定筛选条件事件
        document.getElementById('expressCompanyFilter').addEventListener('change', filterOrders);
        document.getElementById('logisticsStatusFilter').addEventListener('change', filterOrders);
        
        // 绑定搜索事件
        document.getElementById('searchBtn').addEventListener('click', function() {
            filterOrders();
        });
        
        document.getElementById('searchInput').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterOrders();
            }
        });
        
        // 绑定清除筛选事件
        document.getElementById('clearAllFilters').addEventListener('click', function() {
            // 重置所有筛选条件
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('expressCompanyFilter').value = '';
            document.getElementById('logisticsStatusFilter').value = '';
            document.getElementById('searchInput').value = '';
            
            // 清空筛选条件
            currentFilters = {};
            
            // 重新筛选
            filterOrders();
        });
        
        // 绑定生成运单按钮点击事件
        document.getElementById('generateWaybillBtn').addEventListener('click', function() {
            // 获取选中的订单
            const selectedOrders = getSelectedOrders();
            if (selectedOrders.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: '未选择订单',
                    text: '请先选择要生成运单的订单',
                    confirmButtonText: '确定'
                });
                return;
            }
            
            // 打开模板选择框
            $('#templateModal').modal('show');
        });
        
        // 绑定选择全部复选框事件
        document.getElementById('selectAll').addEventListener('change', function() {
            const isChecked = this.checked;
            document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
        
        // 绑定分页事件
        document.getElementById('pagination').addEventListener('click', handlePagination);
        
        // 绑定导入按钮事件
        const localImportBtn = document.getElementById('localImportBtn');
        if (localImportBtn) {
            localImportBtn.addEventListener('click', function() {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('未找到文件输入控件');
                    showErrorMessage('系统错误：未找到文件输入控件');
                }
            });
        }
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        const apiImportBtn = document.getElementById('apiImportBtn');
        if (apiImportBtn) {
            apiImportBtn.addEventListener('click', handleApiImport);
        }
        
        console.log('所有事件监听器绑定完成');
    } catch (error) {
        console.error('绑定事件监听器时出错:', error);
        showErrorMessage('绑定事件失败: ' + error.message);
    }
}

// 显示错误消息
function showErrorMessage(message) {
    console.error('错误:', message);
    
    const tableBody = document.getElementById('orderTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="16" class="text-center py-5">
                    <div class="text-danger mb-3">
                        <i class="fas fa-exclamation-circle fa-3x"></i>
        </div>
                    <p class="mb-3">${message}</p>
                    <button class="btn btn-outline-primary" id="retryBtn">
                        <i class="fas fa-sync-alt me-2"></i>重试
                    </button>
                </td>
            </tr>
        `;
        
        // 绑定重试按钮事件
        document.getElementById('retryBtn')?.addEventListener('click', function() {
            // 刷新页面
            window.location.reload();
        });
    } else {
        // 如果找不到表格主体，使用alert显示错误
        alert('系统错误: ' + message);
    }
}

// 添加本地存储按钮
function addLocalStorageButton() {
    try {
        const actionButtons = document.querySelector('.action-buttons');
        if (!actionButtons) return;
        
        // 检查按钮是否已存在
        if (document.getElementById('localStorageBtn')) return;
        
        // 创建本地存储按钮
        const button = document.createElement('button');
        button.id = 'localStorageBtn';
        button.className = 'btn btn-outline-secondary ms-2';
        button.innerHTML = '<i class="fas fa-save me-1"></i> 保存到本地';
        button.title = '将当前数据保存到本地存储';
        
        // 绑定点击事件
        button.addEventListener('click', function() {
            if (typeof saveToLocalStorage === 'function') {
                saveToLocalStorage();
            } else {
                showErrorMessage('保存功能未定义');
            }
        });
        
        // 添加到操作按钮区域
        actionButtons.appendChild(button);
    } catch (error) {
        console.error('添加本地存储按钮失败:', error);
    }
}

// 添加快递100设置按钮
function addKuaidi100SettingButton() {
    try {
        const actionButtons = document.querySelector('.action-buttons');
        if (!actionButtons) return;
        
        // 检查按钮是否已存在
        if (document.getElementById('kuaidi100SettingBtn')) return;
        
        // 创建快递100设置按钮
        const button = document.createElement('button');
        button.id = 'kuaidi100SettingBtn';
        button.className = 'btn btn-outline-info ms-2';
        button.innerHTML = '<i class="fas fa-cog me-1"></i> 快递API设置';
        button.title = '设置快递100 API的认证信息';
        
        // 绑定点击事件
        button.addEventListener('click', function() {
            if (typeof showKuaidi100Settings === 'function') {
                showKuaidi100Settings();
        } else {
                showErrorMessage('快递API设置功能未定义');
            }
        });
        
        // 添加到操作按钮区域
        actionButtons.appendChild(button);
    } catch (error) {
        console.error('添加快递100设置按钮失败:', error);
    }
}

// 更新语言元素显示
function updateLanguageElements() {
    try {
        // 获取当前语言设置
        const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
        
        // 隐藏所有语言元素
        document.querySelectorAll('.lang-zh, .lang-en').forEach(el => {
            el.classList.add('d-none');
        });
        
        // 显示当前语言的元素
        document.querySelectorAll(`.lang-${currentLang}`).forEach(el => {
            el.classList.remove('d-none');
        });
        
        console.log('已更新语言显示为:', currentLang);
    } catch (error) {
        console.error('更新语言元素显示失败:', error);
    }
}

// 处理本地数据库同步
async function handleDBSync() {
    try {
        // 显示确认对话框
        const result = await Swal.fire({
            title: '数据本地存档',
            html: `
                <div class="text-start">
                    <p class="mb-2">请选择操作:</p>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="syncDirection" id="syncToDB" value="toDB" checked>
                        <label class="form-check-label" for="syncToDB">
                            <i class="fas fa-save text-success me-1"></i>将当前订单数据保存到本地
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="syncDirection" id="syncFromDB" value="fromDB">
                        <label class="form-check-label" for="syncFromDB">
                            <i class="fas fa-folder-open text-primary me-1"></i>从本地加载订单数据
                        </label>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        });

        if (!result.isConfirmed) return;

        // 获取操作方向
        const syncDirection = document.querySelector('input[name="syncDirection"]:checked').value;
        
        // 显示加载状态
        Swal.fire({
            title: '正在处理',
            text: syncDirection === 'toDB' ? '正在保存订单数据...' : '正在加载订单数据...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // 检查IndexedDB服务是否可用
        if (!window.indexedDBService) {
            throw new Error('本地存储服务不可用，请确保已正确加载服务');
        }
        
        if (syncDirection === 'toDB') {
            // 保存到本地
            await saveOrdersToDB();
        } else {
            // 从本地获取数据
            await loadOrdersFromDB();
        }
        
    } catch (error) {
        console.error('本地数据同步失败:', error);
        Swal.fire({
            icon: 'error',
            title: '同步失败',
            text: error.message || '同步过程中发生错误',
            confirmButtonText: '确定'
        });
    }
}

// 保存订单数据到本地
async function saveOrdersToDB() {
    try {
        // 确保有订单数据
        if (!allOrders || allOrders.length === 0) {
            throw new Error('没有可保存的订单数据');
        }
        
        // 调用数据库服务保存数据
        const count = await window.indexedDBService.saveOrders(allOrders);
        
        // 显示成功消息
        Swal.fire({
            icon: 'success',
            title: '保存成功',
            text: `成功保存${count}条订单数据到本地`,
            confirmButtonText: '确定'
        });
        
    } catch (error) {
        console.error('保存订单到本地失败:', error);
        throw error;
    }
}

// 从本地加载订单数据
async function loadOrdersFromDB() {
    try {
        // 调用数据库服务获取数据
        const orders = await window.indexedDBService.getOrders();
        
        if (!orders || orders.length === 0) {
            throw new Error('本地没有保存的订单数据');
        }
        
        // 更新本地订单数据
        allOrders = orders;
        
        // 应用筛选
        filterOrders();
        
        // 显示成功消息
        Swal.fire({
            icon: 'success',
            title: '加载成功',
            text: `成功从本地加载${orders.length}条订单数据`,
            confirmButtonText: '确定'
        });
        
    } catch (error) {
        console.error('从本地加载订单数据失败:', error);
        throw error;
    }
}
    
// 显示快递100配置对话框
function showKuaidi100Config() {
    // 获取当前配置
    const config = window.kuaidi100Service ? window.kuaidi100Service.config : {
        key: '',
        customer: '',
        secret: ''
    };
    
    Swal.fire({
        title: '快递100 API设置',
        html: `
            <form id="kuaidi100ConfigForm" class="text-start">
                <div class="mb-3">
                    <label for="apiKey" class="form-label">授权key</label>
                    <input type="text" class="form-control" id="apiKey" placeholder="输入您的授权key" value="${config.key || ''}">
        </div>
                <div class="mb-3">
                    <label for="customer" class="form-label">Customer ID</label>
                    <input type="text" class="form-control" id="customer" placeholder="输入您的customer ID" value="${config.customer || ''}">
                </div>
                <div class="mb-3">
                    <label for="secret" class="form-label">Secret</label>
                    <input type="password" class="form-control" id="secret" placeholder="输入您的secret" value="${config.secret || ''}">
        </div>
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle me-2"></i>请在快递100开发者平台获取以上参数
        </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: '保存设置',
        cancelButtonText: '取消',
        focusConfirm: false,
        preConfirm: () => {
            const apiKey = document.getElementById('apiKey').value;
            const customer = document.getElementById('customer').value;
            const secret = document.getElementById('secret').value;
            
            // 简单验证
            if (!apiKey && !customer && !secret) {
                Swal.showValidationMessage('请至少填写一项设置');
                return false;
            }
            
            return {
                key: apiKey,
                customer: customer,
                secret: secret
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveKuaidi100Config(result.value);
        }
    });
}
    
// 保存快递100配置
function saveKuaidi100Config(config) {
    try {
        // 检查快递100服务是否可用
        if (!window.kuaidi100Service) {
            throw new Error('快递100服务不可用，请确保已正确加载服务');
        }
        
        // 更新配置
        window.kuaidi100Service.setConfig(config);
        
        // 本地存储配置(不含secret)
        localStorage.setItem('kuaidi100_key', config.key);
        localStorage.setItem('kuaidi100_customer', config.customer);
        
        Swal.fire({
            icon: 'success',
            title: '设置已保存',
            text: '快递100 API配置已成功更新',
            confirmButtonText: '确定'
        });
        
    } catch (error) {
        console.error('保存快递100配置失败:', error);
        Swal.fire({
            icon: 'error',
            title: '保存失败',
            text: error.message || '设置保存过程中发生错误',
            confirmButtonText: '确定'
        });
    }
}

// 查询物流信息
async function queryLogistics(orderNumber) {
    try {
        // 查找订单
        const order = allOrders.find(o => o.orderNumber === orderNumber);
        if (!order) {
            throw new Error('未找到订单信息');
        }
        
        // 检查是否有运单号
        if (!order.waybillNumber) {
            throw new Error('该订单尚未生成运单号');
        }
        
        // 检查是否有快递公司
        if (!order.expressCompany) {
            throw new Error('该订单未设置快递公司');
        }
        
        // 检查快递100服务是否可用
        if (!window.kuaidi100Service) {
            throw new Error('快递100服务不可用，请确保已正确加载服务');
        }
        
        // 获取快递公司编码
        const companyCode = window.kuaidi100Service.getCompanyCode(order.expressCompany);
        if (!companyCode) {
            throw new Error('不支持的快递公司: ' + order.expressCompany);
        }
        
        // 显示加载状态
        Swal.fire({
            title: '查询物流',
            text: '正在查询物流信息...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // 调用快递100查询接口
        const result = await window.kuaidi100Service.queryTracking({
            com: companyCode,
            num: order.waybillNumber,
            phone: order.phone // 可选参数
        });
        
        if (result.success) {
            // 更新订单的物流状态
            order.logisticsStatus = {
                status: result.status,
                latestUpdate: result.data && result.data.length > 0 ? result.data[0].context : ''
            };
            
            // 如果物流状态为"签收"，更新订单的签收状态和时间
            if (result.state === '3') {
                order.isSigned = true;
                order.receivingTime = result.data && result.data.length > 0 ? result.data[0].time : new Date().toISOString().split('T')[0];
            }
            
            // 更新表格显示
            renderOrderTable();
            
            // 更新本地存储
            if (window.indexedDBService) {
                window.indexedDBService.updateOrder(orderNumber, {
                    logisticsStatus: order.logisticsStatus,
                    isSigned: order.isSigned,
                    receivingTime: order.receivingTime
                }).catch(error => {
                    console.error('更新本地存储失败:', error);
                });
            }
            
            // 显示物流详情
            showLogisticsDetails(order, result.data);
            
        } else {
            throw new Error(result.error || '获取物流信息失败');
        }
        
    } catch (error) {
        console.error('查询物流失败:', error);
        Swal.fire({
            icon: 'error',
            title: '查询失败',
            text: error.message,
            confirmButtonText: '确定'
        });
    }
}
    
// 显示物流详情
function showLogisticsDetails(order, trackingData) {
    // 构建物流跟踪HTML
    let trackingHtml = '';
    
    if (trackingData && trackingData.length > 0) {
        trackingHtml = `
            <div class="timeline">
                ${trackingData.map((item, index) => `
                    <div class="timeline-item ${index === 0 ? 'active' : ''}">
                        <div class="timeline-date">${item.time}</div>
                        <div class="timeline-content">
                            <div class="timeline-title">${item.context}</div>
                            <div class="timeline-location text-muted small">${item.location || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        trackingHtml = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-circle me-2"></i>暂无物流跟踪信息
            </div>
        `;
    }
    
    // 显示物流详情对话框
    Swal.fire({
        title: `物流详情 - ${order.expressCompany}`,
        html: `
            <div class="text-start mb-3">
                <div class="row mb-2">
                    <div class="col-4 text-muted">运单号:</div>
                    <div class="col-8">${order.waybillNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">订单号:</div>
                    <div class="col-8">${order.orderNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">收件人:</div>
                    <div class="col-8">${order.contact}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">当前状态:</div>
                    <div class="col-8">
                        <span class="badge ${order.isSigned ? 'bg-success' : 'bg-primary'}">
                            ${order.logisticsStatus.status}
                        </span>
                    </div>
                </div>
            </div>
            <hr>
            <div class="logistics-tracking">
                <h6 class="text-start mb-3">物流轨迹</h6>
                ${trackingHtml}
            </div>
            <style>
                .timeline {
                    position: relative;
                    padding-left: 30px;
                    text-align: left;
                }
                .timeline:before {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 0;
                    height: 100%;
                    width: 2px;
                    background: #e9ecef;
                }
                .timeline-item {
                    position: relative;
                    padding-bottom: 20px;
                }
                .timeline-item:before {
                    content: '';
                    position: absolute;
                    left: -30px;
                    top: 0;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #6c757d;
                    border: 2px solid #fff;
                }
                .timeline-item.active:before {
                    background: #198754;
                }
                .timeline-date {
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 5px;
                }
                .timeline-content {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                }
                .timeline-title {
                    font-weight: 500;
                }
            </style>
        `,
        width: '600px',
        confirmButtonText: '关闭',
        showCancelButton: false
    });
}
    
// 生成电子面单
async function generateElectronic(orderNumber) {
    try {
        // 查找订单
        const order = allOrders.find(o => o.orderNumber === orderNumber);
        if (!order) {
            throw new Error('未找到订单信息');
        }
        
        // 检查是否有快递公司
        if (!order.expressCompany) {
            throw new Error('请先选择快递公司');
        }
        
        // 检查快递100服务是否可用
        if (!window.kuaidi100Service) {
            throw new Error('快递100服务不可用，请确保已正确加载服务');
        }
        
        // 获取快递公司编码
        const companyCode = window.kuaidi100Service.getCompanyCode(order.expressCompany);
        if (!companyCode) {
            throw new Error('不支持的快递公司: ' + order.expressCompany);
        }
        
        // 显示加载状态
        Swal.fire({
            title: '生成电子面单',
            text: '正在生成电子面单，请稍候...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // 调用快递100生成电子面单接口
        const result = await window.kuaidi100Service.generateElectronic({
            com: companyCode,
            num: order.waybillNumber,
            phone: order.phone // 可选参数
        });
        
        if (result.success) {
            // 更新订单的电子面单状态
            order.electronicStatus = {
                status: result.status,
                latestUpdate: result.data && result.data.length > 0 ? result.data[0].context : ''
            };
            
            // 更新表格显示
            renderOrderTable();
            
            // 更新本地存储
            if (window.indexedDBService) {
                window.indexedDBService.updateOrder(orderNumber, {
                    electronicStatus: order.electronicStatus,
                    isSigned: order.isSigned,
                    receivingTime: order.receivingTime
                }).catch(error => {
                    console.error('更新本地存储失败:', error);
                });
            }
            
            // 显示电子面单
            showElectronicDetails(order, result.data);
            
        } else {
            throw new Error(result.error || '生成电子面单失败');
        }
        
    } catch (error) {
        console.error('生成电子面单失败:', error);
        Swal.fire({
            icon: 'error',
            title: '生成失败',
            text: error.message,
            confirmButtonText: '确定'
        });
    }
}
    
// 显示电子面单详情
function showElectronicDetails(order, trackingData) {
    // 构建电子面单HTML
    let electronicHtml = '';
    
    if (trackingData && trackingData.length > 0) {
        electronicHtml = `
            <div class="timeline">
                ${trackingData.map((item, index) => `
                    <div class="timeline-item ${index === 0 ? 'active' : ''}">
                        <div class="timeline-date">${item.time}</div>
                        <div class="timeline-content">
                            <div class="timeline-title">${item.context}</div>
                            <div class="timeline-location text-muted small">${item.location || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        electronicHtml = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-circle me-2"></i>暂无电子面单信息
            </div>
        `;
    }
    
    // 显示电子面单详情对话框
    Swal.fire({
        title: `电子面单 - ${order.expressCompany}`,
        html: `
            <div class="text-start mb-3">
                <div class="row mb-2">
                    <div class="col-4 text-muted">运单号:</div>
                    <div class="col-8">${order.waybillNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">订单号:</div>
                    <div class="col-8">${order.orderNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">收件人:</div>
                    <div class="col-8">${order.contact}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4 text-muted">当前状态:</div>
                    <div class="col-8">
                        <span class="badge ${order.isSigned ? 'bg-success' : 'bg-primary'}">
                            ${order.electronicStatus.status}
                        </span>
                    </div>
                </div>
            </div>
            <hr>
            <div class="electronic-tracking">
                <h6 class="text-start mb-3">电子面单轨迹</h6>
                ${electronicHtml}
            </div>
            <style>
                .timeline {
                    position: relative;
                    padding-left: 30px;
                    text-align: left;
                }
                .timeline:before {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 0;
                    height: 100%;
                    width: 2px;
                    background: #e9ecef;
                }
                .timeline-item {
                    position: relative;
                    padding-bottom: 20px;
                }
                .timeline-item:before {
                    content: '';
                    position: absolute;
                    left: -30px;
                    top: 0;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #6c757d;
                    border: 2px solid #fff;
                }
                .timeline-item.active:before {
                    background: #198754;
                }
                .timeline-date {
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 5px;
                }
                .timeline-content {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                }
                .timeline-title {
                    font-weight: 500;
                }
            </style>
        `,
        width: '600px',
        confirmButtonText: '关闭',
        showCancelButton: false
    });
}
    
// 绑定事件监听器
function bindTableButtonEvents() {
    // 生成运单按钮
    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.getAttribute('data-id');
            generateWaybill(orderNumber);
        });
    });
    
    // 打印运单按钮
    document.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.getAttribute('data-id');
            printWaybill(orderNumber);
        });
    });
    
    // 跟踪物流按钮
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.getAttribute('data-id');
            queryLogistics(orderNumber);
        });
    });
}

// 筛选订单数据
function filterOrders() {
    console.log('应用筛选条件:', currentFilters);
    
    // 从所有订单开始筛选
    let filtered = [...allOrders];
    
    // 应用搜索文本筛选
    if (currentFilters.searchText) {
        const searchText = currentFilters.searchText.toLowerCase();
        filtered = filtered.filter(order => {
            return (
                (order.orderNumber && order.orderNumber.toLowerCase().includes(searchText)) ||
                (order.waybillNumber && order.waybillNumber.toLowerCase().includes(searchText)) ||
                (order.contact && order.contact.toLowerCase().includes(searchText)) ||
                (order.phone && order.phone.includes(searchText)) ||
                (order.address && order.address.toLowerCase().includes(searchText))
            );
        });
    }
    
    // 应用日期范围筛选
    if (currentFilters.startDate) {
        const startDate = new Date(currentFilters.startDate);
        filtered = filtered.filter(order => new Date(order.orderTime) >= startDate);
    }
    
    if (currentFilters.endDate) {
        const endDate = new Date(currentFilters.endDate);
        endDate.setHours(23, 59, 59, 999); // 设置为当天的最后一毫秒
        filtered = filtered.filter(order => new Date(order.orderTime) <= endDate);
    }
    
    // 应用列值筛选
    Object.keys(currentFilters).forEach(key => {
        if (key !== 'searchText' && key !== 'startDate' && key !== 'endDate' && key !== 'specialFilter') {
            const values = currentFilters[key];
            
            if (Array.isArray(values) && values.length > 0) {
                filtered = filtered.filter(order => {
                    // 处理嵌套属性，如 logisticsStatus.status
                    let orderValue;
                    if (key === 'logisticsStatus') {
                        orderValue = order.logisticsStatus?.status;
                    } else if (key === 'isSigned') {
                        orderValue = order[key] ? '是' : '否';
                    } else {
                        orderValue = order[key];
                    }
                    
                    // 将值转换为字符串进行比较
                    return values.includes(String(orderValue)) || values.includes(Number(orderValue));
                });
            }
        }
    });
    
    // 应用特殊筛选条件
    if (currentFilters.specialFilter && typeof currentFilters.specialFilter === 'function') {
        filtered = filtered.filter(currentFilters.specialFilter);
    }
    
    // 更新筛选后的数据
    displayedOrders = filtered;
    
    // 显示当前页数据
    showPage(1); // 重置为第一页
}

// 渲染订单表格
function renderOrderTable() {
    console.log('渲染订单表格...');
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) {
        console.error('未找到表格主体元素');
        return;
    }
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 获取当前语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
    
    // 如果没有筛选结果
    if (!displayedOrders || displayedOrders.length === 0) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 16;
        noDataCell.className = 'text-center p-3';
        
        if (currentLang === 'zh') {
            noDataCell.textContent = '没有符合条件的订单数据';
        } else {
            noDataCell.textContent = 'No order data matching the criteria';
        }
        
        noDataRow.appendChild(noDataCell);
        tableBody.appendChild(noDataRow);

        // 更新分页信息
        document.getElementById('startRecord').textContent = '0';
        document.getElementById('endRecord').textContent = '0';
        document.getElementById('totalRecords').textContent = '0';
        
        // 更新分页控件
        updatePagination();
        return;
    }
    
    // 计算当前页显示的记录
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, displayedOrders.length);
    const ordersToDisplay = displayedOrders.slice(startIndex, endIndex);
    
    // 更新分页信息
    document.getElementById('startRecord').textContent = displayedOrders.length > 0 ? startIndex + 1 : 0;
    document.getElementById('endRecord').textContent = endIndex;
    document.getElementById('totalRecords').textContent = displayedOrders.length;
    
    // 填充表格
    ordersToDisplay.forEach(order => {
        // 创建行
        const row = document.createElement('tr');
        
        // 如果是重复数据，添加背景颜色
        if (order.isDuplicate) {
            row.classList.add('bg-warning-subtle');
            row.setAttribute('title', '此订单可能是重复数据');
            row.style.backgroundColor = '#fff3cd';
        }
        
        // 如果是新导入的数据，添加标记
        if (order.importTime) {
            const importDate = new Date(order.importTime);
            const now = new Date();
            const diffHours = (now - importDate) / (1000 * 60 * 60);
            
            // 如果是在24小时内导入的，显示"新"标记
            if (diffHours < 24) {
                row.classList.add('new-import');
                row.setAttribute('data-import-time', order.importTime);
            }
        }
        
        // 构建行内容
        row.innerHTML = `
            <td><input type="checkbox" class="order-checkbox" data-id="${order.orderNumber}"></td>
            <td>${order.orderTime || ''}</td>
            <td>${order.orderNumber || ''}</td>
            <td>${order.weight || '0'}${order.weight ? 'kg' : ''}</td>
            <td class="text-truncate" style="max-width: 200px;" title="${order.address || ''}">${order.address || ''}</td>
            <td>${order.contact || ''}</td>
            <td>${order.phone || ''}</td>
            <td>${order.expressCompany || ''}</td>
            <td>${order.waybillNumber || ''}</td>
            <td>${order.waybillTemplate || ''}</td>
            <td>${order.shippingFee ? '¥' + order.shippingFee.toFixed(2) : ''}</td>
            <td>${order.shippingTime || ''}</td>
            <td>
                ${order.logisticsStatus ? `
                    <span class="badge ${getStatusBadgeClass(order.logisticsStatus.status).badgeClass}">
                        ${order.logisticsStatus.status}
                    </span>
                    ${order.logisticsStatus.latestUpdate ? `
                        <div class="small text-muted mt-1">${order.logisticsStatus.latestUpdate}</div>
                    ` : ''}
                ` : '<span class="badge bg-secondary">待发货</span>'}
            </td>
            <td>${order.receivingTime || ''}</td>
            <td>
                <span class="badge ${order.isSigned ? 'bg-success' : 'bg-secondary'}">
                    ${order.isSigned ? (currentLang === 'zh' ? '已签收' : 'Signed') : (currentLang === 'zh' ? '未签收' : 'Unsigned')}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-primary generate-btn" 
                            data-id="${order.orderNumber}" ${order.waybillNumber ? 'disabled' : ''}>
                        ${currentLang === 'zh' ? '生成' : 'Gen'}
                    </button>
                    <button type="button" class="btn btn-outline-info print-btn" 
                            data-id="${order.orderNumber}" ${!order.waybillNumber ? 'disabled' : ''}>
                        ${currentLang === 'zh' ? '打印' : 'Print'}
                    </button>
                </div>
            </td>
        `;
        
        // 添加行到表格
        tableBody.appendChild(row);
    });
    
    console.log('订单表格渲染完成，显示了' + ordersToDisplay.length + '条记录');
    
    // 绑定按钮事件
    bindTableButtonEvents();
}

// 获取状态对应的Badge类
function getStatusBadgeClass(status) {
    if (!status) return { displayStatus: '待发货', badgeClass: 'bg-secondary' };
    
    // 状态映射表
    const statusMap = {
        '待发货': { en: 'Pending', class: 'bg-secondary' },
        '已发货': { en: 'Shipped', class: 'bg-primary' },
        '运输中': { en: 'In Transit', class: 'bg-info' },
        '派送中': { en: 'Out for Delivery', class: 'bg-warning' },
        '已签收': { en: 'Delivered', class: 'bg-success' },
        '异常': { en: 'Exception', class: 'bg-danger' },
        '退回中': { en: 'Returning', class: 'bg-dark' },
        '订单取消': { en: 'Cancelled', class: 'bg-dark' }
    };
    
    // 获取对应的样式类
    let badgeClass = 'bg-secondary';
    if (statusMap[status]) {
        badgeClass = statusMap[status].class;
    }
    
    return { displayStatus: status, badgeClass };
}

// 更新分页
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('未找到分页元素');
            return;
        }
        
    // 清空分页
    pagination.innerHTML = '';
    
    // 如果没有数据，显示空分页
    if (!displayedOrders || displayedOrders.length === 0) {
        pagination.innerHTML = `
            <li class="page-item disabled">
                <a class="page-link" href="#" data-page="prev">
                    <span class="lang-zh">上一页</span>
                    <span class="lang-en d-none">Previous</span>
                </a>
            </li>
            <li class="page-item active">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
            <li class="page-item disabled">
                <a class="page-link" href="#" data-page="next">
                    <span class="lang-zh">下一页</span>
                    <span class="lang-en d-none">Next</span>
                </a>
            </li>
        `;
        return;
    }
    
    // 计算总页数
    const totalPages = Math.ceil(displayedOrders.length / pageSize);
    
    // 构建分页
    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" data-page="prev">
            <span class="lang-zh">上一页</span>
            <span class="lang-en d-none">Previous</span>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // 页码按钮
    const maxVisiblePages = 5; // 最多显示5个页码
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 首页按钮
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
        pagination.appendChild(firstLi);
        
        // 省略号
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
            pagination.appendChild(ellipsisLi);
        }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item${i === currentPage ? ' active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        pagination.appendChild(pageLi);
    }
    
    // 尾页按钮
    if (endPage < totalPages) {
        // 省略号
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
            pagination.appendChild(ellipsisLi);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
        pagination.appendChild(lastLi);
    }
    
    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item${currentPage === totalPages ? ' disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" data-page="next">
            <span class="lang-zh">下一页</span>
            <span class="lang-en d-none">Next</span>
        </a>
    `;
    pagination.appendChild(nextLi);
    
    // 显示当前语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
    const langElements = document.querySelectorAll(`.lang-${currentLang}`);
    langElements.forEach(el => el.classList.remove('d-none'));
}

// 处理分页
function handlePagination(event) {
    event.preventDefault();
    
    if (!event.target.hasAttribute('data-page')) {
        return;
    }
    
    // 获取当前页码
    const page = event.target.getAttribute('data-page');
    
    // 处理页码
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        }
    } else if (page === 'next') {
        const totalPages = Math.ceil(displayedOrders.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
        }
    } else {
        currentPage = parseInt(page);
    }
    
    // 渲染表格
    renderOrderTable();
    
    // 更新分页
    updatePagination();
}

// 监听语言改变事件
document.addEventListener('languageChanged', function(e) {
    updateLanguageElements();
    
    // 重新渲染表格，应用新语言
    renderOrderTable();
});

// 初始化调用
document.addEventListener('DOMContentLoaded', function() {
    initPage().catch(error => {
        console.error('初始化失败:', error);
        showErrorMessage('系统初始化失败: ' + error.message);
    });
});

// 处理文件选择
function handleFileSelect(event) {
    console.log('文件选择事件触发');
    
    const file = event.target.files[0];
    if (!file) {
        console.warn('未选择文件或文件选择被取消');
        return;
    }
    
    console.log('选择了文件:', file.name, '类型:', file.type, '大小:', file.size + ' bytes');
    
    // 重置文件输入控件，允许重复选择同一个文件
    event.target.value = '';
    
    // 显示加载状态
    Swal.fire({
        title: '处理中',
        text: '正在导入Excel数据，请稍候...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // 检查XLSX库是否加载
    if (typeof XLSX === 'undefined') {
        console.log('XLSX库未加载，尝试加载...');
        
        // 动态加载XLSX库
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = function() {
            console.log('XLSX库加载成功，处理文件');
            processExcelFile(file);
        };
        script.onerror = function() {
            console.error('加载XLSX库失败');
            Swal.fire({
                icon: 'error',
                title: '导入失败',
                text: '无法加载Excel处理组件，请刷新页面后重试',
                confirmButtonText: '确定',
                footer: '<a href="../templates/订单发货明细导入模板.xlsx" download>下载标准导入模板</a>'
            });
        };
        document.head.appendChild(script);
    } else {
        console.log('XLSX库已加载，直接处理文件');
        processExcelFile(file);
    }
}

// 处理Excel文件
function processExcelFile(file) {
    console.log('开始处理Excel文件:', file.name, '类型:', file.type, '大小:', file.size + ' bytes');
    
    // 显示加载提示
    Swal.fire({
        title: '正在处理文件',
        text: '请稍候...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            console.log('文件读取完成，开始解析...');
            const data = e.target.result;
            
            let workbook;
            try {
                // 尝试解析为Excel文件
                workbook = XLSX.read(data, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd' });
                console.log('成功解析Excel文件，工作表:', workbook.SheetNames);
            } catch (parseError) {
                console.error('Excel解析失败:', parseError);
                throw new Error('无法解析Excel文件，请确保文件格式正确');
            }
            
            // 检查是否有工作表
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('Excel文件中没有找到工作表');
            }
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            console.log('使用第一个工作表:', firstSheetName);
            
            // 转换为JSON
            let jsonData;
            try {
                jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    raw: false, // 返回格式化后的字符串
                    dateNF: 'yyyy-mm-dd', // 日期格式
                    defval: '' // 空单元格的默认值
                });
                console.log('工作表已转换为JSON数据，行数:', jsonData.length);
            } catch (jsonError) {
                console.error('转换为JSON失败:', jsonError);
                throw new Error('无法将工作表内容转换为有效数据');
            }
            
            if (jsonData.length === 0) {
                throw new Error('文件中没有包含有效数据');
            }
            
            // 打印第一行数据用于调试
            console.log('第一行数据示例:', jsonData[0]);
            console.log('可用字段:', Object.keys(jsonData[0]));
            
            // 列出所有可能的中文表头映射，简化为只关注必要字段
            const headerMappings = {
                orderTime: ['订单时间', '下单时间', '订单日期', '创建时间', '日期', '时间', 'order time', 'date'],
                orderNumber: ['订单号', '订单编号', '订单ID', '订单序号', '单号', '编号', 'order number', 'order no', 'id'],
                address: ['地址', '收货地址', '收件地址', '送货地址', '客户地址', '详细地址', 'address'],
                contact: ['联系人', '收件人', '客户姓名', '收货人', '姓名', '客户', '收件人姓名', 'contact', 'name'],
                phone: ['联系方式', '电话', '手机号', '联系电话', '收件人电话', '手机', '电话号码', 'phone', 'tel', 'mobile']
            };
            
            // 扩展可选字段映射
            const optionalHeaderMappings = {
                weight: ['重量', '重量(kg)', '物品重量', '包裹重量', 'kg', 'weight'],
                expressCompany: ['快递公司', '物流公司', '配送公司', '快递', '物流', 'express company'],
                waybillNumber: ['运单号', '快递单号', '物流单号', '配送单号', '单号', 'waybill', 'tracking number'],
                waybillTemplate: ['模板', '运单模板', '快递模板', '打印模板', 'template'],
                shippingFee: ['运费', '配送费', '快递费', '物流费', 'shipping fee'],
                shippingTime: ['寄件时间', '发货时间', '寄出时间', '发出时间', 'shipping time'],
                logisticsStatus: ['物流状态', '配送状态', '快递状态', '运输状态', '状态', 'logistics status', 'status'],
                logisticsUpdate: ['最新更新', '物流更新', '状态更新', '物流信息', 'update info'],
                receivingTime: ['收件时间', '收货时间', '送达时间', '完成时间', 'receiving time'],
                isSigned: ['是否签收', '签收状态', '是否已签收', '签收', 'signed']
            };
            
            // 合并所有表头映射用于搜索
            const allHeaderMappings = { ...headerMappings, ...optionalHeaderMappings };
            
            // 自动检测表头并创建字段映射
            const fieldMapping = {};
            
            if (jsonData.length > 0) {
                const availableHeaders = Object.keys(jsonData[0]);
                console.log('检测到的表头:', availableHeaders);
                
                // 对每个目标字段，找到匹配的表头
                for (const [field, possibleHeaders] of Object.entries(allHeaderMappings)) {
                    for (const header of possibleHeaders) {
                        if (availableHeaders.some(h => h.toLowerCase() === header.toLowerCase())) {
                            // 找到精确匹配
                            fieldMapping[field] = availableHeaders.find(h => h.toLowerCase() === header.toLowerCase());
                            console.log(`字段 ${field} 映射到表头 "${fieldMapping[field]}"`);
            break;
                        }
                    }
                    // 如果没有精确匹配，尝试部分匹配
                    if (!fieldMapping[field]) {
                        for (const header of possibleHeaders) {
                            const partialMatch = availableHeaders.find(h => 
                                h.toLowerCase().includes(header.toLowerCase()) || 
                                header.toLowerCase().includes(h.toLowerCase())
                            );
                            if (partialMatch) {
                                fieldMapping[field] = partialMatch;
                                console.log(`字段 ${field} 通过部分匹配映射到表头 "${partialMatch}"`);
            break;
                            }
                        }
                    }
                }
            }
            
            console.log('最终字段映射:', fieldMapping);
            
            // 检查必须字段是否映射成功
            const requiredFields = ['orderTime', 'orderNumber', 'address', 'contact', 'phone'];
            const missingFields = requiredFields.filter(field => !fieldMapping[field]);
            
            if (missingFields.length > 0) {
                // 有必须字段缺失，但仍继续导入，转换为空字符串
                console.warn('缺少必须字段:', missingFields);
            }
            
            // 转换为系统可识别的格式，不验证必填字段，允许空值
            const importedOrders = [];
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                try {
                    // 使用字段映射获取值
                    const getFieldValue = (field, defaultValue = '') => {
                        const header = fieldMapping[field];
                        return header && row[header] !== undefined ? row[header] : defaultValue;
                    };
                    
                    // 创建订单对象，所有字段都可以为空
                    const orderItem = {
                        orderTime: getFieldValue('orderTime', ''),
                        orderNumber: getFieldValue('orderNumber', `导入订单-${Date.now()}-${i}`).toString(),
                        weight: parseFloat(getFieldValue('weight', '0')) || 0,
                        address: getFieldValue('address', '').toString(),
                        contact: getFieldValue('contact', '').toString(),
                        phone: getFieldValue('phone', '').toString(),
                        expressCompany: getFieldValue('expressCompany', '').toString(),
                        waybillNumber: getFieldValue('waybillNumber', '').toString(),
                        waybillTemplate: getFieldValue('waybillTemplate', '').toString(),
                        shippingFee: parseFloat(getFieldValue('shippingFee', '0')) || 0,
                        shippingTime: getFieldValue('shippingTime', ''),
                        logisticsStatus: {
                            status: getFieldValue('logisticsStatus', '待发货').toString(),
                            latestUpdate: getFieldValue('logisticsUpdate', '').toString()
                        },
                        receivingTime: getFieldValue('receivingTime', ''),
                        isSigned: getFieldValue('isSigned', '').toString().toLowerCase() === 'true' || 
                                  getFieldValue('isSigned', '').toString() === '1' || 
                                  getFieldValue('isSigned', '').toString() === '是'
                    };
                    
                    importedOrders.push(orderItem);
                } catch (rowError) {
                    console.error(`处理第${i+1}行数据出错:`, rowError, row);
                    // 继续处理下一行
                }
            }
            
            console.log('成功转换数据为订单格式，共提取了', importedOrders.length, '条订单');
            
            // 检查数据是否为空
            if (importedOrders.length === 0) {
                throw new Error('没有有效的数据可以导入');
            }
            
            // 将新导入的数据放在数组前面，而不是替换全部数据
            allOrders = [...importedOrders, ...allOrders];
            
            // 重要：同步更新window.ordersData
            window.ordersData = allOrders;
            
            // 应用筛选
            filterOrders();
            
            // 显示成功消息
            Swal.fire({
                icon: 'success',
                title: '导入成功',
                html: `
                    <div>成功导入 ${importedOrders.length} 条订单数据</div>
                    <div class="text-info mt-2">新导入的数据已排列在前面</div>
                `,
                confirmButtonText: '确定'
            });
            
        } catch (error) {
            console.error('处理Excel文件失败:', error);
            Swal.fire({
                icon: 'error',
                title: '导入失败',
                text: error.message || '文件格式不正确或读取过程中出错',
                confirmButtonText: '确定',
                footer: '<a href="../templates/订单发货明细导入模板.xlsx" download>下载标准导入模板</a>'
            });
        }
    };
    
    reader.onerror = function(ex) {
        console.error('读取文件失败:', ex);
        Swal.fire({
            icon: 'error',
            title: '导入失败',
            text: '读取文件时出错，请确保文件未损坏且有正确的读取权限',
            confirmButtonText: '确定'
        });
    };
    
    // 读取文件内容
    try {
        // 根据文件类型选择适当的读取方法
        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') || 
            file.name.endsWith('.xls')) {
            console.log('使用二进制模式读取Excel文件');
            reader.readAsBinaryString(file);
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            console.log('使用文本模式读取CSV文件');
            reader.readAsText(file);
        } else {
            console.log('未识别的文件类型，尝试以二进制模式读取');
            reader.readAsBinaryString(file);
        }
    } catch (error) {
        console.error('启动文件读取过程失败:', error);
        Swal.fire({
            icon: 'error',
            title: '导入失败',
            text: '无法读取文件，请确保文件有效且未损坏',
            confirmButtonText: '确定'
        });
    }
}

// 处理URL参数
function handleUrlParams() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter');
        
        if (filter) {
            console.log('检测到URL参数筛选:', filter);
            
            switch(filter) {
                case 'overdue':
                    // 超期订单筛选
                    currentFilters.logisticsStatus = '待发货';
                    // 找出下单时间超过7天的订单
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    currentFilters.specialFilter = (order) => {
                        const orderDate = new Date(order.orderTime);
                        return orderDate < sevenDaysAgo && order.logisticsStatus.status === '待发货';
                    };
                    break;
                    
                // 可以添加其他筛选条件
                default:
                    console.log('未知筛选参数:', filter);
            }
            
            // 应用筛选
            filterOrders();
        }
    } catch (error) {
        console.error('处理URL参数出错:', error);
    }
}

// 实现表头筛选功能
function setupColumnFilters() {
    console.log('设置表头筛选功能...');
    
    // 为所有带筛选图标的表头绑定点击事件
    document.querySelectorAll('.filter-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const column = this.getAttribute('data-column');
            console.log('点击了筛选图标:', column);
            
            // 获取列的所有唯一值
            const uniqueValues = getUniqueValues(column);
            
            // 显示筛选弹窗
            showFilterPopup(column, uniqueValues, this);
        });
    });
}

// 获取列的所有唯一值
function getUniqueValues(column) {
    const uniqueSet = new Set();
    
    allOrders.forEach(order => {
        let value = '';
        
        // 处理嵌套属性，如 logisticsStatus.status
        if (column === 'logisticsStatus') {
            value = order.logisticsStatus?.status || '';
        } else {
            value = order[column] || '';
        }
        
        // 格式化值以便显示
        if (value !== '') {
            if (column === 'shippingFee' || column === 'weight') {
                // 数字列保留原值，便于排序
                uniqueSet.add(Number(value));
            } else if (column === 'isSigned') {
                // 布尔类型特殊处理
                uniqueSet.add(value ? '是' : '否');
            } else {
                uniqueSet.add(String(value));
            }
        }
    });
    
    // 转换为数组并排序
    let uniqueArray = Array.from(uniqueSet);
    
    if (column === 'shippingFee' || column === 'weight') {
        // 数字排序
        uniqueArray.sort((a, b) => a - b);
    } else {
        // 字符串排序
        uniqueArray.sort();
    }
    
    return uniqueArray;
}

// 显示筛选弹窗
function showFilterPopup(column, values, element) {
    // 删除可能存在的旧弹窗
    const oldPopup = document.querySelector('.filter-popup');
    if (oldPopup) {
        oldPopup.remove();
    }
    
    // 创建新的筛选弹窗
    const popup = document.createElement('div');
    popup.className = 'filter-popup';
    
    // 获取当前语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
    
    // 获取列名的显示文本
    const columnLabel = getColumnLabel(column, currentLang);
    
    // 弹窗头部
    popup.innerHTML = `
        <div class="filter-header">
            <strong>${columnLabel}${currentLang === 'zh' ? '筛选' : ' Filter'}</strong>
            <button type="button" class="btn-close btn-sm" aria-label="Close"></button>
        </div>
        <div class="filter-content">
            <div class="mb-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="filterSelectAll" checked>
                    <label class="form-check-label" for="filterSelectAll">
                        ${currentLang === 'zh' ? '全选' : 'Select All'}
                    </label>
                </div>
            </div>
            <div class="filter-values" style="max-height: 200px; overflow-y: auto;">
                ${values.map((value, index) => `
                    <div class="form-check">
                        <input class="form-check-input filter-value" type="checkbox" id="filter-${column}-${index}" data-value="${value}" checked>
                        <label class="form-check-label" for="filter-${column}-${index}">
                            ${value === '' ? (currentLang === 'zh' ? '(空)' : '(Empty)') : value}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="filter-footer">
            <button type="button" class="btn btn-sm btn-secondary me-2" id="filterCancelBtn">
                ${currentLang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button type="button" class="btn btn-sm btn-primary" id="filterApplyBtn">
                ${currentLang === 'zh' ? '应用' : 'Apply'}
            </button>
        </div>
    `;
    
    // 插入弹窗到页面
    document.body.appendChild(popup);
    
    // 计算弹窗位置
    const rect = element.getBoundingClientRect();
    popup.style.top = (rect.bottom + window.scrollY) + 'px';
    popup.style.left = (rect.left + window.scrollX) + 'px';
    
    // 绑定关闭按钮事件
    popup.querySelector('.btn-close').addEventListener('click', () => {
        popup.remove();
    });
    
    // 绑定全选/取消全选事件
    const selectAllCheckbox = popup.querySelector('#filterSelectAll');
    selectAllCheckbox.addEventListener('change', function() {
        const checked = this.checked;
        popup.querySelectorAll('.filter-value').forEach(checkbox => {
            checkbox.checked = checked;
        });
    });
    
    // 绑定取消按钮事件
    popup.querySelector('#filterCancelBtn').addEventListener('click', () => {
        popup.remove();
    });
    
    // 绑定应用按钮事件
    popup.querySelector('#filterApplyBtn').addEventListener('click', () => {
        // 获取选中的值
        const checkedValues = [];
        popup.querySelectorAll('.filter-value:checked').forEach(checkbox => {
            checkedValues.push(checkbox.getAttribute('data-value'));
        });
        
        if (checkedValues.length === values.length) {
            // 如果全部选中，相当于没有筛选
            delete currentFilters[column];
        } else if (checkedValues.length > 0) {
            // 如果有选中的值，设置筛选条件
            currentFilters[column] = checkedValues;
        } else {
            // 如果没有选中的值，显示空结果
            currentFilters[column] = [];
        }
        
        // 应用筛选并关闭弹窗
        filterOrders();
        popup.remove();
        
        // 更新表头筛选图标，显示哪些列有筛选条件
        updateFilterIndicators();
    });
    
    // 点击页面其他区域关闭弹窗
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target) && e.target !== element) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    });
}

// 获取列名的显示文本
function getColumnLabel(column, lang) {
    const labelMap = {
        zh: {
            orderTime: '订单时间',
            orderNumber: '订单号',
            weight: '重量',
            address: '地址',
            contact: '联系人',
            phone: '联系方式',
            expressCompany: '快递公司',
            waybillNumber: '运单号',
            waybillTemplate: '模板',
            shippingFee: '运费',
            shippingTime: '寄件时间',
            logisticsStatus: '物流状态',
            receivingTime: '收件时间',
            isSigned: '是否签收'
        },
        en: {
            orderTime: 'Order Time',
            orderNumber: 'Order No.',
            weight: 'Weight',
            address: 'Address',
            contact: 'Contact',
            phone: 'Phone',
            expressCompany: 'Express',
            waybillNumber: 'Waybill No.',
            waybillTemplate: 'Template',
            shippingFee: 'Fee',
            shippingTime: 'Ship Time',
            logisticsStatus: 'Status',
            receivingTime: 'Receive Time',
            isSigned: 'Signed'
        }
    };
    
    return labelMap[lang][column] || column;
}

// 更新筛选指示器
function updateFilterIndicators() {
    // 将所有筛选指示器重置
    document.querySelectorAll('.th-with-filter').forEach(th => {
        th.classList.remove('filtered');
    });
    
    // 将当前有筛选的列标记为已筛选
    Object.keys(currentFilters).forEach(column => {
        if (column !== 'startDate' && column !== 'endDate' && column !== 'searchText' && column !== 'specialFilter') {
            const filterIcon = document.querySelector(`.filter-icon[data-column="${column}"]`);
            if (filterIcon) {
                const th = filterIcon.closest('th');
                if (th) {
                    th.classList.add('th-with-filter');
                    th.classList.add('filtered');
                }
            }
        }
    });
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化日期筛选功能
function initializeDateFilter() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDateBtn = document.getElementById('applyDateFilter');
    const clearDateBtn = document.getElementById('clearDateFilter');
    
    // 应用日期筛选按钮点击事件
    applyDateBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (startDate) {
            currentFilters.startDate = startDate;
        } else {
            delete currentFilters.startDate;
        }
        
        if (endDate) {
            currentFilters.endDate = endDate;
        } else {
            delete currentFilters.endDate;
        }
        
        filterOrders();
    });
    
    // 清除日期筛选按钮点击事件
    clearDateBtn.addEventListener('click', function() {
        startDateInput.value = '';
        endDateInput.value = '';
        delete currentFilters.startDate;
        delete currentFilters.endDate;
        filterOrders();
    });
}

// 更新页面语言
function updatePageLanguage() {
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
    console.log('当前语言:', currentLang);
    
    // 更新页面上的文本元素
    const langMap = {
        zh: {
            pageTitle: '订单列表',
            search: '搜索订单号、运单号、联系人、电话或地址',
            searchBtn: '搜索',
            clearSearch: '清除',
            dateRange: '日期范围',
            startDate: '开始日期',
            endDate: '结束日期',
            applyDate: '应用',
            clearDate: '清除',
            generateBtn: '生成订单',
            printBtn: '批量打印',
            orderTime: '订单时间',
            orderNumber: '订单号',
            weight: '重量',
            address: '地址',
            contact: '联系人',
            phone: '联系方式',
            expressCompany: '快递公司',
            waybillNumber: '运单号',
            waybillTemplate: '模板',
            shippingFee: '运费',
            shippingTime: '寄件时间',
            logisticsStatus: '物流状态',
            receivingTime: '收件时间',
            isSigned: '是否签收',
            actions: '操作'
        },
        en: {
            pageTitle: 'Order List',
            search: 'Search order no., waybill no., contact, phone or address',
            searchBtn: 'Search',
            clearSearch: 'Clear',
            dateRange: 'Date Range',
            startDate: 'Start Date',
            endDate: 'End Date',
            applyDate: 'Apply',
            clearDate: 'Clear',
            generateBtn: 'Generate Orders',
            printBtn: 'Batch Print',
            orderTime: 'Order Time',
            orderNumber: 'Order No.',
            weight: 'Weight',
            address: 'Address',
            contact: 'Contact',
            phone: 'Phone',
            expressCompany: 'Express',
            waybillNumber: 'Waybill No.',
            waybillTemplate: 'Template',
            shippingFee: 'Fee',
            shippingTime: 'Ship Time',
            logisticsStatus: 'Status',
            receivingTime: 'Receive Time',
            isSigned: 'Signed',
            actions: 'Actions'
        }
    };
    
    // 更新页面标题
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = langMap[currentLang].pageTitle;
    }
    
    // 更新搜索栏
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = langMap[currentLang].search;
    }
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.innerHTML = `<i class="fas fa-search"></i> ${langMap[currentLang].searchBtn}`;
    }
    
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.innerHTML = `<i class="fas fa-times"></i> ${langMap[currentLang].clearSearch}`;
    }
    
    // 更新日期筛选
    const dateRangeLabel = document.getElementById('dateRangeLabel');
    if (dateRangeLabel) {
        dateRangeLabel.textContent = langMap[currentLang].dateRange;
    }
    
    const startDate = document.getElementById('startDate');
    if (startDate) {
        startDate.placeholder = langMap[currentLang].startDate;
    }
    
    const endDate = document.getElementById('endDate');
    if (endDate) {
        endDate.placeholder = langMap[currentLang].endDate;
    }
    
    const applyDateFilter = document.getElementById('applyDateFilter');
    if (applyDateFilter) {
        applyDateFilter.textContent = langMap[currentLang].applyDate;
    }
    
    const clearDateFilter = document.getElementById('clearDateFilter');
    if (clearDateFilter) {
        clearDateFilter.textContent = langMap[currentLang].clearDate;
    }
    
    // 更新按钮
    const generateOrderBtn = document.getElementById('generateOrderBtn');
    if (generateOrderBtn) {
        generateOrderBtn.innerHTML = `<i class="fas fa-plus"></i> ${langMap[currentLang].generateBtn}`;
    }
    
    const batchPrintBtn = document.getElementById('batchPrintBtn');
    if (batchPrintBtn) {
        batchPrintBtn.innerHTML = `<i class="fas fa-print"></i> ${langMap[currentLang].printBtn}`;
    }
    
    // 更新表头
    document.querySelectorAll('table th').forEach(th => {
        const key = th.getAttribute('data-key');
        if (key && langMap[currentLang][key]) {
            // 保留筛选图标
            const filterIcon = th.querySelector('.filter-icon');
            if (filterIcon) {
                th.innerHTML = langMap[currentLang][key];
                th.appendChild(filterIcon);
            } else {
                th.textContent = langMap[currentLang][key];
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化语言
    updatePageLanguage();
    
    // 初始化订单数据
    loadOrders();
    
    // 初始化搜索功能
    initializeSearch();
    
    // 初始化日期筛选功能
    initializeDateFilter();
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', function() {
        updatePageLanguage();
        
        // 重新渲染订单表格，以更新语言
        showPage(currentPage);
    });
});

// 初始化搜索功能
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (!searchInput || !searchBtn) {
        console.error('搜索元素未找到，无法初始化搜索功能');
        return;
    }
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function() {
        currentFilters.searchText = searchInput.value.trim();
        filterOrders();
    });
    
    // 清除搜索按钮点击事件
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            delete currentFilters.searchText;
            filterOrders();
        });
    }
    
    // 回车键触发搜索
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// 渲染订单表格
function renderOrderTable(orders) {
    const tableBody = document.getElementById('orderTableBody');
    
    if (!tableBody) {
        console.error('未找到表格主体元素，无法渲染订单表格');
        return;
    }
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 遍历订单数据，生成表格行
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // 添加表格单元格
        row.innerHTML = `
            <td>${order.orderTime || '-'}</td>
            <td>${order.orderNumber || '-'}</td>
            <td>${order.weight || '-'}</td>
            <td title="${order.address || ''}">${order.address ? (order.address.length > 15 ? order.address.substring(0, 15) + '...' : order.address) : '-'}</td>
            <td>${order.contact || '-'}</td>
            <td>${order.phone || '-'}</td>
            <td>${order.expressCompany || '-'}</td>
            <td>${order.waybillNumber || '-'}</td>
            <td>${order.waybillTemplate || '-'}</td>
            <td>${order.shippingFee || '-'}</td>
            <td>${order.shippingTime || '-'}</td>
            <td>
                <span class="badge bg-${order.logisticsStatus?.color || 'secondary'}">
                    ${order.logisticsStatus?.status || '-'}
                </span>
            </td>
            <td>${order.receivingTime || '-'}</td>
            <td>${order.isSigned !== undefined ? (order.isSigned ? (currentLang === 'zh' ? '是' : 'Yes') : (currentLang === 'zh' ? '否' : 'No')) : '-'}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary btn-print" data-id="${order.id}" title="${currentLang === 'zh' ? '打印订单' : 'Print Order'}">
                        <i class="fas fa-print"></i>
                    </button>
                    ${order.logisticsStatus?.status === '待发货' ? `
                    <button type="button" class="btn btn-outline-success btn-ship" data-id="${order.id}" title="${currentLang === 'zh' ? '处理发货' : 'Process Shipping'}">
                        <i class="fas fa-shipping-fast"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 为打印按钮和处理发货按钮绑定事件
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            printOrder(orderId);
        });
    });
    
    document.querySelectorAll('.btn-ship').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            processShipping(orderId);
        });
    });
}

// 显示指定页码的数据
function showPage(page) {
    currentPage = page;
    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, displayedOrders.length);
    const pageData = displayedOrders.slice(start, end);
    
    renderOrderTable(pageData);
    updatePagination(displayedOrders.length);
}