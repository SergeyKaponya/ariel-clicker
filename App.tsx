
import React, { useState, useEffect, useCallback } from 'react';
import { Product, UserInfo, DeliveryMethod } from './types';
import { ProductCard } from './components/ProductCard';
import { Sidebar } from './components/Sidebar';
import { BotControls } from './components/BotControls';
import { Menu, User, Settings, ExternalLink } from 'lucide-react';

declare const chrome: any;

const INITIAL_PRODUCT: Product = {
  id: '354',
  title: 'Лошадка из коллекции «Акварель»',
  collection: 'Лимитированная серия',
  price: 9500,
  imageUrl: 'https://www.f-ariel.ru/upload/image_resize_cache/iblock/ddd/o0iwztz81ios0cakprwftof2yzuh6a05-484-484-canvas.webp',
  dropDate: new Date(Date.now() + 1000 * 15),
  status: 'upcoming',
};

const USER: UserInfo = {
  name: 'Юлия Быкова',
  phone: '+7 (903) 127-45-93',
};

const DELIVERY: DeliveryMethod = {
  id: 'self-pickup',
  name: 'Самовывоз из магазина',
  address: 'Нижний Новгород, шоссе Жиркомбината, 8а, лит. Б.',
};

const App: React.FC = () => {
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCT);
  const [cart, setCart] = useState<Product[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [isAutoClickerEnabled, setIsAutoClickerEnabled] = useState(false);
  const [clickDelay, setClickDelay] = useState(50); 
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [wasAutoClicked, setWasAutoClicked] = useState(false);
  const [isMultiOrder, setIsMultiOrder] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['autoClickerEnabled', 'clickDelay', 'multiOrderEnabled'], (result: any) => {
        if (result.autoClickerEnabled !== undefined) setIsAutoClickerEnabled(result.autoClickerEnabled);
        if (result.clickDelay !== undefined) setClickDelay(result.clickDelay);
        if (result.multiOrderEnabled !== undefined) setIsMultiOrder(result.multiOrderEnabled);
      });
    }
  }, []);

  const handleToggleAutoClicker = (enabled: boolean) => {
    setIsAutoClickerEnabled(enabled);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ autoClickerEnabled: enabled });
    }
  };

  const handleDelayChange = (val: number) => {
    setClickDelay(val);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ clickDelay: val });
    }
  };

  const addToCart = useCallback((item: Product, isAuto: boolean = false) => {
    const now = Date.now();
    const dropTime = item.dropDate.getTime();
    setReactionTime(Math.max(0, now - dropTime));
    setWasAutoClicked(isAuto);
    setCart([item]);

    if (isAuto) {
      setTimeout(() => {
        setOrderPlaced(true);
        // Если включен режим конвейера, симулируем возврат через 3 секунды
        if (isMultiOrder) {
           setTimeout(() => {
              setOrderPlaced(false);
              setCart([]);
              setProduct(prev => ({ ...prev, status: 'available' }));
           }, 3000);
        }
      }, 300);
    }
  }, [isMultiOrder]);

  const handleTimerComplete = useCallback(() => {
    setProduct((prev) => ({ ...prev, status: 'available' }));
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (product.status === 'available' && isAutoClickerEnabled && !orderPlaced && cart.length === 0) {
      timeout = setTimeout(() => {
        addToCart(product, true);
      }, clickDelay);
    }
    return () => clearTimeout(timeout);
  }, [product.status, isAutoClickerEnabled, orderPlaced, cart.length, clickDelay, addToCart, product]);

  const resetDemo = () => {
    setCart([]);
    setOrderPlaced(false);
    setReactionTime(null);
    setWasAutoClicked(false);
    setIsTraining(false);
    setProduct({...INITIAL_PRODUCT, dropDate: new Date(Date.now() + 1000 * 15), status: 'upcoming'});
  };

  const startTraining = () => {
    setCart([]);
    setOrderPlaced(false);
    setReactionTime(null);
    setWasAutoClicked(false);
    setIsTraining(true);
    setProduct({...INITIAL_PRODUCT, dropDate: new Date(Date.now() + 2000), status: 'upcoming'});
  };

  const isExtensionPopup = typeof window !== 'undefined' && window.innerWidth < 600;

  if (isExtensionPopup) {
    return (
      <div className="w-[400px] bg-[#1A1C21] min-h-[500px] flex flex-col p-4">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4 text-white">
          <span className="font-bold text-sm">Ariel Assistant</span>
          <div className="text-[10px] text-green-500 font-bold uppercase animate-pulse">Live Mode</div>
        </div>
        <BotControls 
          isAutoClickerEnabled={isAutoClickerEnabled}
          onToggleAutoClicker={handleToggleAutoClicker}
          delay={clickDelay}
          onDelayChange={handleDelayChange}
          onStartTraining={startTraining}
          lastReactionTime={reactionTime}
          isTraining={isTraining}
        />
        <a href="https://www.f-ariel.ru/" target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#0D66CE] text-white rounded-xl text-sm font-bold">
          <span>На сайт f-ariel.ru</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="fixed z-20 top-0 right-0 left-0 h-16 lg:h-20 bg-white shadow-sm border-b border-gray-100 px-4">
        <div className="container mx-auto h-full flex items-center justify-between">
           <img src="https://www.f-ariel.ru/local/frontend/dist/assets/logo.svg" alt="ARIEL" className="h-6" />
           <div className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">Simulator v2.0</div>
        </div>
      </header>

      <div className="block lg:grid grid-cols-[1fr_min-content] pt-16 lg:pt-20 flex-1">
        <main className="container mx-auto py-10 px-4 lg:max-w-[1000px]">
          <h1 className="text-2xl font-bold mb-8">Режим конвейера (Цикличная покупка)</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductCard product={product} onAddToCart={(p) => addToCart(p, false)} onTimerComplete={handleTimerComplete} />
            <div>
               <BotControls 
                  isAutoClickerEnabled={isAutoClickerEnabled}
                  onToggleAutoClicker={handleToggleAutoClicker}
                  delay={clickDelay}
                  onDelayChange={handleDelayChange}
                  onStartTraining={startTraining}
                  lastReactionTime={reactionTime}
                  isTraining={isTraining}
               />
               <div className="mt-4 p-4 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed">
                  <strong>Как работает «Конвейер» в симуляторе:</strong><br/>
                  После успешной покупки симулятор подождет 3 секунды и сам вернет товар в статус «Доступен», имитируя возврат со страницы успеха.
               </div>
               <button onClick={resetDemo} className="mt-4 text-xs text-gray-400 underline">Сбросить все</button>
            </div>
          </div>
        </main>
        <section className="bg-[#F8F9FB] border-l border-gray-100 lg:w-[400px]">
          <Sidebar cart={cart} userInfo={USER} delivery={DELIVERY} onCheckout={() => setOrderPlaced(true)} orderPlaced={orderPlaced} wasAutoClicked={wasAutoClicked} reactionTime={reactionTime} />
        </section>
      </div>
    </div>
  );
};

export default App;
