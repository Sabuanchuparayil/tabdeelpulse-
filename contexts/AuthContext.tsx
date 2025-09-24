import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { useApi } from '../hooks/useApi';

interface AuthContextType {
    user: User | null;
    originalUser: User | null;
    isImpersonating: boolean;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
    impersonate: (userId: string) => void;
    stopImpersonating: () => void;
    hasPermission: (permission: string) => boolean;
    updateUserProfile: (updatedUser: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const api = useApi();

    useEffect(() => {
        const fetchRoles = async () => {
            const fetchedRoles = await api.getRoles();
            setRoles(fetchedRoles);
        };
        fetchRoles();
    }, [api]);

    const login = async (email: string, pass: string): Promise<User | null> => {
        const loggedInUser = await api.login(email, pass);
        if (loggedInUser) {
            setUser(loggedInUser);
        }
        return loggedInUser;
    };

    const logout = () => {
        setUser(null);
        setOriginalUser(null);
    };

    const impersonate = async (userId: string) => {
        const targetUser = await api.getUser(userId);
        if (targetUser && user) {
            setOriginalUser(user);
            setUser(targetUser);
        }
    };

    const stopImpersonating = () => {
        if (originalUser) {
            setUser(originalUser);
            setOriginalUser(null);
        }
    };

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        const userRole = roles.find(role => role.id === user.roleId);
        return userRole?.permissions.includes(permission) ?? false;
    };

    const updateUserProfile = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser);
            if (originalUser && originalUser.id === user.id) {
                setOriginalUser(newUser);
            }
        }
    };

    const isImpersonating = !!originalUser;

    return (
        <AuthContext.Provider value={{ user, originalUser, isImpersonating, login, logout, impersonate, stopImpersonating, hasPermission, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};