// Toast提示组件
class Toast {
    constructor() {
        this.createToastContainer();
    }

    // 创建Toast容器
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
        this.container = container;
    }

    // 显示Toast
    show(message, type = 'info') {
        const toast = document.createElement('div');
        const id = `toast-${Date.now()}`;
        toast.id = id;
        toast.className = `toast align-items-center border-0 ${this.getBackgroundClass(type)}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body text-white">
                    ${this.getIcon(type)} ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        this.container.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 3000
        });

        bsToast.show();

        // 监听隐藏事件,移除DOM元素
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // 获取背景样式类
    getBackgroundClass(type) {
        switch (type) {
            case 'success': return 'bg-success';
            case 'error': return 'bg-danger';
            case 'warning': return 'bg-warning';
            default: return 'bg-info';
        }
    }

    // 获取图标
    getIcon(type) {
        switch (type) {
            case 'success': return '<i class="fas fa-check-circle me-1"></i>';
            case 'error': return '<i class="fas fa-times-circle me-1"></i>';
            case 'warning': return '<i class="fas fa-exclamation-circle me-1"></i>';
            default: return '<i class="fas fa-info-circle me-1"></i>';
        }
    }

    // 成功提示
    success(message) {
        this.show(message, 'success');
    }

    // 错误提示
    error(message) {
        this.show(message, 'error');
    }

    // 警告提示
    warning(message) {
        this.show(message, 'warning');
    }

    // 信息提示
    info(message) {
        this.show(message, 'info');
    }
}

// 导出单例实例
export const toast = new Toast(); 