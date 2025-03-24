// 仓储API服务
class WarehouseService {
    // 从仓储系统导入发货明细
    static async importShipmentDetails() {
        try {
            // 调用仓储系统API获取发货明细
            const response = await fetch(API_ENDPOINTS.warehouseImport, {
                method: 'GET',
                headers: API_HEADERS
            });

            if (!response.ok) {
                throw new Error('从仓储系统导入数据失败');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('导入发货明细失败:', error);
            throw error;
        }
    }
}

// 导出服务
window.WarehouseService = WarehouseService; 