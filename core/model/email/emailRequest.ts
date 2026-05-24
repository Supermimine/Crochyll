export interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  [key: string]: any;
}