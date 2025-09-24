

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Task, User } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import Modal from '../common/Modal';

const TaskView: React.FC<{ users: User[] }> = ({ users }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

    const api = useApi();
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        if (user) {
            api.getTasks(user.id).then(setTasks);
            setNewTaskAssignedTo(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleToggleComplete = async (task: Task) => {
        if (!user) return;
        const updatedTask = { ...task, isCompleted: !task.isCompleted };
        await api.updateTask(updatedTask, user.id);
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    };
    
    const handleAddTask = async () => {
        if (!newTaskTitle || !newTaskDueDate || !user) return;
        const newTask = await api.addTask({
            title: newTaskTitle,
            assignedTo: newTaskAssignedTo || user.id,
            dueDate: newTaskDueDate,
            isCompleted: false,
            creatorId: user.id
        }, user.id);
        setTasks(prev => [...prev, newTask]);
        setIsModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDueDate('');
    };

    const sortedTasks = useMemo(() =>
        tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    , [tasks]);

    const filteredTasks = useMemo(() =>
        sortedTasks.filter(t => showCompleted || !t.isCompleted)
    , [sortedTasks, showCompleted]);


    // FIX: Use a memoized plain object for the user map for better type inference.
    const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

    const getTaskUrgency = (task: Task): { dotClass: string, textClass: string } => {
        if (task.isCompleted) return { dotClass: '', textClass: '' };
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { dotClass: 'bg-red-500', textClass: 'text-red-500' };
        }
        if (diffDays <= 3) {
            return { dotClass: 'bg-orange-500', textClass: 'text-orange-500' };
        }
        return { dotClass: '', textClass: '' };
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <input
                        id="show-completed"
                        type="checkbox"
                        checked={showCompleted}
                        onChange={e => setShowCompleted(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
                    />
                    <label htmlFor="show-completed" className="ml-2">Show Completed Tasks</label>
                </div>
                 <button onClick={() => setIsModalOpen(true)} className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90">
                    <Icon name="plus" className="w-5 h-5" />
                    <span>Add Task</span>
                </button>
            </div>

            <ul className="space-y-3">
                {filteredTasks.map(task => {
                    const { dotClass, textClass } = getTaskUrgency(task);
                    return (
                        <li key={task.id} className="bg-white dark:bg-dark-bg-card p-4 rounded-lg shadow-sm flex items-center justify-between transition-all">
                            <div className="flex items-center">
                                <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleComplete(task)} className="h-5 w-5 rounded border-gray-300 text-primary-light focus:ring-primary-light" />
                                <div className="ml-4">
                                    <div className="flex items-center space-x-2">
                                        {dotClass && <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`}></div>}
                                        <p className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {/* FIX: Access user from the object map. */}
                                        <span className={textClass}>Due: {new Date(task.dueDate).toLocaleDateString()}</span> | Assigned to: {userMap[task.assignedTo]?.name || 'Unknown'}
                                        <br/>
                                        <span className="text-xs">Created: {new Date(task.createdDate).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Title</label>
                        <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Assign To</label>
                        <select value={newTaskAssignedTo} onChange={e => setNewTaskAssignedTo(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleAddTask} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Add Task</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default TaskView;
