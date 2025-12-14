
import React from 'react';
import { UserInfo, DeliveryMethod, Product } from '../types';
import { MapPin, User, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

interface SidebarProps {
  cart: Product[];
  userInfo: UserInfo;
  delivery: DeliveryMethod;
  onCheckout: () => void;
  orderPlaced: boolean;
  wasAutoClicked: boolean;
  reactionTime: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  cart, 
  userInfo, 
  delivery, 
  onCheckout, 
  orderPlaced,
  wasAutoClicked,
  reactionTime
}) => {
  const totalPrice = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="h-full z-10 p-6 lg:p-10 lg:fixed lg:w-[400px] xl:w-[496px] overflow-auto">
      <div className="flex flex-col gap-8" data-component="checkout">
        
        {orderPlaced ? (
           <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center animate-in zoom-in duration-300 shadow-xl">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">Заявка принята!</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                 {wasAutoClicked 
                    ? 'Бот-автокликер успешно отправил запрос в первые миллисекунды.' 
                    : 'Ваша реакция позволила оформить игрушку вручную!'}
              </p>
              
              {reactionTime !== null && (
                 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="text-[11px] text-gray-400 uppercase font-black mb-1">Время реакции</div>
                    <div className="text-4xl font-black text-[#0D66CE]">{reactionTime} <span className="text-base font-normal">мс</span></div>
                    <div className="text-[10px] text-gray-400 mt-2">
                       (Разница между доступностью товара и кликом)
                    </div>
                 </div>
              )}
           </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-black mb-6">Ваша корзина</h2>
              
              {cart.length > 0 ? (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-black truncate leading-tight">{item.title}</p>
                        <p className="text-sm text-gray-400 mt-1">1 шт • {item.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm text-gray-500">Итоговая сумма:</span>
                        <span className="text-2xl font-bold text-black">
                           {totalPrice.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                    <button 
                        onClick={onCheckout}
                        className="w-full bg-[#0D66CE] hover:bg-[#0A52A5] text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>Оформить заявку</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-gray-400 mt-3 text-center">
                       Нажимая кнопку, вы соглашаетесь на обработку данных
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-200" />
                    <span className="text-sm font-medium">Ожидание появления товаров...</span>
                    <span className="text-[11px] text-gray-400 mt-1">Корзина обновится автоматически</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-[#0D66CE]" />
                 Доставка
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-bold text-black">{delivery.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{delivery.address}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                 <User className="w-4 h-4 text-[#0D66CE]" />
                 Получатель
              </h3>
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Имя:</span>
                     <span className="font-medium">{userInfo.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Телефон:</span>
                     <span className="font-medium">{userInfo.phone}</span>
                  </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
