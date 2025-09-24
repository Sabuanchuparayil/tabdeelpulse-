
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Logo } from '../../constants';
import { useApi } from '../../hooks/useApi';
import { User, Role } from '../../types';
import Avatar from '../common/Avatar';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const authContext = useContext(AuthContext);
    
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const api = useApi();

    useEffect(() => {
        const fetchTestData = async () => {
            const [userData, roleData] = await Promise.all([api.getUsers(), api.getRoles()]);
            setUsers(userData);
            setRoles(roleData);
        };
        fetchTestData();
    }, [api]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (!email || !password) {
            setError('Please enter both email and password.');
            setIsLoading(false);
            return;
        }
        try {
            const user = await authContext?.login(email, password);
            if (!user) {
                setError('Invalid credentials or user is disabled.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickLogin = async (user: User) => {
        setIsLoading(true);
        setError('');
        try {
            const loggedInUser = await authContext?.login(user.email, 'password'); // Password doesn't matter for mock
            if (!loggedInUser) {
                setError(`Could not log in as ${user.name}.`);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleMap = new Map(roles.map(r => [r.id, r.name]));
    const sampleUsers = [
        users.find(u => u.roleId === 'role-1'), // Admin
        users.find(u => u.roleId === 'role-2'), // Manager
        users.find(u => u.roleId === 'role-3'), // Technician
        users.find(u => u.roleId === 'role-4'), // Accountant
    ].filter(Boolean) as User[];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-dark-bg-card shadow-lg rounded-xl p-8">
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <h2 className="text-2xl font-bold font-serif text-center text-light-text dark:text-dark-text mb-1">Welcome Back!</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Sign in to continue to Tabdeel Pulse+</p>
                    
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark sm:text-sm bg-transparent"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark sm:text-sm bg-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light border-gray-300 dark:border-gray-600 rounded bg-transparent"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-light hover:text-blue-700 dark:text-primary-dark dark:hover:text-blue-400">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:bg-primary-dark dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {sampleUsers.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                            Or quick login for testing:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {sampleUsers.map(sampleUser => (
                                <button
                                    key={sampleUser.id}
                                    onClick={() => handleQuickLogin(sampleUser)}
                                    disabled={isLoading}
                                    className="p-3 bg-white dark:bg-dark-bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark disabled:opacity-50 disabled:cursor-wait flex flex-col items-center justify-center space-y-2"
                                >
                                    <Avatar name={sampleUser.name} size="lg" />
                                    <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate w-full">{sampleUser.name.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{roleMap.get(sampleUser.roleId)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
