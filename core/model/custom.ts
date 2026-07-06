import type { Creator } from "../enum/creator";
import type { Matter } from "../enum/matter";
import type { Category } from "../enum/category";


export interface Custom {
    name: string;
    description: string;
    creator: Creator;
    size: string;
    sizeFormat: string;
    matter: Matter[];
    category: Category;
    username: string;
    contact: string;
}
