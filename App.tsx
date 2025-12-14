
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

  const isExtensionPopup = typeof window !== 'undefined' && window.innerWidth < 600;

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['autoClickerEnabled', 'clickDelay'], (result: any) => {
        if (result.autoClickerEnabled !== undefined) setIsAutoClickerEnabled(result.autoClickerEnabled);
        if (result.clickDelay !== undefined) setClickDelay(result.clickDelay);
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

  const handleTimerComplete = useCallback(() => {
    setProduct((prev) => ({ ...prev, status: 'available' }));
  }, []);

  const addToCart = useCallback((item: Product, isAuto: boolean = false) => {
    const now = Date.now();
    const dropTime = item.dropDate.getTime();
    const rawReaction = now - dropTime;
    const currentReaction = Math.max(0, rawReaction);
    
    setReactionTime(currentReaction);
    setWasAutoClicked(isAuto);
    setCart([item]);
    setIsTraining(false);

    // Если это автокликер, запускаем вторую фазу "Оформление" через небольшую паузу
    if (isAuto) {
      setTimeout(() => {
        setOrderPlaced(true);
      }, 300); // Симулируем задержку на появление кнопки "Оформить"
    }
  }, []);

  const handleCheckout = () => {
    setOrderPlaced(true);
  };

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
    setProduct({
        ...INITIAL_PRODUCT,
        dropDate: new Date(Date.now() + 1000 * 15),
        status: 'upcoming'
    });
  };

  const startTraining = () => {
    setCart([]);
    setOrderPlaced(false);
    setReactionTime(null);
    setWasAutoClicked(false);
    setIsTraining(true);
    const randomDelay = Math.floor(Math.random() * 5000) + 2000;
    setProduct({
      ...INITIAL_PRODUCT,
      dropDate: new Date(Date.now() + randomDelay),
      status: 'upcoming'
    });
  };

  if (isExtensionPopup) {
    return (
      <div className="w-[400px] bg-[#1A1C21] min-h-[500px] flex flex-col font-['Inter',_sans-serif] p-4">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <img src="https://www.f-ariel.ru/favicon.ico" className="w-5 h-5" alt="" />
            <span className="text-white font-bold text-sm">Ariel Drop Assistant</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             Live Mode
          </div>
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

        <div className="mt-6 space-y-3">
          <a 
            href="https://www.f-ariel.ru/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#0D66CE] text-white rounded-xl text-sm font-bold hover:bg-[#0A52A5] transition-colors"
          >
            <span>Перейти на сайт</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-[10px] text-gray-500 text-center leading-relaxed italic px-2">
            Бот автоматически нажмет «В корзину», а затем сразу «Оформить заявку» при старте продаж.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-['Inter',_sans-serif]">
      <header className="fixed z-20 top-0 right-0 left-0 h-16 lg:h-20 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto h-full px-4 flex items-center justify-between max-w-[1400px]">
          <div className="flex items-center h-full">
            <Menu className="mr-4 h-6 w-6 cursor-pointer lg:hidden text-slate-900" />
            <div className="h-[24px] w-[139px] flex items-center">
               <img src="https://www.f-ariel.ru/local/frontend/dist/assets/logo.svg" alt="ARIEL" className="h-6" />
            </div>
            <ul className="ml-16 hidden lg:flex h-full items-center">
              <li className="px-4 border-b-2 border-[#0D66CE] h-full flex items-center">
                <a className="text-base font-medium text-black" href="#">Главная</a>
              </li>
              <li className="px-4 h-full flex items-center">
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded ml-2 font-black uppercase">Simulator Mode</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-6">
            <a 
              className="flex h-10 items-center gap-2 rounded-lg border border-[#B8D4F5] bg-[#F3F8FF] px-4 text-[#0D66CE] text-base font-medium hover:bg-[#E1EDFF] transition-colors" 
              href="#"
            >
              <User className="h-4 w-4" />
              <span>Личный кабинет</span>
            </a>
          </div>
        </div>
      </header>

      <div className="block lg:grid grid-cols-[1fr_min-content] pt-16 lg:pt-20 flex-1">
        <main className="bg-white">
          <div className="container mx-auto py-10 lg:py-16 px-4 lg:max-w-[1000px]">
            <h1 className="text-3xl lg:text-[34px] font-medium mb-4 leading-tight">Тренажер (Полный цикл покупки)</h1>
            <div className="text-base text-gray-500 mb-10 leading-relaxed">
              Включите автокликер, чтобы увидеть, как бот нажимает две кнопки подряд. <br/>
              Сначала «В корзину», а через долю секунды — «Оформить заявку».
            </div>

            <div className="mb-6 text-xl font-medium text-black">Демонстрационный товар</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProductCard 
                product={product}
                onAddToCart={(p) => addToCart(p, false)}
                onTimerComplete={handleTimerComplete}
              />
              <div className="col-span-1 md:col-span-2">
                 <BotControls 
                    isAutoClickerEnabled={isAutoClickerEnabled}
                    onToggleAutoClicker={handleToggleAutoClicker}
                    delay={clickDelay}
                    onDelayChange={handleDelayChange}
                    onStartTraining={startTraining}
                    lastReactionTime={reactionTime}
                    isTraining={isTraining}
                 />
                 <button onClick={resetDemo} className="mt-4 text-xs text-gray-400 hover:text-[#0D66CE] underline">Сбросить симулятор</button>
              </div>
            </div>
          </div>
        </main>

        <section className="bg-[#F8F9FB] border-l border-gray-100 lg:w-[400px] xl:w-[496px]">
          <Sidebar 
            cart={cart}
            userInfo={USER}
            delivery={DELIVERY}
            onCheckout={handleCheckout}
            orderPlaced={orderPlaced}
            wasAutoClicked={wasAutoClicked}
            reactionTime={reactionTime}
          />
        </section>
      </div>

      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center">
         <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Ariel Bot Extension — Full Cycle Automation Ready</p>
      </footer>
    </div>
  );
};

export default App;
