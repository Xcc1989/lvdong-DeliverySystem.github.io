// API配置文件
const API_CONFIG = {
    // 快递100 API配置
    KUAIDI100: {
        // 快递100客户授权key
        KEY: '您的快递100客户授权key',
        // 快递100客户ID
        CUSTOMER: '您的快递100客户ID',
        // 快递100账号密钥
        SECRET: '您的快递100账号密钥',
        // API基础URL
        BASE_URL: 'https://api.kuaidi100.com/v1',
        // 电子面单模板列表
        TEMPLATES: {
            'SF': 'SF_1', // 顺丰电子面单模板ID
            'YTO': 'YTO_1', // 圆通电子面单模板ID
            'ZTO': 'ZTO_1', // 中通电子面单模板ID
            'YD': 'YD_1', // 韵达电子面单模板ID
            'STO': 'STO_1', // 申通电子面单模板ID
            'JD': 'JD_1'  // 京东快递电子面单模板ID
        },
        // 快递公司编码
        COMPANY_CODES: {
            '顺丰速运': 'SF',
            '圆通速递': 'YTO',
            '中通快递': 'ZTO',
            '韵达快递': 'YD',
            '申通快递': 'STO',
            'EMS': 'EMS',
            '百世快递': 'HTKY',
            '京东物流': 'JD'
        }
    },
    
    // 仓储API配置
    WAREHOUSE: {
        // API基础URL
        BASE_URL: 'https://api.warehouse.example.com',
        // API密钥
        API_KEY: '您的仓储系统API密钥',
        // 终端点配置
        ENDPOINTS: {
            // 获取订单列表
            ORDERS: '/orders',
            // 获取库存信息
            INVENTORY: '/inventory',
            // 创建出库单
            CREATE_OUTBOUND: '/outbound',
            // 确认出库
            CONFIRM_OUTBOUND: '/outbound/confirm'
        }
    }
};

// API端点URL构建
const API_ENDPOINTS = {
    // 快递100 API端点
    KUAIDI100: {
        // 物流查询接口
        query: 'https://poll.kuaidi100.com/poll/query.do',
        // 物流订阅接口
        subscribe: 'https://poll.kuaidi100.com/poll',
        // 电子面单接口
        electronic: 'https://order.kuaidi100.com/order/electronic',
        // 快递公司查询
        companies: 'https://poll.kuaidi100.com/company.do'
    },
    
    // 仓储API端点
    WAREHOUSE: {
        getOrders: `${API_CONFIG.WAREHOUSE.BASE_URL}${API_CONFIG.WAREHOUSE.ENDPOINTS.ORDERS}`,
        getInventory: `${API_CONFIG.WAREHOUSE.BASE_URL}${API_CONFIG.WAREHOUSE.ENDPOINTS.INVENTORY}`,
        createOutbound: `${API_CONFIG.WAREHOUSE.BASE_URL}${API_CONFIG.WAREHOUSE.ENDPOINTS.CREATE_OUTBOUND}`,
        confirmOutbound: `${API_CONFIG.WAREHOUSE.BASE_URL}${API_CONFIG.WAREHOUSE.ENDPOINTS.CONFIRM_OUTBOUND}`
    }
};

// 快递100错误处理
const KUAIDI100_ERROR_MESSAGES = {
    '400': '请求参数错误',
    '401': '未授权，请检查API密钥',
    '403': '拒绝访问，请检查IP白名单',
    '429': '请求过于频繁，请稍后再试',
    '500': '服务器错误，请稍后重试',
    '503': '服务暂时不可用，请稍后重试'
};

// 导出配置
if (typeof module !== 'undefined') {
    module.exports = {
        API_CONFIG,
        API_ENDPOINTS,
        KUAIDI100_ERROR_MESSAGES
    };
}

// 浏览器环境下的全局配置
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.API_ENDPOINTS = API_ENDPOINTS;
    window.KUAIDI100_ERROR_MESSAGES = KUAIDI100_ERROR_MESSAGES;
} 