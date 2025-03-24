# 物流动态看板 - 页面说明文档

## 页面布局结构

### 1. 整体布局
- 采用 Bootstrap 5.3.0 框架
- 使用响应式布局,适配不同屏幕尺寸
- 页面分为左侧导航栏和右侧内容区

### 2. 数据看板区域
- 顶部统计卡片区
  - 今日发货量
  - 本月发货量
  - 待发货订单
  - 运输中订单
  - 已签收订单
  - 异常订单

### 3. 图表展示区
- 发货量趋势图
  - 按日/周/月切换
  - 显示发货量变化趋势
  - 支持时间范围选择
- 快递公司占比图
  - 饼图展示各快递公司占比
  - 显示具体数量和百分比
- 物流状态分布图
  - 展示各状态订单数量
  - 包含待发货/运输中/已签收/异常等状态

### 4. 实时物流动态
- 最新物流状态列表
  - 显示最近 50 条物流状态更新
  - 包含订单号/状态/时间等信息
  - 支持实时更新
- 异常订单提醒
  - 显示所有异常状态订单
  - 高亮显示紧急异常

## 数据结构

### 1. 统计数据
```typescript
interface Statistics {
  todayShipments: number;      // 今日发货量
  monthlyShipments: number;    // 本月发货量
  pendingOrders: number;       // 待发货订单数
  inTransitOrders: number;     // 运输中订单数
  deliveredOrders: number;     // 已签收订单数
  abnormalOrders: number;      // 异常订单数
}
```

### 2. 趋势数据
```typescript
interface TrendData {
  date: string;               // 日期
  shipments: number;          // 发货量
  deliveryRate: number;       // 签收率
  abnormalRate: number;       // 异常率
}
```

### 3. 快递公司数据
```typescript
interface CourierData {
  company: string;            // 快递公司名称
  shipments: number;          // 发货量
  percentage: number;         // 占比
  avgDeliveryTime: number;    // 平均配送时间(小时)
}
```

### 4. 物流动态数据
```typescript
interface LogisticsUpdate {
  orderId: string;            // 订单号
  status: string;             // 物流状态
  updateTime: string;         // 更新时间
  location: string;           // 当前位置
  isAbnormal: boolean;        // 是否异常
  details: string;            // 详细信息
}
```

## 功能需求

### 1. 数据展示
- 实时更新统计数据
- 支持多维度数据分析
- 图表交互功能
- 数据导出功能

### 2. 筛选功能
- 时间范围筛选
- 快递公司筛选
- 物流状态筛选
- 异常类型筛选

### 3. 图表功能
- 支持图表数据下钻
- 图表联动分析
- 自定义图表显示

### 4. 实时监控
- 物流状态实时更新
- 异常订单实时提醒
- 支持手动刷新

## 接口规范

### 1. 获取统计数据
```typescript
GET /api/logistics/statistics
Response: Statistics
```

### 2. 获取趋势数据
```typescript
GET /api/logistics/trends
Query: {
  startDate: string;
  endDate: string;
  type: 'day' | 'week' | 'month';
}
Response: TrendData[]
```

### 3. 获取快递公司数据
```typescript
GET /api/logistics/couriers
Response: CourierData[]
```

### 4. 获取物流动态
```typescript
GET /api/logistics/updates
Query: {
  limit: number;
  offset: number;
}
Response: LogisticsUpdate[]
```

## 注意事项

1. 数据更新频率
   - 统计数据：5分钟更新一次
   - 趋势图表：30分钟更新一次
   - 物流动态：实时更新

2. 性能优化
   - 使用数据缓存
   - 按需加载图表
   - 分页加载物流动态

3. 异常处理
   - 网络异常重试机制
   - 数据加载失败提示
   - 异常订单高亮显示

4. 用户体验
   - 添加加载动画
   - 图表交互响应及时
   - 提供操作引导 