import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Separator } from '@/components/ui/separator';
import { Mail, Key, LogIn } from 'lucide-react';
const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [activeTab, setActiveTab] = useState(mode === 'login' ? 'login' : 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'jobSeeker' | 'employer'>('jobSeeker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const navigate = useNavigate();
  const {
    signUp,
    signIn,
    signInWithGoogle,
    currentUser,
    sendEmailLink,
    signInWithEmail
  } = useAuth();

  // Check if coming from email link
  useEffect(() => {
    const emailFromStorage = localStorage.getItem('emailForSignIn');
    if (emailFromStorage && window.location.href.includes('?mode=login')) {
      setEmail(emailFromStorage);
      handleEmailLinkSignIn(emailFromStorage);
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Update tab when URL param changes
  useEffect(() => {
    setActiveTab(mode === 'login' ? 'login' : 'register');
  }, [mode]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "You have been logged in"
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to login. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName, role);
      toast({
        title: "Success",
        description: "Account created successfully"
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await sendEmailLink(email, activeTab === 'login' ? 'jobSeeker' : role);
      setEmailLinkSent(true);
      toast({
        title: "Success",
        description: "We've sent a sign-in link to your email"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send login email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEmailLinkSignIn = async (emailAddress: string) => {
    const success = await signInWithEmail(emailAddress);
    if (success) {
      toast({
        title: "Success",
        description: "You have been signed in successfully"
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: "Invalid or expired sign-in link. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      // For login, we don't need to specify role
      if (activeTab === 'login') {
        await signInWithGoogle();
      } else {
        // For register, we need the role
        await signInWithGoogle(role);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Google sign-in failed. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <MainLayout>
      <div className="flex items-center justify-center py-12 animate-fade-in">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' ? 'Enter your credentials to access your account' : 'Fill in the form below to create your account'}
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              {!emailLinkSent ? <>
                  {/* Password Login Form */}
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Button variant="link" className="p-0 h-auto text-xs">
                            Forgot password?
                          </Button>
                        </div>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-7">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <LogIn className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Logging in...' : 'Login with Password'}
                      </Button>
                      
                      <Separator>
                        <span className="mx-2 text-xs text-muted-foreground">OR</span>
                      </Separator>
                      
                      {/* Passwordless Login */}
                      <Button type="button" variant="outline" className="w-full" onClick={handleEmailLink} disabled={isSubmitting}>
                        <Mail className="mr-2 h-4 w-4" />
                        Login with Email Link
                      </Button>
                      
                      <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                      </Button>
                    </CardFooter>
                  </form>
                </> : <CardContent className="pt-4 text-center">
                  <div className="mb-4">
                    <div className="bg-green-50 p-4 rounded-md mb-4">
                      <p className="text-green-800">A login link has been sent to {email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please check your email and click the link to sign in.
                    </p>
                  </div>
                  <Button type="button" variant="outline" className="mt-2" onClick={() => setEmailLinkSent(false)}>
                    Back to login
                  </Button>
                </CardContent>}
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              {!emailLinkSent ? <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input id="displayName" placeholder="John Doe" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <Input id="registerEmail" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Password</Label>
                      <Input id="registerPassword" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <RadioGroup defaultValue="jobSeeker" value={role} onValueChange={value => setRole(value as 'jobSeeker' | 'employer')} className="flex">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="jobSeeker" id="jobSeeker" />
                          <Label htmlFor="jobSeeker">Job Seeker</Label>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <RadioGroupItem value="employer" id="employer" />
                          <Label htmlFor="employer">Employer</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Key className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Creating account...' : 'Create account with Password'}
                    </Button>
                    
                    <Separator>
                      <span className="mx-2 text-xs text-muted-foreground">OR</span>
                    </Separator>
                    
                    {/* Passwordless Registration */}
                    <Button type="button" variant="outline" className="w-full" onClick={handleEmailLink} disabled={isSubmitting}>
                      <Mail className="mr-2 h-4 w-4" />
                      Register with Email Link
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Continue with Google
                    </Button>
                  </CardFooter>
                </form> : <CardContent className="pt-4 text-center">
                  <div className="mb-4">
                    <div className="bg-green-50 p-4 rounded-md mb-4">
                      <p className="text-green-800">A registration link has been sent to {email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please check your email and click the link to complete your registration.
                    </p>
                  </div>
                  <Button type="button" variant="outline" className="mt-2" onClick={() => setEmailLinkSent(false)}>
                    Back to register
                  </Button>
                </CardContent>}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>;
};
export default Auth;