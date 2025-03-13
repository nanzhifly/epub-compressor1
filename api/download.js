const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// 验证文件名安全性
function isValidFileName(fileName) {
    return /^[a-zA-Z0-9-_]+\.epub$/.test(fileName) && 
           !fileName.includes('..') && 
           !fileName.includes('/');
}

// 处理文件下载请求
module.exports = async (req, res) => {
    try {
        const { filename } = req.query;
        
        if (!filename) {
            return res.status(400).json({
                error: '缺少文件名参数'
            });
        }

        // 文件名安全性检查
        if (!isValidFileName(filename)) {
            return res.status(400).json({ error: 'Invalid file name' });
        }

        const filePath = path.join(process.env.TEMP_DIR || '/tmp', filename);
        
        // 检查文件是否存在
        try {
            await readFile(filePath);
        } catch (error) {
            return res.status(404).json({
                error: '文件不存在或已过期'
            });
        }

        // 设置响应头
        res.setHeader('Content-Type', 'application/epub+zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // 发送文件
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // 文件发送完成后删除临时文件
        fileStream.on('end', async () => {
            try {
                await unlink(filePath);
            } catch (error) {
                console.error('删除临时文件失败:', error);
            }
        });

    } catch (error) {
        console.error('下载处理错误:', error);
        res.status(500).json({
            error: '下载处理失败',
            message: error.message
        });
    }
}; 