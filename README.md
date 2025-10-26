# 智能天气信息面板

一个美观、响应式的天气信息查询单页面应用，使用HTML、CSS和JavaScript构建。

## 功能特点

- 城市天气查询功能
- 优雅的用户界面设计
- 响应式布局，支持各种设备
- 实时显示天气数据，包括温度、天气状况、风力风向等
- 根据天气状况自动切换背景渐变
- 流畅的动画和过渡效果
- 友好的错误提示

## 项目结构

```
weather/
├── index.html    # 页面结构
├── styles.css    # 样式文件
├── app.js        # JavaScript功能实现
└── README.md     # 项目说明
```

## 使用说明

### 1. 获取API密钥

本应用使用[OpenWeatherMap](https://openweathermap.org/)提供的免费天气API。要使用此应用，您需要：

1. 访问[OpenWeatherMap](https://home.openweathermap.org/users/sign_up)注册一个免费账户
2. 登录后，在API Keys页面获取您的API密钥

### 2. 配置API密钥

1. 打开`app.js`文件
2. 将`YOUR_OPENWEATHERMAP_API_KEY`替换为您刚刚获取的API密钥

```javascript
const API_KEY = '您的API密钥';
```

### 3. 运行应用

只需在浏览器中打开`index.html`文件即可运行应用。

## 技术栈

- HTML5
- CSS3 (使用Flexbox和Grid布局)
- JavaScript (原生，无需框架)
- Font Awesome (图标)
- OpenWeatherMap API

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 注意事项

- 免费的OpenWeatherMap API有调用次数限制（每天60次）
- 确保在使用前替换API密钥，否则无法获取天气数据
- 部分城市名称可能需要使用英文或拼音才能正确识别

## 界面预览

- 响应式设计，在手机、平板和桌面设备上都能完美显示
- 现代化的UI设计，包含渐变背景和卡片式布局
- 平滑的动画和过渡效果，提升用户体验

## 许可证

本项目仅供学习和参考使用。