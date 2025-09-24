import React from 'react';

interface AvatarProps {
    name: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// A palette of colors for the avatars
const COLORS = [
    'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400',
    'bg-teal-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500'
];

const SIZES = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-32 h-32 text-5xl',
};


const Avatar: React.FC<AvatarProps> = ({ name, className, size = 'md' }) => {
    const getInitials = (name: string): string => {
        if (!name) return '?';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getColor = (name: string): string => {
        if (!name) return COLORS[0];
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return COLORS[charCodeSum % COLORS.length];
    };

    const initials = getInitials(name);
    const colorClass = getColor(name);
    const sizeClass = SIZES[size] || SIZES['md'];

    return (
        <div className={`rounded-full flex items-center justify-center text-white font-bold select-none ${colorClass} ${sizeClass} ${className}`}>
            <span>{initials}</span>
        </div>
    );
};

export default Avatar;
