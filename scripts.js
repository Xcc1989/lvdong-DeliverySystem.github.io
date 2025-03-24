// 初始化三个API的基础配置
const API_CONFIG = {
  warehouse: 'https://api.warehouse.com/orders',
  express: 'https://courier-platform.com/api/shipping',
  logistics: 'https://logistics-tracking.com/v3/query'
};

// 并行获取所有数据
function generateMockData() {
  const mockOrders = [];
  for(let i=1; i<=15; i++) {
    const statusIndex = i % 3;
    const status = ['待发货','运输中','已签收'][statusIndex];
    const statusClass = ['bg-warning','bg-info','bg-success'][statusIndex];
    mockOrders.push({
      id: 'MOCK' + i.toString().padStart(3, '0'),
      date: `202407${i.toString().padStart(2, '0')}`,
      number: 'PO' + (1234567 + i).toString(),
      weight: `${i % 5 + 1}kg`,
      address: ['上海浦东','北京朝阳','广州天河','深圳南山'][i%4],
      contact: ['张','王','李','陈'][i%4] + '先生',
      phone: `13800${i.toString().padStart(6, '0')}`,
      status: status,
      status_class: statusClass,
      tracking_number: i > 5 ? `SF${Date.now().toString().slice(-6)}` : null
    });
  }
  return mockOrders;
}

async function loadAllData() {
  try {
    const mockOrders = generateMockData();
    // 仅使用模拟数据
    const pageData = mockOrders.slice((currentPage - 1) * 10, currentPage * 10);
    orderTbody.innerHTML = pageData.map(order => `
      <tr>
        <td>${order.date}</td>
        <td>${order.number}</td>
        <td>${order.weight}kg</td>
        <td>${order.address}</td>
        <td>${order.contact}</td>
        <td>${order.phone}</td>
        <td>${order.send_time || '-'}</td>
        <td><span class="badge ${order.status_class}">${order.status}</span></td>
        <td>${order.receive_time || '-'}</td>
        <td><span class="badge ${order.signed ? 'bg-success' : 'bg-secondary'}">${order.signed ? '已签收' : '未签收'}</span></td>
        <td>
          <select class="form-select form-select-sm" onchange="generateTrackingNumber('${order.id}', this.value)">
            ${shippingInfo.companies.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
          </select>
          <div class="mt-2 tracking-info" id="tracking-${order.id}">
            <div class="badge bg-secondary">${order.tracking_number || '待生成'}</div>
          </div>
          <button class="btn btn-sm btn-primary w-100 mt-1" onclick="printWaybill('${order.id}')">打印面单</button>
        </td>
      </tr>
    `).join('');
    // 更新分页控件
    const totalPages = Math.ceil(mockOrders.length / 10);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">上一页</a>
      </li>
      ${Array.from({length: totalPages}, (_, i) => `
        <li class="page-item ${i + 1 === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="changePage(${i + 1})">${i + 1}</a>
        </li>
      `).join('')}
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">下一页</a>
      </li>
    `;
    }

    // 更新快递信息
    try {
      const expressSelect = document.querySelector('select.form-select');
      expressSelect.innerHTML = shippingInfo.companies.map(company => 
        `<option value="${company.code}">${company.name}</option>`
      ).join('');

      // 更新物流状态
      const logisticsAlert = document.querySelector('.alert');
      logisticsAlert.innerHTML = `
        <div>寄件时间：${logistics.send_time}</div>
        <div>当前状态：${logistics.status}</div>
        <div>签收状态：${logistics.signed ? '已签收' : '运输中'}</div>
      `;
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }

// 分页切换函数
window.changePage = function(page) {
  currentPage = page;
  showPage(page);
};

// 初始化显示第一页
showPage(1);

// 初始化加载数据
document.addEventListener('DOMContentLoaded', loadAllData);



// 发货操作函数
function shipOrder(orderId) {
  // 实际应调用快递平台API生成电子面单
  console.log(`处理订单 ${orderId} 的发货操作`);
  alert('发货操作已触发，请检查快递单号');
}

// 为导入发货明细按钮添加点击事件
const importButton = document.getElementById('importButton');
importButton.addEventListener('click', async () => {
    try {
        const response = await fetch('https://api.warehouse.com/orders');
        const data = await response.json();
        console.log('导入的发货明细:', data);
    } catch (error) {
        console.error('导入发货明细失败:', error);
    }
});

// 添加缺失的全局变量声明
let currentPage = 1;



// 实现分页展示函数
function showPage(page) {
  currentPage = page;
  loadAllData();
}