import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateQRCode } from '@/lib/qrcode-generator'
import { createShortUrl } from '@/lib/url-shortener'

// Shopify integration for generating product QR codes

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products, storeUrl, trackingEnabled } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Products array required' }, { status: 400 })
    }

    if (!storeUrl) {
      return NextResponse.json({ error: 'Store URL required' }, { status: 400 })
    }

    const results = []

    for (const product of products) {
      const { id, title, handle, variantId } = product

      // Construct product URL
      const productUrl = variantId
        ? `${storeUrl}/products/${handle}?variant=${variantId}`
        : `${storeUrl}/products/${handle}`

      let finalUrl = productUrl
      let qrCodeRecord

      // If tracking is enabled, create dynamic QR code
      if (trackingEnabled) {
        qrCodeRecord = await createShortUrl({
          userId: session.user.id,
          originalUrl: productUrl,
          qrType: 'URL',
          metadata: {
            platform: 'shopify',
            productId: id,
            productTitle: title,
            variantId,
          },
        })
        finalUrl = qrCodeRecord.dynamicUrl!
      }

      // Generate QR code image
      const qrImage = await generateQRCode({
        content: finalUrl,
        size: 500, // Larger for product labels
        errorCorrectionLevel: 'H', // High for potential damage
      })

      results.push({
        productId: id,
        productTitle: title,
        productHandle: handle,
        variantId,
        productUrl,
        shortUrl: trackingEnabled ? finalUrl : undefined,
        qrCode: qrImage.dataUrl,
        qrCodeId: qrCodeRecord?.id,
      })
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      products: results,
    })
  } catch (error) {
    console.error('Shopify integration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// WooCommerce integration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products, storeUrl, trackingEnabled, consumerKey, consumerSecret } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Products array required' }, { status: 400 })
    }

    if (!storeUrl) {
      return NextResponse.json({ error: 'Store URL required' }, { status: 400 })
    }

    const results = []

    for (const product of products) {
      const { id, name, slug, permalink } = product

      let finalUrl = permalink
      let qrCodeRecord

      if (trackingEnabled) {
        qrCodeRecord = await createShortUrl({
          userId: session.user.id,
          originalUrl: permalink,
          qrType: 'URL',
          metadata: {
            platform: 'woocommerce',
            productId: id,
            productName: name,
          },
        })
        finalUrl = qrCodeRecord.dynamicUrl!
      }

      const qrImage = await generateQRCode({
        content: finalUrl,
        size: 500,
        errorCorrectionLevel: 'H',
      })

      results.push({
        productId: id,
        productName: name,
        productSlug: slug,
        productUrl: permalink,
        shortUrl: trackingEnabled ? finalUrl : undefined,
        qrCode: qrImage.dataUrl,
        qrCodeId: qrCodeRecord?.id,
      })
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      products: results,
    })
  } catch (error) {
    console.error('WooCommerce integration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
