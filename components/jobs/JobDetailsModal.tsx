import React, { useState, useContext } from 'react';
import { ServiceJob, JobStatus, User, JobComment } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: ServiceJob;
    onUpdate: (updatedJob: ServiceJob) => void;
    projectMap: Map<string, string>;
    userMap: Map<string, User>;
    allUsers: User[];
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job, onUpdate, projectMap, userMap, allUsers }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentJob, setCurrentJob] = useState(job);
    const [newComment, setNewComment] = useState("");
    const api = useApi();
    const { hasPermission, user } = useContext(AuthContext)!;

    const handleSave = async () => {
        if (!user) return;
        const updatedJob = await api.updateServiceJob(currentJob, user.id);
        onUpdate(updatedJob);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentJob(job);
        setIsEditing(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !user) return;
        const updatedJob = await api.addJobComment(job.id, { authorId: user.id, content: newComment });
        if (updatedJob) {
            onUpdate(updatedJob);
            setNewComment("");
        }
    };
    
    const getEscalationText = (level: number) => {
        if (level === 1) return "Level 1: Notified Manager";
        if (level === 2) return "Level 2: Escalated to Admin";
        return "None";
    }

    const isJobOverdue = (job: ServiceJob): boolean => {
        if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
            return false;
        }
        const today = new Date();
        today.setHours(0,0,0,0);
        return new Date(job.dueDate) < today;
    }

    const DetailItem: React.FC<{ label: string; value: React.ReactNode, className?: string }> = ({ label, value, className }) => (
        <div className={className}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Job Details" size="xl">
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-bold font-serif">{currentJob.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{projectMap.get(currentJob.projectId)}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <DetailItem label="Assigned To" value={
                        <div className="flex items-center space-x-2">
                            <Avatar name={userMap.get(currentJob.assignedToId)?.name || '?'} size="sm"/>
                            <span>{userMap.get(currentJob.assignedToId)?.name || 'Unassigned'}</span>
                        </div>
                    } />
                     <DetailItem label="Created Date" value={new Date(currentJob.createdDate).toLocaleString()} />
                     <DetailItem 
                        label="Due Date" 
                        value={new Date(currentJob.dueDate).toLocaleDateString()} 
                        className={isJobOverdue(currentJob) ? 'text-red-500' : ''}
                     />
                    <DetailItem label="Priority" value={currentJob.priority} />
                    <DetailItem label="Status" value={currentJob.status} />
                    <DetailItem label="Last Updated" value={new Date(currentJob.updatedDate).toLocaleString()} />
                    <DetailItem label="Escalation Status" value={getEscalationText(currentJob.escalationLevel)} className="col-span-3" />
                </div>
                
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                    <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md mt-1 whitespace-pre-wrap">{currentJob.description}</p>
                </div>

                {isEditing && (
                    <div className="p-4 border-t dark:border-gray-600 space-y-4">
                        <h4 className="font-semibold">Update Job</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Change Status</label>
                                <select 
                                    value={currentJob.status} 
                                    onChange={e => setCurrentJob(p => ({...p, status: e.target.value as JobStatus}))}
                                    className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card"
                                >
                                    {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Change Due Date</label>
                                <input
                                    type="date"
                                    value={currentJob.dueDate}
                                    onChange={e => setCurrentJob(p => ({...p, dueDate: e.target.value}))}
                                    className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
                                />
                            </div>
                        </div>
                        {hasPermission('jobs:assign') && (
                             <div>
                                <label className="block text-sm font-medium mb-1">Reassign To</label>
                                <select 
                                    value={currentJob.assignedToId} 
                                    onChange={e => setCurrentJob(p => ({...p, assignedToId: e.target.value}))}
                                    className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card"
                                >
                                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                 <div className="space-y-3 pt-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Comments</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {job.comments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <Avatar name={userMap.get(comment.authorId)?.name || '?'} size="sm" />
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{userMap.get(comment.authorId)?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-start space-x-3 pt-2">
                        <Avatar name={user?.name || '?'} size="sm" />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                rows={2}
                                placeholder="Add a comment..."
                                className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 focus:ring-1 focus:ring-primary-light"
                            />
                            <button onClick={handleAddComment} className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-secondary-light text-white hover:opacity-90">Post Comment</button>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-600">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-light text-white">Save Changes</button>
                        </>
                    ) : (
                        <>
                             <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Close</button>
                             {hasPermission('jobs:update') && <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-lg bg-primary-light text-white">Update Job</button>}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default JobDetailsModal;