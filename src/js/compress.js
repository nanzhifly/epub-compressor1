class Compressor {
    constructor() {
        this.compressButton = document.getElementById('compressButton');
        this.fileInput = document.getElementById('fileInput');
        this.compressionLevel = document.getElementById('compressionLevel');
        this.progressSection = document.getElementById('progressSection');
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadLink = document.getElementById('downloadLink');
        this.compressNewFile = document.getElementById('compressNewFile');
        this.compressionResults = document.getElementById('compressionResults');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.compressButton.addEventListener('click', () => this.startCompression());
        this.compressNewFile.addEventListener('click', () => this.resetUI());
    }

    async startCompression() {
        const file = window.getCurrentFile();
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('level', this.compressionLevel.value);

        this.updateUIBeforeCompression();

        try {
            const response = await fetch('/api/compress', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).catch(error => {
                throw new Error('Network error: Please check your connection');
            });

            if (!response.ok) {
                let errorMessage = 'Compression failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json().catch(error => {
                throw new Error('Invalid server response');
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Compression failed');
            }
            
            // Display compression results
            this.compressionResults.textContent = `Original: ${(result.originalSize / (1024 * 1024)).toFixed(2)} MB → Compressed: ${(result.compressedSize / (1024 * 1024)).toFixed(2)} MB (${result.compressionRatio}% smaller)`;

            // Set download link
            this.downloadLink.href = result.downloadUrl;
            this.downloadLink.download = `compressed_${file.name}`;
            
            // Show download section
            this.downloadSection.hidden = false;
            this.progressSection.hidden = true;

        } catch (error) {
            console.error('Compression error:', error);
            window.progress.updateStatus(error.message, true);
            alert(error.message);
        } finally {
            this.compressButton.disabled = false;
        }
    }

    updateUIBeforeCompression() {
        this.compressButton.disabled = true;
        this.progressSection.hidden = false;
        this.downloadSection.hidden = true;
        window.progress.updateProgress(0);
        window.progress.updateStatus('Starting compression...');
    }

    formatFileSize(bytes) {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    }

    resetUI() {
        this.compressButton.disabled = false;
        this.progressSection.hidden = true;
        this.downloadSection.hidden = true;
        this.compressionResults.textContent = '';
        window.progress.updateProgress(0);
        window.progress.updateStatus('');
        
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        fileInput.value = '';
        document.querySelector('.file-name').textContent = '';
        document.querySelector('.file-size').textContent = '';
        document.getElementById('compressionPanel').hidden = true;
    }
}

// Initialize compressor
window.compressor = new Compressor();