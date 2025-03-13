# EPUB Compressor 部署总结文档

## 项目概述

EPUB Compressor 是一个在线电子书压缩工具，使用 Node.js 和 Express 构建，部署在 Vercel 平台上。本文档总结了部署过程中遇到的主要问题和解决方案，为后续优化提供参考。

## 一、部署问题及解决方案

### 1. 500 内部服务器错误

#### 问题描述
- 错误类型：`FUNCTION_INVOCATION_FAILED`
- 表现形式：服务器无法正常响应请求
- 影响范围：所有 API 接口

#### 原因分析
1. Vercel Serverless 函数配置不当
2. WebSocket 连接在 Serverless 环境中不支持
3. 服务器端错误处理机制不完善

#### 解决方案
1. 移除 WebSocket 相关代码
2. 改用 RESTful API 架构
3. 优化错误处理中间件
```javascript
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
```

### 2. 404 页面未找到错误

#### 问题描述
- 错误类型：`NOT_FOUND`
- 表现形式：静态资源无法访问
- 影响范围：前端页面和静态资源

#### 原因分析
1. Vercel 路由配置不正确
2. 静态文件处理优先级问题
3. 文件路径解析错误

#### 解决方案
1. 更新 vercel.json 配置：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

2. 添加静态文件构建配置：
```json
{
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "src/**",
      "use": "@vercel/static"
    }
  ]
}
```

## 二、技术优化

### 1. 文件处理优化

#### 内存存储配置
```javascript
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024,
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
```

### 2. 跨域处理
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
```

### 3. 环境变量配置
```json
{
  "env": {
    "NODE_ENV": "production",
    "MAX_FILE_SIZE": "4194304",
    "MAX_BATCH_FILES": "10",
    "COMPRESSION_CACHE_DURATION": "3600000",
    "MAX_CONCURRENT_COMPRESSIONS": "5"
  }
}
```

## 三、Serverless 环境注意事项

### 1. 环境限制
- 函数执行时间限制：10-60秒
- 内存使用限制：1024MB
- 临时文件系统
- 不支持长连接

### 2. 最佳实践
1. 文件处理
   - 使用内存存储代替文件系统
   - 严格控制文件大小限制
   - 实现并发控制

2. 错误处理
   - 完善错误捕获机制
   - 提供清晰的错误提示
   - 记录错误日志

3. 性能优化
   - 合理使用缓存
   - 优化压缩算法
   - 控制并发请求数

## 四、后续优化计划

### 1. 功能优化
- [ ] 添加文件处理进度反馈
- [ ] 实现文件压缩历史记录
- [ ] 优化压缩算法
- [ ] 添加更多压缩选项
- [ ] 实现批量处理功能

### 2. 用户体验
- [ ] 完善错误提示信息
- [ ] 优化移动端适配
- [ ] 添加用户反馈系统
- [ ] 优化加载状态显示

### 3. 性能优化
- [ ] 实现文件分片上传
- [ ] 优化大文件处理
- [ ] 添加文件预处理
- [ ] 实现智能压缩策略

### 4. 监控与维护
- [ ] 添加性能监控
- [ ] 实现错误追踪
- [ ] 优化日志系统
- [ ] 添加数据分析

## 五、部署检查清单

### 1. 环境配置
- [ ] 检查环境变量设置
- [ ] 验证构建配置
- [ ] 确认路由规则

### 2. 功能测试
- [ ] 文件上传测试
- [ ] 压缩功能测试
- [ ] 下载功能测试
- [ ] 错误处理测试

### 3. 性能检查
- [ ] 响应时间测试
- [ ] 并发处理测试
- [ ] 内存使用监控
- [ ] 错误日志检查

## 结论

本次部署经验表明，在 Serverless 环境中开发需要特别注意：

1. 环境限制和配置细节
2. 文件处理策略
3. 错误处理机制
4. 性能优化方案

通过合理的配置和优化，我们成功实现了一个稳定、高效的在线 EPUB 压缩服务。后续将继续根据用户反馈和使用情况进行优化和改进。 