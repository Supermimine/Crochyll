import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';

import { Category } from "@core/enum/category";
import { TypeMaking } from "@core/enum/typeMaking";
import { Creator } from "@core/enum/creator";
import { Matter } from "@core/enum//matter";
import { Size } from "@core/enum//size";
import { SizeWool } from '@core/enum/sizeWool';
import { Maintenance } from "@core/enum//maintenance";
import type { Product } from "@core/model/product";

const router = Router();

const getProducts = (): Product[] => {
    return [
        //Vêtements
        {
            id: "148f32ca-0aa2-4716-b5f9-92c93dc9483a",
            name: {
                fr: "Châle douceur",
                en: "Soft Shawl"
            },
            price: [45.00, 45.00, 85.00, 85.00],
            category: Category.Clothes,
            description: {
                fr: "Ce châle va vous apporter douceur et réconfort pour les soirées froides d'été! Il est parfait pour vous protéger du soleil, le châle douceur est léger et permet à la peau de respirer.",
                en: "This shawl will bring you softness and comfort for the cold summer evenings! It is perfect to protect you from the sun, the softness shawl is light and allows the skin to breathe."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.WolfSoph,
            size: [Size.XS, Size.S, Size.M, Size.L],
            shade: ["000-001", "000-002"],
            matter: [
                Matter.Cotton,
                Matter.Acrylic,
            ],
            maintenance: [],
            measure: "TODO",
            weight: 0,
            keywords: ["châle", "douceur", "écharpe", "foulard", "accessoire", "mode", "printemps", "été", "léger"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Hobbii",
                    name: "Honolulu",
                    size: SizeWool.Fine,
                    color: "04",
                    matter: [
                        {
                            type: Matter.Cotton,
                            percentage: 52
                        },
                        {
                            type: Matter.Acrylic,
                            percentage: 48
                        }
                    ]
                },
                {
                    compagny: "Hobbii",
                    name: "Honolulu",
                    size: SizeWool.Fine,
                    color: "03",
                    matter: [
                        {
                            type: Matter.Cotton,
                            percentage: 52
                        },
                        {
                            type: Matter.Acrylic,
                            percentage: 48
                        }
                    ]
                },
            ],
            image: [
                "products/148f32ca-0aa2-4716-b5f9-92c93dc9483a-1.jpg",
                "products/148f32ca-0aa2-4716-b5f9-92c93dc9483a-2.jpg",
                "products/148f32ca-0aa2-4716-b5f9-92c93dc9483a-3.jpg",
                "products/148f32ca-0aa2-4716-b5f9-92c93dc9483a-4.jpg",
                "products/148f32ca-0aa2-4716-b5f9-92c93dc9483a-5.jpg"
            ]
        },
        {
            id: "ee2b74c8-0958-4b52-9772-4cfdc1807792",
            name: {
                fr: "Serviette à cheveaux",
                en: "Hair Towel"
            },
            price: [45.00],
            category: Category.Accessoires,
            description: {
                fr: "Avec sa composition de conton et de bamboo, cette serviette à cheveaux est très absorbante et ce même pour vos cheveux dégoulinant d'eaux!",
                en: "With its composition of cotton and bamboo, this hair towel is very absorbent and even for your dripping hair!"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.WolfSoph,
            size: [],
            shade: [],
            matter: [
                Matter.Bamboo,
                Matter.Cotton
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer, Maintenance.Uniron],
            measure: "26 x 60 x 1 cm",
            weight: 0,
            keywords: ["serviette", "cheveux", "accessoire", "mode", "léger", "eaux", "hygiène", "douche", "bain"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Hobbii",
                    name: "Rainbow Bamboo",
                    size: SizeWool.SuperFine,
                    color: "38",
                    matter: [
                        {
                            type: Matter.Cotton,
                            percentage: 40
                        },
                        {
                            type: Matter.Bamboo,
                            percentage: 60
                        }
                    ]
                }
            ],
            image: [
                "products/ee2b74c8-0958-4b52-9772-4cfdc1807792-1.jpg",
                "products/ee2b74c8-0958-4b52-9772-4cfdc1807792-2.jpg",
                "products/ee2b74c8-0958-4b52-9772-4cfdc1807792-3.jpg",
                "products/ee2b74c8-0958-4b52-9772-4cfdc1807792-4.jpg",
                "products/ee2b74c8-0958-4b52-9772-4cfdc1807792-5.jpg"
            ]
        },
        {
            id: "2732d19e-b5cd-4c1c-ad97-7fa17f8560b5",
            name: {
                fr: "Veste granny - Tea time",
                en: "Granny Jacket - Tea time"
            },
            price: [60.00, 60.00, 85.00],
            category: Category.Clothes,
            description: {
                fr: "TODO",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.WolfSoph,
            size: [Size.S, Size.M, Size.L],
            shade: ["000-003", "000-004", "000-005", "000-006", "000-007", "000-008", "000-009", "000-010", "000-011", "000-012", "000-013", "000-014", "000-015", "000-016", "000-017", "000-018", "000-019", "000-020", "000-021", "000-022", "000-023", "000-024", "000-025"],
            matter: [
                Matter.Acrylic
            ],
            maintenance: [Maintenance.HandWash],
            measure: "141 x 62 x 2 cm",
            weight: 0,
            keywords: ["chandail", "vêtement", "léger", "chaud", "veste", "manche longue"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Hobbii",
                    name: "Tea time - Chrismas",
                    size: SizeWool.Medium,
                    color: "03 - Christmas Tree",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                }
            ],
            image: [
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-1.jpg",
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-2.jpg",
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-3.jpg",
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-4.jpg",
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-5.jpg",
                "products/2732d19e-b5cd-4c1c-ad97-7fa17f8560b5-6.jpg",

            ]
        },
        //Amigurumi
        {
            id: "56265f9b-24a9-468f-824f-f16ee0aa049d",
            name: {
                fr: "Tortue",
                en: "Turtle"
            },
            price: [14.99],
            category: Category.Amigurumi,
            description: {
                fr: "Quoi de plus mignon qu'une petite tortue en peluche ? Cette adorable créature en crochet est parfaite pour les enfants et les amateurs de peluches. Fabriquée avec soin, elle est douce au toucher et idéale pour les câlins. Offrez cette tortue comme cadeau unique et charmant qui apportera un sourire à tous ceux qui la recevront ou pour vous même ;D.",
                en: "What could be cuter than a little plush turtle? This adorable crochet creature is perfect for children and stuffed animal lovers alike. Carefully crafted, it is soft to the touch and ideal for cuddling. Give this turtle as a unique, charming gift that will bring a smile to anyone's face—or keep it for yourself! ;D"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "10 x 8 x 12 cm",
            weight: 0.5,
            keywords: ["tortue", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "marin", "mers", "petit"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Pin",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Caramel",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/56265f9b-24a9-468f-824f-f16ee0aa049d-1.jpg",
                "products/56265f9b-24a9-468f-824f-f16ee0aa049d-2.jpg",
                "products/56265f9b-24a9-468f-824f-f16ee0aa049d-3.jpg",
                "products/56265f9b-24a9-468f-824f-f16ee0aa049d-4.jpg",
                "products/56265f9b-24a9-468f-824f-f16ee0aa049d-5.jpg"
            ]
        },
        {
            id: "6c55960e-8887-4978-9f58-7225c95cbcba",
            name: {
                fr: "Koala",
                en: "Koala"
            },
            price: [24.99],
            category: Category.Amigurumi,
            description: {
                fr: "Ce koala en peluche est un compagnon idéale pour les enfants et amateurs d'animaux en peluche. Ce super animal d'origine d'australie est frabriqué avec soin au crochet.",
                en: "This plush koala is an ideal companion for children and stuffed animal enthusiasts. This wonderful animal from Australia is carefully crafted using the crochet technique."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "15 x 25 x 15 cm",
            weight: 1,
            keywords: ["koala", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "australie", "animal"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Loops & Threads",
                    name: "Soft Classic",
                    size: SizeWool.Medium,
                    color: "Grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-1.jpg",
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-2.jpg",
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-3.jpg",
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-4.jpg",
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-5.jpg",
                "products/6c55960e-8887-4978-9f58-7225c95cbcba-6.jpg"
            ]
        },
        {
            id: "f8f262ff-07a0-4cf7-beb2-1be26902b788",
            name: {
                fr: "Lapin",
                en: "Rabbit"
            },
            price: [17.99],
            category: Category.Amigurumi,
            description: {
                fr: "Ce lapin en peluche est un compagnon idéal pour les enfants et les amateurs de peluches. Un adorable petit lapin à oreille tombante en crochet.",
                en: "This plush rabbit is an ideal companion for children and stuffed animal enthusiasts. An adorable little crocheted lop-eared rabbit."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "20 x 20 x 35 cm",
            weight: 1.5,
            keywords: ["lapin", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "cute"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Cantaloupe",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["no-picture.png"]
        },
        {
            id: "dd82c5b7-5c64-4a09-b8fc-c9a17fe4d099",
            name: {
                fr: "Serpent",
                en: "Snake"
            },
            price: [29.99],
            category: Category.Amigurumi,
            description: {
                fr: "Ne vous fiez pas aux apparences, ce petit serpent en peluche est tout sauf effrayant ! Entièrement crocheté à la main avec soin, il adore s'enrouler partout pour recevoir des câlins. Doux, coloré et super attachant, c'est le cadeau original parfait pour surprendre un proche ou pour ajouter une touche rigolote à votre collection ;D.",
                en: "Don't let appearances fool you—this little plush snake is anything but scary! Entirely handcrafted with care, it loves to curl up anywhere for cuddles. Soft, colorful, and super endearing, it's the perfect original gift to surprise a loved one or to add a funny touch to your own collection ;D."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Polyester,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "TODO",
            weight: 1.5,
            keywords: ["serpent", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Big Twist",
                    name: "Baby Bear Yarn",
                    size: SizeWool.SuperBulky,
                    color: "Sepia",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["no-picture.png"]
        },
        {
            id: "1c57a765-7d99-4ba4-a64a-df57fc396c2b",
            name: {
                fr: "Arraignée",
                en: "Spider"
            },
            price: [10.00],
            category: Category.Amigurumi,
            description: {
                fr: "Découvrez notre adorable petite d'araignée en crochet, parfaite pour les décorations d'halloween ou pour les amateurs d'araignées en peluche. Cette petite créature à huit pattes est fabriquée avec soin.",
                en: "Discover our adorable little crochet spider, perfect for Halloween decorations or for fans of plush spiders. This little eight-legged creature is crafted with care."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: ["000-026", "000-027"],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "8 x 3 x 8 cm",
            weight: 0.5,
            keywords: ["arraignée", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "insecte", "petit"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Loops & Threads",
                    name: "Soft Classic",
                    size: SizeWool.Medium,
                    color: "Grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["no-picture.png"]
        },
        {
            id: "95f8ca4f-34de-4d70-b8b3-fe183f012224",
            name: {
                fr: "Arraignée géante",
                en: "Giant Spider"
            },
            price: [79.99],
            category: Category.Amigurumi,
            description: {
                fr: "Découvrez notre impressionnante grande d'araignée en crochet, parfaite pour les décorations d'halloween ou pour les amateurs d'araignées en peluche. Cette créature à huit pattes est fabriquée avec soin et mesure 120 cm de long, ce qui en fait une pièce maîtresse pour votre collection de peluches ou une décoration unique pour les fêtes d'halloween ou comme oreiller a forme particulière.",
                en: "Discover our impressive large crochet spider, perfect for Halloween decorations or for fans of plush spiders. Carefully crafted, this eight-legged creature measures 120 cm in length, making it a standout piece for your plush collection, a unique Halloween decoration, or a novelty-shaped pillow."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
                Matter.Polyester,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "120 x 25 x 120 cm",
            weight: 5,
            keywords: ["arraignée", "peluche", "amigurumi", "cadeau", "enfant", "insecte", "grand", "halloween"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Purple",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Velvet",
                    size: SizeWool.Bulky,
                    color: "Blackbird",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                }
            ],
            image: ["no-picture.png"]
        },
        {
            id: "8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a",
            name: {
                fr: "Vachette",
                en: "Calf"
            },
            price: [21.99],
            category: Category.Amigurumi,
            description: {
                fr: "Cette adorable petite vache poilu en peluche représente une vachette Highland. Avec son pelage doux et son caractère charmant, elle est parfaite pour les tous.",
                en: "This adorable little plush Highland cow features a shaggy coat. With its soft fur and charming personality, it is perfect for everyone."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "18 x 18 x 15 cm",
            weight: 0.7,
            keywords: ["vachette", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "ferme"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Super Value",
                    size: SizeWool.Medium,
                    color: "Redwood Heather",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Caramel",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Michaels",
                    name: "Big Twist",
                    size: SizeWool.Medium,
                    color: "Ivory",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-1.jpg",
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-2.jpg",
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-3.jpg",
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-4.jpg",
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-5.jpg",
                "products/8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a-6.jpg"
            ]
        },
        {
            id: "0133a43e-270c-42ce-bf5b-99f2b81b362e",
            name: {
                fr: "Chèvre",
                en: "Goat"
            },
            price: [11.99],
            category: Category.Amigurumi,
            description: {
                fr: "Cette adorable petite chèvre assise et avec sa longue barbe est parfaite et simple comme peluche pour tout les ages.",
                en: "This adorable little seated goat with a long beard makes a perfect, simple plush toy for all ages."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "8 x 12 x 8 cm",
            weight: 0.5,
            keywords: ["chèvre", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "ferme"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Michaels",
                    name: "Big Twist",
                    size: SizeWool.Medium,
                    color: "Ivory",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Caramel",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/0133a43e-270c-42ce-bf5b-99f2b81b362e-1.jpg",
                "products/0133a43e-270c-42ce-bf5b-99f2b81b362e-2.jpg",
                "products/0133a43e-270c-42ce-bf5b-99f2b81b362e-3.jpg",
                "products/0133a43e-270c-42ce-bf5b-99f2b81b362e-4.jpg",
                "products/0133a43e-270c-42ce-bf5b-99f2b81b362e-5.jpg"
            ]
        },
        {
            id: "f5f5a251-7f5c-4f4f-acf7-379ea2546b54",
            name: {
                fr: "Renard",
                en: "Fox"
            },
            price: [49.99],
            category: Category.Amigurumi,
            description: {
                fr: "Ce renard sur 2 pattes en peluche est un compagnon idéal pour les enfants et les amateurs de peluches. Avec son pelage doux et ses détails soignés il sera le compagnon idéal pour les câlins et les aventures imaginaires.",
                en: "This plush fox standing on two legs is an ideal companion for children and stuffed animal enthusiasts. With its soft fur and finely crafted details, it makes the perfect companion for cuddles and imaginative adventures."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "20 x 50 x 30 cm",
            weight: 3,
            keywords: ["renard", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "forêt"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Michaels",
                    name: "Big Twist",
                    size: SizeWool.Medium,
                    color: "Ivory",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Orange",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["no-picture.png"]
        },
        {
            id: "95be2d6f-5290-4ab5-b384-5af8a5ed7251",
            name: {
                fr: "Pinguin",
                en: "Penguin"
            },
            price: [19.99],
            category: Category.Amigurumi,
            description: {
                fr: "Ce bébé pinguin assis en peluche est un compagnon mignon et adorable qui ce tiens parfaitement dans les mains.",
                en: "This seated plush baby penguin is a cute and adorable companion that fits perfectly in your hands."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "15 x 15 x 15 cm",
            weight: 1,
            keywords: ["pinguin", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "arctique"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Michaels",
                    name: "Big Twist",
                    size: SizeWool.Medium,
                    color: "Ivory",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Dark Grey Heather",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Gold",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/95be2d6f-5290-4ab5-b384-5af8a5ed7251-1.jpg",
                "products/95be2d6f-5290-4ab5-b384-5af8a5ed7251-2.jpg",
                "products/95be2d6f-5290-4ab5-b384-5af8a5ed7251-3.jpg",
                "products/95be2d6f-5290-4ab5-b384-5af8a5ed7251-4.jpg",
                "products/95be2d6f-5290-4ab5-b384-5af8a5ed7251-5.jpg"
            ]
        },
        {
            id: "6cf964cf-f73a-4f96-832b-d2efca21282b",
            name: {
                fr: "Souris",
                en: "Mouse"
            },
            price: [15.00],
            category: Category.Amigurumi,
            description: {
                fr: "Cette petit souris sur 2 pattes avec sa long queue, peut prendre plusieurs position et est parfaites pour les situations comiques ou pour les câlins.",
                en: "This little two-legged mouse with its long tail can strike various poses and is perfect for comic situations or for cuddling."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "8 x 18 x 8 cm",
            weight: 1,
            keywords: ["souris", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "petit"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Pink",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/6cf964cf-f73a-4f96-832b-d2efca21282b-1.jpg",
                "products/6cf964cf-f73a-4f96-832b-d2efca21282b-2.jpg",
                "products/6cf964cf-f73a-4f96-832b-d2efca21282b-3.jpg"
            ]
        },
        {
            id: "112a8609-7876-401c-882a-d54be6d6ac88",
            name: {
                fr: "Raie manta",
                en: "Manta Ray"
            },
            price: [15.00],
            category: Category.Amigurumi,
            description: {
                fr: "Cette raie manta en peluche est parfaite pour les amateurs d'animaux marins et les collectionneurs d'amigurumi.",
                en: "This plush manta ray is perfect for marine animal enthusiasts and amigurumi collectors."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "15 x 5 x 17 cm",
            weight: 0.5,
            keywords: ["raie manta", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "marin"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Teal",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Michaels",
                    name: "Loops & Threads Soft Classic",
                    size: SizeWool.Medium,
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/112a8609-7876-401c-882a-d54be6d6ac88-1.jpg",
                "products/112a8609-7876-401c-882a-d54be6d6ac88-2.jpg",
                "products/112a8609-7876-401c-882a-d54be6d6ac88-3.jpg",
                "products/112a8609-7876-401c-882a-d54be6d6ac88-4.jpg",
                "products/112a8609-7876-401c-882a-d54be6d6ac88-5.jpg"
            ]
        },
        {
            id: "f3561426-f762-4164-b8a9-ce42623affb9",
            name: {
                fr: "Requin baleine",
                en: "Whale Shark"
            },
            price: [74.99],
            category: Category.Amigurumi,
            description: {
                fr: "Partez à l'aventure sous-marine avec ce magnifique requin-baleine en crochet ! Malgré sa grande taille dans l'océan, cette version miniature en peluche est un concentré de douceur et de gentillesse. Fabriqué avec soin, il est idéal pour les amateurs du monde marin et parfait pour décorer une chambre ou servir de compagnon de dodo ;D.",
                en: "Embark on an underwater adventure with this beautiful crochet whale shark! Despite its large size in the ocean, this miniature plush version is packed with softness and kindness. Carefully crafted, it's ideal for marine life lovers and perfect for decorating a bedroom or becoming a bedtime companion ;D."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Polyester,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "TODO",
            weight: 0,
            keywords: ["requin baleine", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Blanket Brights",
                    size: SizeWool.SuperBulky,
                    color: "Bleu roi",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Blanket",
                    size: SizeWool.SuperBulky,
                    color: "Whipped Cream",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Blanket",
                    size: SizeWool.SuperBulky,
                    color: "Pink Dust",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                }
            ],
            image: ["no-picture.png"]
        },
        {
            id: "8b333ba4-3195-4923-a1a0-19c7478d03da",
            name: {
                fr: "Gnome",
                en: "Gnome"
            },
            price: [20.00, 32.00, 30.00, 32.00],
            category: Category.Amigurumi,
            description: {
                fr: "Ce petit gnome en peluche est prêt à apporter une touche de magie et de bonheur dans votre maison. Avec son grand chapeau pointu et sa barbe toute douce, cette créature en crochet est tout simplement irrésistible. C’est le compagnon idéal pour décorer une étagère ou pour offrir un cadeau unique plein de personnalité ;D.",
                en: "This little plush gnome is ready to bring a touch of magic and happiness to your home. With its big pointed hat and super soft beard, this crochet creature is simply irresistible. It’s the ideal companion to decorate a shelf or to give as a unique gift full of personality ;D."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: ["000-044", "000-045", "000-046", "000-047"],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "TODO",
            weight: 0,
            keywords: ["requin baleine", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Dark grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Yarnspirations",
                    name: "Bernat Prenium",
                    size: SizeWool.Medium,
                    color: "Cantaloupe",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Michaels",
                    name: "Loops & Threads Soft Classic",
                    size: SizeWool.Medium,
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/8b333ba4-3195-4923-a1a0-19c7478d03da-1.jpg",
                "products/8b333ba4-3195-4923-a1a0-19c7478d03da-2.jpg",
                "products/8b333ba4-3195-4923-a1a0-19c7478d03da-3.jpg",
                "##000-045##no-picture.png",
                "##000-046##no-picture.png",
                "##000-047##no-picture.png"
            ]
        },
        {
            id: "725f771c-5e82-4507-9f32-58e27561a07a",
            name: {
                fr: "Pieuvre",
                en: "Octopus"
            },
            price: [89.99],
            category: Category.Amigurumi,
            description: {
                fr: "Avec ses tentacules rigolotes et ses grands yeux tendres, cette petite pieuvre en peluche va faire chavirer votre cœur ! Faite au crochet avec beaucoup d'amour, elle est incroyablement douce et ses bras sont parfaits pour être attrapés par les petites mains. Un cadeau charmant et réconfortant pour les enfants... ou pour vous-même ;D.",
                en: "With its funny tentacles and big, tender eyes, this little plush octopus will melt your heart! Crocheted with lots of love, it is incredibly soft and its arms are perfect for little hands to hold. A charming and comforting gift for children... or for yourself ;D."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
                Matter.Polyester
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "TODO",
            weight: 0,
            keywords: ["pieuvre", "peluche", "amigurumi", "géant", "mers", "cadeau", "enfant", "océan", "tentacules", "octo"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Michaels",
                    name: "Big Twist",
                    size: SizeWool.SuperBulky,
                    color: "Gold",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Loops & Threads",
                    name: "Demi Purl",
                    size: SizeWool.SuperBulky,
                    color: "Dark Gulf Grey",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: [
                "products/725f771c-5e82-4507-9f32-58e27561a07a-1.jpg",
                "products/725f771c-5e82-4507-9f32-58e27561a07a-2.jpg",
                "products/725f771c-5e82-4507-9f32-58e27561a07a-3.jpg",
                "products/725f771c-5e82-4507-9f32-58e27561a07a-4.jpg",
                "products/725f771c-5e82-4507-9f32-58e27561a07a-5.jpg"
            ]
        },
        //Accessoires Amigurumi
        {
            id: "4c6f73ed-7d41-4f91-ac85-9e85869ecc2a",
            name: {
                fr: "Couverture",
                en: "Blanket"
            },
            price: [5.00, 7.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "Petite couverture qui pourra accompagner vos peluche partout, ainsi que les abbriller la nuit. Cette accessoire est parfait pour les amigurumies qui ont les mains jointes.",
                en: "A small blanket that can accompany your stuffed toys wherever they go and keep them covered at night. This accessory is perfect for amigurumi with joined hands."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [Size.XS, Size.S],
            shade: ["000-028", "000-029", "000-030", "000-031", "000-032", "000-033", "000-034", "000-035", "000-036", "000-037", "000-038", "000-039", "000-040", "000-041", "000-042", "000-043"],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "15 x 1 x 18 cm OU 22 x 1 x 26",
            weight: 0.2,
            keywords: ["couverture", "enfant", "nuit", "dormir"],
            relatedProduct: ["6cf964cf-f73a-4f96-832b-d2efca21282b", "6c55960e-8887-4978-9f58-7225c95cbcba", "f5f5a251-7f5c-4f4f-acf7-379ea2546b54", "95be2d6f-5290-4ab5-b384-5af8a5ed7251"],
            wool: [
            ],
            image: [
                "products/4c6f73ed-7d41-4f91-ac85-9e85869ecc2a-1.jpg",
                "products/4c6f73ed-7d41-4f91-ac85-9e85869ecc2a-2.jpg",
                "products/4c6f73ed-7d41-4f91-ac85-9e85869ecc2a-3.jpg"
            ]
        },
        {
            id: "db0625fe-cbd0-4ae7-a96e-ccf8e7b73689",
            name: {
                fr: "Bambou",
                en: "Bamboo"
            },
            price: [7.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "3 petite tige de bambou qui pourrais ressortir et accompagner vos animamaux en crochet. Cette assesoire naturel est idéal pour rendre une peluche unique et avec un air réaliste.",
                en: "A small bamboo stem that can be attached to your crocheted animals. This natural accessory is perfect for giving a plush toy a unique, realistic look."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "5 x 5 x 20 cm",
            weight: 0.3,
            keywords: ["bambou", "enfant", "nature", "forêt"],
            relatedProduct: ["6c55960e-8887-4978-9f58-7225c95cbcba"],
            wool: [
            ],
            image: [
                "products/db0625fe-cbd0-4ae7-a96e-ccf8e7b73689-1.jpg",
                "products/db0625fe-cbd0-4ae7-a96e-ccf8e7b73689-2.jpg",
                "products/db0625fe-cbd0-4ae7-a96e-ccf8e7b73689-3.jpg",
                "products/db0625fe-cbd0-4ae7-a96e-ccf8e7b73689-4.jpg"
            ]
        },
        {
            id: "a91e8fbe-78a2-4c0f-87ea-fbfe7252027e",
            name: {
                fr: "Fromage",
                en: "Cheese"
            },
            price: [15.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "Qui a dit que le fromage ne pouvait pas être mignon ? Craquez pour cette adorable part de fromage en peluche faite au crochet. Avec son design original et sa texture ultra douce, elle apporte une touche d'humour et d'originalité à votre décor. Le cadeau parfait pour les gourmands et les amateurs d'objets insolites ;D.",
                en: "Who said cheese couldn't be cute? Fall for this adorable slice of plush cheese made with crochet. With its original design and ultra-soft texture, it brings a touch of humor and uniqueness to your decor. The perfect gift for foodies and lovers of quirky items ;D."
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "25 x 12 x 12 cm",
            weight: 1,
            keywords: ["fromage", "peluche", "amigurumi"],
            relatedProduct: ["6cf964cf-f73a-4f96-832b-d2efca21282b"],
            wool: [
            ],
            image: [
                "products/a91e8fbe-78a2-4c0f-87ea-fbfe7252027e-1.jpg",
                "products/a91e8fbe-78a2-4c0f-87ea-fbfe7252027e-2.jpg",
                "products/a91e8fbe-78a2-4c0f-87ea-fbfe7252027e-3.jpg"
            ]
        },
        {
            id: "ef655bfb-0c46-4cac-9874-8c4919d4c75b",
            name: {
                fr: "Chapeau citrouille",
                en: "Pumpkin hat"
            },
            price: [6.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "",
                en: ""
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "25 x 12 x 12 cm",
            weight: 1,
            keywords: ["chapeau", "tuque", "orange", "citrouille", "halloween", "peluche", "amigurumi"],
            relatedProduct: ["8b333ba4-3195-4923-a1a0-19c7478d03da"],
            wool: [
            ],
            image: [
                "products/ef655bfb-0c46-4cac-9874-8c4919d4c75b-1.jpg",
                "products/ef655bfb-0c46-4cac-9874-8c4919d4c75b-2.jpg",
                "products/ef655bfb-0c46-4cac-9874-8c4919d4c75b-3.jpg",
                "products/ef655bfb-0c46-4cac-9874-8c4919d4c75b-4.jpg"
            ]
        },
        {
            id: "6368e5f9-38c3-492b-8d97-c1af55390cdb",
            name: {
                fr: "Chapeau Noël",
                en: "Christmas hat"
            },
            price: [5.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "",
                en: ""
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "25 x 12 x 12 cm",
            weight: 1,
            keywords: ["chapeau", "tuque", "rouge", "noel", "noël", "peluche", "amigurumi", "froid"],
            relatedProduct: ["8b333ba4-3195-4923-a1a0-19c7478d03da"],
            wool: [
            ],
            image: [
                "products/6368e5f9-38c3-492b-8d97-c1af55390cdb-1.jpg",
                "products/6368e5f9-38c3-492b-8d97-c1af55390cdb-2.jpg",
                "products/6368e5f9-38c3-492b-8d97-c1af55390cdb-3.jpg"
            ]
        },
        {
            id: "eaf3800d-8bed-47cf-bc56-ae58947bd572",
            name: {
                fr: "Chapeau fleur",
                en: "flower hat"
            },
            price: [6.00],
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "",
                en: ""
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "25 x 12 x 12 cm",
            weight: 1,
            keywords: ["chapeau", "tuque", "orange", "citrouille", "halloween", "peluche", "amigurumi"],
            relatedProduct: ["8b333ba4-3195-4923-a1a0-19c7478d03da"],
            wool: [
            ],
            image: [
                "products/eaf3800d-8bed-47cf-bc56-ae58947bd572-1.jpg",
                "products/eaf3800d-8bed-47cf-bc56-ae58947bd572-2.jpg",
                "products/eaf3800d-8bed-47cf-bc56-ae58947bd572-3.jpg"
            ]
        },
    ]
};

// GET /api/products
router.get('/products', (req: Request, res: Response) => {
    try {
        const products = getProducts();
        const response: ApiResponse<Product[]> = {
            success: true,
            data: products,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/products/:id
router.get('/products/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const products = getProducts();
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                timestamp: new Date().toISOString()
            });
        }

        const response: ApiResponse<Product> = {
            success: true,
            data: product,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/products/category/:category
router.get('/products/category/:category', (req: Request, res: Response) => {
    try {
        const categoryParam = req.params.category as string;
        const categories = categoryParam.split(',');

        const products = getProducts();
        let filtered: Product[] = [];

        for (const cat of categories) {
            const categoryNum = Number(cat);
            const category = !isNaN(categoryNum) ? categoryNum : Category[cat as keyof typeof Category];
            filtered = filtered.concat(products.filter(item => item.category === category));
        }

        const response: ApiResponse<Product[]> = {
            success: true,
            data: filtered,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
