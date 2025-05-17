
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Calendar, Briefcase } from 'lucide-react';

interface JobCardProps {
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

const JobCard = ({
  id,
  title,
  company,
  location,
  type,
  salary,
  createdAt,
  deadline
}: JobCardProps) => {
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

  return (
    <Link to={`/job/${id}`}>
      <Card className="job-card h-full hover:border-job-teal transition-all">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
            <Badge className={getTypeColor(type)} variant="outline">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
          
          <p className="text-base font-medium text-gray-700 mb-2">{company}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
          
          <p className="text-md font-semibold text-job-blue">
            {formatSalary(salary.min, salary.max, salary.currency)} <span className="font-normal text-gray-500">/ year</span>
          </p>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Posted {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            <span>Apply by {formatDistanceToNow(deadline, { addSuffix: true })}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default JobCard;
