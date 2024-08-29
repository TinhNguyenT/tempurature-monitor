from counterfit_connection import CounterFitConnection
from counterfit_shims_seeed_python_dht import DHT
import paho.mqtt.client as mqtt
import time

# Khởi tạo kết nối CounterFit
CounterFitConnection.init('127.0.0.1', 5000)

# Cấu hình ThingsBoard
THINGSBOARD_HOST = 'localhost'  # Địa chỉ IP hoặc tên miền của ThingsBoard
ACCESS_TOKEN = '7hSX2p22zUAkp8pCeyIm'  # Token truy cập thiết bị từ ThingsBoard

# Khởi tạo MQTT client
client = mqtt.Client()
client.username_pw_set(ACCESS_TOKEN)
client.connect(THINGSBOARD_HOST, 1883, 60)

# Khởi tạo cảm biến DHT
sensor = DHT("11", 5)  # Cảm biến DHT11 ở chân GPIO 5

while True:
    humidity, temp = sensor.read()  # Đọc cả nhiệt độ và độ ẩm
    print(f'Nhiệt độ: {temp}°C, Độ ẩm: {humidity}%')
    
    # Tạo payload với cả nhiệt độ và độ ẩm
    payload = '{{"temperature": {}, "humidity": {}}}'.format(temp, humidity)
    client.publish('v1/devices/me/telemetry', payload)
    
    time.sleep(10)
