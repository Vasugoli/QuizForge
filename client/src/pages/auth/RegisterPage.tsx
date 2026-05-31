import React, { useState } from 'react'
import authStore from '@/store/authStore'
import api from '@/lib/axios'
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface RegisterPageProps {
  onNavigateToLogin: () => void
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { setAuth } = authStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      })
      setAuth(response.data.token, response.data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px] shadow-lg border border-border bg-card">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create Account</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Join QuizForge to start creating assessments and scaling your tests.
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
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name *
            </Label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-10 h-11 bg-muted/30 border-border focus-visible:ring-primary focus-visible:border-primary text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address *
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
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
              Password *
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (Min 6 chars)"
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
                Signing Up...
              </span>
            ) : (
              <span>Sign Up</span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground pb-6 border-t border-border pt-4">
        <div>
          Already have an account?{' '}
          <a
            href="#"
            className="text-primary font-semibold hover:underline transition-colors duration-150"
            onClick={(e) => {
              e.preventDefault()
              onNavigateToLogin()
            }}
          >
            Sign in instead
          </a>
        </div>
      </CardFooter>
    </Card>
  )
}

export default RegisterPage
