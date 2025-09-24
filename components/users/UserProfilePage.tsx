import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { User, Page } from '../../types';
import Avatar from '../common/Avatar';

interface UserProfilePageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate }) => {
    const { user, updateUserProfile } = useContext(AuthContext)!;
    const [formData, setFormData] = useState<Partial<User>>({});
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: ''});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
        }
    }, [user]);

    if (!user) {
        return <div>Loading profile...</div>;
    }

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };
    
    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile(formData);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords don't match.");
            return;
        }
        // In a real app, you would call an API to change the password.
        console.log("Password change requested for user:", user.id);
        setSuccessMessage('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-6">My Profile</h1>
            {successMessage && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-md mb-6">{successMessage}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md text-center">
                        <Avatar name={user.name} size="xl" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold font-serif">{user.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                {/* Edit Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Update Personal Info */}
                    <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-serif font-bold mb-4">Personal Information</h3>
                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleInfoChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInfoChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Update Profile</button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-serif font-bold mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Password</label>
                                <input type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">New Password</label>
                                <input type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                <input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;