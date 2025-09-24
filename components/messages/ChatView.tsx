import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { ChatThread, User } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';

interface ChatViewProps {
    thread: ChatThread;
    users: User[];
    onMessageSent: (updatedThread: ChatThread) => void;
    onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ thread, users, onMessageSent, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const { user } = useContext(AuthContext)!;
    const api = useApi();
    // FIX: Use a memoized plain object for the user map for better type inference.
    const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [thread.messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;
        const updatedThread = await api.addMessage(thread.id, { senderId: user.id, content: newMessage });
        if (updatedThread) {
            onMessageSent(updatedThread);
            setNewMessage('');
        }
    };

    return (
        <>
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-2 md:hidden p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                    <div>
                        <h3 className="text-lg font-bold">{thread.title}</h3>
                        <p className="text-sm text-gray-500">
                            {/* FIX: Access user from the object map. */}
                            {thread.participants.map(pId => userMap[pId]?.name.split(' ')[0]).join(', ')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/20">
                <div className="space-y-4">
                    {thread.messages.map(message => {
                        // FIX: Access user from the object map.
                        const sender = userMap[message.senderId];
                        const isCurrentUser = sender?.id === user?.id;
                        return (
                             <div key={message.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {!isCurrentUser && sender && <Avatar name={sender.name} size="sm" />}
                                <div className={`max-w-md p-3 rounded-xl ${isCurrentUser ? 'bg-primary-light text-white rounded-br-none' : 'bg-white dark:bg-dark-bg-card rounded-bl-none'}`}>
                                    <p className="text-sm">{message.content}</p>
                                    <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-right' : 'text-left'}`}>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                 {isCurrentUser && sender && <Avatar name={sender.name} size="sm" />}
                            </div>
                        )
                    })}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-grow p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-light"
                    />
                    <button onClick={handleSendMessage} className="px-4 py-2 rounded-lg bg-primary-light text-white">Send</button>
                </div>
            </div>
            
        </>
    );
};

export default ChatView;