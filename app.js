// 注意：请替换为您自己的OpenWeatherMap API密钥
// 您可以在 https://home.openweathermap.org/users/sign_up 注册获取免费API密钥
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM元素
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');

// 事件监听器
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        showError('请输入城市名称');
    }
});

// 按回车键也可以搜索
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// 获取天气数据
async function fetchWeatherData(city) {
    try {
        // 清空之前的错误信息
        errorMessage.style.display = 'none';
        
        // 显示加载状态
        weatherContainer.innerHTML = '<div class="weather-placeholder fade-in"><i class="fas fa-spinner fa-spin"></i><p>正在获取天气信息...</p></div>';
        
        // 调用OpenWeatherMap API
        // 使用metric单位获取摄氏度温度
        const response = await fetch(`${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('未找到该城市，请检查输入是否正确');
            } else if (response.status === 401) {
                throw new Error('API密钥无效，请替换为您自己的密钥');
            }
            throw new Error(`获取天气数据失败: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 显示天气信息
        displayWeatherData(data);
        
    } catch (error) {
        showError(error.message);
    }
}

// 显示天气数据
function displayWeatherData(data) {
    // 清除占位符
    weatherContainer.innerHTML = '';
    
    // 创建天气内容容器
    const weatherContent = document.createElement('div');
    weatherContent.className = 'weather-content fade-in';
    
    // 获取日期
    const date = new Date();
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    // 获取风向
    const windDirection = getWindDirection(data.wind.deg);
    
    // 获取天气图标
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    
    // 构建天气信息HTML
    weatherContent.innerHTML = `
        <div class="weather-header">
            <h2 class="city-name">${data.name}, ${data.sys.country}</h2>
            <p class="weather-date">${formattedDate}</p>
        </div>
        
        <div class="weather-main">
            <div class="temperature">${Math.round(data.main.temp)}°</div>
            <div class="weather-info">
                <div class="weather-icon">${weatherIcon}</div>
                <div class="weather-description">${data.weather[0].description}</div>
            </div>
        </div>
        
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">体感温度</div>
                <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">湿度</div>
                <div class="detail-value">${data.main.humidity}%</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">气压</div>
                <div class="detail-value">${data.main.pressure} hPa</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">风力</div>
                <div class="detail-value">${windDirection} ${data.wind.speed} m/s</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">能见度</div>
                <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">云量</div>
                <div class="detail-value">${data.clouds.all}%</div>
            </div>
        </div>
    `;
    
    // 添加到容器
    weatherContainer.appendChild(weatherContent);
    
    // 根据天气状况更新背景色
    updateWeatherBackground(data.weather[0].main);
}

// 根据风向角度获取风向描述
function getWindDirection(degrees) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// 获取天气图标
function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': '<i class="fas fa-sun"></i>',
        'Clouds': '<i class="fas fa-cloud-sun"></i>',
        'Rain': '<i class="fas fa-cloud-rain"></i>',
        'Drizzle': '<i class="fas fa-cloud-showers-heavy"></i>',
        'Thunderstorm': '<i class="fas fa-bolt"></i>',
        'Snow': '<i class="fas fa-snowflake"></i>',
        'Mist': '<i class="fas fa-smog"></i>',
        'Fog': '<i class="fas fa-smog"></i>',
        'Haze': '<i class="fas fa-smog"></i>'
    };
    
    return iconMap[weatherMain] || '<i class="fas fa-cloud"></i>';
}

// 根据天气更新背景
function updateWeatherBackground(weatherMain) {
    const backgroundMap = {
        'Clear': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Clouds': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Rain': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Drizzle': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Thunderstorm': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        'Snow': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        'Mist': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'Fog': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'Haze': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    
    weatherContainer.style.background = backgroundMap[weatherMain] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// 显示错误信息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // 重置天气容器
    weatherContainer.innerHTML = `
        <div class="weather-placeholder">
            <i class="fas fa-cloud-sun"></i>
            <p>输入城市名称并点击查询按钮获取天气信息</p>
        </div>
    `;
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// 初始化页面
function init() {
    // 设置默认提示
    weatherContainer.innerHTML = `
        <div class="weather-placeholder">
            <i class="fas fa-cloud-sun"></i>
            <p>输入城市名称并点击查询按钮获取天气信息</p>
        </div>
    `;
    
    // 提示用户需要设置API密钥
    console.log('请记得在app.js文件中设置您的OpenWeatherMap API密钥');
};

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);