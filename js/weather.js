// Weather functionality for NaviMate
// Simple GPS weather with OpenWeatherMap API

class WeatherService {
  constructor() {
    // OpenWeatherMap API (основной)
    this.apiKey = (typeof window !== 'undefined' && window.OPENWEATHER_API_KEY) ? window.OPENWEATHER_API_KEY : 'd8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
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
      this.showError(this.getTranslation('geolocationError'));
      return;
    }
    
    this.getWeatherBtn.disabled = true;
    this.getWeatherBtn.textContent = `🌤️ ${this.getTranslation('gettingWeather')}`;
    
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Получаем текущую погоду и прогноз
      const [weatherData, forecastData] = await Promise.all([
        this.fetchWeather(latitude, longitude),
        this.fetchForecast(latitude, longitude)
      ]);
      
      // Параллельно получаем УФ индекс (Open-Meteo)
      const uvPromise = this.fetchUvIndex(latitude, longitude);
      
      this.displayWeather(weatherData);
      this.displayForecast(forecastData);
      
      const uv = await uvPromise;
      if (uv != null) {
        const desc = this.getUvDescription(uv);
        document.getElementById('weatherUvIndex').textContent = `${uv} (${desc})`;
      }
      
      // Переоценка палубы с учётом UV и осадков из ближайшего прогноза и текущих
      let hasPrecip = false;
      try {
        if (weatherData && (weatherData.rain || weatherData.snow)) {
          hasPrecip = true;
        }
        if (!hasPrecip && forecastData && forecastData.list && forecastData.list.length) {
          const f0 = forecastData.list[0];
          hasPrecip = !!(f0.rain || f0.snow);
        }
      } catch(e) {}
      const deck = this.evaluateDeckRisk(uv, weatherData.main.temp, weatherData.wind.speed, weatherData.main.humidity, hasPrecip);
      this.setDeckInfo(deck.message, deck.riskClass);
      
      this.hideError();
      
    } catch (error) {
      console.error('Ошибка получения погоды:', error);
      
      // Более детальная обработка ошибок
      if (error.code === 1) {
        this.showError(this.getTranslation('geolocationError'));
      } else if (error.code === 2) {
        this.showError(this.getTranslation('gpsPermissionError'));
      } else if (error.code === 3) {
        this.showError(this.getTranslation('gpsTimeoutError'));
      } else if (error.message && error.message.includes('API')) {
        this.showError(this.getTranslation('apiKeyError'));
      } else {
        this.showError(this.getTranslation('weatherError'));
      }
    } finally {
      this.getWeatherBtn.disabled = false;
      this.getWeatherBtn.textContent = this.getTranslation('getWeather');
    }
  }
  
  // Улучшенный флоу получения геопозиции с несколькими стратегиями
  getCurrentPosition() {
    const fastCached = { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 };
    const hiWatch = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };
    const loWatch = { enableHighAccuracy: false, timeout: 35000, maximumAge: 600000 };

    const once = (opts) => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });

    const watchFor = (opts, msTimeout) => new Promise((resolve, reject) => {
      let watchId = null;
      const done = (fn) => (val) => { if (watchId != null) navigator.geolocation.clearWatch(watchId); clearTimeout(timer); fn(val); };
      const timer = setTimeout(done(reject), msTimeout || 15000, { code: 3, message: 'watchPosition timeout' });
      watchId = navigator.geolocation.watchPosition(done(resolve), done(reject), opts);
    });

    // 1) Быстрый cached (часто спасает на мобиле)
    return once(fastCached)
      // 2) Если не получилось — hi-accuracy watch 15 c
      .catch(() => watchFor(hiWatch, 15000))
      // 3) Если всё ещё нет — low-accuracy watch 15 c
      .catch(() => watchFor(loWatch, 15000));
  }
  
  // Запрос к API OpenWeatherMap для текущей погоды
  async fetchWeather(lat, lon) {
    if (!this.apiKey) {
      throw new Error(this.getTranslation('apiKeyNotFound'));
    }
    
    const lang = window.lang || 'ru';
    const apiLang = lang === 'en' ? 'en' : 'ru';
    const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${apiLang}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(this.getTranslation('apiKeyError'));
      } else if (response.status === 429) {
        throw new Error(this.getTranslation('apiLimitError'));
      } else {
        throw new Error(`${this.getTranslation('apiError')}: ${response.status}`);
      }
    }
    
    return await response.json();
  }
  
  // Запрос к API OpenWeatherMap для прогноза
  async fetchForecast(lat, lon) {
    if (!this.apiKey) {
      throw new Error(this.getTranslation('apiKeyNotFound'));
    }
    
    const lang = window.lang || 'ru';
    const apiLang = lang === 'en' ? 'en' : 'ru';
    const url = `${this.forecastUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${apiLang}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(this.getTranslation('apiKeyError'));
      } else if (response.status === 429) {
        throw new Error(this.getTranslation('apiLimitError'));
      } else {
        throw new Error(`${this.getTranslation('apiError')}: ${response.status}`);
      }
    }
    
    return await response.json();
  }

  async fetchUvIndex(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json && json.current && typeof json.current.uv_index !== 'undefined' ? json.current.uv_index : null;
  }
  
  // Отображение погоды
  displayWeather(data) {
    // Основная информация
    document.getElementById('weatherIcon').textContent = this.getWeatherIcon(data.weather[0].id);
    document.getElementById('weatherTemp').textContent = `${Math.round(data.main.temp)}°C`;
    
    // Переводим описание погоды
    const weatherDesc = this.translateWeatherDescription(data.weather[0].description, data.weather[0].id);
    document.getElementById('weatherDesc').textContent = weatherDesc;
    
    // Детали с описанием ветра по шкале Бофорта
    const windSpeed = data.wind.speed;
    const windDescription = this.getBeaufortDescription(windSpeed);
    const lang = window.lang || 'ru';
    const windUnit = lang === 'en' ? 'm/s' : 'м/с';
    document.getElementById('weatherWind').textContent = `${windSpeed} ${windUnit} (${windDescription})`;
    document.getElementById('weatherWindDir').textContent = this.getWindDirection(data.wind.deg);
    document.getElementById('weatherHumidity').textContent = `${data.main.humidity}%`;
    
    // Видимость (если есть)
    if (data.visibility != null) {
      const v = Math.max(0, Number(data.visibility));
      const lang = window.lang || 'ru';
      if (v >= 10000) {
        const unit = lang === 'en' ? 'km' : 'км';
        document.getElementById('weatherVisibility').textContent = `>10 ${unit}`;
      } else if (v >= 1000) {
        const km = (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1);
        const unit = lang === 'en' ? 'km' : 'км';
        document.getElementById('weatherVisibility').textContent = `${km} ${unit}`;
      } else {
        const m = Math.round(v);
        const unit = lang === 'en' ? 'm' : 'м';
        document.getElementById('weatherVisibility').textContent = `${m} ${unit}`;
      }
    } else {
      document.getElementById('weatherVisibility').textContent = '--';
    }
    
    // УФ индекс (если есть)
    if (data.uvi !== undefined) {
      document.getElementById('weatherUvIndex').textContent = `${data.uvi}`;
    } else {
      document.getElementById('weatherUvIndex').textContent = '--';
    }
    
    // Местоположение
    const cityName = this.translateCityName(data.name);
    const countryCode = data.sys.country;
    const flag = this.getFlagEmoji(countryCode);
    const locationText = `${flag} ${cityName}`;
    document.getElementById('weatherLocation').textContent = locationText;
    
    // После базовых параметров — предварительная оценка без UV (если он ещё не получен)
    const prelim = this.evaluateDeckRisk(undefined, data.main.temp, windSpeed, data.main.humidity, false);
    this.setDeckInfo(prelim.message, prelim.riskClass);
    
    // Показываем информацию
    this.weatherInfo.style.display = 'block';
    
    // Обновляем язык для всех элементов
    this.updateAllWeatherElements();
    
    // Принудительно обновляем язык после отображения
    setTimeout(() => {
      this.forceUpdateAllElements();
    }, 100);
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
          const lang = window.lang || 'ru';
          const windUnit = lang === 'en' ? 'm/s' : 'м/с';
          document.getElementById(`forecastWind${periodId}`).textContent = 
            `${windSpeed} ${windUnit} (${windDescription})`;
        }
      }
    });
    
    // Показываем прогноз
    document.getElementById('weatherForecast').style.display = 'block';
    
    // Обновляем язык для прогноза
    setTimeout(() => {
      this.forceUpdateAllElements();
    }, 100);
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
    const lang = window.lang || 'ru';
    
    if (lang === 'en') {
      // Английские направления с стрелками (куда дует ветер)
      const directions = ['↓N', '↙NE', '←E', '↖SE', '↑S', '↗SW', '→W', '↘NW'];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    } else {
      // Русские направления с стрелками (куда дует ветер)
      const directions = ['↓С', '↙СВ', '←В', '↖ЮВ', '↑Ю', '↗ЮЗ', '→З', '↘СЗ'];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    }
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
  
  // Перевод описания погоды
  translateWeatherDescription(description, weatherId) {
    const lang = window.lang || 'ru';
    
    // Словарь переводов для основных описаний
    const weatherTranslations = {
      ru: {
        'clear sky': 'ясно',
        'few clouds': 'малооблачно',
        'scattered clouds': 'рассеянные облака',
        'broken clouds': 'облачно',
        'overcast clouds': 'пасмурно',
        'light rain': 'легкий дождь',
        'moderate rain': 'умеренный дождь',
        'heavy rain': 'сильный дождь',
        'light snow': 'легкий снег',
        'moderate snow': 'умеренный снег',
        'heavy snow': 'сильный снег',
        'mist': 'туман',
        'fog': 'туман',
        'thunderstorm': 'гроза'
      },
      en: {
        'ясно': 'clear sky',
        'малооблачно': 'few clouds',
        'рассеянные облака': 'scattered clouds',
        'облачно': 'broken clouds',
        'пасмурно': 'overcast clouds',
        'легкий дождь': 'light rain',
        'умеренный дождь': 'moderate rain',
        'сильный дождь': 'heavy rain',
        'легкий снег': 'light snow',
        'умеренный снег': 'moderate snow',
        'сильный снег': 'heavy snow',
        'туман': 'fog',
        'гроза': 'thunderstorm'
      }
    };
    
    const translations = weatherTranslations[lang] || {};
    return translations[description.toLowerCase()] || description;
  }
  
  // Перевод названий городов
  translateCityName(cityName) {
    const lang = window.lang || 'ru';
    
    const cityTranslations = {
      ru: {
        'Belgrade': 'Белград',
        'Budapest': 'Будапешт',
        'Vienna': 'Вена',
        'Bratislava': 'Братислава',
        'Bucharest': 'Бухарест',
        'Sofia': 'София',
        'Zagreb': 'Загреб',
        'Novi Sad': 'Нови-Сад',
        'Subotica': 'Суботица',
        'Debrecen': 'Дебрецен',
        'Szeged': 'Сегед',
        'Gyor': 'Дьёр',
        'Linz': 'Линц',
        'Graz': 'Грац',
        'Kosice': 'Кошице',
        'Nitra': 'Нитра',
        'Constanta': 'Констанца',
        'Timisoara': 'Тимишоара',
        'Varna': 'Варна',
        'Burgas': 'Бургас',
        'Split': 'Сплит',
        'Rijeka': 'Риека'
      },
      en: {
        'Белград': 'Belgrade',
        'Будапешт': 'Budapest',
        'Вена': 'Vienna',
        'Братислава': 'Bratislava',
        'Бухарест': 'Bucharest',
        'София': 'Sofia',
        'Загреб': 'Zagreb',
        'Нови-Сад': 'Novi Sad',
        'Суботица': 'Subotica',
        'Дебрецен': 'Debrecen',
        'Сегед': 'Szeged',
        'Дьёр': 'Gyor',
        'Линц': 'Linz',
        'Грац': 'Graz',
        'Кошице': 'Kosice',
        'Нитра': 'Nitra',
        'Констанца': 'Constanta',
        'Тимишоара': 'Timisoara',
        'Варна': 'Varna',
        'Бургас': 'Burgas',
        'Сплит': 'Split',
        'Риека': 'Rijeka'
      }
    };
    
    const translations = cityTranslations[lang] || {};
    return translations[cityName] || cityName;
  }
  
  // Перевод названий стран
  translateCountryName(countryCode) {
    const lang = window.lang || 'ru';
    
    const countryTranslations = {
      ru: {
        'RS': 'Сербия',
        'HU': 'Венгрия',
        'AT': 'Австрия',
        'SK': 'Словакия',
        'RO': 'Румыния',
        'BG': 'Болгария',
        'HR': 'Хорватия',
        'SI': 'Словения',
        'ME': 'Черногория',
        'BA': 'Босния и Герцеговина',
        'MK': 'Северная Македония',
        'AL': 'Албания',
        'GR': 'Греция',
        'TR': 'Турция',
        'UA': 'Украина',
        'MD': 'Молдова',
        'PL': 'Польша',
        'CZ': 'Чехия',
        'DE': 'Германия',
        'IT': 'Италия',
        'FR': 'Франция',
        'ES': 'Испания',
        'GB': 'Великобритания',
        'US': 'США',
        'CA': 'Канада'
      },
      en: {
        'RS': 'Serbia',
        'HU': 'Hungary',
        'AT': 'Austria',
        'SK': 'Slovakia',
        'RO': 'Romania',
        'BG': 'Bulgaria',
        'HR': 'Croatia',
        'SI': 'Slovenia',
        'ME': 'Montenegro',
        'BA': 'Bosnia and Herzegovina',
        'MK': 'North Macedonia',
        'AL': 'Albania',
        'GR': 'Greece',
        'TR': 'Turkey',
        'UA': 'Ukraine',
        'MD': 'Moldova',
        'PL': 'Poland',
        'CZ': 'Czech Republic',
        'DE': 'Germany',
        'IT': 'Italy',
        'FR': 'France',
        'ES': 'Spain',
        'GB': 'United Kingdom',
        'US': 'United States',
        'CA': 'Canada'
      }
    };
    
    const translations = countryTranslations[lang] || {};
    return translations[countryCode] || countryCode;
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
    
    // Обновляем сообщение об ошибке
    const weatherError = document.querySelector('.weather-error p');
    if (weatherError) {
      weatherError.textContent = this.getTranslation('weatherGeneralError');
    }
    
    // Обновляем текущую погоду (если есть)
    this.updateCurrentWeatherLanguage();
    
    // Обновляем все элементы погоды при смене языка
    this.updateAllWeatherElements();
  }
  
  // Обновление всех элементов погоды
  updateAllWeatherElements() {
    // Обновляем описание погоды
    const weatherDesc = document.getElementById('weatherDesc');
    if (weatherDesc && weatherDesc.textContent) {
      const currentDesc = weatherDesc.textContent;
      const translatedDesc = this.translateWeatherDescription(currentDesc);
      if (translatedDesc !== currentDesc) {
        weatherDesc.textContent = translatedDesc;
      }
    }
    
    // Обновляем местоположение - упрощённая логика
    const weatherLocation = document.getElementById('weatherLocation');
    if (weatherLocation && weatherLocation.textContent) {
      const txt = weatherLocation.textContent.trim();
      const flagMatch = txt.match(/^(\p{RI}\p{RI})\s+(.*)$/u);
      if (flagMatch) {
        const flag = flagMatch[1];
        const cityShown = flagMatch[2];
        // Простой перевод города
        const cityTranslated = this.translateCityName(cityShown);
        weatherLocation.textContent = `${flag} ${cityTranslated}`;
      }
    }
    
    // Обновляем единицы измерения и шкалу Бофорта
    this.updateWindUnitsAndBeaufort();
    
    // Принудительно обновляем все элементы при смене языка
    this.forceUpdateAllElements();
  }
  
  // Принудительное обновление всех элементов
  forceUpdateAllElements() {
    const lang = window.lang || 'ru';
    
    // Обновляем видимость
    const visibilityElement = document.getElementById('weatherVisibility');
    if (visibilityElement && visibilityElement.textContent !== '--') {
      const visibilityValue = visibilityElement.textContent.match(/^(\d+)/);
      if (visibilityValue) {
        const unit = lang === 'en' ? 'm' : 'м';
        visibilityElement.textContent = `${visibilityValue[1]} ${unit}`;
      }
    }
    
    // Обновляем ветер с шкалой Бофорта
    const currentWind = document.getElementById('weatherWind');
    if (currentWind && currentWind.textContent.includes('(')) {
      const windSpeed = currentWind.textContent.match(/^([\d.]+)/);
      if (windSpeed) {
        const windDescription = this.getBeaufortDescription(parseFloat(windSpeed[1]));
        const windUnit = lang === 'en' ? 'm/s' : 'м/с';
        currentWind.textContent = `${windSpeed[1]} ${windUnit} (${windDescription})`;
      }
    }
    
    // Обновляем прогноз ветра
    ['Morning', 'Day', 'Evening', 'Night'].forEach(period => {
      const forecastWind = document.getElementById(`forecastWind${period}`);
      if (forecastWind && forecastWind.textContent.includes('(')) {
        const windSpeed = forecastWind.textContent.match(/^([\d.]+)/);
        if (windSpeed) {
          const windDescription = this.getBeaufortDescription(parseFloat(windSpeed[1]));
          const windUnit = lang === 'en' ? 'm/s' : 'м/с';
          forecastWind.textContent = `${windSpeed[1]} ${windUnit} (${windDescription})`;
        }
      }
    });
  }
  
  // Обновление языка для текущей погоды
  updateCurrentWeatherLanguage() {
    const windLabel = document.querySelector('.weather-item[data-type="wind"] .weather-label');
    if (windLabel) {
      windLabel.textContent = this.getTranslation('wind');
    }
    
    const humidityLabel = document.querySelector('.weather-item[data-type="humidity"] .weather-label');
    if (humidityLabel) {
      humidityLabel.textContent = this.getTranslation('humidity');
    }
    
    const visibilityLabel = document.querySelector('.weather-item[data-type="visibility"] .weather-label');
    if (visibilityLabel) {
      visibilityLabel.textContent = this.getTranslation('visibility');
    }
    
    const uvIndexLabel = document.querySelector('.weather-item[data-type="uvIndex"] .weather-label');
    if (uvIndexLabel) {
      uvIndexLabel.textContent = this.getTranslation('uvIndex');
    }
    
    // Обновляем единицы измерения ветра и шкалу Бофорта
    this.updateWindUnitsAndBeaufort();
    
    // Обновляем описание УФ индекса под текущий язык (если значение уже показано)
    const uvEl = document.getElementById('weatherUvIndex');
    if (uvEl && uvEl.textContent && uvEl.textContent !== '--') {
      const match = uvEl.textContent.match(/([\d.]+)/);
      if (match) {
        const uv = parseFloat(match[1]);
        const desc = this.getUvDescription(uv);
        uvEl.textContent = `${uv} (${desc})`;
      }
    }
    // Локализуем текст палубы (если он в текущей локали не совпадает)
    const deckText = document.getElementById('deckText');
    if (deckText && deckText.textContent) {
      // Принудительный пересчёт для текущего языка
      const windVal = parseFloat((document.getElementById('weatherWind')?.textContent || '').match(/([\d.]+)/)?.[1] || 'NaN');
      const humVal = parseFloat((document.getElementById('weatherHumidity')?.textContent || '').match(/([\d.]+)/)?.[1] || 'NaN');
      const tempVal = parseFloat((document.getElementById('weatherTemp')?.textContent || '').match(/-?[\d.]+/)?.[0] || 'NaN');
      const uvVal = parseFloat((uvEl?.textContent || '').match(/([\d.]+)/)?.[1] || 'NaN');
      const deck = this.evaluateDeckRisk(isNaN(uvVal)?undefined:uvVal, isNaN(tempVal)?undefined:tempVal, isNaN(windVal)?undefined:windVal, isNaN(humVal)?undefined:humVal, false);
      this.setDeckInfo(deck.message, deck.riskClass);
    }
  }
  
  // Обновление единиц ветра и шкалы Бофорта
  updateWindUnitsAndBeaufort() {
    // Теперь вся логика перенесена в forceUpdateAllElements
    this.forceUpdateAllElements();
  }

  reverseCountryLookup(localizedName) {
    const maps = {
      ru: {
        'Сербия':'RS','Венгрия':'HU','Австрия':'AT','Словакия':'SK','Румыния':'RO','Болгария':'BG','Хорватия':'HR','Словения':'SI','Черногория':'ME','Босния и Герцеговина':'BA','Северная Македония':'MK','Албания':'AL','Греция':'GR','Турция':'TR','Украина':'UA','Молдова':'MD','Польша':'PL','Чехия':'CZ','Германия':'DE','Италия':'IT','Франция':'FR','Испания':'ES','Великобритания':'GB','США':'US','Канада':'CA'
      },
      en: {
        'Serbia':'RS','Hungary':'HU','Austria':'AT','Slovakia':'SK','Romania':'RO','Bulgaria':'BG','Croatia':'HR','Slovenia':'SI','Montenegro':'ME','Bosnia and Herzegovina':'BA','North Macedonia':'MK','Albania':'AL','Greece':'GR','Turkey':'TR','Ukraine':'UA','Moldova':'MD','Poland':'PL','Czech Republic':'CZ','Germany':'DE','Italy':'IT','France':'FR','Spain':'ES','United Kingdom':'GB','United States':'US','Canada':'CA'
      }
    };
    const current = window.lang || 'ru';
    const map = maps[current] || maps.ru;
    return map[localizedName] || localizedName;
  }

  getUvDescription(uv) {
    const v = Number(uv);
    const lang = window.lang || 'ru';
    const ranges = [
      { max: 2.9, ru: 'низкий', en: 'low' },
      { max: 5.9, ru: 'умеренный', en: 'moderate' },
      { max: 7.9, ru: 'высокий', en: 'high' },
      { max: 10.9, ru: 'очень высокий', en: 'very high' },
      { max: Infinity, ru: 'крайне высокий', en: 'extreme' }
    ];
    const item = ranges.find(r => v <= r.max) || ranges[0];
    return lang === 'en' ? item.en : item.ru;
  }

  getFlagEmoji(code) {
    if (!code || code.length !== 2) return '';
    const base = 127397; // 'A' -> 🇦 offset
    const chars = code.toUpperCase().split('').map(c => String.fromCodePoint(base + c.charCodeAt(0))).join('');
    return chars;
  }

  setDeckInfo(message, riskClass) {
    const box = document.getElementById('weatherDeck');
    const text = document.getElementById('deckText');
    if (!box || !text) return;
    box.classList.remove('risk-low','risk-medium','risk-high','risk-very-high','risk-extreme');
    if (riskClass) box.classList.add(riskClass);
    text.textContent = message || '—';
  }

  evaluateDeckRisk(uv, tempC, windMs, humidityPct, hasPrecip) {
    const lang = window.lang || 'ru';
    const M = (ru, en) => (lang === 'en' ? en : ru);

    // Normalize inputs
    const uvVal = (typeof uv === 'number' && !isNaN(uv)) ? uv : null;
    const t = typeof tempC === 'number' ? tempC : null;
    const w = typeof windMs === 'number' ? windMs : null;
    const h = typeof humidityPct === 'number' ? humidityPct : null;
    const p = !!hasPrecip;

    // Helper to pick
    const res = (msg, cls) => ({ message: msg, riskClass: cls });

    // Highest priority conditions
    if (w != null && w > 25 && !p) {
      return res(M('Опасно: шторм/ураган', 'Danger: storm/gale'), 'risk-extreme');
    }
    if (t != null && t > 40 && (w == null || w < 10) && (h == null || h > 50) && !p) {
      return res(M('Крайне опасно', 'Extremely dangerous'), 'risk-extreme');
    }
    if (p) {
      return res(M('Опасно: дождь/шторм', 'Danger: rain/storm'), 'risk-high');
    }

    // UV 8+ very high
    if (uvVal != null && uvVal >= 8 && !p) {
      return res(M('Очень высокий риск ожогов', 'Very high sunburn risk'), 'risk-very-high');
    }

    // Temperature bands with humidity and wind
    if (t != null && t >= 35 && t < 40 && (w == null || w < 5) && (h != null && h > 50) && !p) {
      return res(M('Опасно: перегрев', 'Danger: heat stress'), 'risk-very-high');
    }
    if (t != null && t >= 30 && t < 35 && (w == null || w < 5) && (h != null && h > 60) && !p) {
      return res(M('Жарко, риск перегрева', 'Hot, heat stress risk'), 'risk-high');
    }

    // UV 6–7
    if (uvVal != null && uvVal >= 6 && uvVal <= 7 && (t == null || t <= 30) && (h == null || h < 70) && !p) {
      if (w != null && w > 10) {
        return res(M('Ожоги возможны, но ветер спасает', 'Sunburn possible, wind helps'), 'risk-medium');
      }
      return res(M('Высокий риск ожогов', 'High sunburn risk'), 'risk-high');
    }

    // UV 3–5
    if (uvVal != null && uvVal >= 3 && uvVal <= 5 && (t == null || t <= 30) && (h == null || h < 70) && !p) {
      if (w != null && w > 20) {
        return res(M('Опасно: ветер + ожоги', 'Danger: wind + sunburn'), 'risk-very-high');
      }
      return res(M('Риск солнечных ожогов', 'Sunburn risk'), 'risk-medium');
    }

    // UV 0–2
    if (uvVal != null && uvVal <= 2 && (t == null || t <= 30) && !p) {
      if (w != null && w > 20) {
        return res(M('Опасно: сильный ветер', 'Danger: strong wind'), 'risk-high');
      }
      if (w != null && w >= 10 && w <= 20 && (h == null || h < 70)) {
        return res(M('Свежо, но дует', 'Fresh, but windy'), 'risk-medium');
      }
      if ((w == null || w < 10) && (h == null || h < 70)) {
        return res(M('Комфортно', 'Comfortable'), 'risk-low');
      }
    }

    // Fallback generic
    return res(M('Приемлемо', 'Acceptable'), 'risk-low');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Создаем экземпляр сервиса погоды (API ключ уже настроен)
  const weatherService = new WeatherService();
  window.weatherService = weatherService;
});

// Обновление языка при смене
document.addEventListener('languageChanged', () => {
  if (window.weatherService) {
    window.weatherService.updateLanguage();
  }
});