import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Announcement, User } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

const AnnouncementView: React.FC<{ users: User[] }> = ({ users }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: ''});
    const api = useApi();
    const { user, hasPermission } = useContext(AuthContext)!;
    // FIX: Use a memoized plain object for the user map for better type inference.
    const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
    
    useEffect(() => {
        api.getAnnouncements().then(data => setAnnouncements(data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content || !user) return;
        const created = await api.addAnnouncement({ ...newAnnouncement, authorId: user.id });
        setAnnouncements(prev => [created, ...prev]);
        setIsModalOpen(false);
        setNewAnnouncement({ title: '', content: '' });
    };

    return (
        <div>
            {hasPermission('announcements:manage') && (
                 <div className="text-right mb-4">
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90 ml-auto">
                        <Icon name="plus" className="w-5 h-5" />
                        <span>New Announcement</span>
                    </button>
                </div>
            )}
            <div className="space-y-4">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-white dark:bg-dark-bg-card p-5 rounded-lg shadow-sm border-l-4 border-secondary-light dark:border-secondary-dark">
                        <div className="flex items-start space-x-4">
                             {/* FIX: Access user from the object map. */}
                             <Avatar name={userMap[ann.authorId]?.name || 'Admin'} size="md" />
                             <div>
                                <h3 className="font-bold text-lg">{ann.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {/* FIX: Access user from the object map. */}
                                    By {userMap[ann.authorId]?.name || 'Admin'} on {new Date(ann.timestamp).toLocaleString()}
                                </p>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">{ann.content}</p>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Announcement">
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement(p => ({...p, title: e.target.value}))} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement(p => ({...p, content: e.target.value}))} rows={4} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleAddAnnouncement} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Post Announcement</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AnnouncementView;
