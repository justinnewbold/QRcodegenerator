import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      '100 QR codes per month',
      'Basic customization',
      'PNG/SVG export',
      '1 workspace',
      'Community support',
    ],
    limits: {
      qrCodes: 100,
      scans: 1000,
      workspaces: 1,
      apiCalls: 0,
      dynamicQR: 0,
    },
  },
  PRO: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    features: [
      'Unlimited QR codes',
      'Advanced customization',
      'All export formats',
      'Dynamic QR codes',
      'Analytics dashboard',
      '5 workspaces',
      'Priority support',
      'Remove watermark',
    ],
    limits: {
      qrCodes: -1, // Unlimited
      scans: 50000,
      workspaces: 5,
      apiCalls: 10000,
      dynamicQR: 100,
    },
  },
  BUSINESS: {
    name: 'Business',
    price: 49,
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    features: [
      'Everything in Pro',
      'Unlimited dynamic QR codes',
      'Team collaboration',
      'White-label options',
      'API access',
      'Custom domains',
      'Unlimited workspaces',
      'Premium support',
      'Advanced analytics',
    ],
    limits: {
      qrCodes: -1,
      scans: -1,
      workspaces: -1,
      apiCalls: 100000,
      dynamicQR: -1,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null, // Custom pricing
    features: [
      'Everything in Business',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment',
      'Custom development',
      'Enterprise SSO',
    ],
    limits: {
      qrCodes: -1,
      scans: -1,
      workspaces: -1,
      apiCalls: -1,
      dynamicQR: -1,
    },
  },
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: undefined, // Will be filled from user
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}
