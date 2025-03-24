// 导出服务
class ExportService {
    // 将订单数据导出到维格表
    static async exportOrdersToVika(ordersData) {
        try {
            // 转换数据格式为维格表所需的格式
            const records = ordersData.map(order => ({
                fields: {
                    orderTime: order.orderTime,
                    orderNumber: order.orderNumber,
                    weight: order.weight,
                    address: order.address,
                    contact: order.contact,
                    phone: order.phone,
                    expressCompany: order.expressCompany,
                    waybillNumber: order.waybillNumber,
                    waybillTemplate: order.waybillTemplate,
                    shippingTime: order.shippingTime,
                    logisticsStatus: order.logisticsStatus.status,
                    logisticsUpdate: order.logisticsStatus.latestUpdate,
                    receivingTime: order.receivingTime,
                    isSigned: order.isSigned
                }
            }));

            // 先清空维格表中的所有记录
            const deleteResponse = await fetch(API_ENDPOINTS.getRecords, {
                method: 'DELETE',
                headers: API_HEADERS
            });

            if (!deleteResponse.ok) {
                throw new Error('清空维格表数据失败');
            }

            // 批量创建新记录
            const response = await fetch(API_ENDPOINTS.getRecords, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({
                    records: records
                })
            });

            if (!response.ok) {
                throw new Error('导出数据失败');
            }

            const result = await response.json();
            return result.data.records;
        } catch (error) {
            console.error('导出订单数据失败:', error);
            throw error;
        }
    }
}

// 导出服务
window.ExportService = ExportService; 