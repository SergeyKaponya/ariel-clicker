
/**
 * Этот скрипт работает непосредственно на страницах f-ariel.ru
 */

declare const chrome: any;

let config = {
  enabled: false,
  delay: 50,
  autoRefresh: false,
  dropTime: "" // Формат "HH:mm:ss"
};

const updateConfig = () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['autoClickerEnabled', 'clickDelay', 'autoRefreshEnabled', 'dropTime'], (result: any) => {
      config.enabled = result.autoClickerEnabled || false;
      config.delay = result.clickDelay || 50;
      config.autoRefresh = result.autoRefreshEnabled || false;
      config.dropTime = result.dropTime || "";
      
      if (config.autoRefresh) {
        checkAndRefresh();
      }
    });
  }
};

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(() => updateConfig());
}

const performFullCycle = async () => {
  if (!config.enabled) return;

  const basketBtn = document.querySelector('[data-add-to-basket], .js-add-to-basket, button.buy') as HTMLButtonElement;
  
  if (basketBtn && !basketBtn.disabled && basketBtn.offsetParent !== null) {
    console.log('Ariel Bot: TARGET DETECTED! Stopping refresh and clicking...');
    
    // Мгновенно отключаем рефреш в сторадже
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ autoRefreshEnabled: false });
    }

    // Ждем заданную задержку (миллисекунды)
    await new Promise(resolve => setTimeout(resolve, config.delay));
    basketBtn.click();

    // Быстрый поиск кнопки оформления
    let attempts = 0;
    const findCheckoutInterval = setInterval(() => {
      attempts++;
      const checkoutBtn = Array.from(document.querySelectorAll('a, button, span')).find(el => 
        el.textContent?.trim().toLowerCase().includes('оформить') || 
        el.textContent?.trim().toLowerCase().includes('перейти к оформлению')
      ) as HTMLElement;

      if (checkoutBtn && checkoutBtn.offsetParent !== null) {
        checkoutBtn.click();
        clearInterval(findCheckoutInterval);
      }
      if (attempts > 100) clearInterval(findCheckoutInterval);
    }, 50); // Проверяем чаще (раз в 50мс)
    return true;
  }
  return false;
};

const checkAndRefresh = () => {
  if (!config.autoRefresh || !config.dropTime) return;

  const now = new Date();
  const [hours, minutes, seconds] = config.dropTime.split(':').map(Number);
  const dropDate = new Date();
  dropDate.setHours(hours, minutes, seconds || 0, 0);

  const timeDiff = dropDate.getTime() - now.getTime();

  // Если время уже прошло (более 10 сек назад), выключаем
  if (timeDiff < -10000) {
    return;
  }

  // Сначала проверяем, нет ли уже кнопки (вдруг старт был раньше)
  const basketBtn = document.querySelector('[data-add-to-basket]:not([disabled])') as HTMLElement;
  if (basketBtn && basketBtn.offsetParent !== null) {
    performFullCycle();
    return;
  }

  let nextRefreshDelay = 10000; // По умолчанию 10 сек

  if (timeDiff <= 0) {
    // Момент старта! Если кнопки нет, рефрешим очень быстро
    nextRefreshDelay = 1200; 
  } else if (timeDiff <= 10000) {
    // TURBO ZONE: меньше 10 секунд до старта
    // Рассчитываем задержку так, чтобы следующий рефреш был либо через 1.2с, 
    // либо точно в момент dropDate - 200ms (на пинг)
    nextRefreshDelay = Math.min(1200, timeDiff - 200);
    if (nextRefreshDelay < 100) nextRefreshDelay = 1200; // защита от отрицательных
  } else if (timeDiff <= 30000) {
    // HOT ZONE: меньше 30 секунд
    nextRefreshDelay = 4000;
  } else if (timeDiff <= 60000) {
    // PREP ZONE: меньше 1 минуты
    nextRefreshDelay = 8000;
  } else {
    // Далеко до старта
    return; 
  }

  console.log(`Ariel Bot: Time to drop: ${(timeDiff/1000).toFixed(1)}s. Next refresh in ${nextRefreshDelay}ms`);
  
  setTimeout(() => {
    // Финальная проверка перед рефрешем
    if (!document.querySelector('[data-add-to-basket]:not([disabled])')) {
      location.reload();
    }
  }, nextRefreshDelay);
};

// Наблюдатель за появлением кнопок (для динамических сайтов)
const observer = new MutationObserver(() => {
  if (config.enabled) {
    performFullCycle();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['disabled', 'class']
});

// Запуск при загрузке
updateConfig();
