import { ref } from 'vue';
import type { CartItem } from '@/model/cartItem';
import type { Size } from '@/enum/size';
import type { Product } from '@/model/product';

const carts = ref<CartItem[]>([]);

const setCarts = () => {
  const cartData = localStorage.getItem("cart");
  carts.value = cartData ? JSON.parse(cartData) : [];
}

const addCart = async (
  item: any = null,
  colorSelected: string | null = null,
  sizeSelected: Size | null = null,
  quantity: number = 1,
  itemsList: Product[] = [],
  allCart: boolean = true
) => {
  const storageValue = localStorage.getItem('cart');
  let cart: CartItem[] = storageValue ? JSON.parse(storageValue) : [];

  console.log('item: ', item);
  console.log('colorSelected: ', colorSelected);
  console.log('sizeSelected: ', sizeSelected);
  console.log('quantity: ', quantity);
  console.log('itemsList: ', itemsList);
  console.log('allCart: ', allCart);

  if (allCart && item) {
    const existingEntry = cart.find(
      entry =>
        entry.item.id === item.id &&
        entry.color === colorSelected &&
        entry.size === sizeSelected
    );

    if (existingEntry) {
      existingEntry.quantity += quantity;
    } else {
      cart.push({
        quantity,
        item,
        color: colorSelected,
        size: sizeSelected
      });
    }
  }

  if (itemsList.length > 0) {
    itemsList.forEach((accessory: Product) => {
      cart.push({
        quantity: 1,
        item: accessory,
        color: null,
        size: null
      });
    });
  }

  console.log('cart: ', cart);
  localStorage.setItem('cart', JSON.stringify(cart));
  setCarts();
}

const removeCart = (cartItem: CartItem) => {
  const storageValue = localStorage.getItem('cart');
  let cart: CartItem[] = storageValue ? JSON.parse(storageValue) : [];

  cart = cart.filter(
    entry =>
      !(
        entry.item.id === cartItem.item.id &&
        entry.color === cartItem.color &&
        entry.size === cartItem.size
      )
  );

  localStorage.setItem('cart', JSON.stringify(cart));
  setCarts();
}

const cleanCart = () => {
  localStorage.removeItem('cart');
  setCarts();
}

const updateQuantityCart = (isUp: boolean, cartItem: CartItem) => {
  const storageValue = localStorage.getItem("cart");
  let cart: CartItem[] = storageValue ? JSON.parse(storageValue) : [];

  const existingEntry = cart.find(entry => entry.item.id === cartItem.item.id && entry.color === cartItem.color && entry.size === cartItem.size);

  if (existingEntry) {
    if (isUp) {
      existingEntry.quantity++;
    } else {
      existingEntry.quantity = Math.max(1, existingEntry.quantity - 1);
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  setCarts();
}

export const useCart = () => {
  setCarts();

  return { carts, addCart, removeCart, cleanCart, updateQuantityCart };
}