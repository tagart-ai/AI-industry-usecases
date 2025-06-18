import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "./constants.js";

// Объект для хранения переводов
const translations = {};
// Текущий язык
let currentLanguage = localStorage.getItem("language") || DEFAULT_LANGUAGE;

// Функция для загрузки переводов
async function loadTranslations() {
  try {
    console.log("Attempting to load translations...");
    const promises = AVAILABLE_LANGUAGES.map(lang => 
      fetch(`AI-industry-usecases/${lang}.json`)
        .then(response => {
          console.log(`Fetch response for ${lang}.json:`, response);
          if (!response.ok) {
            throw new Error(`Failed to load ${lang} translations: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          translations[lang] = data;
          console.log(`Successfully loaded ${lang} translations:`, data);
        })
        .catch(error => {
          console.error(`Error loading ${lang} translations:`, error);
        })
    );
    
    await Promise.all(promises);
    console.log("All translation promises resolved. Current translations object:", translations);
    
    // Проверяем, что текущий язык загружен
    if (!translations[currentLanguage]) {
      console.warn(`Translations for ${currentLanguage} not loaded, falling back to ${DEFAULT_LANGUAGE}`);
      currentLanguage = DEFAULT_LANGUAGE;
    }
    
    return true;
  } catch (error) {
    console.error("Error in loadTranslations function:", error);
    return false;
  }
}

// Получение перевода по ключу
function t(key) {
  // Если ключ не указан, возвращаем пустую строку
  if (!key) return "";
  
  // Если переводы не загружены, возвращаем ключ
  if (!translations[currentLanguage]) {
    console.warn(`Translations for current language (${currentLanguage}) not available. Key: ${key}`);
    return key;
  }
  
  // Разбиваем ключ на части (например, \'header.title\' -> [\'header\', \'title\'])
  const parts = key.split(".");
  
  // Ищем перевод в дереве переводов
  let translation = translations[currentLanguage];
  for (const part of parts) {
    if (!translation || !translation[part]) {
      // Если перевод не найден, возвращаем ключ
      console.warn(`Translation not found for key: ${key} in language ${currentLanguage}. Missing part: ${part}`);
      return key;
    }
    translation = translation[part];
  }
  
  return translation;
}

// Обновление переводов на странице
function updateTranslations() {
  console.log("Updating translations for language:", currentLanguage);
  console.log("Current translations object:", translations);
  // Обновляем все элементы с атрибутом data-i18n
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(element => {
    const key = element.getAttribute("data-i18n");
    const translation = t(key);
    if (translation && translation !== key) {
      element.textContent = translation;
    } else if (translation === key) {
      console.warn(`Key ${key} not translated for language ${currentLanguage}.`);
    }
  });
}

// Создание переключателя языков
function createLanguageSwitcher(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="language-switcher">
      <button data-lang="ru" class="${currentLanguage === "ru" ? "active" : ""}">Русский</button>
      <button data-lang="en" class="${currentLanguage === "en" ? "active" : ""}">English</button>
      <button data-lang="zh" class="${currentLanguage === "zh" ? "active" : ""}">中文</button>
    </div>
  `;
  
  container.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", function() {
      const newLang = this.getAttribute("data-lang");
      if (newLang !== currentLanguage) {
        currentLanguage = newLang;
        localStorage.setItem("language", currentLanguage);
        document.dispatchEvent(new Event("languageChanged"));
      }
    });
  });
}

// Получение текущего языка
function getCurrentLanguage() {
  return currentLanguage;
}

export const i18n = {
  loadTranslations,
  t,
  updateTranslations,
  createLanguageSwitcher,
  getCurrentLanguage,
};


