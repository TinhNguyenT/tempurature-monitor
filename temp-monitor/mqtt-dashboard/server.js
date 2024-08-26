const http = require('http');
const fs = require('fs');
const mqtt = require('mqtt');

// Kết nối với broker MQTT
const mqttClient = mqtt.connect('mqtt://broker.emqx.io', {
    username: 'temp',
    password: '123456'
});

let latestData = {}; // Lưu trữ dữ liệu mới nhất từ MQTT

// Đăng ký để nhận dữ liệu từ topic mà Arduino xuất bản
mqttClient.on('connect', () => {
    console.log('Đã kết nối với broker MQTT');
    mqttClient.subscribe('sensor/data', (err) => {
        if (err) {
            console.error('Không thể đăng ký:', err);
        }
    });
});

// Xử lý các tin nhắn MQTT đến
mqttClient.on('message', (topic, message) => {
    try {
        latestData = JSON.parse(message.toString());
        latestData.time = new Date(); // Thêm timestamp vào dữ liệu
        console.log('Nhận dữ liệu từ MQTT:', latestData);
    } catch (error) {
        console.error('Lỗi khi phân tích tin nhắn:', error);
    }
});

const requestHandler = (request, response) => {
    const { url: pathname } = request;

    if (pathname === '/get') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify([latestData]));
    } else {
        fs.readFile('./public/index.html', (error, content) => {
            if (error) {
                response.writeHead(500);
                response.end('Lỗi khi tải index.html');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content);
            }
        });
    }
};

const server = http.createServer(requestHandler);
server.listen(8000, () => {
    console.log('Server đang lắng nghe trên cổng 8000');
});