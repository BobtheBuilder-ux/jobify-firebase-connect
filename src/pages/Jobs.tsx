
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import JobCard from '@/components/ui/JobCard';
import SearchFilters from '@/components/ui/SearchFilters';
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
  category?: string;
}

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialFilters, setInitialFilters] = useState({
    query: '',
    location: '',
    jobType: 'all',
    salaryRange: [0, 200000] as [number, number],
    category: categoryParam || ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let jobQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
        
        // Apply category filter if provided
        if (categoryParam) {
          jobQuery = query(
            collection(db, 'jobs'),
            where('status', '==', 'active'),
            where('category', '==', categoryParam),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(jobQuery);
        const jobsData: Job[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || new Date()
          } as Job;
        });

        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job listings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // For now, set sample data
    const sampleJobs: Job[] = [
      {
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
        category: 'Technology',
        createdAt: new Date('2025-05-05'),
        deadline: new Date('2025-06-05')
      },
      {
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
        category: 'Technology',
        createdAt: new Date('2025-05-10'),
        deadline: new Date('2025-06-10')
      },
      {
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
        category: 'Engineering',
        createdAt: new Date('2025-05-12'),
        deadline: new Date('2025-06-15')
      },
      {
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
        category: 'Design',
        createdAt: new Date('2025-05-15'),
        deadline: new Date('2025-06-20')
      },
      {
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
        category: 'Technology',
        createdAt: new Date('2025-05-16'),
        deadline: new Date('2025-06-16')
      },
      {
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
        category: 'Technology',
        createdAt: new Date('2025-05-17'),
        deadline: new Date('2025-06-17')
      },
      {
        id: '7',
        title: 'Product Manager',
        company: 'InnovateCo',
        location: 'Seattle, WA',
        type: 'hybrid',
        salary: {
          min: 110000,
          max: 150000,
          currency: '$'
        },
        category: 'Marketing',
        createdAt: new Date('2025-05-15'),
        deadline: new Date('2025-06-18')
      },
      {
        id: '8',
        title: 'Data Scientist',
        company: 'AnalyticsPro',
        location: 'Boston, MA',
        type: 'onsite',
        salary: {
          min: 115000,
          max: 155000,
          currency: '$'
        },
        category: 'Technology',
        createdAt: new Date('2025-05-14'),
        deadline: new Date('2025-06-19')
      }
    ];

    setJobs(sampleJobs);
    
    // Filter by category if specified in URL
    if (categoryParam) {
      const filtered = sampleJobs.filter(job => job.category === categoryParam);
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(sampleJobs);
    }
    
    setLoading(false);

    // Comment out fetchJobs call for now, since we're using sample data
    // fetchJobs();
  }, [categoryParam]);

  const handleSearch = (filters: { 
    query: string; 
    location: string; 
    jobType: string; 
    salaryRange: [number, number];
    category?: string;
  }) => {
    const { query, location, jobType, salaryRange, category } = filters;
    
    const filtered = jobs.filter((job) => {
      const matchQuery = !query || 
        job.title.toLowerCase().includes(query.toLowerCase()) || 
        job.company.toLowerCase().includes(query.toLowerCase());
      
      const matchLocation = !location || 
        job.location.toLowerCase().includes(location.toLowerCase());
      
      const matchType = !jobType || jobType === 'all' || job.type === jobType;
      
      const matchSalary = job.salary.min >= salaryRange[0] && 
        job.salary.max <= salaryRange[1];
      
      const matchCategory = !category || category === '' || job.category === category;
      
      return matchQuery && matchLocation && matchType && matchSalary && matchCategory;
    });
    
    setFilteredJobs(filtered);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find Your Next Career Opportunity</h1>
        
        {/* Search Filters */}
        <SearchFilters onSearch={handleSearch} initialFilters={initialFilters} />
        
        {/* Job Listings */}
        <div className="mb-8">
          <p className="text-lg mb-4">{filteredJobs.length} jobs found</p>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No jobs found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} {...job} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Jobs;
