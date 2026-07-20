import { ref } from 'vue';
import type { CartItem } from '@core/model/cartItem';
import type { Size } from '@core/enum/size';
import type { Product } from '@core/model/product';
import { safeStorageGetJSON, safeStorageSetJSON } from '@/tools/appTools';

const carts = ref<CartItem[]>([]);

const setCarts = () => {
  carts.value = safeStorageGetJSON<CartItem[]>("cart", []);
};

const addCart = async (
  item: any = null,
  colorSelected: string | null = null,
  sizeSelected: Size | null = null,
  quantity: number = 1,
  itemsList: Product[] = [],
  allCart: boolean = true
) => {
  const cart = safeStorageGetJSON<CartItem[]>("cart", []);
  const updatedCart = [...cart];

  if (allCart && item) {
    const existingEntry = updatedCart.find(
      entry =>
        entry.item.id === item.id &&
        entry.color === colorSelected &&
        entry.size === sizeSelected
    );

    if (existingEntry) {
      existingEntry.quantity += quantity;
    } else {
      updatedCart.push({
        quantity,
        item,
        color: colorSelected,
        size: sizeSelected
      });
    }
  }

  if (itemsList.length > 0) {
    itemsList.forEach((accessory: Product) => {
      updatedCart.push({
        quantity: 1,
        item: accessory,
        color: null,
        size: null
      });
    });
  }

  safeStorageSetJSON("cart", updatedCart);
  setCarts();
};

const removeCart = (cartItem: CartItem) => {
  const cart = safeStorageGetJSON<CartItem[]>("cart", []);
  const updatedCart = cart.filter(
    entry =>
      !(
        entry.item.id === cartItem.item.id &&
        entry.color === cartItem.color &&
        entry.size === cartItem.size
      )
  );

  safeStorageSetJSON("cart", updatedCart);
  setCarts();
};

const cleanCart = () => {
  safeStorageSetJSON('cart', []);
  setCarts();
};

const updateQuantityCart = (isUp: boolean, cartItem: CartItem) => {
  const cart = safeStorageGetJSON<CartItem[]>("cart", []);
  const updatedCart = cart.map(entry => {
    if (entry.item.id === cartItem.item.id && entry.color === cartItem.color && entry.size === cartItem.size) {
      return {
        ...entry,
        quantity: isUp ? entry.quantity + 1 : Math.max(1, entry.quantity - 1)
      };
    }

    return entry;
  });

  safeStorageSetJSON("cart", updatedCart);
  setCarts();
};

export const useCart = () => {
  setCarts();

  return { carts, addCart, removeCart, cleanCart, updateQuantityCart };
};