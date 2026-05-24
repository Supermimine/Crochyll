const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Category } from '@core/enum/category';
import type { Product } from '@core/model/product';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============ HEALTH CHECK ============
  async healthCheck(): Promise<boolean> {
    const response = await this.request('/api/health');
    return response.success;
  }

  // ============ PRODUCTS ============

  /**
   * Get all products
   * -------------------------------------
   * @returns An array of products or an error message if the request fails
   * @throws Will throw an error if the products is not found or if there is an issue with the API request
   * @example
   * const products = await api.getProducts();
   */
  async getProducts(): Promise<Product[]> {
    const response: ApiResponse<Product[]> = await this.request('/api/products');

      if (!response.success || !response.data) {
        throw new Error('Products not found');
      }

    return response.data
  }

  /**
   * Get product by ID
   * -------------------------------------
   * @param id The ID of the product
   * @returns The product if found, or an error message if not found
   * @throws Will throw an error if the product is not found or if there is an issue with the API request
   * @example
   * const product = await api.getProductById('12345');
   * console.log(product.name);
   */
  async getProductById(id: string): Promise<Product> {
    const response: ApiResponse<Product> = await this.request(`/api/products/${id}`);

      if (!response.success || !response.data) {
        throw new Error('Product not found');
      }

    return response.data;
  }

  /**
   * Get products by category
   * -------------------------------------
   * @param category The category of the products to retrieve
   * @returns An array of products or an error message if the request fails
   * @throws Will throw an error if the products is not found or if there is an issue with the API request
   * @example
   * const products = await api.getProductsByCategory(Category.Amigurumi);
   */
  async getProductsByCategory(category: Category): Promise<Product[]> {
    const response: ApiResponse<Product[]> = await this.request(`/api/products/category/${category}`);

      if (!response.success || !response.data) {
        throw new Error('Products not found');
      }

    return response.data;    
  }

  // ============ EMAILS ============

  /**
   * Envoyer un email générique
   */
  async sendEmail(emailData: {
    to: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  /**
   * Envoyer un formulaire de contact
   */
  async sendContactForm(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/email/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

// Créer une instance unique du service
export const api = new ApiService();

export default ApiService;
