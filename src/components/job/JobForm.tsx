
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';

interface JobFormProps {
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'remote' | 'hybrid' | 'onsite';
    description: string;
    requirements: string;
    category: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    deadline: Date;
  };
  isEditing?: boolean;
}

const JobForm = ({ job, isEditing = false }: JobFormProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    type: job?.type || 'onsite',
    description: job?.description || '',
    requirements: job?.requirements || '',
    category: job?.category || 'Technology',
    salaryMin: job?.salary?.min || 50000,
    salaryMax: job?.salary?.max || 100000,
    salaryCurrency: job?.salary?.currency || '$',
    deadline: job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type as 'remote' | 'hybrid' | 'onsite',
        description: formData.description,
        requirements: formData.requirements,
        category: formData.category,
        salary: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: formData.salaryCurrency,
        },
        deadline: new Date(formData.deadline),
        postedBy: currentUser.uid,
        status: 'active',
      };

      if (isEditing && job) {
        // Update existing job
        await updateDoc(doc(db, 'jobs', job.id), {
          ...jobData,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: "Success",
          description: "Job has been updated",
        });
      } else {
        // Add new job
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdAt: serverTimestamp(),
        });
        toast({
          title: "Success",
          description: "Job has been posted",
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: isEditing ? "Failed to update job" : "Failed to post job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Job' : 'Post a New Job'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input 
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  name="location"
                  placeholder="e.g., Remote, New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Job Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange(value, 'type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Job Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Job Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Salary */}
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="flex gap-4">
                  <div className="w-1/4">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select 
                      value={formData.salaryCurrency}
                      onValueChange={(value) => handleSelectChange(value, 'salaryCurrency')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">USD ($)</SelectItem>
                        <SelectItem value="€">EUR (€)</SelectItem>
                        <SelectItem value="£">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="salaryMin">Minimum</Label>
                    <Input 
                      id="salaryMin"
                      name="salaryMin"
                      type="number"
                      min="0"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="salaryMax">Maximum</Label>
                    <Input 
                      id="salaryMax"
                      name="salaryMax"
                      type="number"
                      min="0"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input 
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>
              
              {/* Job Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea 
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : isEditing ? 'Update Job' : 'Post Job'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobForm;
