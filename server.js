const express = require('express');
const path = require('path');
const multer = require('multer');
const compress = require('./api/compress');
const download = require('./api/download');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024, // 4MB limit for Vercel
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/epub+zip' || 
            path.extname(file.originalname).toLowerCase() === '.epub') {
            cb(null, true);
        } else {
            cb(new Error('Only EPUB files are allowed'));
        }
    }
});

// 允许跨域请求
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 设置静态文件服务
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // 根目录静态文件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.post('/api/compress', upload.single('file'), compress);
app.get('/api/download', download);

// 健康检查
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// 处理根路由和其他静态文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// SEO文件处理 - 高复用、低耦合、可扩展的设计
const seoFiles = {
    'robots.txt': 'public/robots.txt',
    'sitemap.xml': 'public/sitemap.xml',
    'googlea025fff20a5644c5.html': 'public/googlea025fff20a5644c5.html',
    'site.webmanifest': 'site.webmanifest',
    'book.svg': 'book.svg'
};

// 统一的SEO文件处理路由
Object.entries(seoFiles).forEach(([url, filePath]) => {
    app.get(`/${url}`, (req, res) => {
        const fullPath = path.join(__dirname, filePath);
        if (require('fs').existsSync(fullPath)) {
            res.sendFile(fullPath);
        } else {
            res.status(404).send(`${url} not found`);
        }
    });
});

// 处理其他所有路由
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'src', req.path);
    // 检查文件是否存在
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, 'src', 'index.html'));
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size exceeds 4MB limit',
                code: 'FILE_TOO_LARGE'
            });
        }
    }
    
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 启动服务器
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// 导出 app 实例供 Vercel 使用
module.exports = app;