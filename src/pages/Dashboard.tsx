
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  createdAt: Date;
  deadline: Date;
  status: 'active' | 'closed';
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const Dashboard = () => {
  const { currentUser, userData, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        if (isEmployer) {
          // Fetch jobs posted by the employer
          const jobsQuery = query(
            collection(db, 'jobs'),
            where('postedBy', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );

          const jobsSnapshot = await getDocs(jobsQuery);
          const jobsData = jobsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            deadline: doc.data().deadline?.toDate() || new Date()
          })) as Job[];

          setJobs(jobsData);
        } else {
          // Fetch applications submitted by the job seeker
          const applicationsQuery = query(
            collection(db, 'applications'),
            where('userId', '==', currentUser.uid),
            orderBy('submittedAt', 'desc')
          );

          const applicationsSnapshot = await getDocs(applicationsQuery);
          const applicationsData = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate() || new Date()
          })) as Application[];

          setApplications(applicationsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // For now, set sample data
    if (isEmployer) {
      // Sample jobs for employer
      setJobs([
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          location: 'Remote',
          createdAt: new Date('2025-05-05'),
          deadline: new Date('2025-06-05'),
          status: 'active'
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'TechCorp',
          location: 'New York, NY',
          createdAt: new Date('2025-05-01'),
          deadline: new Date('2025-05-30'),
          status: 'active'
        },
        {
          id: '3',
          title: 'UI/UX Designer',
          company: 'TechCorp',
          location: 'Remote',
          createdAt: new Date('2025-04-15'),
          deadline: new Date('2025-05-15'),
          status: 'closed'
        }
      ]);
    } else {
      // Sample applications for job seeker
      setApplications([
        {
          id: '1',
          jobId: '1',
          jobTitle: 'Senior Frontend Developer',
          company: 'TechCorp',
          submittedAt: new Date('2025-05-10'),
          status: 'pending'
        },
        {
          id: '2',
          jobId: '4',
          jobTitle: 'React Native Developer',
          company: 'MobileApps',
          submittedAt: new Date('2025-05-08'),
          status: 'reviewed'
        },
        {
          id: '3',
          jobId: '7',
          jobTitle: 'Product Manager',
          company: 'InnovateCo',
          submittedAt: new Date('2025-05-01'),
          status: 'accepted'
        },
        {
          id: '4',
          jobId: '8',
          jobTitle: 'Data Scientist',
          company: 'AnalyticsPro',
          submittedAt: new Date('2025-04-25'),
          status: 'rejected'
        }
      ]);
    }
    
    setLoading(false);

    // Comment out fetchData call for now, since we're using sample data
    // fetchData();
  }, [currentUser, isEmployer]);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth?mode=login" />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Closed</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Dashboard header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {userData?.displayName || currentUser.displayName}
          </p>
        </div>

        <Separator />

        {/* Dashboard content */}
        {isEmployer ? (
          /* Employer Dashboard */
          <div className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {jobs.filter(job => job.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    New Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3</div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs Management */}
            <Tabs defaultValue="active">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="active">Active Jobs</TabsTrigger>
                  <TabsTrigger value="closed">Closed Jobs</TabsTrigger>
                </TabsList>
                <Button>Post New Job</Button>
              </div>

              <TabsContent value="active" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-4">Loading...</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobs
                            .filter(job => job.status === 'active')
                            .map(job => (
                              <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell>{format(job.createdAt, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(job.deadline, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{getStatusBadge(job.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Button variant="outline" size="sm">View</Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          {jobs.filter(job => job.status === 'active').length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                No active jobs found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="closed" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-4">Loading...</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead>Expired</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobs
                            .filter(job => job.status === 'closed')
                            .map(job => (
                              <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell>{format(job.createdAt, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(job.deadline, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{getStatusBadge(job.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Repost</Button>
                                    <Button variant="outline" size="sm">View</Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          {jobs.filter(job => job.status === 'closed').length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                No closed jobs found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Job Seeker Dashboard */
          <div className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {applications.filter(app => app.status === 'reviewed').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {applications.filter(app => app.status === 'accepted').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications */}
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.length > 0 ? (
                        applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">{application.jobTitle}</TableCell>
                            <TableCell>{application.company}</TableCell>
                            <TableCell>{format(application.submittedAt, 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{getStatusBadge(application.status)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            You haven't applied to any jobs yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Based on your profile and application history, we'll show you personalized job recommendations.
                </p>
                <Button className="mt-4" variant="outline">Complete Your Profile</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
