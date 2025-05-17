
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import JobForm from '@/components/job/JobForm';

const EditJob = () => {
  const { jobId } = useParams();
  const { currentUser, isEmployer } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !currentUser) return;

      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        
        if (!jobDoc.exists() || jobDoc.data().postedBy !== currentUser.uid) {
          setNotFound(true);
          toast({
            title: "Error",
            description: "Job not found or you don't have permission to edit it",
            variant: "destructive",
          });
          return;
        }
        
        setJob({
          id: jobDoc.id,
          ...jobDoc.data(),
          deadline: jobDoc.data().deadline?.toDate() || new Date()
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Failed to load job data",
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
      type: "remote",
      description: "We are looking for a Senior Frontend Developer to join our team...",
      requirements: "5+ years of experience with React, TypeScript, and modern frontend tools",
      category: "Technology",
      salary: {
        min: 95000,
        max: 125000,
        currency: "$"
      },
      createdAt: new Date('2025-05-05'),
      deadline: new Date('2025-06-05'),
      status: 'active'
    });
    
    setLoading(false);
    
    // Comment out fetchJob call for now, since we're using sample data
    // fetchJob();
  }, [jobId, currentUser]);

  // Redirect if not authenticated or not an employer
  if (!currentUser || !isEmployer) {
    return <Navigate to="/auth?mode=login" />;
  }

  // Show not found state
  if (notFound) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <JobForm job={job} isEditing={true} />;
};

export default EditJob;
