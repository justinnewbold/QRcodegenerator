// Print-on-Demand integration using Printful API

interface PrintfulProduct {
  variantId: number
  name: string
  price: string
}

interface PrintOrder {
  recipient: {
    name: string
    address1: string
    city: string
    stateCode: string
    countryCode: string
    zip: string
  }
  items: Array<{
    variantId: number
    quantity: number
    files: Array<{
      url: string
    }>
  }>
}

export class PrintOnDemandService {
  private apiKey: string
  private baseUrl = 'https://api.printful.com'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PRINTFUL_API_KEY || ''
  }

  async getProducts(): Promise<PrintfulProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Printful products error:', error)
      throw error
    }
  }

  async createOrder(order: PrintOrder): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Printful order error:', error)
      throw error
    }
  }

  async estimateCosts(items: PrintOrder['items']): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/estimate-costs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        throw new Error('Failed to estimate costs')
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Printful estimate error:', error)
      throw error
    }
  }
}

// QR Code print product templates
export const QR_PRINT_PRODUCTS = {
  sticker: {
    variantId: 10270, // Example Printful variant ID for stickers
    name: 'QR Code Sticker (3x3")',
    sizes: ['3x3', '4x4', '6x6'],
    material: 'Vinyl',
  },
  poster: {
    variantId: 1116, // Example variant ID
    name: 'QR Code Poster',
    sizes: ['12x16', '18x24', '24x36'],
    material: 'Premium paper',
  },
  sign: {
    variantId: 10256,
    name: 'QR Code Sign',
    sizes: ['8x10', '11x14', '16x20'],
    material: 'Aluminum',
  },
  tshirt: {
    variantId: 4012,
    name: 'T-Shirt with QR Code',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: '100% Cotton',
  },
}

export async function createQRPrintOrder(
  qrCodeImageUrl: string,
  productType: keyof typeof QR_PRINT_PRODUCTS,
  quantity: number,
  recipient: PrintOrder['recipient']
): Promise<any> {
  const service = new PrintOnDemandService()
  const product = QR_PRINT_PRODUCTS[productType]

  const order: PrintOrder = {
    recipient,
    items: [
      {
        variantId: product.variantId,
        quantity,
        files: [
          {
            url: qrCodeImageUrl,
          },
        ],
      },
    ],
  }

  return await service.createOrder(order)
}
