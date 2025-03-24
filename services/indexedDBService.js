/**
 * IndexedDB服务 - 用于本地存储订单数据
 * 提供数据库初始化、订单存储和检索功能
 */
class IndexedDBService {
    constructor() {
        this.dbName = 'GreenLogisticsDB';
        this.dbVersion = 1;
        this.db = null;
        this.ready = this.initDB();
    }

    /**
     * 初始化数据库连接
     * @returns {Promise} 返回初始化完成的Promise
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            console.log(`初始化IndexedDB数据库: ${this.dbName}, 版本: ${this.dbVersion}`);
            
            // 打开数据库连接
            const request = indexedDB.open(this.dbName, this.dbVersion);

            // 处理数据库打开错误
            request.onerror = (event) => {
                console.error('打开数据库失败:', event.target.error);
                reject(event.target.error);
            };

            // 数据库升级事件（首次创建或版本更新时触发）
            request.onupgradeneeded = (event) => {
                console.log('数据库需要升级或创建');
                
                const db = event.target.result;
                
                // 如果存在旧的数据存储，则删除它
                if (db.objectStoreNames.contains('orders')) {
                    db.deleteObjectStore('orders');
                }
                
                // 创建订单数据存储，使用orderNumber作为键
                const orderStore = db.createObjectStore('orders', { keyPath: 'orderNumber' });
                
                // 创建索引方便查询
                orderStore.createIndex('orderTime', 'orderTime', { unique: false });
                orderStore.createIndex('expressCompany', 'expressCompany', { unique: false });
                orderStore.createIndex('logisticsStatus', 'logisticsStatus.status', { unique: false });
                orderStore.createIndex('isSigned', 'isSigned', { unique: false });
                
                console.log('数据库结构创建完成');
            };

            // 数据库成功打开事件
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库连接成功');
                
                // 监听数据库错误
                this.db.onerror = (event) => {
                    console.error('数据库错误:', event.target.error);
                };
                
                resolve(this.db);
            };
        });
    }

    /**
     * 保存多个订单
     * @param {Array} orders 订单数组
     * @returns {Promise<number>} 保存的订单数量
     */
    async saveOrders(orders) {
        await this.ready;

        if (!Array.isArray(orders) || orders.length === 0) {
            throw new Error('没有可保存的订单数据');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readwrite');
            const orderStore = transaction.objectStore('orders');
            
            let count = 0;
            
            // 处理事务完成
            transaction.oncomplete = () => {
                console.log(`成功保存${count}条订单`);
                resolve(count);
            };
            
            // 处理事务错误
            transaction.onerror = (event) => {
                console.error('保存订单事务失败:', event.target.error);
                reject(event.target.error);
            };
            
            // 逐条保存订单
            orders.forEach(order => {
                // 添加时间戳
                order.lastUpdated = new Date().toISOString();
                
                // 存储订单
                const request = orderStore.put(order);
                
                request.onsuccess = () => {
                    count++;
                };
                
                request.onerror = (event) => {
                    console.error(`保存订单 ${order.orderNumber} 失败:`, event.target.error);
                };
            });
        });
    }

    /**
     * 保存单个订单
     * @param {Object} order 订单对象
     * @returns {Promise} 保存结果Promise
     */
    async saveOrder(order) {
        await this.ready;

        if (!order || !order.orderNumber) {
            throw new Error('订单数据无效或缺少订单号');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readwrite');
            const orderStore = transaction.objectStore('orders');
            
            // 添加时间戳
            order.lastUpdated = new Date().toISOString();
            
            // 存储订单
            const request = orderStore.put(order);
            
            request.onsuccess = (event) => {
                console.log(`成功保存订单: ${order.orderNumber}`);
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                console.error(`保存订单 ${order.orderNumber} 失败:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取所有订单
     * @returns {Promise<Array>} 订单数组
     */
    async getOrders() {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readonly');
            const orderStore = transaction.objectStore('orders');
            const request = orderStore.getAll();
            
            request.onsuccess = (event) => {
                const orders = event.target.result;
                console.log(`成功获取${orders.length}条订单数据`);
                resolve(orders);
            };
            
            request.onerror = (event) => {
                console.error('获取订单失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 根据订单号获取订单
     * @param {string} orderNumber 订单号
     * @returns {Promise<Object>} 订单对象
     */
    async getOrder(orderNumber) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readonly');
            const orderStore = transaction.objectStore('orders');
            const request = orderStore.get(orderNumber);
            
            request.onsuccess = (event) => {
                const order = event.target.result;
                if (order) {
                    console.log(`成功获取订单: ${orderNumber}`);
                    resolve(order);
                } else {
                    console.log(`未找到订单: ${orderNumber}`);
                    resolve(null);
                }
            };
            
            request.onerror = (event) => {
                console.error(`获取订单 ${orderNumber} 失败:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 查询满足条件的订单
     * @param {Object} criteria 查询条件
     * @returns {Promise<Array>} 订单数组
     */
    async queryOrders(criteria = {}) {
        await this.ready;
        const orders = await this.getOrders();
        
        // 如果没有条件，返回所有订单
        if (Object.keys(criteria).length === 0) {
            return orders;
        }
        
        // 根据条件筛选订单
        return orders.filter(order => {
            for (const key in criteria) {
                // 处理嵌套属性，如 logisticsStatus.status
                if (key.includes('.')) {
                    const parts = key.split('.');
                    let value = order;
                    for (const part of parts) {
                        if (value === undefined || value === null) return false;
                        value = value[part];
                    }
                    
                    if (value !== criteria[key]) return false;
                } else if (order[key] !== criteria[key]) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * 删除订单
     * @param {string} orderNumber 订单号
     * @returns {Promise} 删除结果Promise
     */
    async deleteOrder(orderNumber) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readwrite');
            const orderStore = transaction.objectStore('orders');
            const request = orderStore.delete(orderNumber);
            
            request.onsuccess = () => {
                console.log(`成功删除订单: ${orderNumber}`);
                resolve(true);
            };
            
            request.onerror = (event) => {
                console.error(`删除订单 ${orderNumber} 失败:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 清空所有订单
     * @returns {Promise} 清空结果Promise
     */
    async clearOrders() {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readwrite');
            const orderStore = transaction.objectStore('orders');
            const request = orderStore.clear();
            
            request.onsuccess = () => {
                console.log('成功清空所有订单');
                resolve(true);
            };
            
            request.onerror = (event) => {
                console.error('清空订单失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 更新订单信息
     * @param {string} orderNumber 订单号
     * @param {Object} updatedFields 需要更新的字段
     * @returns {Promise} 更新结果Promise
     */
    async updateOrder(orderNumber, updatedFields) {
        await this.ready;

        if (!orderNumber || !updatedFields) {
            throw new Error('订单号和更新字段不能为空');
        }

        // 先获取现有订单
        const order = await this.getOrder(orderNumber);
        if (!order) {
            throw new Error(`未找到订单: ${orderNumber}`);
        }

        // 更新字段
        for (const key in updatedFields) {
            if (key.includes('.')) {
                // 处理嵌套字段，如 logisticsStatus.status
                const parts = key.split('.');
                let target = order;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!target[parts[i]]) {
                        target[parts[i]] = {};
                    }
                    target = target[parts[i]];
                }
                target[parts[parts.length - 1]] = updatedFields[key];
            } else {
                // 普通字段直接更新
                order[key] = updatedFields[key];
            }
        }

        // 更新最后修改时间
        order.lastUpdated = new Date().toISOString();

        // 保存更新后的订单
        return this.saveOrder(order);
    }
}

// 创建服务实例并导出
const indexedDBService = new IndexedDBService();
window.indexedDBService = indexedDBService; 