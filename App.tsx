/**
 * Этот скрипт работает непосредственно на страницах f-ariel.ru
 * Рефакторинг: улучшена детекция кнопок, timing, логи, обработка ошибок.
 */

declare const chrome: any;

let config = {
  enabled: false,
  delay: 50,
  autoRefresh: false,
  dropTime: "",
  multiOrder: false
};

const updateConfig = () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['autoClickerEnabled', 'clickDelay', 'autoRefreshEnabled', 'dropTime', 'multiOrderEnabled'], (result: any) => {
      config.enabled = result.autoClickerEnabled || false;
      config.delay = result.clickDelay || 50;
      config.autoRefresh = result.autoRefreshEnabled || false;
      config.dropTime = result.dropTime || "";
      config.multiOrder = result.multiOrderEnabled || false;
      
      console.log('Ariel Bot: Config updated', config);
      checkOrderSuccess();
      if (config.autoRefresh) checkAndRefresh();
    });
  }
};

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(() => updateConfig());
  setInterval(updateConfig, 500); // Частое обновление config
}

/**
 * Ищет кнопку "В корзину" с учетом вложенности и динамики
 */
const findBasketButton = (): HTMLElement | null => {
  console.log('Ariel Bot: Searching for basket button...');
  
  // Основные селекторы
  const selectors = [
    '[data-add-to-basket] button', // Вложенная кнопка
    '[data-add-to-basket] .btn',   // Или div с классом btn
    '[data-add-to-basket]',        // Сам контейнер, если кликабелен
    '.js-add-to-basket',
    'button.buy, .btn-buy, .to_basket, .add_to_cart'
  ];
  
  for (const sel of selectors) {
    const btn = document.querySelector(sel) as HTMLElement;
    if (btn && isElementInteractive(btn)) {
      console.log('Ariel Bot: Found button via selector:', sel);
      return btn;
    }
  }
  
  // Поиск по тексту
  const allInteractive = Array.from(document.querySelectorAll('button, a, div.btn, [role="button"]'));
  const btn = allInteractive.find(el => {
    const text = el.textContent?.toLowerCase().trim() || "";
    return ['корзину', 'в корзину', 'купить', 'добавить', 'заказать'].some(kw => text.includes(kw)) &&
           isElementInteractive(el as HTMLElement);
  }) as HTMLElement;
  
  if (btn) {
    console.log('Ariel Bot: Found button via text:', btn.textContent);
    return btn;
  }
  
  console.log('Ariel Bot: No button found');
  return null;
};

/**
 * Проверяет, интерактивен ли элемент (видим, не disabled, в DOM)
 */
const isElementInteractive = (el: HTMLElement): boolean => {
  return !!el &&
         el.offsetParent !== null &&
         getComputedStyle(el).display !== 'none' &&
         getComputedStyle(el).visibility !== 'hidden' &&
         !(el as any).disabled &&
         !el.classList.contains('disabled');
};

/**
 * Ищет кнопку оформления заказа
 */
const findCheckoutButton = (): HTMLElement | null => {
  console.log('Ariel Bot: Searching for checkout button...');
  const keywords = ['оформить', 'перейти к оформлению', 'корзина', 'чек-аут', 'оплата', 'заказать'];
  const allInteractive = Array.from(document.querySelectorAll('a, button, div.btn, [role="button"]'));
  
  const btn = allInteractive.find(el => {
    const text = el.textContent?.toLowerCase().trim() || "";
    return keywords.some(kw => text.includes(kw)) && isElementInteractive(el as HTMLElement);
  }) as HTMLElement;
  
  if (btn) console.log('Ariel Bot: Found checkout:', btn.textContent);
  return btn;
};

const checkOrderSuccess = () => {
  if (!config.multiOrder || !config.enabled) return;

  const successKeywords = ['заявка принята', 'спасибо за заказ', 'заказ сформирован', 'успешно', 'success', 'confirmed'];
  const bodyText = document.body.textContent?.toLowerCase() || "";
  const isSuccess = successKeywords.some(kw => bodyText.includes(kw)) ||
                    window.location.href.includes('success') ||
                    window.location.href.includes('confirm') ||
                    window.location.href.includes('thank') ||
                    document.querySelector('[data-order-success]'); // Если есть атрибут

  if (isSuccess) {
    console.log('Ariel Bot: Order success! Returning for multi-order...');
    setTimeout(() => {
      window.history.back();
      setTimeout(() => location.reload(), 1000);
    }, 1000);
  }
};

const performFullCycle = async () => {
  if (!config.enabled) return false;

  const basketBtn = findBasketButton();
  if (basketBtn) {
    console.log('Ariel Bot: Clicking basket button...');
    try {
      await new Promise(resolve => setTimeout(resolve, config.delay));
      basketBtn.click();
      
      // Retry если не сработало (например, если нужно 2 клика)
      setTimeout(() => {
        if (!findCheckoutButton()) basketBtn.click();
      }, 200);
      
      let attempts = 0;
      const maxAttempts = 100; // 5 сек
      const checkoutInterval = setInterval(() => {
        attempts++;
        const checkoutBtn = findCheckoutButton();
        if (checkoutBtn) {
          console.log('Ariel Bot: Clicking checkout...');
          checkoutBtn.click();
          clearInterval(checkoutInterval);
          if (config.multiOrder) setTimeout(checkOrderSuccess, 1000);
        }
        if (attempts > maxAttempts) {
          clearInterval(checkoutInterval);
          console.error('Ariel Bot: Checkout not found after retries');
        }
      }, 50);
      
      return true;
    } catch (e) {
      console.error('Ariel Bot: Click error', e);
    }
  }
  return false;
};

const checkAndRefresh = () => {
  if (!config.autoRefresh || !config.dropTime) return;

  const now = new Date().getTime();
  const [h, m, s] = config.dropTime.split(':').map(Number);
  const dropTimestamp = new Date().setHours(h, m, s || 0, 0);

  const timeDiff = dropTimestamp - now;

  if (timeDiff < -15000 && !config.multiOrder) return; // После дропа +15с stop если не multi

  if (findBasketButton()) {
    performFullCycle();
    return;
  }

  // Адаптивная задержка: ближе к дропу — чаще
  let nextDelay = 10000;
  if (timeDiff <= 0) {
    nextDelay = 100; // После дропа — очень часто
  } else if (timeDiff <= 2000) {
    nextDelay = 100; // За 2с до — polling
  } else if (timeDiff <= 10000) {
    nextDelay = 500;
  } else if (timeDiff <= 30000) {
    nextDelay = 2000;
  }

  console.log('Ariel Bot: Next refresh in', nextDelay / 1000, 'sec');
  setTimeout(() => {
    if (!findBasketButton()) {
      location.reload();
    } else {
      performFullCycle();
    }
    checkAndRefresh(); // Рекурсия для continuous
  }, nextDelay);
};

const observer = new MutationObserver((mutations) => {
  if (config.enabled) {
    console.log('Ariel Bot: DOM changed, checking...');
    performFullCycle();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['disabled', 'class', 'style', 'data-*'] // Добавлены data-attrs
});

updateConfig();
setInterval(performFullCycle, 200); // Дополнительный polling
