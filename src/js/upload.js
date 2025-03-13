// 文件上传处理
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFileButton = document.getElementById('selectFile');
    const compressionPanel = document.getElementById('compressionPanel');
    const fileNameDisplay = document.querySelector('.file-name');
    const fileSizeDisplay = document.querySelector('.file-size');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = errorMessage.querySelector('.error-text');
    const errorDetails = errorMessage.querySelector('.error-details');
    
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
    let currentFile = null;

    // 显示错误消息
    function showError(message, details) {
        errorText.textContent = message;
        errorDetails.textContent = details;
        errorMessage.classList.remove('show');
        // 触发重排以重新开始动画
        void errorMessage.offsetWidth;
        errorMessage.classList.add('show');
    }

    // 隐藏错误消息
    function hideError() {
        errorMessage.classList.remove('show');
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)}MB`;
    }

    // 处理文件选择
    function handleFileSelect(file) {
        if (!file) return;
        
        hideError();
        
        // 检查文件类型
        if (!file.name.toLowerCase().endsWith('.epub')) {
            showError('Invalid file type', 'Please select an EPUB file');
            return;
        }

        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
            showError('File size exceeds limit', 
                     `Current file size: ${formatFileSize(file.size)}\n` +
                     `Maximum allowed: ${formatFileSize(MAX_FILE_SIZE)}`);
            return;
        }

        currentFile = file;
        
        // 显示文件信息
        fileNameDisplay.textContent = `File: ${file.name}`;
        fileSizeDisplay.textContent = `Size: ${formatFileSize(file.size)}`;
        
        // 显示压缩面板
        compressionPanel.hidden = false;
    }

    // 文件拖放处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });

    // 点击选择文件
    selectFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    });

    // 导出当前文件供其他模块使用
    window.getCurrentFile = () => currentFile;
}); 