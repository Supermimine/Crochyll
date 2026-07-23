import type { Matter } from "../../enum/matter";
import type { SizeWool } from "../../enum/sizeWool";

export interface Yarn {
    name: string;
    size: SizeWool;
    compagny?: string;
    color: string;
    matter: {
        type: Matter;
        percentage: number;
    }[];
    image?: string | null;
    length?: number;
    weight?: number;
    hookSize?: number;
    needleSize?: number;
    quantity: number;
    useQuantity: number;
    noPlace?: string;
}