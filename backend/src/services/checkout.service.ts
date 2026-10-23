import { randomUUID } from 'crypto';
import type { Address } from '@core/model/address';
import type { CartItem } from '@core/model/cartItem';
import type { Promo } from '@core/model/promo';
import { getProductPrice } from '@core/utils/productPricing';
import { getProducts } from '../routes/products';
import { getPromoCodes } from '../routes/promo';
import { mailerService } from './mailer.service';
import { normalizeText, validateEmail, validatePromoCode } from '../security';

interface CheckoutItemInput {
  productId: string;
  quantity: number;
  color: string | null;
  size: number | null;
}

interface CheckoutInput {
  items: CheckoutItemInput[];
  address: Address;
  promoCode?: string;
}

interface OrderLine {
  name: string;
  quantity: number;
  price: number;
}

interface PendingCheckout {
  expiresAt: number;
  amount: string;
  orderLines: OrderLine[];
  total: number;
  shippingAddress: string;
  captured: boolean;
  emailSent?: boolean;
  capturePromise?: Promise<{ success: boolean; emailSent: boolean }>;
}

interface PayPalOrderResult {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        amount?: { currency_code?: string; value?: string };
        status?: string;
      }>;
    };
  }>;
  payer?: { email_address?: string };
}

const pendingCheckouts = new Map<string, PendingCheckout>();
const CHECKOUT_TTL_MS = 30 * 60_000;
const MAX_PENDING_CHECKOUTS = 10_000;
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

export class CheckoutError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

const paypalBaseUrl = () => process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const getAccessToken = async (): Promise<string> => {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new CheckoutError('PayPal is not configured', 503);
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.value;
  }

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new CheckoutError('Unable to connect to PayPal', 502);
  }

  const token = await response.json() as { access_token?: string; expires_in?: number };
  if (!token.access_token) {
    throw new CheckoutError('Unable to connect to PayPal', 502);
  }

  cachedAccessToken = {
    value: token.access_token,
    expiresAt: Date.now() + Math.max(60, token.expires_in ?? 300) * 1000,
  };
  return cachedAccessToken.value;
};

const paypalRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new CheckoutError('PayPal could not process the checkout', 502);
  }

  return response.json() as Promise<T>;
};

const money = (value: number) => (Math.round(value * 100) / 100).toFixed(2);

const getShippingPrice = (cart: CartItem[], country: string): number => {
  let shipping = 0;

  for (const entry of cart) {
    const dimensions = entry.item.measure.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const [length = 0, width = 0, height = 0] = dimensions;
    const zone = country === 'CA' ? 'CA'
      : country === 'US' ? 'US'
        : ['FR', 'DE', 'IT', 'ES', 'BE', 'NL', 'PT', 'IE', 'SE', 'NO'].includes(country) ? 'EU'
          : 'international';
    const basePrice = zone === 'CA' ? 8 : zone === 'US' ? 22 : zone === 'EU' ? 45 : 70;
    const weightMultiplier = zone === 'CA' ? 8 : zone === 'US' ? 12 : zone === 'EU' ? 15 : 15;
    const maxDimension = Math.max(length, width, height);
    const sizeFee = maxDimension > 60 ? 10 : maxDimension > 40 ? 5 : 0;
    const volumetricWeight = length * width * height / 5000;
    const unitShipping = Math.round((basePrice + Math.max(entry.item.weight, volumetricWeight) * weightMultiplier + sizeFee) * 100) / 100;

    for (let quantity = 0; quantity < entry.quantity; quantity += 1) {
      shipping += unitShipping * (quantity === 0 ? 1 : quantity < 5 ? 0.5 : 0.25);
    }
  }

  return Math.round(shipping * 100) / 100;
};

const normalizeAddress = (value: unknown): Address => {
  if (!value || typeof value !== 'object') {
    throw new CheckoutError('Invalid checkout details', 400);
  }

  const address = value as Partial<Address>;
  const address1 = normalizeText(address.address1, 120);
  const address2 = address.address2 ? normalizeText(address.address2, 120) : '';
  const city = normalizeText(address.city, 80);
  const state = address.state ? normalizeText(address.state, 80) : '';
  const postalCode = address.postalCode ? normalizeText(address.postalCode, 20) : '';
  const country = typeof address.country === 'string' ? address.country.trim().toUpperCase() : '';

  if (!address1 || !city || !/^[A-Z]{2}$/.test(country)) {
    throw new CheckoutError('Invalid checkout details', 400);
  }

  return { address1, address2: address2 || undefined, city, state: state || undefined, postalCode: postalCode || undefined, country };
};

const findPromo = (code: unknown): Promo | undefined => {
  if (!code) return undefined;
  const normalizedCode = validatePromoCode(code);
  if (!normalizedCode) throw new CheckoutError('Invalid promo code', 400);

  const promo = getPromoCodes().find((item) => item.code.toUpperCase() === normalizedCode);
  if (!promo || (promo.expiresAt && Date.now() > new Date(promo.expiresAt).getTime())) {
    throw new CheckoutError('Invalid or expired promo code', 400);
  }
  if (!Number.isFinite(promo.discount) || promo.discount < 0 || promo.discount > 100) {
    throw new CheckoutError('Invalid promo code', 400);
  }
  return promo;
};

const buildCheckout = (input: CheckoutInput) => {
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
    throw new CheckoutError('Invalid checkout details', 400);
  }

  const products = getProducts();
  const cart: CartItem[] = [];
  const orderLines: OrderLine[] = [];

  for (const line of input.items) {
    if (!line || typeof line.productId !== 'string' || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
      throw new CheckoutError('Invalid checkout details', 400);
    }

    const product = products.find((item) => item.id === line.productId);
    if (!product) throw new CheckoutError('Product unavailable', 400);
    if (product.size.length && (line.size === null || !product.size.includes(line.size))) {
      throw new CheckoutError('Invalid product option', 400);
    }
    if (product.shade.length && (typeof line.color !== 'string' || !product.shade.includes(line.color))) {
      throw new CheckoutError('Invalid product option', 400);
    }

    const price = getProductPrice(product, line.size as CartItem['size'], line.color);
    if (!Number.isFinite(price) || price < 0) throw new CheckoutError('Product unavailable', 400);

    cart.push({ quantity: line.quantity, item: product, color: line.color, size: line.size as CartItem['size'] });
    orderLines.push({ name: product.name.fr, quantity: line.quantity, price });
  }

  const address = normalizeAddress(input.address);
  const subtotal = Math.round(orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;
  const promo = findPromo(input.promoCode);
  const discount = promo ? Math.round(subtotal * promo.discount) / 100 : 0;
  const shipping = subtotal >= 150 ? 0 : getShippingPrice(cart, address.country);
  const total = Math.round((subtotal - discount + shipping) * 100) / 100;
  if (total <= 0) throw new CheckoutError('Invalid checkout total', 400);

  return { address, orderLines, subtotal, discount, shipping, total };
};

const cleanupPendingCheckouts = () => {
  const now = Date.now();
  for (const [id, checkout] of pendingCheckouts) {
    if (checkout.expiresAt <= now) pendingCheckouts.delete(id);
  }
};

export const createPayPalOrder = async (input: CheckoutInput) => {
  cleanupPendingCheckouts();
  if (pendingCheckouts.size >= MAX_PENDING_CHECKOUTS) {
    throw new CheckoutError('Checkout temporarily unavailable', 503);
  }

  const checkout = buildCheckout(input);
  const items = checkout.orderLines.map((line) => ({
    name: line.name.slice(0, 127),
    quantity: String(line.quantity),
    category: 'PHYSICAL_GOODS',
    unit_amount: { currency_code: 'CAD', value: money(line.price) },
  }));
  const amountBreakdown: Record<string, { currency_code: string; value: string }> = {
    item_total: { currency_code: 'CAD', value: money(checkout.subtotal) },
    shipping: { currency_code: 'CAD', value: money(checkout.shipping) },
  };
  if (checkout.discount > 0) {
    amountBreakdown.discount = { currency_code: 'CAD', value: money(checkout.discount) };
  }

  const result = await paypalRequest<PayPalOrderResult>('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'CAD',
          value: money(checkout.total),
          breakdown: amountBreakdown,
        },
        items,
        shipping: {
          name: { full_name: 'Crochyll customer' },
          address: {
            address_line_1: checkout.address.address1,
            address_line_2: checkout.address.address2,
            admin_area_2: checkout.address.city,
            admin_area_1: checkout.address.state,
            postal_code: checkout.address.postalCode,
            country_code: checkout.address.country,
          },
        },
      }],
      application_context: { shipping_preference: 'SET_PROVIDED_ADDRESS', user_action: 'PAY_NOW' },
    }),
  });

  if (!result.id) throw new CheckoutError('Unable to create PayPal order', 502);
  pendingCheckouts.set(result.id, {
    expiresAt: Date.now() + CHECKOUT_TTL_MS,
    amount: money(checkout.total),
    orderLines: checkout.orderLines,
    total: checkout.total,
    shippingAddress: [checkout.address.address1, checkout.address.address2, checkout.address.city, checkout.address.state, checkout.address.postalCode, checkout.address.country].filter(Boolean).join(', '),
    captured: false,
  });

  return { orderId: result.id, total: money(checkout.total) };
};

export const capturePayPalOrder = async (orderId: unknown) => {
  if (typeof orderId !== 'string' || !/^[A-Z0-9-]{10,64}$/i.test(orderId)) {
    throw new CheckoutError('Invalid order', 400);
  }

  cleanupPendingCheckouts();
  const pending = pendingCheckouts.get(orderId);
  if (!pending) throw new CheckoutError('Order not found or expired', 404);
  if (pending.captured) return { success: true, emailSent: pending.emailSent ?? false };
  if (pending.capturePromise) return pending.capturePromise;

  pending.capturePromise = (async () => {
    const result = await paypalRequest<PayPalOrderResult>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${orderId}` },
      body: '{}',
    });
    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    if (result.status !== 'COMPLETED' || capture?.status !== 'COMPLETED' || capture.amount?.currency_code !== 'CAD' || capture.amount.value !== pending.amount) {
      throw new CheckoutError('Payment could not be verified', 402);
    }

    pending.captured = true;
    const payerEmail = validateEmail(result.payer?.email_address);
    if (payerEmail) {
      const emailResult = await mailerService.sendOrderConfirmation(payerEmail, {
        orderId,
        customerName: 'Client Crochyll',
        items: pending.orderLines,
        total: pending.total,
        shippingAddress: pending.shippingAddress,
      });
      pending.emailSent = emailResult.success;
    }

    return { success: true, emailSent: pending.emailSent ?? false };
  })();

  try {
    return await pending.capturePromise;
  } finally {
    pending.capturePromise = undefined;
  }
};