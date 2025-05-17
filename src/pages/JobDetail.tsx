
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Briefcase, Building, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  createdAt: Date;
  deadline: Date;
  postedBy: string;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, 'jobs', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setJob({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || new Date()
          } as Job);
        } else {
          console.log('No such document!');
          toast({
            title: 'Error',
            description: 'Job not found',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // For now, set sample data based on the ID
    const sampleJob: Job = {
      id: id || '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'remote',
      salary: {
        min: 95000,
        max: 125000,
        currency: '$'
      },
      description: `
        <p>We're looking for a Senior Frontend Developer to join our team and help build innovative web applications.</p>
        
        <p>As a Senior Frontend Developer, you will work closely with our product and design teams to build responsive and performant user interfaces. You'll be responsible for implementing new features, improving existing ones, and ensuring the overall quality of our frontend codebase.</p>
        
        <p>This is a remote position with flexible working hours. We offer competitive compensation, benefits, and opportunities for professional growth.</p>
      `,
      requirements: [
        'At least 5 years of experience in frontend development',
        'Proficiency in React.js and TypeScript',
        'Experience with modern frontend tooling (Webpack, Vite, etc.)',
        'Strong understanding of HTML, CSS, and JavaScript',
        'Experience with responsive design and cross-browser compatibility',
        'Good understanding of web performance optimization techniques',
        'Familiarity with REST APIs and GraphQL',
        'Experience with state management libraries (Redux, Mobx, etc.)',
      ],
      createdAt: new Date('2025-05-05'),
      deadline: new Date('2025-06-05'),
      postedBy: 'user123',
    };

    setJob(sampleJob);
    setLoading(false);

    // Comment out fetchJobDetails call for now, since we're using sample data
    // fetchJobDetails();
  }, [id]);

  // Format salary display
  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };

  // Decide job type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'remote':
        return 'bg-job-lightteal text-job-teal';
      case 'hybrid':
        return 'bg-blue-100 text-blue-700';
      case 'onsite':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse space-y-4 w-full max-w-4xl">
            <div className="h-12 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isJobExpired = new Date() > job.deadline;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Job Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center text-gray-600 gap-3">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
              </div>
              <Badge className={getTypeColor(job.type)} variant="outline">
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <Button 
              size="lg" 
              disabled={isJobExpired || !currentUser}
              asChild={!isJobExpired && !!currentUser}
            >
              {!currentUser ? (
                <span>Login to Apply</span>
              ) : isJobExpired ? (
                <span>Application Closed</span>
              ) : (
                <Link to={`/job/${job.id}/apply`}>Apply Now</Link>
              )}
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-500 mb-1">Salary</p>
              <p className="text-xl font-semibold text-job-blue">
                {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                <span className="text-base font-normal text-gray-500"> / year</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Posted on</p>
                  <p>{format(job.createdAt, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Apply before</p>
                  <p className={isJobExpired ? 'text-red-500' : ''}>
                    {format(job.deadline, 'MMM dd, yyyy')}
                    {isJobExpired && ' (Expired)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>
              <div dangerouslySetInnerHTML={{ __html: job.description }} className="text-gray-700 space-y-3" />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            size="lg" 
            disabled={isJobExpired || !currentUser}
            className="flex-1"
            asChild={!isJobExpired && !!currentUser}
          >
            {!currentUser ? (
              <span>Login to Apply</span>
            ) : isJobExpired ? (
              <span>Application Closed</span>
            ) : (
              <Link to={`/job/${job.id}/apply`}>Apply Now</Link>
            )}
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            Save Job
          </Button>
        </div>

        {/* Similar Jobs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Similar Jobs</h2>
          <p className="text-gray-500">
            More jobs coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
