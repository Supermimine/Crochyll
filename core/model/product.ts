import type { Category } from "../enum/category";
import type { Creator } from "../enum/creator";
import type { Maintenance } from "../enum/maintenance";
import type { Matter } from "../enum/matter";
import type { Size } from "../enum/size";
import type { SizeWool } from "../enum/sizeWool";
import type { TypeMaking } from "../enum/typeMaking";
export interface Product {
    id: string;
    name: string;
    price: number[];
    category: Category;
    description: {
        fr: string,
        en: string
    };
    typeMaking: TypeMaking;
    creator: Creator;
    size: Size[];
    shade: string[];
    matter: Matter[];
    maintenance: Maintenance[];
    measure: string;
    weight: number;
    keywords: string[];
    relatedProduct: string[];
    wool: {
        compagny: string;
        name: string;
        size: SizeWool;
        color: string;
        matter: {
            type: Matter;
            percentage: number;
        }[];
    }[];
    image: string[];
}
