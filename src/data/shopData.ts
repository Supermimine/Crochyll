import { Category } from "../enum/category";
import { TypeMaking } from "../enum/typeMaking";
import { Creator } from "../enum/creator";
import { Matter } from "../enum/matter";
import { Size } from "../enum/size";
import { Maintenance } from "../enum/maintenance";
import type { Product } from "../model/product";

export const data: { shopName: string; location: string; products: Product[] } = {
    "shopName": "Crochyll",
    "location": "St-Liboire, QC, Canada",
    products: [
        //Vêtements
        {
            id: "148f32ca-0aa2-4716-b5f9-92c93dc9483a",
            name: "Châle douceur",
            price: 45.00,
            category: Category.Clothes,
            description: {
                fr:"TODO",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.WolfSoph,
            size: [Size.XS, Size.S, Size.M, Size.L],
            shade: ["03", "04"],
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
                    size: "2 (fine)",
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
                    size: "2 (fine)",
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
            image: ["icon.png"]
        },
        //Amigurumi
        {
            id: "56265f9b-24a9-468f-824f-f16ee0aa049d",
            name: "Tortue",
            price: 16.00,
            category: Category.Amigurumi,
            description: {
                fr:"Quoi de plus mignon qu'une petite tortue en peluche ? Cette adorable créature en crochet est parfaite pour les enfants et les amateurs de peluches. Fabriquée avec soin, elle est douce au toucher et idéale pour les câlins. Offrez cette tortue comme cadeau unique et charmant qui apportera un sourire à tous ceux qui la recevront ou pour vous même ;D.",
                en: "TODO"
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
            keywords: ["tortue", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant", "animal", "marin"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Pin",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Caramel",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "6c55960e-8887-4978-9f58-7225c95cbcba",
            name: "Koala",
            price: 25.00,
            category: Category.Amigurumi,
            description: {
                fr:"Ce koala en peluche est un compagnon idéale pour les enfants et amateurs d'animaux en peluche. Ce super animal d'origine d'australie est frabriqué avec soin au crochet.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Ivy",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png", "test.png"]
        },
        {
            id: "f8f262ff-07a0-4cf7-beb2-1be26902b788",
            name: "Lapin",
            price: 30.00,
            category: Category.Amigurumi,
            description: {
                fr: "Ce lapin en peluche est un compagnon idéal pour les enfants et les amateurs de peluches. Un adorable petit lapin à oreille tombante en crochet.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Cantaloupe",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "dd82c5b7-5c64-4a09-b8fc-c9a17fe4d099",
            name: "Serpent",
            price: 30.00,
            category: Category.Amigurumi,
            description: {
                fr:"TODO",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
            matter: [
                Matter.Acrylic,
            ],
            maintenance: [Maintenance.Washable, Maintenance.Dryer],
            measure: "TODO",
            weight: 1.5,
            keywords: ["serpent", "peluche", "amigurumi", "mignon", "kawaii", "cadeau", "enfant"],
            relatedProduct: [],
            wool: [
                {
                    compagny: "TODO",
                    name: "TODO",
                    size: "4 (moyenne)",
                    color: "TODO",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "1c57a765-7d99-4ba4-a64a-df57fc396c2b",
            name: "Arraignée",
            price: 10.00,
            category: Category.Amigurumi,
            description: {
                fr: "Découvrez notre adorable petite d'araignée en crochet, parfaite pour les décorations d'halloween ou pour les amateurs d'araignées en peluche. Cette petite créature à huit pattes est fabriquée avec soin.",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: ["Black", "Grey"],
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "95f8ca4f-34de-4d70-b8b3-fe183f012224",
            name: "Arraignée géante",
            price: 80.00,
            category: Category.Amigurumi,
            description: {
                fr: "Découvrez notre impressionnante grande d'araignée en crochet, parfaite pour les décorations d'halloween ou pour les amateurs d'araignées en peluche. Cette créature à huit pattes est fabriquée avec soin et mesure 120 cm de long, ce qui en fait une pièce maîtresse pour votre collection de peluches ou une décoration unique pour les fêtes d'halloween ou comme oreiller a forme particulière.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Purple",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Velvet",
                    size: "5 (épais)",
                    color: "Blackbird",
                    matter: [
                        {
                            type: Matter.Polyester,
                            percentage: 100
                        }
                    ]
                }
            ],
            image: ["icon.png"]
        },
        {
            id: "8bf9c02c-ed2e-4721-b32b-f24ca09f8f0a",
            name: "Vachette",
            price: 15.00,
            category: Category.Amigurumi,
            description: {
                fr: "Cette adorable petite vache poilu en peluche représente une vachette Highland. Avec son pelage doux et son caractère charmant, elle est parfaite pour les tous.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Super Value",
                    size: "4 (moyenne)",
                    color: "Redwood Heather",
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
                    size: "4 (moyenne)",
                    color: "Coffee",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat prenium",
                    size: "4 (moyenne)",
                    color: "Almond",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "0133a43e-270c-42ce-bf5b-99f2b81b362e",
            name: "Chèvre",
            price: 15.00,
            category: Category.Amigurumi,
            description: {
                fr: "Cette adorable petite chèvre assise et avec sa longue barbe est parfaite et simple comme peluche pour tout les ages.",
                en: "TODO"
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
                    name: "Loops & Threads Soft Classic",
                    size: "4 (moyenne)",
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
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
                    name: "Loops & Threads Soft Classic",
                    size: "4 (moyenne)",
                    color: "Mocha",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "f5f5a251-7f5c-4f4f-acf7-379ea2546b54",
            name: "Renard",
            price: 50.00,
            category: Category.Amigurumi,
            description: {
                fr: "Ce renard sur 2 pattes en peluche est un compagnon idéal pour les enfants et les amateurs de peluches. Avec son pelage doux et ses détails soignés il sera le compagnon idéal pour les câlins et les aventures imaginaires.",
                en: "TODO"
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
                    name: "Loops & Threads Soft Classic",
                    size: "4 (moyenne)",
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Black",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Orange",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "95be2d6f-5290-4ab5-b384-5af8a5ed7251",
            name: "Pinguin",
            price: 15.00,
            category: Category.Amigurumi,
            description: {
                fr: "Ce bébé pinguin assis en peluche est un compagnon mignon et adorable qui ce tiens parfaitement dans les mains.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
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
                    name: "Loops & Threads Soft Classic",
                    size: "4 (moyenne)",
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Dark grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Gold",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "6cf964cf-f73a-4f96-832b-d2efca21282b",
            name: "Souris",
            price: 15.00,
            category: Category.Amigurumi,
            description: {
                fr: "Cette petit souris sur 2 pattes avec sa long queue, peut prendre plusieurs position et est parfaites pour les situations comiques ou pour les câlins.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Medium grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Pink",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "112a8609-7876-401c-882a-d54be6d6ac88",
            name: "Raie manta",
            price: 15.00,
            category: Category.Amigurumi,
            description: {
                fr: "Cette raie manta en peluche est parfaite pour les amateurs d'animaux marins et les collectionneurs d'amigurumi.",
                en: "TODO"
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
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
                    size: "4 (moyenne)",
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "f3561426-f762-4164-b8a9-ce42623affb9",
            name: "Requin baleine",
            price: 35.00,
            category: Category.Amigurumi,
            description: {
                fr:"TODO",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
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
                    compagny: "TODO",
                    name: "TODO",
                    size: "4 (moyenne)",
                    color: "TODO",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        {
            id: "8b333ba4-3195-4923-a1a0-19c7478d03da",
            name: "Gnome",
            price: 40.00,
            category: Category.Amigurumi,
            description: {
                fr:"TODO",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [],
            shade: [],
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
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
                    color: "Dark grey",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
                {
                    compagny: "Walmart",
                    name: "Bernat Prenium",
                    size: "4 (moyenne)",
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
                    size: "4 (moyenne)",
                    color: "Off White",
                    matter: [
                        {
                            type: Matter.Acrylic,
                            percentage: 100
                        }
                    ]
                },
            ],
            image: ["icon.png"]
        },
        //Accessoires Amigurumi
        {
            id: "4c6f73ed-7d41-4f91-ac85-9e85869ecc2a",
            name: "Couverture",
            price: 5.00,
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "Petite couverture qui pourra accompagner vos peluche partout, ainsi que les abbriller la nuit. Cette accessoire est parfait pour les amigurumies qui ont les mains jointes.",
                en: "TODO"
            },
            typeMaking: TypeMaking.Crochet,
            creator: Creator.Supermimine,
            size: [Size.XS, Size.S],
            shade: ["Green", "Blue", "Yellow", "Pink", ],
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
            image: ["icon.png"]
        },
        {
            id: "db0625fe-cbd0-4ae7-a96e-ccf8e7b73689",
            name: "Bambou",
            price: 7.00,
            category: Category.AccessoiresAmigurumi,
            description: {
                fr: "3 petite tige de bambou qui pourrais ressortir et accompagner vos animamaux en crochet. Cette assesoire naturel est idéal pour rendre une peluche unique et avec un air réaliste.",
                en: "TODO"
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
            image: ["icon.png"]
        },
        {
            id: "a91e8fbe-78a2-4c0f-87ea-fbfe7252027e",
            name: "Fromage",
            price: 15.00,
            category: Category.AccessoiresAmigurumi,
            description: {
                fr:"TODO",
                en: "TODO"
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
            image: ["icon.png"]
        },
    ]
}

const getItem = (id: string) => {
    return data.products.find(item => item.id === id);
};

export default getItem;
