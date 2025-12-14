export interface Product {
  id: string;
  title: string;
  collection: string;
  price: number;
  imageUrl: string;
  dropDate: Date;
  status: 'upcoming' | 'available' | 'sold_out';
}

export interface DeliveryMethod {
  id: string;
  name: string;
  address: string;
}

export interface UserInfo {
  name: string;
  phone: string;
}