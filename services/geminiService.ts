import { Message, User } from '../types';

export const summarizeConversation = async (messages: Message[], users: User[]): Promise<string> => {
    // This feature has been disabled.
    console.warn("AI summarization feature is disabled.");
    return Promise.resolve("AI summarization is currently unavailable.");
};
