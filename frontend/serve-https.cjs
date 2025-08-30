const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 443;

// SSL証明書を読み込み
const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../ssl/cert.pem'))
};

// 静的ファイルを配信
app.use(express.static(path.join(__dirname, 'dist')));

// SPAのため、すべてのルートでindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// HTTPSサーバーを開始
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running on https://0.0.0.0:${PORT}`);
});