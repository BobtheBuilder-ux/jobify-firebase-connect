
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

interface Application {
  id: string;
  userId: string;
  jobId: string;
  userName: string;
  userEmail: string;
  resumeUrl?: string;
  coverLetter?: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const JobApplications = () => {
  const { jobId } = useParams();
  const { currentUser, isEmployer } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !jobId) return;

      try {
        // Fetch job details
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        
        if (!jobDoc.exists() || jobDoc.data().postedBy !== currentUser.uid) {
          toast({
            title: "Error",
            description: "Job not found or you don't have permission to view these applications",
            variant: "destructive",
          });
          return;
        }
        
        setJob({ id: jobDoc.id, ...jobDoc.data() });

        // Fetch applications for this job
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId)
        );

        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate() || new Date()
        })) as Application[];

        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to load application data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // For now, set sample data
    setJob({
      id: jobId,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      createdAt: new Date('2025-05-05'),
      deadline: new Date('2025-06-05'),
      status: 'active'
    });

    setApplications([
      {
        id: '1',
        userId: 'user1',
        jobId: jobId || '',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        resumeUrl: 'https://example.com/resume.pdf',
        submittedAt: new Date('2025-05-10'),
        status: 'pending'
      },
      {
        id: '2',
        userId: 'user2',
        jobId: jobId || '',
        userName: 'Emma Johnson',
        userEmail: 'emma@example.com',
        resumeUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am excited to apply for this role...',
        submittedAt: new Date('2025-05-11'),
        status: 'reviewed'
      },
      {
        id: '3',
        userId: 'user3',
        jobId: jobId || '',
        userName: 'Michael Brown',
        userEmail: 'michael@example.com',
        resumeUrl: 'https://example.com/resume.pdf',
        submittedAt: new Date('2025-05-12'),
        status: 'accepted'
      }
    ]);
    
    setLoading(false);
    
    // Comment out fetchData call for now, since we're using sample data
    // fetchData();
  }, [currentUser, jobId]);

  // Redirect if not authenticated or not an employer
  if (!currentUser || !isEmployer) {
    return <Navigate to="/auth?mode=login" />;
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      // In a real application, update the status in Firestore
      // await updateDoc(doc(db, 'applications', applicationId), {
      //   status: newStatus
      // });

      // For now, update the local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus as any } : app
      ));

      toast({
        title: "Success",
        description: "Application status has been updated",
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Applications</h1>
            <p className="text-gray-500">
              {job?.title} at {job?.company}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">Loading applications...</div>
            ) : applications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.userName}</TableCell>
                      <TableCell>{application.userEmail}</TableCell>
                      <TableCell>{format(application.submittedAt, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            defaultValue={application.status}
                            onValueChange={(value) => handleStatusChange(application.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">No applications found for this job.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobApplications;
