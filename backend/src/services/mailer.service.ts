import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

interface MailerConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

class MailerService {
  private transporter: Transporter | null = null;
  private config: MailerConfig | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Réinitialiser le service Mailer (utile après le chargement de dotenv)
   */
  reinitialize(): void {
    this.transporter = null;
    this.config = null;
    this.initialize();
  }

  /**
   * Initialiser le service Nodemailer avec configuration SMTP
   */
  private initialize(): void {
    try {
      // Récupérer les variables d'environnement
      const smtpHost = process.env.SMTP_HOST?.trim();
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER?.trim();
      const smtpPass = process.env.SMTP_PASSWORD?.trim();
      const smtpFromName = process.env.SMTP_FROM_NAME || 'Crochyll';
      const smtpFromEmail = (process.env.SMTP_FROM_EMAIL || smtpUser)?.trim();
      const smtpSecure = process.env.SMTP_SECURE === 'true'; // Pour port 465

      // Vérifier la configuration
      if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('⚠️  Configuration SMTP incomplète. L\'envoi d\'emails n\'est pas activé.');
        console.warn(`   Valeurs manquantes: ${!smtpHost ? 'SMTP_HOST ' : ''}${!smtpUser ? 'SMTP_USER ' : ''}${!smtpPass ? 'SMTP_PASSWORD' : ''}`);
        return;
      }

      this.config = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        from: {
          name: smtpFromName,
          email: smtpFromEmail || smtpUser,
        },
      };

      // Créer le transporteur avec le config valide
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service Mailer:', error);
    }
  }

  /**
   * Vérifier la connexion SMTP
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Transporter non initialisé');
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion SMTP:', error);
      return false;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    replyTo?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Service email non configuré',
      };
    }

    try {
      // Validation des paramètres
      if (!this.isValidEmail(to)) {
        return {
          success: false,
          error: `Email invalide: ${to}`,
        };
      }

      if (!subject.trim()) {
        return {
          success: false,
          error: 'Le sujet ne peut pas être vide',
        };
      }

      if (!html.trim()) {
        return {
          success: false,
          error: 'Le contenu de l\'email ne peut pas être vide',
        };
      }

      const mailOptions: SendMailOptions = {
        from: `${this.config!.from.name} <${this.config!.from.email}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      if (replyTo) {
        mailOptions.replyTo = replyTo;
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email',
      };
    }
  }

  async sendPersonalizedRequestEmail(
    username: string,
    email: string,
    subject: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Valider les paramètres
    if (!this.isValidEmail(email)) {
      return {
        success: false,
        error: `Email invalide: ${email}`,
      };
    }

    if (!subject.trim() || !message.trim()) {
      return {
        success: false,
        error: 'Tous les champs sont requis',
      };
    }

    // Vérifier que le service est configuré
    const supportEmail = process.env.SUPPORT_EMAIL || this.config?.from.email;
    if (!supportEmail) {
      return {
        success: false,
        error: 'Service email non configuré (SUPPORT_EMAIL manquant)',
      };
    }

    // Construire le contenu HTML sécurisé
    const htmlContent = `
      <p><strong>Nom:</strong> ${this.escapeHtml(username.trim() ? username : 'Nom inconnue')}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(email)}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${this.escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    return this.sendEmail(
      supportEmail,
      `[Contact] ${subject}`,
      htmlContent,
      message,
      email // L'email de l'utilisateur comme replyTo
    );
  }

  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      shippingAddress: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const itemsHtml = orderData.items
      .map(
        item => `
      <tr>
        <td>${this.escapeHtml(item.name)}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <h2>Confirmation de commande</h2>
      <p>Bonjour ${this.escapeHtml(orderData.customerName)},</p>
      <p>Merci pour votre commande! Voici les détails:</p>
      <p><strong>Numéro de commande:</strong> ${this.escapeHtml(orderData.orderId)}</p>
      
      <h3>Articles:</h3>
      <table border="1" cellpadding="10">
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Prix</th>
        </tr>
        ${itemsHtml}
      </table>
      
      <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
      <p><strong>Adresse de livraison:</strong></p>
      <p>${this.escapeHtml(orderData.shippingAddress).replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p>Nous vous remercions de votre achat!</p>
      <p>Cordialement,<br>L'équipe Crochyll</p>
    `;

    return this.sendEmail(
      to,
      `Confirmation de commande - ${orderData.orderId}`,
      htmlContent
    );
  }

  /**
   * Valider si une adresse email est valide
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Échapper les caractères HTML pour prévenir les injections XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Enlever les balises HTML
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}

// Exporter une instance singleton
export const mailerService = new MailerService();
