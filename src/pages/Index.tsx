
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase/config';
import JobCard from '@/components/ui/JobCard';
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
  createdAt: Date;
  deadline: Date;
}

const Index = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    currentUser
  } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Featured jobs query (example criteria: salary above 80k)
        const featuredQuery = query(collection(db, 'jobs'), where('status', '==', 'active'), where('salary.min', '>=', 80000), orderBy('salary.min', 'desc'), limit(3));

        // Recent jobs query
        const recentQuery = query(collection(db, 'jobs'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(6));
        const [featuredSnapshot, recentSnapshot] = await Promise.all([getDocs(featuredQuery), getDocs(recentQuery)]);

        // Process featured jobs
        const featuredJobsData: Job[] = featuredSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || new Date()
          } as Job;
        });

        // Process recent jobs
        const recentJobsData: Job[] = recentSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || new Date()
          } as Job;
        });
        setFeaturedJobs(featuredJobsData);
        setRecentJobs(recentJobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job listings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // For now, set sample data
    setFeaturedJobs([{
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'remote',
      salary: {
        min: 95000,
        max: 125000,
        currency: '$'
      },
      createdAt: new Date('2025-05-05'),
      deadline: new Date('2025-06-05')
    }, {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'WebSolutions',
      location: 'New York, NY',
      type: 'hybrid',
      salary: {
        min: 105000,
        max: 140000,
        currency: '$'
      },
      createdAt: new Date('2025-05-10'),
      deadline: new Date('2025-06-10')
    }, {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'San Francisco, CA',
      type: 'onsite',
      salary: {
        min: 120000,
        max: 160000,
        currency: '$'
      },
      createdAt: new Date('2025-05-12'),
      deadline: new Date('2025-06-15')
    }]);
    setRecentJobs([{
      id: '4',
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      location: 'Remote',
      type: 'remote',
      salary: {
        min: 85000,
        max: 110000,
        currency: '$'
      },
      createdAt: new Date('2025-05-15'),
      deadline: new Date('2025-06-20')
    }, {
      id: '5',
      title: 'React Native Developer',
      company: 'MobileApps',
      location: 'Austin, TX',
      type: 'hybrid',
      salary: {
        min: 90000,
        max: 120000,
        currency: '$'
      },
      createdAt: new Date('2025-05-16'),
      deadline: new Date('2025-06-16')
    }, {
      id: '6',
      title: 'Backend Engineer',
      company: 'DataStream',
      location: 'Chicago, IL',
      type: 'onsite',
      salary: {
        min: 100000,
        max: 135000,
        currency: '$'
      },
      createdAt: new Date('2025-05-17'),
      deadline: new Date('2025-06-17')
    }]);
    setLoading(false);

    // Comment out fetchJobs call for now, since we're using sample data
    // fetchJobs();
  }, []);

  // Function to navigate to jobs page with category filter
  const handleCategoryClick = (category: string) => {
    navigate(`/jobs?category=${category}`);
  };

  return <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-job-blue to-job-teal text-white rounded-lg shadow-xl mb-8 py-12 px-6 md:px-12 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Dream Job Today
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-job-blue hover:bg-gray-100" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
            {!currentUser && <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/auth?mode=register" className="text-white bg-transparent">Create Account</Link>
              </Button>}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="mb-12 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Jobs</h2>
          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link to="/jobs">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map(job => <JobCard key={job.id} {...job} />)}
          </div>}
      </section>

      {/* Recent Jobs Section */}
      <section className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Recent Jobs</h2>

        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentJobs.map(job => <JobCard key={job.id} {...job} />)}
          </div>}
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 -mx-6 px-6 py-12 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Technology', 'Marketing', 'Design', 'Finance', 
              'Healthcare', 'Engineering', 'Sales', 'Education'
            ].map(category => (
              <div 
                key={category} 
                className="bg-white p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <p className="font-medium">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>;
};

export default Index;
