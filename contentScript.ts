
/**
 * Этот скрипт работает непосредственно на страницах f-ariel.ru
 * Обновлен для максимальной устойчивости к изменениям верстки.
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
      
      checkOrderSuccess();
      if (config.autoRefresh) checkAndRefresh();
    });
  }
};

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(() => updateConfig());
}

/**
 * Ищет кнопку "В корзину" максимально широким охватом
 */
const findBasketButton = (): HTMLButtonElement | HTMLElement | null => {
  // 1. По известным атрибутам и классам
  const selector = '[data-add-to-basket], .js-add-to-basket, button.buy, .btn-buy, .to_basket, .add_to_cart';
  let btn = document.querySelector(selector) as HTMLElement;
  
  // 2. Если не нашли, ищем по тексту внутри всех кнопок
  if (!btn || btn.offsetParent === null) {
    const allButtons = Array.from(document.querySelectorAll('button, a.btn, .button'));
    btn = allButtons.find(el => {
      const text = el.textContent?.toLowerCase() || "";
      return (text.includes('корзин') || text.includes('купить') || text.includes('заказ')) && 
             (el as any).disabled !== true && 
             (el as HTMLElement).offsetParent !== null;
    }) as HTMLElement;
  }
  
  return btn;
};

/**
 * Ищет кнопку перехода к оформлению
 */
const findCheckoutButton = (): HTMLElement | null => {
  const keywords = ['оформить', 'перейти', 'корзин', 'чек', 'оплата'];
  const elements = Array.from(document.querySelectorAll('a, button, span, div.btn'));
  
  return elements.find(el => {
    const text = el.textContent?.trim().toLowerCase() || "";
    const isVisible = (el as HTMLElement).offsetParent !== null;
    return isVisible && keywords.some(key => text.includes(key));
  }) as HTMLElement || null;
};

const checkOrderSuccess = () => {
  if (!config.multiOrder || !config.enabled) return;

  const successIndicators = ['заявка принята', 'спасибо за заказ', 'заказ сформирован', 'успешно'];
  const bodyText = document.body.textContent?.toLowerCase() || "";
  const isSuccessPage = successIndicators.some(text => bodyText.includes(text)) || 
                        window.location.href.includes('success') || 
                        window.location.href.includes('confirm');

  if (isSuccessPage) {
    console.log('Ariel Bot: Order success detected!');
    setTimeout(() => {
      window.history.back(); 
      setTimeout(() => location.reload(), 2000);
    }, 1500);
  }
};

const performFullCycle = async () => {
  if (!config.enabled) return;

  const basketBtn = findBasketButton();
  
  if (basketBtn && (basketBtn as any).disabled !== true) {
    console.log('Ariel Bot: TARGET DETECTED! Clicking...');
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ autoRefreshEnabled: false });
    }

    await new Promise(resolve => setTimeout(resolve, config.delay));
    basketBtn.click();

    let attempts = 0;
    const findCheckoutInterval = setInterval(() => {
      attempts++;
      const checkoutBtn = findCheckoutButton();

      if (checkoutBtn) {
        checkoutBtn.click();
        clearInterval(findCheckoutInterval);
        if (config.multiOrder) setTimeout(checkOrderSuccess, 1000);
      }
      if (attempts > 60) clearInterval(findCheckoutInterval); // 3 секунды мониторинга
    }, 50);
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

  if (timeDiff < -15000 && !config.multiOrder) return;

  if (findBasketButton()) {
    performFullCycle();
    return;
  }

  let nextRefreshDelay = 10000;
  if (timeDiff <= 0) {
    nextRefreshDelay = 1200; 
  } else if (timeDiff <= 10000) {
    nextRefreshDelay = Math.max(1000, Math.min(1200, timeDiff - 150));
  } else if (timeDiff <= 30000) {
    nextRefreshDelay = 3500;
  } else {
    nextRefreshDelay = 10000;
  }

  setTimeout(() => {
    if (!findBasketButton()) {
      location.reload();
    } else {
      performFullCycle();
    }
  }, nextRefreshDelay);
};

const observer = new MutationObserver(() => {
  if (config.enabled) performFullCycle();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['disabled', 'class', 'style']
});

updateConfig();
