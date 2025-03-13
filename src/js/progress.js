class ProgressManager {
    constructor() {
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.progressPercent = document.getElementById('progressPercent');
        this.statusMessage = document.getElementById('statusMessage');
        this.progressSection = document.getElementById('progressSection');
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
        this.progressPercent.textContent = `${percent}%`;
        this.progressSection.hidden = false;
    }

    updateStatus(message, isError = false) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'status-message ' + (isError ? 'error' : '');
        
        if (!isError) {
            this.progressText.textContent = message;
        }
        
        this.progressSection.hidden = false;
    }

    reset() {
        this.progressBar.style.width = '0%';
        this.progressPercent.textContent = '0%';
        this.progressText.textContent = 'Ready to start...';
        this.statusMessage.textContent = '';
        this.statusMessage.className = 'status-message';
        this.progressSection.hidden = true;
    }
}

// Initialize progress manager
window.progress = new ProgressManager();

// 进度条处理
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const statusMessage = document.getElementById('statusMessage');

    // 更新进度
    window.updateProgress = (progress) => {
        // 确保进度在 0-100 之间
        progress = Math.min(100, Math.max(0, progress));
        
        // 更新进度条
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;

        // 更新状态文本
        if (progress === 0) {
            progressText.textContent = '准备开始...';
        } else if (progress === 100) {
            progressText.textContent = '压缩完成！';
        } else {
            progressText.textContent = '正在压缩...';
        }
    };

    // 显示错误信息
    window.showError = (message) => {
        statusMessage.textContent = message;
        statusMessage.classList.add('error');
    };

    // 清除错误信息
    window.clearError = () => {
        statusMessage.textContent = '';
        statusMessage.classList.remove('error');
    };
}); 