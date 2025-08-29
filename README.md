# 🌊 NaviMate - Цифровой помощник судоводителя

**RU/EN** | [English](#english) | [Русский](#russian)

---

## 🇷🇺 Русский

### ℹ️ О приложении

**📱 NaviMate** — современный цифровой помощник судоводителя на внутренних водных путях Европы. Приложение предоставляет комплексные инструменты для навигации, планирования маршрутов и мониторинга погодных условий.

### 🚢 Основные инструменты

#### 🔁 Расчёт встречи судов
- **Главная особенность** — мгновенный расчёт **километра встречи**, что в разы упрощает и ускоряет навигационные задачи
- Показывает км встречи, расстояние до неё и ориентировочное время до встречи
- Поддержка нескольких одновременных расчётов
- Быстрое копирование данных нашего судна (позиция и скорость) из первого блока
- Уведомления об ошибках ввода и граничных значениях
- **Адаптивный интерфейс** для мобильных и ПК устройств
- **Определение ближайших мест ожидания** для вверх идущих судов (от Велико-Градиште до Линца)
- **Определение рекомендуемого борта расхождения** для мест ожидания

#### 🕒 Расчёт времени прибытия
- Позволяет рассчитать **время прибытия** и **необходимую скорость** для заданного времени
- **Учитывает рабочие смены судна** — автоматически рассчитывает время с учетом графика работы (например, 06:00-18:00)
- Учитываются расстояние, скорость, задержки на шлюзах и границах
- Автоматически определяется направление движения
- **Расчёт рекомендованной скорости** — показывает оптимальную скорость для прибытия в заданное время с учетом рабочих часов

#### 🌤️ Погода и условия на палубе
- **Получение погоды по GPS** — текущие условия в реальном времени
- **Детальная информация о ветре**:
  - Скорость ветра с описанием по шкале Бофорта
  - **Порывы ветра** (если доступны через API)
  - Направление ветра
- **Условия на палубе** — автоматическая оценка комфортности работы на палубе
- **Прогноз погоды** на следующий день (утро, день, вечер, ночь)
- **UV индекс** для оценки солнечной активности
- **Адаптивный дизайн** — корректное отображение на всех устройствах

#### ⚓ Шлюзы и 🛃 границы
- Автоматически учитываются все ключевые шлюзы от **Железных Ворот до Ашаха**
- Пограничные переходы определяются по маршруту, с возможностью ручного редактирования задержек
- **База данных задержек** для основных пограничных пунктов

#### 🌍 Многоязычность
- **Полная поддержка русского и английского языков**
- Автоматическое переключение языка для всех элементов интерфейса
- Локализованные названия городов и стран
- Адаптивные единицы измерения (м/с, км/ч, °C)

#### 🎨 Интерфейс и темы
- **Тёмная и светлая тема** с автоматическим переключением
- **Адаптивный дизайн** — оптимизирован для мобильных и ПК устройств
- **Современный UI/UX** с интуитивным управлением
- **Responsive layout** — корректное отображение на всех размерах экранов

#### 🔐 Приватность и оффлайн-режим
- Все расчёты выполняются **локально в вашем браузере**
- Данные **не сохраняются** и **не передаются** на сервер
- Приложение работает **без подключения к интернету** после первого открытия
- **Погодные данные** загружаются только при необходимости

### 💡 В планах развития
- Добавление информации об уровнях воды
- **Погода по маршруту** (на 3 дня)
- Страница поддержки проекта

### 🚀 Технические особенности
- **PWA (Progressive Web App)** — работает как нативное приложение
- **Service Worker** для оффлайн функциональности
- **Responsive CSS Grid и Flexbox** для адаптивного дизайна
- **OpenWeatherMap API** для метеоданных
- **Геолокация** для точного определения позиции
- **Локальное хранение** настроек и предпочтений

### 🙏 Благодарности
Спасибо, что используете **NaviMate**! Приложение активно развивается — всё только начинается.

---

## 🇬🇧 English

### ℹ️ About

**📱 NaviMate** — a modern digital navigation assistant for inland waterway captains in Europe. The application provides comprehensive tools for navigation, route planning, and weather monitoring.

### 🚢 Available Tools

#### 🔁 Meeting Calculation
- **Main feature** — instant calculation of **meeting kilometer**, greatly simplifying and speeding up navigation tasks
- Shows meeting km, distance to it, and estimated time to meet
- Supports multiple simultaneous calculations
- Quickly copy our ship's data (position and speed) from the first block
- Error notifications and boundary values
- **Adaptive interface** for mobile and PC devices
- **Determination of nearest waiting points** for upstream vessels (from Veliko Gradište to Linz)
- **Determination of recommended passing side** for waiting points

#### 🕒 Arrival Time Calculation
- Allows calculating **arrival time** and **required speed** for a given time
- **Accounts for ship working shifts** — automatically calculates time considering work schedule (e.g., 06:00-18:00)
- Takes into account distance, speed, delays at locks and borders
- Direction of movement is determined automatically
- **Recommended speed calculation** — shows optimal speed for arrival at specified time considering working hours

#### 🌤️ Weather and Deck Conditions
- **Get weather by GPS** — real-time current conditions
- **Detailed wind information**:
  - Wind speed with Beaufort scale description
  - **Wind gusts** (if available via API)
  - Wind direction
- **Deck conditions** — automatic assessment of deck work comfort
- **Weather forecast** for the next day (morning, day, evening, night)
- **UV index** for solar activity assessment
- **Adaptive design** — proper display on all devices

#### ⚓ Locks and 🛃 Borders
- Automatically accounts for all key locks from **Iron Gates to Asah**
- Border crossings are determined along the route, with the option to manually edit delays
- **Delay database** for major border checkpoints

#### 🌍 Multilingual Support
- **Full support for Russian and English languages**
- Automatic language switching for all interface elements
- Localized city and country names
- Adaptive units of measurement (m/s, km/h, °C)

#### 🎨 Interface and Themes
- **Dark and light themes** with automatic switching
- **Adaptive design** — optimized for mobile and PC devices
- **Modern UI/UX** with intuitive controls
- **Responsive layout** — proper display on all screen sizes

#### 🔐 Privacy and Offline Mode
- All calculations are performed **locally in your browser**
- Data **is not saved** and **not transmitted** to the server
- The app works **offline** after first opening
- **Weather data** is loaded only when needed

### 💡 Development Roadmap
- Adding information about water levels
- **Weather along the route** (for 3 days)
- Project support page

### 🚀 Technical Features
- **PWA (Progressive Web App)** — works like a native application
- **Service Worker** for offline functionality
- **Responsive CSS Grid and Flexbox** for adaptive design
- **OpenWeatherMap API** for weather data
- **Geolocation** for accurate position determination
- **Local storage** for settings and preferences

### 🙏 Acknowledgments
Thank you for using **NaviMate**! The app is actively developing — this is just the beginning.

---

## 📱 Установка / Installation

### PWA (Progressive Web App)
1. Откройте приложение в браузере / Open the app in your browser
2. Нажмите "Установить" / Click "Install" in browser menu
3. Приложение появится на рабочем столе / App will appear on your desktop

### Веб-версия / Web Version
- Просто откройте в браузере / Just open in your browser
- Работает на всех устройствах / Works on all devices
- Автоматически адаптируется / Automatically adapts

---

## 🔧 Технологии / Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Custom responsive design
- **APIs**: OpenWeatherMap, Geolocation
- **Storage**: LocalStorage, Service Worker
- **Design**: Material Design principles, Dark/Light themes
- **Compatibility**: All modern browsers, mobile-first approach
