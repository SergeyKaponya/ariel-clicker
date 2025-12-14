
import React from 'react';
import { Product } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onTimerComplete: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onTimerComplete }) => {
  const isAvailable = product.status === 'available';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div 
      className="flex flex-col group"
      data-component="add-to-basket"
      data-add-to-basket={product.id}
    >
      <div 
        className="aspect-square w-full rounded-2xl bg-[#F3F4F6] overflow-hidden mb-4 relative"
        data-item-image
      >
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.status === 'upcoming' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <CountdownTimer targetDate={product.dropDate} onComplete={onTimerComplete} />
          </div>
        )}
      </div>

      <div 
        className={`text-[11px] mb-2 px-2 py-0.5 w-fit uppercase rounded font-bold tracking-wide ${
          isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}
        data-item-badge
      >
        {isAvailable ? 'В наличии' : `Старт ${formatDate(product.dropDate)}`}
      </div>

      <div 
        className="mb-2 text-lg font-medium text-black leading-tight h-14 overflow-hidden"
        data-item-name
      >
        {product.title}
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-2xl font-bold text-black" data-item-price>
          {product.price.toLocaleString('ru-RU')} ₽
        </div>
        
        <button
          onClick={() => isAvailable && onAddToCart(product)}
          disabled={!isAvailable}
          className={`
            w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
            ${isAvailable 
              ? 'bg-[#0D66CE] text-white hover:bg-[#0A52A5] active:scale-[0.98]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{isAvailable ? 'В корзину' : 'Ожидание'}</span>
        </button>
      </div>
    </div>
  );
};
