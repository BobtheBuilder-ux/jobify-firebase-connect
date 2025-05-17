
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { db, storage, auth } from '@/firebase/config';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserRound, Mail, Briefcase, MapPin, Bell, Shield, LogOut } from 'lucide-react';

const Settings = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.photoURL || null);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    title: userData?.profile?.title || '',
    location: userData?.profile?.location || '',
    bio: userData?.profile?.bio || '',
    skills: userData?.profile?.skills || [],
    websiteUrl: userData?.profile?.websiteUrl || '',
    linkedinUrl: userData?.profile?.linkedinUrl || '',
    githubUrl: userData?.profile?.githubUrl || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    jobAlerts: userData?.profile?.notifications?.jobAlerts || true,
    applicationUpdates: userData?.profile?.notifications?.applicationUpdates || true,
    marketingEmails: userData?.profile?.notifications?.marketingEmails || false,
  });

  // Company profile (for employers)
  const [company, setCompany] = useState({
    companyName: userData?.profile?.companyName || '',
    industry: userData?.profile?.industry || '',
    companySize: userData?.profile?.companySize || '',
    companyDescription: userData?.profile?.companyDescription || '',
    companyWebsite: userData?.profile?.companyWebsite || '',
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: userData?.profile?.security?.twoFactorAuth || false,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (value: boolean, name: string) => {
    setNotifications(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (value: boolean, name: string) => {
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Upload avatar if changed
      let photoURL = currentUser.photoURL;
      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
        
        // Update user profile in Firebase Auth
        await updateProfile(currentUser, { photoURL });
      }
      
      // Update user document in Firestore
      const userUpdate: any = {
        displayName: profile.displayName,
        profile: {
          ...userData?.profile,
          title: profile.title,
          location: profile.location,
          bio: profile.bio,
          skills: profile.skills,
          websiteUrl: profile.websiteUrl,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          photoURL,
          notifications,
          security,
        }
      };
      
      // Add company data for employers
      if (userData?.role === 'employer') {
        userUpdate.profile = {
          ...userUpdate.profile,
          companyName: company.companyName,
          industry: company.industry,
          companySize: company.companySize,
          companyDescription: company.companyDescription,
          companyWebsite: company.companyWebsite,
        };
      }
      
      await updateDoc(userDocRef, userUpdate);
      
      toast({
        title: "Success",
        description: "Your settings have been updated",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUser || !userData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
            <p className="mb-4">You need to be signed in to access settings</p>
            <Button onClick={() => navigate('/auth?mode=login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>
          <Badge variant={userData.role === 'employer' ? "default" : "secondary"}>
            {userData.role === 'employer' ? 'Employer' : 'Job Seeker'}
          </Badge>
        </div>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            
            {userData.role === 'employer' && (
              <TabsTrigger value="company">Company</TabsTrigger>
            )}
            
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={avatarPreview || undefined} alt={profile.displayName} />
                        <AvatarFallback>
                          {profile.displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary">
                        Change photo
                      </Label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label htmlFor="displayName">Full Name</Label>
                        <div className="flex items-center">
                          <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="displayName"
                            name="displayName"
                            value={profile.displayName}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="email"
                            value={currentUser.email || ''}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Professional Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title</Label>
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="title"
                          name="title"
                          placeholder="e.g., Senior Developer"
                          value={profile.title}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location"
                          name="location"
                          placeholder="e.g., New York, NY"
                          value={profile.location}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        placeholder="Tell us about yourself"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        rows={4}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Online Profiles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Online Profiles</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Personal Website</Label>
                      <Input 
                        id="websiteUrl"
                        name="websiteUrl"
                        placeholder="https://yourwebsite.com"
                        value={profile.websiteUrl}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input 
                        id="linkedinUrl"
                        name="linkedinUrl"
                        placeholder="https://linkedin.com/in/username"
                        value={profile.linkedinUrl}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">GitHub Profile</Label>
                      <Input 
                        id="githubUrl"
                        name="githubUrl"
                        placeholder="https://github.com/username"
                        value={profile.githubUrl}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Company Tab (For employers) */}
          {userData.role === 'employer' && (
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Tell job seekers about your company
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName"
                        name="companyName"
                        value={company.companyName}
                        onChange={handleCompanyChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input 
                        id="industry"
                        name="industry"
                        placeholder="e.g., Technology, Healthcare"
                        value={company.industry}
                        onChange={handleCompanyChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Input 
                        id="companySize"
                        name="companySize"
                        placeholder="e.g., 1-10, 11-50, 51-200"
                        value={company.companySize}
                        onChange={handleCompanyChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">Company Description</Label>
                      <Textarea 
                        id="companyDescription"
                        name="companyDescription"
                        placeholder="Tell potential candidates about your company"
                        value={company.companyDescription}
                        onChange={handleCompanyChange}
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <Input 
                        id="companyWebsite"
                        name="companyWebsite"
                        placeholder="https://company.com"
                        value={company.companyWebsite}
                        onChange={handleCompanyChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Company Profile'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="jobAlerts" className="text-base">Job Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about new job opportunities
                          </p>
                        </div>
                      </div>
                      <Switch 
                        id="jobAlerts"
                        checked={notifications.jobAlerts}
                        onCheckedChange={(checked) => handleNotificationChange(checked, 'jobAlerts')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="applicationUpdates" className="text-base">Application Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about your job applications
                          </p>
                        </div>
                      </div>
                      <Switch 
                        id="applicationUpdates"
                        checked={notifications.applicationUpdates}
                        onCheckedChange={(checked) => handleNotificationChange(checked, 'applicationUpdates')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="marketingEmails" className="text-base">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about tips, news and special offers
                          </p>
                        </div>
                      </div>
                      <Switch 
                        id="marketingEmails"
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange(checked, 'marketingEmails')}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="twoFactorAuth" className="text-base">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Switch 
                        id="twoFactorAuth"
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) => handleSecurityChange(checked, 'twoFactorAuth')}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <Button variant="outline" type="button">
                      Change Password
                    </Button>
                  </div>

                  <Separator />

                  {/* Account Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Management</h3>
                    
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      type="button"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
