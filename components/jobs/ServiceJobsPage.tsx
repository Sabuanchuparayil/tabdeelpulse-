import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
// Fix: Import Page type.
import { ServiceJob, Project, User, JobStatus, JobPriority, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import JobDetailsModal from './JobDetailsModal';
import Avatar from '../common/Avatar';
import AccessDenied from '../common/AccessDenied';
import PageHeader from '../common/PageHeader';

// Fix: Add navigate prop to conform to PageProps in MainLayout.tsx
interface ServiceJobsPageProps {
    initialFilter?: JobStatus;
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const ServiceJobsPage: React.FC<ServiceJobsPageProps> = ({ initialFilter }) => {
    const [jobs, setJobs] = useState<ServiceJob[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
    // Fix: Correctly initialize state with default value if prop is not provided.
    const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>(initialFilter ?? 'all');
    
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [jobData, projectData, userData] = await Promise.all([
                    api.getServiceJobs(),
                    api.getProjects(),
                    api.getUsers(),
                ]);
                setJobs(jobData.sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()));
                setProjects(projectData);
                setUsers(userData);
            } catch (error) {
                console.error("Failed to fetch jobs data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateJob = (updatedJob: ServiceJob) => {
        setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob && selectedJob.id === updatedJob.id) {
            setSelectedJob(updatedJob);
        }
    };

    const isJobOverdue = (job: ServiceJob): boolean => {
        if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
            return false;
        }
        const today = new Date();
        today.setHours(0,0,0,0);
        return new Date(job.dueDate) < today;
    }

    const filteredJobs = useMemo(() => {
        if (filterStatus === 'all') return jobs;
        return jobs.filter(job => job.status === filterStatus);
    }, [jobs, filterStatus]);

    if (!hasPermission('jobs:view')) {
        return <AccessDenied />;
    }

    const getStatusClass = (status: JobStatus) => ({
        [JobStatus.OPEN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [JobStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [JobStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [JobStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[status]);

    const getPriorityClass = (priority: JobPriority) => ({
        [JobPriority.LOW]: 'text-gray-500',
        [JobPriority.MEDIUM]: 'text-green-600',
        [JobPriority.HIGH]: 'text-orange-600',
        [JobPriority.URGENT]: 'text-red-600 font-bold',
    }[priority]);
    
    const getEscalationBadge = (level: number) => {
        if (level === 1) {
            return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">L1: Manager</span>;
        }
        if (level === 2) {
             return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">L2: Admin</span>;
        }
        return null;
    }

    return (
        <div>
            <PageHeader title="Service Jobs">
                {hasPermission('jobs:create') && (
                    <button className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90">
                        <Icon name="plus" className="w-5 h-5" />
                        <span>New Job</span>
                    </button>
                )}
            </PageHeader>

            <div className="mb-4">
                 <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as JobStatus | 'all')}
                    className="p-2 border rounded-md bg-transparent dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-light h-full"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left">Job Title</th>
                                <th className="px-6 py-3 text-left">Project</th>
                                <th className="px-6 py-3 text-left">Assigned To</th>
                                <th className="px-6 py-3 text-left">Due Date</th>
                                <th className="px-6 py-3 text-left">Priority</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Alerts</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center space-x-2">
                                                 {isJobOverdue(job) && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" title="Overdue"></span>}
                                                <span>{job.title}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 ml-4">{new Date(job.createdDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">{projectMap.get(job.projectId) || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Avatar name={userMap.get(job.assignedToId)?.name || '?'} size="sm"/>
                                                <span>{userMap.get(job.assignedToId)?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 ${isJobOverdue(job) ? 'text-red-500 font-semibold' : ''}`}>{new Date(job.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={getPriorityClass(job.priority)}>{job.priority}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(job.status)}`}>{job.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEscalationBadge(job.escalationLevel)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedJob(job)} className="text-primary-light dark:text-primary-dark hover:underline">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedJob && (
                <JobDetailsModal
                    isOpen={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                    job={selectedJob}
                    onUpdate={handleUpdateJob}
                    projectMap={projectMap}
                    userMap={userMap}
                    allUsers={users}
                />
            )}
        </div>
    );
};

export default ServiceJobsPage;