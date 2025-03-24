# 服务组件说明文档

本文档介绍物流系统中的各个服务组件，包括其功能、使用方法和API。

## 服务组件概览

物流系统包含以下主要服务组件：

1. **IndexedDB本地存储服务**：提供本地数据存储功能
2. **快递100 API服务**：提供物流查询和电子面单功能
3. **维格表服务**：提供与维格表的数据同步功能
4. **仓储API服务**：提供与仓储系统的交互功能

## 1. IndexedDB本地存储服务

### 概述

IndexedDB本地存储服务(`indexedDBService.js`)提供了基于浏览器IndexedDB的本地数据存储功能，用于在断网或网络不稳定情况下保存订单数据，提高系统可靠性和响应速度。

### 主要功能

- 初始化和管理本地数据库
- 存储订单数据到本地
- 从本地检索订单数据
- 根据条件查询订单
- 更新和删除订单数据

### API说明

#### 初始化数据库

```javascript
// 服务初始化时自动执行，无需手动调用
await indexedDBService.ready; // 等待数据库准备就绪
```

#### 保存订单数据

```javascript
// 保存多个订单
const count = await indexedDBService.saveOrders(ordersArray);
console.log(`成功保存${count}条订单`);

// 保存单个订单
await indexedDBService.saveOrder(orderObject);
```

#### 检索订单数据

```javascript
// 获取所有订单
const allOrders = await indexedDBService.getOrders();

// 根据订单号获取订单
const order = await indexedDBService.getOrder('202401010001');

// 根据条件查询订单
const signedOrders = await indexedDBService.queryOrders({ isSigned: true });
const sfOrders = await indexedDBService.queryOrders({ expressCompany: '顺丰' });
const pendingOrders = await indexedDBService.queryOrders({ 'logisticsStatus.status': '待发货' });
```

#### 更新和删除订单

```javascript
// 更新订单信息
await indexedDBService.updateOrder('202401010001', {
    waybillNumber: 'SF1234567890',
    logisticsStatus: { status: '已发货' }
});

// 删除订单
await indexedDBService.deleteOrder('202401010001');

// 清空所有订单
await indexedDBService.clearOrders();
```

### 使用示例

```javascript
// 保存当前订单数据到本地
async function saveOrdersToLocal() {
    try {
        if (!window.indexedDBService) {
            throw new Error('本地存储服务不可用');
        }
        
        if (!allOrders || allOrders.length === 0) {
            throw new Error('没有可保存的订单数据');
        }
        
        const count = await window.indexedDBService.saveOrders(allOrders);
        alert(`成功保存${count}条订单数据到本地`);
    } catch (error) {
        console.error('保存订单失败:', error);
        alert('保存订单失败: ' + error.message);
    }
}
```

### 注意事项

- IndexedDB是基于浏览器的存储，不同浏览器或电脑间不会共享数据
- 浏览器清除缓存会导致IndexedDB数据丢失
- 大量数据存储可能会占用较多的本地存储空间
- IE浏览器可能不支持或部分支持IndexedDB功能

## 2. 快递100 API服务

### 概述

快递100 API服务(`kuaidi100Service.js`)提供了与快递100平台交互的功能，包括物流查询和电子面单生成。通过该服务，系统可以查询物流状态、生成电子面单并获取运单号。

### 主要功能

- 设置和管理快递100 API配置
- 查询物流状态和物流轨迹
- 订阅物流状态更新
- 生成电子面单
- 打印电子面单

### API说明

#### 配置管理

```javascript
// 设置快递100配置
kuaidi100Service.setConfig({
    key: '您的授权key',
    customer: '您的customer ID',
    secret: '您的secret'
});

// 获取快递公司编码
const code = kuaidi100Service.getCompanyCode('顺丰'); // 返回 'shunfeng'

// 获取电子面单模板ID
const templateId = kuaidi100Service.getTemplateId('shunfeng'); // 返回 'SF_1'
```

#### 物流查询

```javascript
// 查询物流状态
const result = await kuaidi100Service.queryTracking({
    com: 'shunfeng', // 快递公司编码
    num: 'SF1234567890', // 运单号
    phone: '1234' // 手机号后四位（顺丰必填）
});

if (result.success) {
    console.log('物流状态:', result.status);
    console.log('物流轨迹:', result.data);
}
```

#### 物流订阅

```javascript
// 订阅物流状态更新
const result = await kuaidi100Service.subscribe({
    com: 'shunfeng', // 快递公司编码
    num: 'SF1234567890', // 运单号
    callbackUrl: 'https://your-api.com/callback', // 回调URL
    phone: '1234' // 手机号后四位（可选）
});
```

#### 电子面单

```javascript
// 生成电子面单
const result = await kuaidi100Service.createElectronicOrder({
    partnerId: '快递账户', // 电子面单账户
    partnerKey: '快递密钥', // 电子面单密钥
    kuaidicom: 'shunfeng', // 快递公司编码
    recMan: { // 收件人信息
        name: '张三',
        mobile: '13812345678',
        address: '北京市海淀区...'
    },
    sendMan: { // 寄件人信息
        name: '李四',
        mobile: '13987654321',
        address: '上海市浦东新区...'
    },
    cargo: '文件', // 货物描述
    weight: '1', // 重量(kg)
    remark: '请小心轻放' // 备注
});

if (result.success) {
    console.log('运单号:', result.order.kuaidinum);
    // 打印电子面单
    result.order.doPrint();
}
```

### 使用示例

```javascript
// 查询物流示例
async function queryLogistics(orderNumber, expressCompany, waybillNumber, phone) {
    try {
        // 获取快递公司编码
        const companyCode = kuaidi100Service.getCompanyCode(expressCompany);
        if (!companyCode) {
            throw new Error(`不支持的快递公司: ${expressCompany}`);
        }
        
        // 查询物流
        const result = await kuaidi100Service.queryTracking({
            com: companyCode,
            num: waybillNumber,
            phone: phone // 部分快递公司需要
        });
        
        if (result.success) {
            // 更新订单物流状态
            updateOrderLogisticsStatus(orderNumber, result.status, result.data);
            // 显示物流信息
            showLogisticsInfo(result.data);
        } else {
            throw new Error(result.error || '物流查询失败');
        }
    } catch (error) {
        console.error('查询物流失败:', error);
        alert('查询物流失败: ' + error.message);
    }
}
```

### 注意事项

- 使用快递100 API需要有效的授权信息
- 部分快递公司查询要求填写手机号后四位
- 电子面单功能需要与快递公司签订协议并开通相应权限
- API接口有调用频率限制，请合理使用

## 3. 维格表服务

### 概述

维格表服务(`vikaService.js`)提供了与维格表API交互的功能，用于实现订单数据的云端存储和同步。通过该服务，系统可以将订单数据上传到维格表，也可以从维格表下载最新的订单数据。

### 主要功能

- 初始化维格表API连接
- 上传订单数据到维格表
- 从维格表获取订单数据
- 更新和删除维格表中的订单记录
- 字段映射和数据格式转换

### API说明

#### 初始化连接

```javascript
// 初始化维格表服务
vikaService.init({
    token: '您的API Token',
    spaceId: '您的空间ID',
    dataBaseId: '您的数据表ID'
});
```

#### 数据同步

```javascript
// 上传订单数据到维格表
const result = await vikaService.syncOrdersToVika(ordersArray);
console.log(`成功同步${result.successCount}条订单到维格表`);

// 从维格表获取订单数据
const orders = await vikaService.getOrdersFromVika(filters);
console.log(`从维格表获取了${orders.length}条订单`);
```

#### 记录管理

```javascript
// 创建订单记录
const recordId = await vikaService.createRecord(orderData);

// 更新订单记录
await vikaService.updateRecord(recordId, updatedData);

// 删除订单记录
await vikaService.deleteRecord(recordId);
```

#### 文件上传

```javascript
// 上传文件到维格表
const fileInfo = await vikaService.uploadFile(fileBlob, fileName);
console.log('文件URL:', fileInfo.url);
```

### 使用示例

```javascript
// 同步订单数据到维格表
async function syncOrdersToVika() {
    try {
        if (!allOrders || allOrders.length === 0) {
            throw new Error('没有可同步的订单数据');
        }
        
        // 开始同步
        const result = await vikaService.syncOrdersToVika(allOrders);
        
        if (result.success) {
            alert(`成功同步${result.successCount}条订单到维格表`);
        } else {
            throw new Error(result.error || '同步失败');
        }
    } catch (error) {
        console.error('维格表同步失败:', error);
        alert('维格表同步失败: ' + error.message);
    }
}
```

### 注意事项

- 使用维格表API需要有效的API Token
- 大量数据同步可能会较慢，建议分批同步
- 维格表API有调用频率限制
- 维格表字段类型与本地数据结构可能不完全匹配，需要转换

## 4. 仓储API服务

### 概述

仓储API服务(`warehouseService.js`)提供了与企业仓储系统交互的功能，用于获取库存信息、创建出库单和管理仓库物料。

### 主要功能

- 获取库存信息
- 创建出库单
- 查询物料信息
- 库存变更通知

### API说明

#### 库存查询

```javascript
// 查询商品库存
const stock = await warehouseService.getProductStock(productId);
console.log(`商品${productId}当前库存: ${stock}`);

// 查询库存详情
const stockDetails = await warehouseService.getStockDetails(productId);
```

#### 出库单管理

```javascript
// 创建出库单
const outboundId = await warehouseService.createOutbound({
    orderId: '202401010001',
    products: [
        { id: 'P001', quantity: 2 },
        { id: 'P002', quantity: 1 }
    ],
    warehouseId: 'WH001'
});

// 查询出库单状态
const status = await warehouseService.getOutboundStatus(outboundId);
```

### 使用示例

```javascript
// 创建出库单示例
async function createOutboundOrder(orderNumber, products) {
    try {
        // 创建出库单
        const outboundId = await warehouseService.createOutbound({
            orderId: orderNumber,
            products: products,
            warehouseId: 'WH001'
        });
        
        if (outboundId) {
            console.log('出库单创建成功:', outboundId);
            return outboundId;
        } else {
            throw new Error('创建出库单失败');
        }
    } catch (error) {
        console.error('创建出库单失败:', error);
        throw error;
    }
}
```

### 注意事项

- 仓储API服务需要有效的API认证
- 出库单创建后不能随意修改
- 库存变更通知可能存在延迟
- 物料编码需遵循系统规定的格式 