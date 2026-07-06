export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  slug?: string;
  stock?: number;
};

export type CartState = {
  items: CartItem[];
  savedItems: CartItem[];
  couponCode: string;
  giftCouponCode: string;
};
