/**
 * 快递100 API服务
 * 提供物流查询和电子面单功能
 */
class Kuaidi100Service {
    constructor() {
        // 配置参数
        this.config = {
            key: '', // 授权key
            customer: '', // 快递100分配的customer
            secret: '' // 签名加密串
        };
        
        // API地址
        this.apiUrls = {
            query: 'https://poll.kuaidi100.com/poll/query.do', // 实时查询接口
            subscribe: 'https://poll.kuaidi100.com/poll', // 订阅接口
            order: 'https://poll.kuaidi100.com/eorderapi.do' // 电子面单接口
        };
        
        // 快递公司编码映射
        this.companyMap = {
            '顺丰': 'shunfeng',
            '中通': 'zhongtong',
            '申通': 'shentong',
            '圆通': 'yuantong',
            '韵达': 'yunda',
            '邮政': 'youzhengguonei',
            'EMS': 'ems',
            '百世': 'huitongkuaidi',
            '京东': 'jd',
            '德邦': 'debangwuliu',
            '天天': 'tiantian'
            // 可根据需要添加更多快递公司
        };
        
        // 模板ID映射（用于电子面单）
        this.templateMap = {
            'shunfeng': 'SF_1', // 顺丰标准模板
            'zhongtong': 'ZTO_1', // 中通标准模板
            'shentong': 'STO_1', // 申通标准模板
            'yuantong': 'YTO_1', // 圆通标准模板
            'yunda': 'YD_1', // 韵达标准模板
            'youzhengguonei': 'YZ_1', // 邮政标准模板
            'ems': 'EMS_1', // EMS标准模板
            'huitongkuaidi': 'HTKY_1', // 百世标准模板
            'jd': 'JD_1', // 京东标准模板
            'debangwuliu': 'DBL_1', // 德邦标准模板
            'tiantian': 'HHTT_1' // 天天标准模板
            // 可根据需要添加更多模板
        };
        
        // 从本地存储加载配置
        this.loadConfigFromStorage();
        
        console.log('快递100服务初始化完成');
    }
    
    /**
     * 设置配置参数
     * @param {Object} config 配置对象
     */
    setConfig(config) {
        if (!config) return;
        
        // 更新配置
        if (config.key) this.config.key = config.key;
        if (config.customer) this.config.customer = config.customer;
        if (config.secret) this.config.secret = config.secret;
        
        // 保存配置到本地存储
        this.saveConfigToStorage();
        
        console.log('快递100配置已更新');
    }
    
    /**
     * 从本地存储加载配置
     */
    loadConfigFromStorage() {
        try {
            const key = localStorage.getItem('kuaidi100_key');
            const customer = localStorage.getItem('kuaidi100_customer');
            
            if (key) this.config.key = key;
            if (customer) this.config.customer = customer;
            
            // 出于安全考虑，不从本地存储加载secret
            
            console.log('从本地存储加载快递100配置');
        } catch (error) {
            console.error('从本地存储加载快递100配置失败:', error);
        }
    }
    
    /**
     * 保存配置到本地存储
     */
    saveConfigToStorage() {
        try {
            if (this.config.key) localStorage.setItem('kuaidi100_key', this.config.key);
            if (this.config.customer) localStorage.setItem('kuaidi100_customer', this.config.customer);
            
            // 出于安全考虑，不保存secret到本地存储
            
            console.log('快递100配置已保存到本地存储');
        } catch (error) {
            console.error('保存快递100配置到本地存储失败:', error);
        }
    }
    
    /**
     * 获取快递公司编码
     * @param {string} companyName 快递公司名称
     * @returns {string} 快递公司编码
     */
    getCompanyCode(companyName) {
        return this.companyMap[companyName] || '';
    }
    
    /**
     * 获取电子面单模板ID
     * @param {string} companyCode 快递公司编码
     * @returns {string} 模板ID
     */
    getTemplateId(companyCode) {
        return this.templateMap[companyCode] || '';
    }
    
    /**
     * 查询物流状态
     * @param {Object} params 查询参数
     * @returns {Promise<Object>} 查询结果
     */
    async queryTracking(params) {
        try {
            // 检查必要参数
            if (!params.com) throw new Error('缺少快递公司编码(com)参数');
            if (!params.num) throw new Error('缺少运单号(num)参数');
            
            // 检查配置是否完整
            if (!this.config.key) throw new Error('缺少授权key，请先设置快递100 API参数');
            
            // 构建请求参数
            const requestData = {
                com: params.com, // 快递公司编码
                num: params.num, // 快递单号
                phone: params.phone || '', // 手机号（顺丰单号必填，其他选填）
                from: params.from || '', // 出发地城市
                to: params.to || '', // 目的地城市
                resultv2: 1 // 开启行政区域解析
            };
            
            // 生成签名
            const sign = this.generateSign(params.com, params.num);
            
            // 构建请求体
            const postData = {
                customer: this.config.customer,
                sign: sign,
                param: JSON.stringify(requestData)
            };
            
            // 发送请求
            const response = await fetch(this.apiUrls.query, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.convertToFormData(postData)
            });
            
            // 解析响应
            const result = await response.json();
            
            // 处理响应结果
            if (result.status === '200') {
                return {
                    success: true,
                    state: result.state, // 物流状态码
                    status: this.parseState(result.state), // 物流状态文本
                    data: result.data, // 物流轨迹
                    logistics: result.logistics, // 物流公司信息
                    isCheck: result.ischeck === '1' // 是否签收
                };
            } else {
                throw new Error(result.message || '查询物流信息失败');
            }
            
        } catch (error) {
            console.error('查询物流状态失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 订阅物流状态更新
     * @param {Object} params 订阅参数
     * @returns {Promise<Object>} 订阅结果
     */
    async subscribe(params) {
        try {
            // 检查必要参数
            if (!params.com) throw new Error('缺少快递公司编码(com)参数');
            if (!params.num) throw new Error('缺少运单号(num)参数');
            if (!params.callbackUrl) throw new Error('缺少回调URL(callbackUrl)参数');
            
            // 检查配置是否完整
            if (!this.config.key) throw new Error('缺少授权key，请先设置快递100 API参数');
            if (!this.config.customer) throw new Error('缺少customer，请先设置快递100 API参数');
            
            // 构建请求参数
            const requestData = {
                company: params.com, // 快递公司编码
                number: params.num, // 快递单号
                from: params.from || '', // 出发地城市
                to: params.to || '', // 目的地城市
                key: this.config.key, // 授权key
                parameters: {
                    callbackurl: params.callbackUrl, // 回调URL
                    phone: params.phone || '', // 手机号
                    orderid: params.orderId || '', // 订单ID
                    salt: params.salt || '' // 加密串
                }
            };
            
            // 构建请求体
            const postData = {
                schema: 'json',
                param: JSON.stringify(requestData)
            };
            
            // 发送请求
            const response = await fetch(this.apiUrls.subscribe, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.convertToFormData(postData)
            });
            
            // 解析响应
            const result = await response.json();
            
            // 处理响应结果
            if (result.result === true) {
                return {
                    success: true,
                    message: result.message,
                    status: '订阅成功'
                };
            } else {
                throw new Error(result.message || '订阅物流信息失败');
            }
            
        } catch (error) {
            console.error('订阅物流状态失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 创建电子面单
     * @param {Object} params 电子面单参数
     * @returns {Promise<Object>} 创建结果
     */
    async createElectronicOrder(params) {
        try {
            // 检查必要参数
            if (!params.kuaidicom) throw new Error('缺少快递公司编码(kuaidicom)参数');
            if (!params.recMan || !params.recMan.name || !params.recMan.mobile || !params.recMan.address) {
                throw new Error('收件人信息不完整');
            }
            if (!params.sendMan || !params.sendMan.name || !params.sendMan.mobile || !params.sendMan.address) {
                throw new Error('寄件人信息不完整');
            }
            
            // 检查配置是否完整
            if (!this.config.key) throw new Error('缺少授权key，请先设置快递100 API参数');
            if (!this.config.customer) throw new Error('缺少customer，请先设置快递100 API参数');
            
            // 构建请求参数
            const requestData = {
                method: 'order.submit', // 方法名
                t: Date.now(), // 时间戳
                key: this.config.key, // 授权key
                data: {
                    kuaidicom: params.kuaidicom, // 快递公司编码
                    partnerId: params.partnerId || '', // 电子面单账号
                    partnerKey: params.partnerKey || '', // 电子面单密钥
                    net: params.net || '', // 收件网点
                    recMan: params.recMan, // 收件人信息
                    sendMan: params.sendMan, // 寄件人信息
                    cargo: params.cargo || '货物', // 货物名称
                    weight: params.weight || '1', // 货物重量(kg)
                    count: params.count || '1', // 包裹数量
                    payment: params.payment || 'SHIPPER', // 支付方式 SHIPPER-寄付 CONSIGNEE-到付
                    remark: params.remark || '', // 备注
                    tempid: this.getTemplateId(params.kuaidicom) // 电子面单模板ID
                }
            };
            
            // 生成签名
            const sign = this.generateOrderSign(JSON.stringify(requestData.data));
            
            // 构建请求体
            const postData = {
                method: requestData.method,
                key: requestData.key,
                t: requestData.t,
                sign: sign,
                param: JSON.stringify(requestData.data)
            };
            
            // 发送请求
            const response = await fetch(this.apiUrls.order, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.convertToFormData(postData)
            });
            
            // 解析响应
            const result = await response.json();
            
            // 处理响应结果
            if (result.status === '200' && result.data && result.data.order) {
                // 为订单添加打印方法
                result.data.order.doPrint = () => this.printOrder(result.data.template);
                
                return {
                    success: true,
                    order: result.data.order, // 订单信息
                    template: result.data.template, // 电子面单模板
                    templateType: result.data.templateType, // 模板类型
                    status: '创建成功'
                };
            } else {
                throw new Error(result.message || '创建电子面单失败');
            }
            
        } catch (error) {
            console.error('创建电子面单失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 打印电子面单
     * @param {string} templateHtml 电子面单HTML模板
     */
    printOrder(templateHtml) {
        if (!templateHtml) {
            console.error('缺少电子面单模板，无法打印');
            return;
        }
        
        try {
            // 创建打印窗口
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('请允许弹出窗口，以便打印电子面单');
                return;
            }
            
            // 写入HTML内容
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>电子面单打印</title>
                    <style>
                        body { margin: 0; padding: 0; }
                    </style>
                </head>
                <body>
                    ${templateHtml}
                    <script>
                        // 自动打印并关闭窗口
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            
            // 关闭文档写入
            printWindow.document.close();
            
        } catch (error) {
            console.error('打印电子面单失败:', error);
            alert('打印电子面单失败: ' + error.message);
        }
    }
    
    /**
     * 生成签名
     * @param {string} company 快递公司编码
     * @param {string} number 运单号
     * @returns {string} 签名
     */
    generateSign(company, number) {
        const params = `${this.config.key}${company}${number}`;
        return this.md5(params);
    }
    
    /**
     * 生成电子面单签名
     * @param {string} data 请求数据
     * @returns {string} 签名
     */
    generateOrderSign(data) {
        const params = `${data}${this.config.secret}${this.config.key}`;
        return this.md5(params).toUpperCase();
    }
    
    /**
     * MD5加密
     * @param {string} string 要加密的字符串
     * @returns {string} MD5加密结果
     */
    md5(string) {
        // 由于浏览器环境可能不支持直接使用md5，这里可以使用第三方库
        // 这里使用一个简单的替代方案，实际使用时请替换成真实的md5实现
        console.warn('请替换为真实的MD5实现');
        
        // 简单的字符串哈希函数（仅用于演示，不是真正的MD5）
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 转换为16进制字符串
        return (hash >>> 0).toString(16).padStart(32, '0');
    }
    
    /**
     * 将对象转换为表单数据
     * @param {Object} data 要转换的数据对象
     * @returns {string} URL编码的表单数据
     */
    convertToFormData(data) {
        const formData = new URLSearchParams();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        return formData.toString();
    }
    
    /**
     * 解析物流状态码
     * @param {string} state 状态码
     * @returns {string} 状态文本
     */
    parseState(state) {
        const stateMap = {
            '0': '暂无轨迹',
            '1': '已揽收',
            '2': '运输中',
            '3': '已签收',
            '4': '问题件',
            '5': '派送中',
            '6': '退回中'
        };
        
        return stateMap[state] || '未知状态';
    }
}

// 创建服务实例并导出
const kuaidi100Service = new Kuaidi100Service();
window.kuaidi100Service = kuaidi100Service; 