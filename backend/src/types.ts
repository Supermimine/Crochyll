// Types partagés entre frontend et backend

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  measure?: string;
  weight?: number;
  [key: string]: any;
}

export interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
