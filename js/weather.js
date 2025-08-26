// Weather functionality for NaviMate
// Simple GPS weather with OpenWeatherMap API

class WeatherService {
  constructor() {
    this.apiKey = localStorage.getItem('weather_api_key') || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.units = 'metric';
    this.lang = 'ru';
    
    this.weatherInfo = document.getElementById('weatherInfo');
    this.weatherError = document.getElementById('weatherError');
    this.getWeatherBtn = document.getElementById('getWeatherBtn');
    
    this.init();
  }
  
  init() {
    this.getWeatherBtn.addEventListener('click', () => this.getWeather());
    this.updateLanguage();
  }
  
  // Получение погоды по GPS
  async getWeather() {
    if (!navigator.geolocation) {
      this.showError('Геолокация не поддерживается вашим браузером');
      return;
    }
    
    this.getWeatherBtn.disabled = true;
    this.getWeatherBtn.textContent = '🌤️ Получение...';
    
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const weatherData = await this.fetchWeather(latitude, longitude);
      this.displayWeather(weatherData);
      this.hideError();
      
    } catch (error) {
      console.error('Ошибка получения погоды:', error);
      this.showError('Не удалось получить погоду. Проверьте разрешения GPS.');
    } finally {
      this.getWeatherBtn.disabled = false;
      this.getWeatherBtn.textContent = this.getTranslation('getWeather');
    }
  }
  
  // Promise-обертка для getCurrentPosition
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 минут
      });
    });
  }
  
  // Запрос к API OpenWeatherMap
  async fetchWeather(lat, lon) {
    if (!this.apiKey) {
      throw new Error('API ключ не найден');
    }
    
    const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Неверный API ключ');
      } else if (response.status === 429) {
        throw new Error('Превышен лимит запросов');
      } else {
        throw new Error(`Ошибка API: ${response.status}`);
      }
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
    this.getWeatherBtn.textContent = this.getTranslation('getWeather');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, есть ли API ключ
  const apiKey = localStorage.getItem('weather_api_key');
  
  if (apiKey) {
    // Создаем экземпляр сервиса погоды
    const weatherService = new WeatherService();
    window.weatherService = weatherService;
    
    // Заполняем поле в настройках
    const apiKeyInput = document.getElementById('weather-api-key');
    if (apiKeyInput) {
      apiKeyInput.value = apiKey;
    }
    
  } else {
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
            Введите ключ в настройках и нажмите "Сохранить"
          </p>
        </div>
      `;
    }
  }
  
  // Обработчик для сохранения API ключа
  const saveApiBtn = document.getElementById('save-weather-api');
  if (saveApiBtn) {
    saveApiBtn.addEventListener('click', () => {
      const apiKeyInput = document.getElementById('weather-api-key');
      const newApiKey = apiKeyInput.value.trim();
      
      if (newApiKey) {
        localStorage.setItem('weather_api_key', newApiKey);
        
        // Перезагружаем страницу для применения ключа
        location.reload();
      }
    });
  }
});

// Обновление языка при смене
document.addEventListener('languageChanged', () => {
  if (window.weatherService) {
    window.weatherService.updateLanguage();
  }
});