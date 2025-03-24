# 物流对账明细 - 页面说明文档

## 页面布局结构

### 1. 整体布局
- 采用 Bootstrap 5.3.0 框架
- 使用响应式布局,适配不同屏幕尺寸
- 页面分为左侧导航栏和右侧内容区

### 2. 对账汇总区域
- 顶部统计卡片区
  - 本月对账总金额
  - 待对账订单数
  - 已对账订单数
  - 异常订单数
  - 对账差异金额

### 3. 对账明细表格
- 表头信息
  - 订单号
  - 发货日期
  - 收货日期
  - 快递公司
  - 运单号
  - 重量(kg)
  - 计费重量
  - 运费金额
  - 对账状态
  - 差异原因
  - 操作按钮
- 分页功能
- 合计行

### 4. 对账操作区
- 批量导入对账单
- 手动添加对账记录
- 导出对账明细
- 批量确认对账

## 数据结构

### 1. 对账汇总数据
```typescript
interface ReconciliationSummary {
  monthlyAmount: number;        // 本月对账总金额
  pendingOrders: number;        // 待对账订单数
  reconciledOrders: number;     // 已对账订单数
  abnormalOrders: number;       // 异常订单数
  differenceAmount: number;     // 对账差异金额
}
```

### 2. 对账明细数据
```typescript
interface ReconciliationDetail {
  orderId: string;             // 订单号
  shippingDate: string;        // 发货日期
  receivingDate: string;       // 收货日期
  expressCompany: string;      // 快递公司
  waybillNumber: string;       // 运单号
  actualWeight: number;        // 实际重量
  chargeWeight: number;        // 计费重量
  freightAmount: number;       // 运费金额
  status: string;              // 对账状态
  difference: number;          // 差异金额
  diffReason: string;          // 差异原因
  remarks: string;             // 备注
}
```

### 3. 对账单导入数据
```typescript
interface ReconciliationImport {
  expressCompany: string;      // 快递公司
  billPeriod: string;         // 账单周期
  billNumber: string;         // 账单编号
  totalAmount: number;        // 总金额
  orderCount: number;         // 订单数量
  details: ReconciliationDetail[]; // 对账明细
}
```

## 功能需求

### 1. 对账管理
- 支持批量导入对账单
- 手动录入对账记录
- 自动匹配订单信息
- 差异订单标记处理

### 2. 筛选功能
- 时间范围筛选
- 快递公司筛选
- 对账状态筛选
- 差异类型筛选

### 3. 数据处理
- 自动计算差异金额
- 支持批量确认对账
- 差异订单处理流程
- 数据导出功能

### 4. 统计分析
- 对账差异分析
- 快递公司费用统计
- 月度费用趋势分析
- 自定义报表导出

## 接口规范

### 1. 获取对账汇总
```typescript
GET /api/reconciliation/summary
Query: {
  startDate: string;
  endDate: string;
}
Response: ReconciliationSummary
```

### 2. 获取对账明细
```typescript
GET /api/reconciliation/details
Query: {
  startDate: string;
  endDate: string;
  expressCompany?: string;
  status?: string;
  page: number;
  pageSize: number;
}
Response: {
  total: number;
  items: ReconciliationDetail[];
}
```

### 3. 导入对账单
```typescript
POST /api/reconciliation/import
Body: FormData // 包含对账单文件
Response: {
  success: boolean;
  message: string;
  importId: string;
  summary: ReconciliationImport;
}
```

### 4. 确认对账
```typescript
POST /api/reconciliation/confirm
Body: {
  orderIds: string[];
  remarks?: string;
}
Response: {
  success: boolean;
  message: string;
}
```

## 注意事项

1. 数据准确性
   - 自动核对订单信息
   - 差异金额双向校验
   - 保留对账历史记录
   - 防止重复对账

2. 性能优化
   - 大数据量分页处理
   - 后台异步导入处理
   - 定期数据归档

3. 异常处理
   - 导入数据格式校验
   - 差异原因必填管理
   - 异常订单处理流程
   - 手动干预机制

4. 权限控制
   - 对账确认权限
   - 差异处理权限
   - 数据导出权限
   - 操作日志记录 