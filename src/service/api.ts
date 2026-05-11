// Service API pour communiquer avec le backend
// Utilise les variables d'environnement Vite

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  /**
   * Effectuer une requête générique
   */
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

  /**
   * Vérifier que le backend est accessible
   */
  async healthCheck(): Promise<boolean> {
    const response = await this.request('/api/health');
    return response.success;
  }

  // ============ PRODUCTS ============

  /**
   * Récupérer tous les produits
   */
  async getProducts(): Promise<ApiResponse<any[]>> {
    return this.request('/api/products');
  }

  /**
   * Récupérer un produit par ID
   */
  async getProductById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/products/${id}`);
  }

  /**
   * Récupérer les produits d'une catégorie
   */
  async getProductsByCategory(category: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/products/category/${category}`);
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
