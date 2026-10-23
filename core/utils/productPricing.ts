import type { Size } from '../enum/size';
import type { Product } from '../model/product';

export function getProductPrice(product: Product, size: Size | null, color: string | null): number {
  if (product.price.length === 0) return 0;

  if (product.price.length > 1 && product.size.length > 1 && size !== null) {
    const sizeIndex = product.size.indexOf(size);
    if (sizeIndex >= 0) return product.price[sizeIndex] ?? product.price[0];
  }

  if (product.price.length > 1 && product.shade.length > 0 && color !== null) {
    const colorIndex = product.shade.indexOf(color);
    if (colorIndex >= 0) return product.price[colorIndex] ?? product.price[0];
  }

  return product.price[0];
}