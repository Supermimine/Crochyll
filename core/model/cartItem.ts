import type { Product } from "./product";
import { Size } from "../enum/size";

export interface CartItem {
    quantity: number;
    item: Product;
    color: string | null;
    size: Size | null;
}
