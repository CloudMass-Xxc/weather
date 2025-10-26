// OpenWeatherMap API基础URL
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 常见城市列表（去重并扩展）
const commonCities = [
    // 中国一线城市
    '北京', '上海', '广州', '深圳',
    // 中国新一线城市及重要城市
    '杭州', '南京', '成都', '武汉', '西安', '重庆', '天津', '苏州', '长沙', '郑州',
    '东莞', '青岛', '沈阳', '宁波', '昆明', '福州', '厦门', '大连', '济南', '哈尔滨',
    '合肥', '佛山', '南宁', '贵阳', '南昌', '长春', '温州', '石家庄', '常州', '泉州',
    '乌鲁木齐', '金华', '徐州', '南通', '太原', '嘉兴', '兰州', '西宁', '银川', '拉萨',
    '呼和浩特', '海口', '三亚', '珠海', '中山', '惠州', '绍兴', '潍坊', '临沂', '台州',
    '保定', '咸阳', '扬州', '赣州', '绵阳', '邯郸', '泰州', '芜湖', '唐山', '济宁',
    '镇江', '洛阳', '淄博', '南阳', '新乡', '淮安', '湛江', '岳阳', '衡阳', '许昌',
    // 国际主要城市
    '纽约', '伦敦', '东京', '巴黎', '柏林', '悉尼', '莫斯科', '新加坡', '迪拜', '洛杉矶',
    '芝加哥', '休斯顿', '多伦多', '温哥华', '首尔', '香港', '曼谷', '吉隆坡', '孟买', '开罗',
    '罗马', '马德里', '圣保罗', '里约热内卢', '莫斯科', '阿姆斯特丹', '苏黎世', '日内瓦', '维也纳', '布拉格'
];

// DOM元素
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKeyButton');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');
let suggestionsContainer = null; // 搜索建议容器
const apiModal = document.getElementById('apiModal');
const closeApiModal = document.getElementById('closeApiModal');
const openApiModal = document.getElementById('openApiModal');
const toastContainer = document.getElementById('toastContainer');

// 根据天气状况更新背景
function updateWeatherBackground(weatherData) {
    // 移除所有可能的天气背景类
    document.body.classList.remove(
        'weather-sunny',
        'weather-rainy', 
        'weather-cloudy',
        'weather-snowy',
        'weather-night',
        'weather-thunderstorm',
        'weather-foggy'
    );
    
    // 获取天气代码和当前时间
    const weatherCode = weatherData.weather[0].id;
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // 判断是否为夜晚
    const isNight = hour < 6 || hour >= 18;
    
    // 根据天气代码设置背景类
    // 晴天
    if (weatherCode >= 800 && weatherCode < 900) {
        if (weatherCode === 800) {
            // 晴朗天空
            document.body.classList.add(isNight ? 'weather-night' : 'weather-sunny');
        } else {
            // 多云
            document.body.classList.add(isNight ? 'weather-night' : 'weather-cloudy');
        }
    }
    // 雨雪天气
    else if (weatherCode >= 500 && weatherCode < 700) {
        if (weatherCode >= 600 && weatherCode < 700) {
            // 雪天
            document.body.classList.add('weather-snowy');
        } else if (weatherCode >= 500 && weatherCode < 600) {
            // 雨天
            document.body.classList.add('weather-rainy');
        }
    }
    // 雷雨天气
    else if (weatherCode >= 200 && weatherCode < 300) {
        document.body.classList.add('weather-thunderstorm');
    }
    // 雾天
    else if (weatherCode >= 700 && weatherCode < 800) {
        document.body.classList.add('weather-foggy');
    }
}

// 从localStorage获取API Key
function getApiKey() {
    return localStorage.getItem('openWeatherMapApiKey') || 'YOUR_OPENWEATHERMAP_API_KEY';
}

// 保存API Key到localStorage
function saveApiKey(apiKey) {
    localStorage.setItem('openWeatherMapApiKey', apiKey);
    return apiKey;
}

// 显示toast通知
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 添加图标
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// 事件监听器
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        // 禁用搜索按钮，防止重复点击
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 直接使用用户输入的城市名称，不再自动添加'市'字
        fetchWeatherDataByCity(city).finally(() => {
            // 恢复按钮状态
            setTimeout(() => {
                searchButton.disabled = false;
                searchButton.innerHTML = '<i class="fas fa-search"></i>';
            }, 300);
        });
        
        hideSuggestions();
    } else {
        showError('请输入城市名称');
    }
});

// 保存API Key按钮事件
saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        saveApiKey(apiKey);
        showToast('API密钥已保存', 'success');
        closeApiModal();
        apiKeyInput.value = '';
    } else {
        showError('请输入有效的API密钥');
    }
});

// API模态框控制
if (openApiModal) {
    openApiModal.addEventListener('click', function() {
        if (apiModal) {
            apiModal.classList.add('show');
            // 从localStorage获取已保存的API密钥
            const savedApiKey = getApiKey();
            if (savedApiKey !== 'YOUR_OPENWEATHERMAP_API_KEY') {
                apiKeyInput.value = savedApiKey;
            }
        }
    });
}

if (closeApiModal) {
    closeApiModal.addEventListener('click', function() {
        if (apiModal) {
            apiModal.classList.remove('show');
            apiKeyInput.value = '';
        }
    });
}

if (apiModal) {
    apiModal.addEventListener('click', function(e) {
        if (e.target === apiModal) {
            apiModal.classList.remove('show');
            apiKeyInput.value = '';
        }
    });
}

// 显示成功消息（使用toast）
function showSuccess(message) {
    showToast(message, 'success');
}

// 定位按钮事件
locationButton.addEventListener('click', () => {
    hideSuggestions();
    
    if (!navigator.geolocation) {
        showError('您的浏览器不支持地理位置功能');
        return;
    }
    
    // 禁用定位按钮，防止重复点击
    locationButton.disabled = true;
    locationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // 显示加载状态
    weatherContainer.innerHTML = '<div class="weather-placeholder fade-in"><i class="fas fa-spinner fa-spin"></i><p>正在获取您的位置...</p></div>';
    
    // 获取用户位置，添加超时设置和高精度选项
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`获取到位置: 纬度 ${latitude}, 经度 ${longitude}`);
            fetchWeatherDataByCoords(latitude, longitude);
            
            // 恢复按钮状态
            setTimeout(() => {
                locationButton.disabled = false;
                locationButton.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            }, 500);
        },
        (error) => {
            let errorMessage;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '您拒绝了位置请求，请在浏览器设置中允许访问位置信息';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '位置信息不可用，请检查设备定位服务是否开启';
                    break;
                case error.TIMEOUT:
                    errorMessage = '获取位置信息超时，请检查网络连接并重试';
                    break;
                default:
                    errorMessage = `获取位置信息时发生未知错误 (${error.message})`;
            }
            showError(errorMessage);
            
            // 恢复按钮状态
            setTimeout(() => {
                locationButton.disabled = false;
                locationButton.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            }, 500);
        },
        {
            enableHighAccuracy: true, // 尝试获取最精确的位置
            timeout: 10000, // 10秒超时
            maximumAge: 60000 // 接受1分钟内的缓存位置
        }
    );
});

// 按回车键也可以搜索
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            // 直接使用用户输入的城市名称调用搜索函数
            fetchWeatherDataByCity(city);
            hideSuggestions();
        }
    }
});

// 根据城市名称获取天气数据
async function fetchWeatherDataByCity(city) {
    const API_KEY = getApiKey();
    
    if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('请先设置有效的OpenWeatherMap API密钥');
        return;
    }
    
    try {
        // 清空之前的错误信息
        errorMessage.style.display = 'none';
        
        // 显示加载状态
        weatherContainer.innerHTML = '<div class="weather-placeholder fade-in"><i class="fas fa-spinner fa-spin"></i><p>正在获取天气信息...</p></div>';
        
        // 尝试获取天气数据的函数
        async function tryFetchWeatherData(cityName) {
            const currentWeatherResponse = await fetch(`${API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=zh_cn`);
            if (!currentWeatherResponse.ok) {
                throw { status: currentWeatherResponse.status };
            }
            return await currentWeatherResponse.json();
        }
        
        // 尝试获取预报数据的函数
        async function tryFetchForecastData(cityName) {
            const forecastResponse = await fetch(`${API_BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=zh_cn`);
            if (!forecastResponse.ok) {
                throw new Error(`获取天气预报数据失败`);
            }
            return await forecastResponse.json();
        }
        
        let currentData;
        let searchCity;
        
        // 定义可能的搜索模式数组
        const searchPatterns = [];
        
        // 添加原始城市名称
        searchPatterns.push(city);
        
        // 如果不包含'市'字，添加带'市'的版本
        if (!city.includes('市')) {
            searchPatterns.push(city + '市');
        } else {
            // 如果已经包含'市'字，也添加不带'市'的版本
            searchPatterns.push(city.replace('市', ''));
        }
        
        // 对于特殊城市名称，添加英文名称尝试
        const specialCities = {
            '珠海': 'Zhuhai',
            '珠海市': 'Zhuhai',
            '澳门': 'Macau',
            '香港': 'Hong Kong'
        };
        
        // 如果城市名称在特殊城市列表中，添加对应的英文名称
        if (specialCities[city]) {
            searchPatterns.push(specialCities[city]);
        }
        
        // 尝试所有搜索模式，直到成功
        let lastError;
        for (const pattern of searchPatterns) {
            try {
                currentData = await tryFetchWeatherData(pattern);
                searchCity = pattern; // 保存成功的搜索关键词
                break; // 找到就跳出循环
            } catch (error) {
                lastError = error;
                // 只有当不是404错误时才终止尝试
                if (error.status !== 404) {
                    break;
                }
            }
        }
        
        // 如果所有模式都失败了
        if (!currentData) {
            if (lastError && lastError.status === 401) {
                throw new Error('API密钥无效，请替换为您自己的密钥');
            } else {
                throw new Error(`未找到城市 "${city}" 相关信息，请检查输入是否正确`);
            }
        }
        
        // 显示当前天气信息
        displayWeatherData(currentData);
        
        // 获取并显示天气预报
        const forecastData = await tryFetchForecastData(searchCity);
        displayForecastData(forecastData);
        
        // 生成并显示生活建议
        const lifeAdvice = generateLifeAdvice(currentData);
        displayLifeAdvice(lifeAdvice);
        
    } catch (error) {
        showError(error.message);
    }
}

// 根据经纬度获取天气数据
async function fetchWeatherDataByCoords(latitude, longitude) {
    const API_KEY = getApiKey();
    
    if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('请先设置有效的OpenWeatherMap API密钥');
        return;
    }
    
    try {
        // 清空之前的错误信息
        errorMessage.style.display = 'none';
        
        // 显示加载状态
        weatherContainer.innerHTML = '<div class="weather-placeholder fade-in"><i class="fas fa-spinner fa-spin"></i><p>正在获取您所在位置的天气信息...</p></div>';
        
        // 调用OpenWeatherMap API，根据经纬度获取当前天气
        const currentWeatherResponse = await fetch(`${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=zh_cn`);
        
        if (!currentWeatherResponse.ok) {
            if (currentWeatherResponse.status === 401) {
                throw new Error('API密钥无效，请替换为您自己的密钥');
            }
            throw new Error(`获取天气数据失败: HTTP ${currentWeatherResponse.status}`);
        }
        
        const currentData = await currentWeatherResponse.json();
        
        // 获取城市名称并更新输入框
        const cityName = currentData.name;
        cityInput.value = cityName;
        
        // 显示当前天气信息
        displayWeatherData(currentData);
        
        // 调用OpenWeatherMap API，根据经纬度获取5天天气预报
        const forecastResponse = await fetch(`${API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=zh_cn`);
        
        if (!forecastResponse.ok) {
            throw new Error(`获取天气预报数据失败: HTTP ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();
        
        // 显示天气预报
        displayForecastData(forecastData);
        
        // 生成并显示生活建议
        const lifeAdvice = generateLifeAdvice(currentData);
        displayLifeAdvice(lifeAdvice);
        
        // 显示位置获取成功的消息
        showSuccess(`已获取您当前位置（${cityName}）的天气信息`);
        
    } catch (error) {
        console.error('定位获取天气失败:', error);
        showError(`定位天气获取失败: ${error.message}`);
    }
}

// 获取天气数据（保留兼容）
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

// 根据天气数据生成生活建议
function generateLifeAdvice(data) {
    const { main, weather, wind, visibility } = data;
    const temp = main.temp;
    const humidity = main.humidity;
    const weatherMain = weather[0].main;
    const windSpeed = wind.speed;
    const visibilityKm = visibility / 1000;
    
    // 穿衣建议 - 更详细实用的穿衣指南
    let clothingAdvice = '';
    if (temp < 0) {
        clothingAdvice = '天气严寒，建议穿着羽绒服、厚毛衣、保暖内衣等多层保暖衣物，注意保护手脚和颈部等易受寒部位。';
    } else if (temp < 10) {
        clothingAdvice = '天气较冷，建议穿着厚外套、毛衣或卫衣等保暖衣物，可适当增减以保持舒适。';
    } else if (temp < 20) {
        clothingAdvice = '天气凉爽，建议穿着轻薄外套或薄毛衣，早晚温差大可准备一件外套备用。';
    } else if (temp < 28) {
        clothingAdvice = '天气舒适，建议穿着长袖衬衫或薄外套，适合外出活动的理想温度。';
    } else {
        clothingAdvice = '天气炎热，建议穿着短袖、短裤等清凉夏装，注意选择透气面料，外出时做好防晒措施。';
    }
    
    // 健康建议 - 综合生活、出行和运动的全面健康指南
    let healthAdvice = '';
    // 基于天气状况的综合健康建议
    if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
        healthAdvice = '雨天路滑，出行注意安全。空气湿度增加，注意防潮，可适当减少户外活动时间。';
    } else if (weatherMain === 'Thunderstorm') {
        healthAdvice = '雷雨天气，尽量避免外出，关闭电子设备。室内保持通风，注意用电安全。';
    } else if (weatherMain === 'Snow') {
        healthAdvice = '雪天注意保暖防滑。外出时穿防滑鞋，驾车减速慢行。室内注意保持空气流通。';
    } else if (weatherMain === 'Fog' || weatherMain === 'Mist' || weatherMain === 'Haze') {
        healthAdvice = '空气质量较差，外出建议佩戴口罩，减少户外运动。多喝水，多吃新鲜蔬果增强免疫力。';
    } else if (temp > 30) {
        healthAdvice = '高温天气，注意防暑降温。多喝水，避免在高温时段外出。户外活动注意防晒，预防中暑。';
    } else if (temp < 5) {
        healthAdvice = '寒冷天气，注意保暖防寒。预防感冒和呼吸道疾病。可适当进行室内运动，增强体质。';
    } else if (humidity < 30) {
        healthAdvice = '空气干燥，注意补水保湿。使用加湿器，多喝水，涂抹保湿护肤品。预防皮肤干燥和呼吸道不适。';
    } else if (temp >= 15 && temp <= 28 && weatherMain === 'Clear') {
        healthAdvice = '天气极佳，是户外活动的好时机。建议进行适量运动，享受阳光，保持良好心情。';
    } else {
        healthAdvice = '天气适宜，保持良好的生活习惯。多喝水，适量运动，注意饮食均衡，保持身心健康。';
    }
    
    return {
        clothing: clothingAdvice,
        health: healthAdvice
    };
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
    
    // 生成并显示生活建议
    const lifeAdvice = generateLifeAdvice(data);
    displayLifeAdvice(lifeAdvice);
    
    // 更新天气背景
    updateWeatherBackground(data);
}

// 显示生活建议
function displayLifeAdvice(advice) {
    // 更可靠地移除所有已存在的生活建议容器
    const allAdviceContainers = document.querySelectorAll('.life-advice-container');
    allAdviceContainers.forEach(container => {
        // 使用remove方法而不是removeChild，确保更好的兼容性
        container.remove();
    });
    
    // 创建生活建议容器
    const adviceContainer = document.createElement('div');
    adviceContainer.className = 'life-advice-container fade-in';
    
    // 添加标题
    const adviceTitle = document.createElement('h3');
    adviceTitle.className = 'advice-title';
    adviceTitle.textContent = '生活建议';
    adviceContainer.appendChild(adviceTitle);
    
    // 创建建议列表
    const adviceList = document.createElement('div');
    adviceList.className = 'advice-list';
    
    // 建议类型配置 - 精简为两个核心建议
    const adviceTypes = [
        { type: 'clothing', icon: 'fas fa-tshirt', title: '穿衣指南' },
        { type: 'health', icon: 'fas fa-heartbeat', title: '健康生活' }
    ];
    
    // 为每种建议创建卡片
    adviceTypes.forEach(typeInfo => {
        const adviceCard = document.createElement('div');
        adviceCard.className = 'advice-card';
        
        adviceCard.innerHTML = `
            <div class="advice-header">
                <i class="${typeInfo.icon}"></i>
                <h4>${typeInfo.title}</h4>
            </div>
            <p class="advice-text">${advice[typeInfo.type]}</p>
        `;
        
        adviceList.appendChild(adviceCard);
    });
    
    // 添加到建议容器
    adviceContainer.appendChild(adviceList);
    
    // 添加到主容器
    weatherContainer.appendChild(adviceContainer);
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

// 显示错误信息
function showError(message) {
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    errorMessage.style.display = 'flex';
    
    // 重置天气容器
    weatherContainer.innerHTML = `
        <div class="weather-placeholder">
            <i class="fas fa-cloud-sun"></i>
            <h2>天气信息</h2>
            <p>输入城市名称并点击查询按钮获取天气信息</p>
            <div class="action-hint">
                <i class="fas fa-lightbulb"></i>
                <span>或点击定位按钮获取当前位置天气</span>
            </div>
        </div>
    `;
    
    // 5秒后自动隐藏错误信息
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// 创建搜索建议容器
function createSuggestionsContainer() {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions-container';
    suggestionsContainer.className = 'suggestions-container';
    
    // 添加到搜索框的父元素中
    const searchWrapper = cityInput.closest('.search-wrapper');
    if (searchWrapper) {
        searchWrapper.appendChild(suggestionsContainer);
    } else {
        cityInput.parentNode.appendChild(suggestionsContainer);
    }
}

// 显示城市搜索建议
function showCitySuggestions(input) {
    if (!input.trim()) {
        hideSuggestions();
        return;
    }
    
    // 移除输入中的'市'字，进行智能匹配
    const normalizedInput = input.toLowerCase().replace('市', '');
    
    // 过滤匹配的城市
    const filteredCities = commonCities.filter(city => {
        // 移除城市名称中的'市'字再进行匹配
        const normalizedCity = city.toLowerCase().replace('市', '');
        return normalizedCity.includes(normalizedInput);
    }).slice(0, 6); // 最多显示6个建议
    
    if (filteredCities.length === 0) {
        hideSuggestions();
        return;
    }
    
    // 创建建议列表
    suggestionsContainer.innerHTML = '';
    filteredCities.forEach(city => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${city}</span>
        `;
        
        // 添加点击事件
        suggestion.addEventListener('click', () => {
            // 直接使用原始城市名称
            cityInput.value = city;
            hideSuggestions();
            fetchWeatherDataByCity(city);
        });
        
        suggestionsContainer.appendChild(suggestion);
    });
    
    // 显示建议容器
    suggestionsContainer.classList.add('show');
}

// 隐藏搜索建议
function hideSuggestions() {
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('show');
    }
}

// 初始化页面
function init() {
    // 创建搜索建议容器
    createSuggestionsContainer();
    
    // 设置默认提示
    weatherContainer.innerHTML = `
        <div class="weather-placeholder">
            <i class="fas fa-cloud-sun placeholder-icon"></i>
            <h2>天气信息</h2>
            <p>输入城市名称并点击查询按钮获取天气信息</p>
            <div class="action-hint">
                <i class="fas fa-lightbulb"></i>
                <span>或点击定位按钮获取当前位置天气</span>
            </div>
        </div>
    `;
    
    // 检查是否已保存API密钥
    const savedApiKey = getApiKey();
    if (savedApiKey !== 'YOUR_OPENWEATHERMAP_API_KEY') {
        apiKeyInput.placeholder = 'API密钥已保存';
        apiKeyInput.disabled = true;
        saveApiKeyButton.disabled = true;
        saveApiKeyButton.style.opacity = '0.7';
    }
    
    // 提示用户需要设置API密钥
    console.log('请在页面上输入您的OpenWeatherMap API密钥');
    
    // 输入事件 - 显示搜索建议
    cityInput.addEventListener('input', () => {
        showCitySuggestions(cityInput.value);
    });
    
    // 失焦时隐藏建议
    cityInput.addEventListener('blur', () => {
        // 延迟隐藏，让点击建议的事件能触发
        setTimeout(hideSuggestions, 200);
    });
    
    // 聚焦时显示建议
    cityInput.addEventListener('focus', () => {
        if (cityInput.value.trim()) {
            showCitySuggestions(cityInput.value);
        }
    });
};

// 显示天气预报数据
function displayForecastData(data) {
    // 创建天气预报容器
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-container fade-in';
    
    // 添加标题
    const forecastTitle = document.createElement('h3');
    forecastTitle.className = 'forecast-title';
    forecastTitle.textContent = '未来5天天气预报';
    forecastContainer.appendChild(forecastTitle);
    
    // 创建预报列表
    const forecastList = document.createElement('div');
    forecastList.className = 'forecast-list';
    
    // 处理预报数据，每天只取一个时间点的数据（例如中午12点附近）
    const dailyForecasts = processDailyForecasts(data.list);
    
    // 为每天创建预报卡片
    dailyForecasts.forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        // 格式化日期
        const date = new Date(day.dt * 1000);
        const formattedDate = date.toLocaleDateString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            weekday: 'short'
        });
        
        // 获取天气图标
        const weatherIcon = getWeatherIcon(day.weather[0].main);
        
        // 构建预报卡片HTML
        forecastCard.innerHTML = `
            <div class="forecast-date">${formattedDate}</div>
            <div class="forecast-icon">${weatherIcon}</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.main.temp_max)}°</span>
                <span class="min-temp">${Math.round(day.main.temp_min)}°</span>
            </div>
        `;
        
        forecastList.appendChild(forecastCard);
    });
    
    // 添加到预报容器
    forecastContainer.appendChild(forecastList);
    
    // 添加到主容器
    weatherContainer.appendChild(forecastContainer);
}

// 处理每天的天气预报数据
function processDailyForecasts(forecastList) {
    // 创建一个Map来存储每天的数据
    const dailyMap = new Map();
    
    // 遍历所有预报，每天只保留一个记录（选择中午12点附近的）
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toDateString();
        const hour = date.getHours();
        
        // 如果当天还没有数据，或者找到更接近中午12点的数据
        if (!dailyMap.has(dateStr) || Math.abs(hour - 12) < Math.abs(new Date(dailyMap.get(dateStr).dt * 1000).getHours() - 12)) {
            dailyMap.set(dateStr, forecast);
        }
    });
    
    // 转换为数组并按日期排序，然后只取未来5天（包括今天）
    return Array.from(dailyMap.values()).sort((a, b) => a.dt - b.dt).slice(0, 5);
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);