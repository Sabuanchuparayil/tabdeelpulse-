import React, { useState } from 'react';
import { User } from '../../types';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (details: { title: string; participantIds: string[]; message: string }) => void;
    allUsers: User[];
    currentUser: User;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreate, allUsers, currentUser }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const handleUserToggle = (userId: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setSelectedUserIds(newSet);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !message.trim() || selectedUserIds.size === 0) {
            alert("Please fill in all fields and select at least one participant.");
            return;
        }
        setIsLoading(true);
        await onCreate({
            title,
            participantIds: Array.from(selectedUserIds),
            message,
        });
        // Resetting state for next time
        setTitle('');
        setMessage('');
        setSelectedUserIds(new Set());
        setIsLoading(false);
        // onClose will be called by the parent component after creation
    };

    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start a New Conversation" size="lg">
            <div className="space-y-4">
                <div>
                    <label htmlFor="chat-title" className="block text-sm font-medium mb-1">Conversation Title</label>
                    <input
                        id="chat-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Q4 Project Planning"
                        className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Participants</label>
                    <div className="max-h-48 overflow-y-auto border dark:border-gray-600 rounded-md p-2 space-y-2">
                        {otherUsers.map(user => (
                            <label key={user.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.has(user.id)}
                                    onChange={() => handleUserToggle(user.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
                                />
                                <Avatar name={user.name} size="sm" />
                                <span>{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="chat-message" className="block text-sm font-medium mb-1">Initial Message</label>
                    <textarea
                        id="chat-message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Type your first message..."
                        className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 disabled:opacity-50">
                        {isLoading ? 'Creating...' : 'Create Chat'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default NewChatModal;
