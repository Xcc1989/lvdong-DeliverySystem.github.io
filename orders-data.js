// 订单列表示例数据
// 此文件定义了一个全局变量 ordersData，包含订单发货明细的示例数据

// 定义为全局变量，使其可以在不同的脚本中访问
window.ordersData = [
    {
        orderTime: '2025-03-17',
        orderNumber: 'ORD8957665901',
        weight: 4.7,
        address: '广东省深圳市南山区科技园19号',
        contact: '张S',
        phone: '1218300302',
        expressCompany: '百世快递',
        waybillNumber: 'SF9208572371431',
        waybillTemplate: '申通标准',
        shippingFee: 14.72,
        shippingTime: '2025-03-20',
        logisticsStatus: {
            status: '待发货',
            latestUpdate: '订单已确认，等待发货'
        },
        receivingTime: '',
        isSigned: false
    },
    {
        orderTime: '2025-03-13',
        orderNumber: 'ORD8957665902',
        weight: 3.4,
        address: '广东省深圳市南山区科技园63号',
        contact: '张U',
        phone: '1809542441',
        expressCompany: '韵达速递',
        waybillNumber: 'SF2698294594332',
        waybillTemplate: '1688',
        shippingFee: 12.09,
        shippingTime: '2025-03-14',
        logisticsStatus: {
            status: '已发货',
            latestUpdate: '包裹已由快递员揽收'
        },
        receivingTime: '2025-03-18',
        isSigned: true
    },
    {
        orderTime: '2025-02-27',
        orderNumber: 'ORD8957665903',
        weight: 1.1,
        address: '广东省深圳市南山区科技园89号',
        contact: '张X',
        phone: '1354851987',
        expressCompany: '申通快递',
        waybillNumber: 'SF8052690983773',
        waybillTemplate: '拼多多',
        shippingFee: 20.41,
        shippingTime: '2025-02-28',
        logisticsStatus: {
            status: '已发货',
            latestUpdate: '快件已交付快递公司'
        },
        receivingTime: '2025-03-04',
        isSigned: true
    },
    {
        orderTime: '2025-03-14',
        orderNumber: 'ORD8957665904',
        weight: 4.2,
        address: '广东省深圳市南山区科技园65号',
        contact: '张B',
        phone: '1478347238',
        expressCompany: '韵达速递',
        waybillNumber: 'SF9055125682654',
        waybillTemplate: '1688',
        shippingFee: 11.82,
        shippingTime: '2025-03-16',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '包裹已由收件人本人签收'
        },
        receivingTime: '2025-03-21',
        isSigned: true
    },
    {
        orderTime: '2025-03-22',
        orderNumber: 'ORD8957665905',
        weight: 7.8,
        address: '广东省深圳市南山区科技园98号',
        contact: '张X',
        phone: '1343859970',
        expressCompany: '天天快递',
        waybillNumber: 'SF5616548084824',
        waybillTemplate: '淘宝',
        shippingFee: 15.18,
        shippingTime: '2025-03-25',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '已签收，感谢使用天天快递'
        },
        receivingTime: '2025-03-27',
        isSigned: true
    },
    {
        orderTime: '2025-03-15',
        orderNumber: 'ORD8957665906',
        weight: 5.2,
        address: '广东省深圳市南山区科技园50号',
        contact: '张W',
        phone: '1935499339',
        expressCompany: '中通快递',
        waybillNumber: 'SF8039220569422',
        waybillTemplate: '顺丰标准',
        shippingFee: 24.20,
        shippingTime: '',
        logisticsStatus: {
            status: '待发货',
            latestUpdate: '订单已确认，等待发货'
        },
        receivingTime: '',
        isSigned: false
    },
    {
        orderTime: '2025-03-09',
        orderNumber: 'ORD8957665907',
        weight: 2.6,
        address: '广东省深圳市南山区科技园84号',
        contact: '张B',
        phone: '1992080128',
        expressCompany: '中通快递',
        waybillNumber: 'SF3054232534303',
        waybillTemplate: '菜鸟',
        shippingFee: 8.27,
        shippingTime: '2025-03-12',
        logisticsStatus: {
            status: '运输中',
            latestUpdate: '快件已到达【深圳转运中心】'
        },
        receivingTime: '',
        isSigned: false
    },
    {
        orderTime: '2025-03-18',
        orderNumber: 'ORD8957665908',
        weight: 2.4,
        address: '广东省深圳市南山区科技园12号',
        contact: '张W',
        phone: '1106679736',
        expressCompany: '圆通速递',
        waybillNumber: 'SF2367382802312',
        waybillTemplate: '京东',
        shippingFee: 11.59,
        shippingTime: '2025-03-21',
        logisticsStatus: {
            status: '已发货',
            latestUpdate: '快件已交付快递公司'
        },
        receivingTime: '2025-03-25',
        isSigned: true
    },
    {
        orderTime: '2025-03-17',
        orderNumber: 'ORD8957665909',
        weight: 6.6,
        address: '广东省深圳市南山区科技园33号',
        contact: '张N',
        phone: '1548286312',
        expressCompany: '圆通速递',
        waybillNumber: 'SF8797738152175',
        waybillTemplate: '申通标准',
        shippingFee: 16.57,
        shippingTime: '2025-03-20',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '包裹已由收件人本人签收'
        },
        receivingTime: '2025-03-22',
        isSigned: true
    },
    {
        orderTime: '2025-02-26',
        orderNumber: 'ORD8957665910',
        weight: 10.0,
        address: '广东省深圳市南山区科技园37号',
        contact: '张T',
        phone: '1296946681',
        expressCompany: '百世快递',
        waybillNumber: 'SF7926460025871',
        waybillTemplate: '菜鸟',
        shippingFee: 7.23,
        shippingTime: '2025-02-28',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '已签收，感谢使用百世快递'
        },
        receivingTime: '2025-03-04',
        isSigned: true
    },
    {
        orderTime: '2025-03-10',
        orderNumber: 'ORD8957665911',
        weight: 2.1,
        address: '广东省深圳市南山区科技园21号',
        contact: '张十三',
        phone: '1290012900',
        expressCompany: '顺丰速运',
        waybillNumber: 'SF9876543210',
        waybillTemplate: '标准模板',
        shippingFee: 23.5,
        shippingTime: '2025-03-10',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '客户已签收，签收人：家人代签'
        },
        receivingTime: '2025-03-12',
        isSigned: true
    },
    {
        orderTime: '2025-03-09',
        orderNumber: 'ORD8957665912',
        weight: 1.6,
        address: '广东省深圳市南山区科技园22号',
        contact: '李十四',
        phone: '1280012800',
        expressCompany: '中通快递',
        waybillNumber: 'ZT1234509876',
        waybillTemplate: '电子面单',
        shippingFee: 15.0,
        shippingTime: '2025-03-09',
        logisticsStatus: {
            status: '退回中',
            latestUpdate: '客户拒收，快件正在退回'
        },
        receivingTime: '',
        isSigned: false
    },
    {
        orderTime: '2025-03-08',
        orderNumber: 'ORD8957665913',
        weight: 3.7,
        address: '广东省深圳市南山区科技园23号',
        contact: '赵十五',
        phone: '1270012700',
        expressCompany: '圆通速递',
        waybillNumber: 'YT9876501234',
        waybillTemplate: '标准模板',
        shippingFee: 18.0,
        shippingTime: '2025-03-08',
        logisticsStatus: {
            status: '派送中',
            latestUpdate: '快件已到达深圳市南山区公司，快递员正在派送'
        },
        receivingTime: '',
        isSigned: false
    },
    {
        orderTime: '2025-03-07',
        orderNumber: 'ORD8957665914',
        weight: 2.9,
        address: '广东省深圳市南山区科技园24号',
        contact: '钱十六',
        phone: '1260012600',
        expressCompany: '韵达快递',
        waybillNumber: 'YD9876501234',
        waybillTemplate: '电子面单',
        shippingFee: 25.0,
        shippingTime: '2025-03-07',
        logisticsStatus: {
            status: '已签收',
            latestUpdate: '客户已签收，感谢您使用韵达快递'
        },
        receivingTime: '2025-03-09',
        isSigned: true
    },
    {
        orderTime: '2025-03-06',
        orderNumber: 'ORD8957665915',
        weight: 4.5,
        address: '广东省深圳市南山区科技园25号',
        contact: '孙十七',
        phone: '1250012500',
        expressCompany: '',
        waybillNumber: '',
        waybillTemplate: '',
        shippingFee: 0,
        shippingTime: '',
        logisticsStatus: {
            status: '订单取消',
            latestUpdate: '客户主动取消订单'
        },
        receivingTime: '',
        isSigned: false
    }
];

// 同时兼容CommonJS和浏览器环境
if (typeof window !== 'undefined') {
    // 浏览器环境下，已经通过window.ordersData赋值
    console.log('示例数据已加载到全局window.ordersData中，共' + window.ordersData.length + '条记录');
    // 同时也赋值给ordersData变量，增加兼容性
    var ordersData = window.ordersData;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境下
    module.exports = window.ordersData;
} 