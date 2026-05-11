import { Router, Request, Response } from 'express';
import type { ApiResponse, Product } from '../types';

const router = Router();

// Données produits temporaires (à remplacer par votre logique)
// Pour le moment, on retourne un template vide
const getProducts = (): Product[] => {
  // TODO: Importer depuis vos données (shopData.ts depuis frontend)
  // ou charger depuis une base de données
  return [
    // Exemple de structure:
    // {
    //   id: '1',
    //   name: 'Produit 1',
    //   price: 29.99,
    //   description: 'Description produit',
    //   category: 'amigurumi',
    //   measure: '10x10x10cm',
    //   weight: 100
    // }
  ];
};

// GET /api/products - Retourner tous les produits
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

// GET /api/products/:id - Retourner un produit spécifique
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

// GET /api/products/category/:category - Retourner les produits d'une catégorie
router.get('/products/category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const products = getProducts();
    const filtered = products.filter(p => p.category === category);

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
