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
      
      // Получаем текущую погоду и прогноз
      const [weatherData, forecastData] = await Promise.all([
        this.fetchWeather(latitude, longitude),
        this.fetchForecast(latitude, longitude)
      ]);
      
      this.displayWeather(weatherData);
      this.displayForecast(forecastData);
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
  
  // Запрос к API OpenWeatherMap для текущей погоды
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
  
  // Запрос к API OpenWeatherMap для прогноза
  async fetchForecast(lat, lon) {
    if (!this.apiKey) {
      throw new Error('API ключ не найден');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
    
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
    
    // Детали с описанием ветра по шкале Бофорта
    const windSpeed = data.wind.speed;
    const windDescription = this.getBeaufortDescription(windSpeed);
    document.getElementById('weatherWind').textContent = `${windSpeed} м/с (${windDescription})`;
    document.getElementById('weatherWindDir').textContent = this.getWindDirection(data.wind.deg);
    document.getElementById('weatherHumidity').textContent = `${data.main.humidity}%`;
    document.getElementById('weatherPressure').textContent = `${Math.round(data.main.pressure)} гПа`;
    
    // Местоположение
    document.getElementById('weatherLocation').textContent = `📍 ${data.name}, ${data.sys.country}`;
    
    // Показываем информацию
    this.weatherInfo.style.display = 'block';
  }
  
  // Отображение прогноза погоды
  displayForecast(data) {
    // Получаем прогноз на завтра (24 часа вперед)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Находим прогнозы для разных периодов дня
    const forecasts = {
      morning: this.findForecastForTime(data.list, 6), // 6:00
      day: this.findForecastForTime(data.list, 12),   // 12:00
      evening: this.findForecastForTime(data.list, 18), // 18:00
      night: this.findForecastForTime(data.list, 0)   // 0:00
    };
    
    // Обновляем UI
    Object.keys(forecasts).forEach(period => {
      const forecast = forecasts[period];
      if (forecast) {
        const periodId = period.charAt(0).toUpperCase() + period.slice(1);
        document.getElementById(`forecastIcon${periodId}`).textContent = 
          this.getWeatherIcon(forecast.weather[0].id);
        document.getElementById(`forecastTemp${periodId}`).textContent = 
          `${Math.round(forecast.main.temp)}°C`;
        
        // Добавляем скорость ветра с описанием
        if (forecast.wind && forecast.wind.speed) {
          const windSpeed = forecast.wind.speed;
          const windDescription = this.getBeaufortDescription(windSpeed);
          document.getElementById(`forecastWind${periodId}`).textContent = 
            `${windSpeed} м/с (${windDescription})`;
        }
      }
    });
    
    // Показываем прогноз
    document.getElementById('weatherForecast').style.display = 'block';
  }
  
  // Поиск прогноза для определенного времени
  findForecastForTime(forecastList, targetHour) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(targetHour, 0, 0, 0);
    
    // Ищем ближайший прогноз к целевому времени
    let closest = null;
    let minDiff = Infinity;
    
    forecastList.forEach(forecast => {
      const forecastTime = new Date(forecast.dt * 1000);
      const diff = Math.abs(forecastTime.getTime() - tomorrow.getTime());
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = forecast;
      }
    });
    
    return closest;
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
  
  // Получение описания ветра по шкале Бофорта
  getBeaufortDescription(speed) {
    const lang = window.lang || 'ru';
    
    if (lang === 'en') {
      // Английские описания
      if (speed < 0.3) return 'calm';
      if (speed < 1.6) return 'light air';
      if (speed < 3.4) return 'light breeze';
      if (speed < 5.5) return 'gentle breeze';
      if (speed < 8.0) return 'moderate breeze';
      if (speed < 10.8) return 'fresh breeze';
      if (speed < 13.9) return 'strong breeze';
      if (speed < 17.2) return 'high wind';
      if (speed < 20.8) return 'gale';
      if (speed < 24.5) return 'strong gale';
      if (speed < 28.5) return 'storm';
      if (speed < 32.7) return 'violent storm';
      return 'hurricane';
    } else {
      // Русские описания
      if (speed < 0.3) return 'штиль';
      if (speed < 1.6) return 'тихий';
      if (speed < 3.4) return 'легкий';
      if (speed < 5.5) return 'слабый';
      if (speed < 8.0) return 'умеренный';
      if (speed < 10.8) return 'свежий';
      if (speed < 13.9) return 'сильный';
      if (speed < 17.2) return 'крепкий';
      if (speed < 20.8) return 'очень крепкий';
      if (speed < 24.5) return 'шторм';
      if (speed < 28.5) return 'сильный шторм';
      if (speed < 32.7) return 'жестокий шторм';
      return 'ураган';
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
    // Обновляем кнопку
    this.getWeatherBtn.textContent = this.getTranslation('getWeather');
    
    // Обновляем подсказку
    const weatherHint = document.querySelector('.weather-hint');
    if (weatherHint) {
      weatherHint.textContent = this.getTranslation('weatherHint');
    }
    
    // Обновляем заголовок прогноза
    const forecastHeading = document.querySelector('.weather-forecast h3');
    if (forecastHeading) {
      forecastHeading.textContent = this.getTranslation('forecastHeading');
    }
    
    // Обновляем времена прогноза
    const forecastTimes = document.querySelectorAll('.forecast-time');
    forecastTimes.forEach((time, index) => {
      const keys = ['forecastMorning', 'forecastDay', 'forecastEvening', 'forecastNight'];
      if (keys[index]) {
        time.textContent = this.getTranslation(keys[index]);
      }
    });
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
  

});

// Обновление языка при смене
document.addEventListener('languageChanged', () => {
  if (window.weatherService) {
    window.weatherService.updateLanguage();
  }
});