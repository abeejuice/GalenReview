import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await signIn(email);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <i className="fas fa-microscope text-primary text-3xl mr-2"></i>
            <CardTitle className="text-2xl">GalenAI Reviewer</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Sign in to access the review dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email.trim()}
              data-testid="button-signin"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription data-testid="error-message">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Development mode - any email will work
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
