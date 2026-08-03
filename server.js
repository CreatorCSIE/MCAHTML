/**
 * MCAHTML 本地服务器 (server.js)
 * 功能：静态文件托管 + 磁盘自动写入 API
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '127.0.0.1';

// 常用 MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.jar': 'application/x-java-archive',
    '.lzma': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
    // 跨域头支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 核心 API：接收前端请求，直接写入磁盘 config/version.json
    if (req.method === 'POST' && req.url === '/api/save-version') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                // 校验 JSON 格式
                JSON.parse(body);
                const jsonPath = path.join(__dirname, 'config', 'version.json');
                
                // 写入磁盘文件
                fs.writeFileSync(jsonPath, body, 'utf8');
                console.log(' [成功] 已将最新配置直接写入磁盘 config/version.json');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: '文件已成功写入磁盘！' }));
            } catch (err) {
                console.error(' [错误] 写入磁盘失败:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // 环境探测 API
    if (req.method === 'GET' && req.url === '/api/env') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ isNode: true, server: 'Node.js' }));
        return;
    }

    // 静态文件托管
    let filePath = path.join(__dirname, req.url === '/' ? 'Minecraft.html' : req.url.split('?')[0]);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('===================================================');
    console.log(`  Minecraft Classic Applet 离线本地服务器已启动 (Node.js)`);
    console.log(`  访问地址: http://${HOST}:${PORT}/Minecraft.html`);
    console.log('===================================================');
});