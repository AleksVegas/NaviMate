// Weather functionality for NaviMate
// OpenWeatherMap API integration with GPS support

class WeatherService {
  constructor() {
    this.apiKey = 'YOUR_API_KEY'; // Замените на ваш API ключ
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.units = 'metric'; // Метрическая система (Цельсии, м/с)
    this.lang = 'ru'; // Язык описания погоды
    
    this.weatherInfo = document.getElementById('weatherInfo');
    this.weatherError = document.getElementById('weatherError');
    this.getLocationBtn = document.getElementById('getLocationBtn');
    this.refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
    this.getWeatherBtn = document.getElementById('getWeatherBtn');
    this.weatherLat = document.getElementById('weatherLat');
    this.weatherLon = document.getElementById('weatherLon');
    
    this.init();
  }
  
  init() {
    // Привязываем обработчики событий
    this.getLocationBtn.addEventListener('click', () => this.getCurrentLocation());
    this.refreshWeatherBtn.addEventListener('click', () => this.refreshWeather());
    this.getWeatherBtn.addEventListener('click', () => this.getWeatherByCoords());
    
    // Загружаем сохраненные координаты
    this.loadSavedCoords();
    
    // Обновляем язык при изменении
    this.updateLanguage();
  }
  
  // Получение текущей позиции через GPS
  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError('Геолокация не поддерживается вашим браузером');
      return;
    }
    
    this.getLocationBtn.disabled = true;
    this.getLocationBtn.textContent = '📍 Получение...';
    
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Сохраняем координаты
      this.saveCoords(latitude, longitude);
      
      // Обновляем поля ввода
      this.weatherLat.value = latitude.toFixed(6);
      this.weatherLon.value = longitude.toFixed(6);
      
      // Получаем погоду
      await this.getWeatherByCoords();
      
    } catch (error) {
      console.error('Ошибка получения позиции:', error);
      this.showError('Не удалось получить вашу позицию. Проверьте разрешения GPS.');
    } finally {
      this.getLocationBtn.disabled = false;
      this.getLocationBtn.textContent = this.getTranslation('getLocation');
    }
  }
  
  // Promise-обертка для getCurrentPosition
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  }
  
  // Получение погоды по координатам
  async getWeatherByCoords() {
    const lat = parseFloat(this.weatherLat.value);
    const lon = parseFloat(this.weatherLon.value);
    
    if (isNaN(lat) || isNaN(lon)) {
      this.showError('Введите корректные координаты');
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      this.showError('Координаты вне допустимого диапазона');
      return;
    }
    
    this.getWeatherBtn.disabled = true;
    this.getWeatherBtn.textContent = '🌤️ Получение...';
    
    try {
      const weatherData = await this.fetchWeather(lat, lon);
      this.displayWeather(weatherData);
      this.hideError();
      
      // Сохраняем координаты
      this.saveCoords(lat, lon);
      
    } catch (error) {
      console.error('Ошибка получения погоды:', error);
      this.showError('Не удалось получить погоду. Проверьте координаты или попробуйте позже.');
    } finally {
      this.getWeatherBtn.disabled = false;
      this.getWeatherBtn.textContent = this.getTranslation('getWeather');
    }
  }
  
  // Запрос к API OpenWeatherMap
  async fetchWeather(lat, lon) {
    const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Отображение погоды
  displayWeather(data) {
    // Основная информация
    document.getElementById('weatherIcon').textContent = this.getWeatherIcon(data.weather[0].id);
    document.getElementById('weatherTemp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    
    // Детали
    document.getElementById('weatherWind').textContent = `${data.wind.speed} м/с`;
    document.getElementById('weatherWindDir').textContent = this.getWindDirection(data.wind.deg);
    document.getElementById('weatherHumidity').textContent = `${data.main.humidity}%`;
    document.getElementById('weatherPressure').textContent = `${Math.round(data.main.pressure)} гПа`;
    
    // Местоположение
    document.getElementById('weatherLocation').textContent = `📍 ${data.name}, ${data.sys.country}`;
    
    // Показываем информацию
    this.weatherInfo.style.display = 'block';
  }
  
  // Получение иконки погоды
  getWeatherIcon(weatherId) {
    const icons = {
      200: '⛈️', // гроза с дождем
      300: '🌧️', // морось
      500: '🌧️', // дождь
      600: '❄️', // снег
      700: '🌫️', // туман
      800: '☀️', // ясно
      801: '🌤️', // малооблачно
      802: '⛅', // облачно
      803: '☁️', // пасмурно
      804: '☁️'  // пасмурно
    };
    
    const category = Math.floor(weatherId / 100);
    return icons[weatherId] || icons[category * 100] || '🌤️';
  }
  
  // Получение направления ветра
  getWindDirection(degrees) {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
  
  // Обновление погоды
  async refreshWeather() {
    if (this.weatherInfo.style.display !== 'none') {
      await this.getWeatherByCoords();
    }
  }
  
  // Сохранение координат в localStorage
  saveCoords(lat, lon) {
    localStorage.setItem('weather_lat', lat.toString());
    localStorage.setItem('weather_lon', lon.toString());
  }
  
  // Загрузка сохраненных координат
  loadSavedCoords() {
    const lat = localStorage.getItem('weather_lat');
    const lon = localStorage.getItem('weather_lon');
    
    if (lat && lon) {
      this.weatherLat.value = lat;
      this.weatherLon.value = lon;
    }
  }
  
  // Показ ошибки
  showError(message) {
    this.weatherError.querySelector('p').textContent = `❌ ${message}`;
    this.weatherError.style.display = 'block';
    this.weatherInfo.style.display = 'none';
  }
  
  // Скрытие ошибки
  hideError() {
    this.weatherError.style.display = 'none';
  }
  
  // Получение перевода
  getTranslation(key) {
    const lang = window.lang || 'ru';
    const translations = window.translations?.[lang] || {};
    return translations[key] || key;
  }
  
  // Обновление языка
  updateLanguage() {
    this.getLocationBtn.textContent = this.getTranslation('getLocation');
    this.refreshWeatherBtn.textContent = this.getTranslation('refreshWeather');
    this.getWeatherBtn.textContent = this.getTranslation('getWeather');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, есть ли API ключ
  const apiKey = prompt('Введите ваш API ключ OpenWeatherMap (или нажмите Отмена для демо):');
  
  if (apiKey) {
    // Создаем экземпляр сервиса погоды
    const weatherService = new WeatherService();
    
    // Устанавливаем API ключ
    weatherService.apiKey = apiKey;
    
    // Сохраняем в localStorage
    localStorage.setItem('weather_api_key', apiKey);
    
    // Делаем глобально доступным
    window.weatherService = weatherService;
    
  } else {
    // Демо режим без API
    console.log('Демо режим погоды - API ключ не введен');
    
    // Показываем сообщение о необходимости API ключа
    const weatherSection = document.getElementById('weather-section');
    if (weatherSection) {
      weatherSection.innerHTML = `
        <h2>🌤️ Погода</h2>
        <hr style="margin: 12px 0; border-color: #ccc;">
        <div style="text-align: center; padding: 40px 20px;">
          <p>Для работы с погодой необходим API ключ OpenWeatherMap</p>
          <p><a href="https://openweathermap.org/api" target="_blank" style="color: #2196F3;">Получить бесплатный ключ</a></p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            После получения ключа обновите страницу и введите его
          </p>
        </div>
      `;
    }
  }
});

// Обновление языка при смене
document.addEventListener('languageChanged', () => {
  if (window.weatherService) {
    window.weatherService.updateLanguage();
  }
});