export const formatRelativeTime = (isoString: string): string => {
    const messageDate = new Date(isoString);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const msPerDay = 24 * 60 * 60 * 1000;
    // Round dates to the beginning of the day for accurate day difference calculation
    const messageDayStart = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const daysDiff = Math.round((startOfToday.getTime() - messageDayStart.getTime()) / msPerDay);

    if (daysDiff === 0) { // Today
        return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    if (daysDiff === 1) { // Yesterday
        return 'Yesterday';
    }
    if (daysDiff > 1 && daysDiff < 7) { // This week
        return messageDate.toLocaleDateString([], { weekday: 'long' });
    }
    // Older than a week
    return messageDate.toLocaleDateString();
};
