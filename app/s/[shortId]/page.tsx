'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Lock, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ShortUrlRedirect() {
  const params = useParams()
  const router = useRouter()
  const shortId = params.shortId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!passwordRequired) {
      redirectToDestination()
    }
  }, [shortId, passwordRequired])

  async function redirectToDestination(attemptPassword?: string) {
    try {
      const response = await fetch('/api/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortId,
          password: attemptPassword,
          metadata: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer,
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.redirectUrl) {
        // Track the scan and redirect
        window.location.href = data.redirectUrl
      } else if (data.passwordRequired) {
        setPasswordRequired(true)
        setLoading(false)
      } else if (data.error) {
        setError(data.error)
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to load QR code destination')
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    await redirectToDestination(password)
    setVerifying(false)
  }

  if (loading && !passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center">Password Protected</CardTitle>
            <CardDescription className="text-center">
              This QR code requires a password to access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={verifying}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={verifying || !password}>
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    const errorMessages: Record<string, { icon: any; title: string; description: string }> = {
      expired: {
        icon: Clock,
        title: 'QR Code Expired',
        description: 'This QR code has expired and is no longer valid.',
      },
      max_scans_reached: {
        icon: AlertCircle,
        title: 'Scan Limit Reached',
        description: 'This QR code has reached its maximum number of scans.',
      },
      inactive: {
        icon: AlertCircle,
        title: 'QR Code Inactive',
        description: 'This QR code has been deactivated.',
      },
      not_found: {
        icon: AlertCircle,
        title: 'Not Found',
        description: 'This QR code could not be found.',
      },
      invalid_password: {
        icon: Lock,
        title: 'Invalid Password',
        description: 'The password you entered is incorrect.',
      },
    }

    const errorInfo = errorMessages[error] || errorMessages.not_found
    const Icon = errorInfo.icon

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Icon className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">{errorInfo.title}</CardTitle>
            <CardDescription className="text-center">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
