import React, { useState } from 'react'
import authStore from '@/store/authStore'
import api from '@/lib/axios'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface LoginPageProps {
  onNavigateToRegister: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { setAuth } = authStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      setAuth(response.data.token, response.data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px] shadow-lg border border-border bg-card">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Sign in to check your metrics and start forging quizzes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error</AlertTitle>
            <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-11 bg-muted/30 border-border focus-visible:ring-primary focus-visible:border-primary text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-11 bg-muted/30 border-border focus-visible:ring-primary focus-visible:border-primary text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold tracking-wide shadow-md transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground pb-6 border-t border-border pt-4">
        <div>
          Don't have an account?{' '}
          <a
            href="#"
            className="text-primary font-semibold hover:underline transition-colors duration-150"
            onClick={(e) => {
              e.preventDefault()
              onNavigateToRegister()
            }}
          >
            Sign up now
          </a>
        </div>
      </CardFooter>
    </Card>
  )
}

export default LoginPage
