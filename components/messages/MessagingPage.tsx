import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { ChatThread, User, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import ChatView from './ChatView';
import NewChatModal from './NewChatModal';
import Icon from '../common/Icon';
import AccessDenied from '../common/AccessDenied';
import { formatRelativeTime } from '../../utils/time';

interface MessagingPageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const MessagingPage: React.FC<MessagingPageProps> = ({ navigate }) => {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const api = useApi();
    const { user, hasPermission } = useContext(AuthContext)!;
    // FIX: Use a memoized plain object for the user map for better type inference.
    const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

    useEffect(() => {
        if (!user) return;
        let isMounted = true;

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [threadData, userData] = await Promise.all([api.getThreads(user.id), api.getUsers()]);
                if (!isMounted) return;

                const sortedThreads = threadData.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
                setThreads(sortedThreads);
                setUsers(userData);
                
                if (window.innerWidth > 768 && sortedThreads.length > 0) {
                    setSelectedThread(sortedThreads[0]);
                }
            } catch (error) {
                console.error("Failed to fetch messaging data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        fetchInitialData();

        const fetchThreadsPeriodically = async () => {
            if (!user) return;
            const threadData = await api.getThreads(user.id);
            if (isMounted) {
                const sortedThreads = threadData.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
                setThreads(sortedThreads);
            }
        };

        // SRE/PERFORMANCE NOTE: Polling with setInterval is simple for a mock environment
        // but is inefficient in production. It creates constant, unnecessary network
        // traffic. For a real-world app, this should be replaced with a real-time
        // connection like WebSockets or Server-Sent Events (SSE) to push updates
        // from the server to the client when they occur.
        const intervalId = setInterval(fetchThreadsPeriodically, 5000); // Poll every 5 seconds

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!user) {
        return null; // Should be handled by the main layout, but good practice
    }
    
    if (!hasPermission('messages:view')) {
        return <AccessDenied />;
    }

    const handleThreadUpdate = (updatedThread: ChatThread) => {
        const sortedThreads = threads
            .map(t => t.id === updatedThread.id ? updatedThread : t)
            .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
        setThreads(sortedThreads);
        setSelectedThread(updatedThread);
    }

    const handleCreateChat = async ({ title, participantIds, message }: { title: string; participantIds: string[]; message: string }) => {
        if (!user) return;
        
        // Add current user to participants
        const allParticipants = [...new Set([user.id, ...participantIds])];

        const newThread = await api.createChatThread(
            title,
            allParticipants,
            { senderId: user.id, content: message }
        );

        if (newThread) {
            setThreads(prev => [newThread, ...prev].sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
            setIsNewChatModalOpen(false);
            setSelectedThread(newThread);
        }
    };
    
    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
            {/* Thread List */}
            <div className={`w-full md:w-1/3 border-r dark:border-gray-700 flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-serif">Conversations</h2>
                     {hasPermission('messages:create') && (
                        <button
                            onClick={() => setIsNewChatModalOpen(true)}
                            className="p-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="New Conversation"
                        >
                            <Icon name="plus-circle" className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <p className="p-4">Loading...</p> : (
                        <ul>
                            {threads.map(thread => {
                                const lastMessage = thread.messages[thread.messages.length - 1];
                                return (
                                <li key={thread.id} onClick={() => setSelectedThread(thread)}
                                    className={`p-4 cursor-pointer border-l-4 ${selectedThread?.id === thread.id ? 'border-primary-light bg-gray-50 dark:bg-gray-700/50' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold truncate">{thread.title}</p>
                                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {formatRelativeTime(thread.lastMessageTimestamp)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {lastMessage ? (
                                            <>
                                                {/* FIX: Access user from the object map. */}
                                                <span className="font-medium">{userMap[lastMessage.senderId]?.name.split(' ')[0]}:</span> {lastMessage.content}
                                            </>
                                        ) : (
                                            <em>No messages yet.</em>
                                        )}
                                    </p>
                                </li>
                            )})}
                        </ul>
                    )}
                </div>
            </div>

            {/* Chat View */}
            <div className={`w-full md:w-2/3 flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
                {selectedThread ? (
                    <ChatView
                        key={selectedThread.id} 
                        thread={selectedThread}
                        users={users}
                        onMessageSent={handleThreadUpdate}
                        onBack={() => setSelectedThread(null)}
                    />
                ) : (
                    <div className="hidden md:flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>

            {isNewChatModalOpen && (
                <NewChatModal
                    isOpen={isNewChatModalOpen}
                    onClose={() => setIsNewChatModalOpen(false)}
                    onCreate={handleCreateChat}
                    allUsers={users}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default MessagingPage;
