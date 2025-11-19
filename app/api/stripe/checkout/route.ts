import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    let priceId: string | undefined

    switch (plan) {
      case 'PRO':
        priceId = process.env.STRIPE_PRICE_PRO_MONTHLY
        break
      case 'BUSINESS':
        priceId = process.env.STRIPE_PRICE_BUSINESS_MONTHLY
        break
      default:
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      )
    }

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      priceId,
      `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.NEXTAUTH_URL}/pricing`
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
