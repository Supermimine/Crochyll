const API_URL = import.meta.env.VITE_API_URL ?? '';

import type { Promo } from '@core';
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
   * const products = await api.getProductsByCategory([Category.Amigurumi]);
   */
  async getProductsByCategory(category: Category[]): Promise<Product[]> {
    const response: ApiResponse<Product[]> = await this.request(`/api/products/category/${category.join(',')}`);

      if (!response.success || !response.data) {
        throw new Error('Products not found');
      }

    return response.data;    
  }

  // ============ PROMO CODES ============
    /**
   * Check if promo code is valid and discount assosiate
   * -------------------------------------
   * @returns A boolean promo codes is valid and discount or an error message if the request fails
   * @throws Will throw an error if the promo codes are not found or if there is an issue with the API request
   * @example
   * const isPromoCodeValid = await api.checkPromoCode(promoCode);
   */
  async checkPromoCode(code: string): Promise<ApiResponse<any>> {
    return this.request('/api/promoCodes/check', {
      method: 'POST',
      body: JSON.stringify({code}),
    });
  }

  // ============ EMAILS ============

  /**
   * Send a simple email
   * -------------------------------------
   * @param emailData The email data to send
   * @return A success message or an error message if the request fails
   * @throws Will throw an error if there is an issue with the API request
   * @example
   * await api.sendEmail({
   *   to: 'recipient@example.com',
   *   subject: 'Test Email',
   *   message: 'This is a test email.'
   * });
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
   * Send personalized request email
   * -------------------------------------
   * @param contactData The contact data to send in the email
   * @returns A success message or an error message if the request fails
   * @throws Will throw an error if there is an issue with the API request
   * @example
   * await api.sendPersonalizedRequestEmail({
   *   username: 'John Doe',
   *   email: 'john.doe@example.com',
   *   subject: 'Demande de personnalisation',
   *   message: 'Bonjour, je souhaiterais commander un article personnalisé...'
   * });
   */
  async sendPersonalizedRequestEmail(contactData: {
    username: string;
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

// Create a singleton instance of the API service
export const api = new ApiService();

export default ApiService;
