import { MOCK_DATA } from '../data/mockData';
import { User, Role, PaymentInstruction, Collection, Deposit, Project, AccountHead, Asset, AssetMovement, ServiceJob, Task, Announcement, ChatThread, Message, Notification, PaymentStatus, AssetStatus, AssetMovementType, JobStatus, ActivityLog, JobComment, ApprovalStatus } from '../types';

const FAKE_DELAY = 500;

// A simple in-memory store to simulate a database
const db = {
    ...MOCK_DATA,
};

// --- Internal Helper for Activity Logging ---
const logActivity = (userId: string, action: string) => {
    const newActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        userId,
        action,
        timestamp: new Date().toISOString()
    };
    db.activity.unshift(newActivity);
};


// --- Internal Helper for Escalation ---
const dispatchNotificationAndThread = (userIds: string[], message: string, threadTitle: string, threadParticipants: string[], existingThreadId?: string) => {
    // 1. Dispatch Notification
    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userIds: userIds,
        message: message,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    db.notifications.unshift(newNotification);

    // 2. Create or Update Chat Thread
    let thread = existingThreadId ? db.chatThreads.find(t => t.id === existingThreadId) : null;
    
    if (thread) { // Update existing thread
        const currentParticipants = new Set(thread.participants);
        const newParticipants = threadParticipants.filter(p => !currentParticipants.has(p));
        if (newParticipants.length > 0) {
            thread.participants.push(...newParticipants);
        }
    } else { // Create new thread
         const newThread: ChatThread = {
            id: `thread-job-${threadTitle.replace(/\s+/g, '-')}`,
            title: threadTitle,
            participants: [...new Set(threadParticipants)], // Ensure unique participants
            messages: [],
            lastMessageTimestamp: new Date().toISOString(),
        };
        db.chatThreads.unshift(newThread);
    }
};

// SRE/ARCHITECTURAL NOTE: This function simulates a background job.
// In a real-world, production application, this logic should NOT live on the client-side API.
// It is inefficient and unreliable to have a client's API call trigger business-critical logic like this.
// This should be a scheduled job (e.g., a cron job) running on the backend server at regular intervals
// (e.g., every hour) to check for overdue items and perform escalations.
const checkAndEscalateJobs = () => {
    const now = new Date();
    // Set time to 00:00:00 to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeJobs = db.serviceJobs.filter(j => j.status === JobStatus.OPEN || j.status === JobStatus.IN_PROGRESS);

    const managers = db.users.filter(u => u.roleId === 'role-2');
    const admins = db.users.filter(u => u.roleId === 'role-1');
    const managerIds = managers.map(m => m.id);
    const adminIds = admins.map(a => a.id);

    for (const job of activeJobs) {
        const dueDate = new Date(job.dueDate);
        if (dueDate >= today) continue; // Not overdue

        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const technician = db.users.find(u => u.id === job.assignedToId);
        const threadId = `thread-job-${job.title.replace(/\s+/g, '-')}`;

        // Level 2: Escalate to Admin (>3 days overdue)
        if (daysOverdue > 3 && job.escalationLevel < 2) {
            job.escalationLevel = 2;
            const message = `URGENT: Job '${job.title}' is now ${daysOverdue} days overdue. Escalated to administrators.`;
            dispatchNotificationAndThread(
                adminIds,
                message,
                `Overdue Job: ${job.title}`,
                [job.assignedToId, ...managerIds, ...adminIds],
                threadId
            );
        }
        // Level 1: Escalate to Manager (1-3 days overdue)
        else if (daysOverdue >= 1 && job.escalationLevel < 1) {
            job.escalationLevel = 1;
            const message = `Job '${job.title}' assigned to ${technician?.name || 'technician'} is now ${daysOverdue} day(s) overdue.`;
            dispatchNotificationAndThread(
                managerIds,
                message,
                `Overdue Job: ${job.title}`,
                [job.assignedToId, ...managerIds],
                threadId
            );
        }
    }
};


const api = {
    // --- Auth ---
    login: (email: string, _pass: string): Promise<User | null> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const user = db.users.find(u => u.email === email && u.status === 'Active');
                resolve(user || null);
            }, FAKE_DELAY);
        });
    },

    // --- Users ---
    getUsers: (): Promise<User[]> => Promise.resolve(db.users),
    getUser: (id: string): Promise<User | null> => Promise.resolve(db.users.find(u => u.id === id) || null),
    updateUser: (user: User): Promise<User> => {
        const oldUser = db.users.find(u => u.id === user.id);
        if (oldUser && oldUser.status === 'Active' && user.status === 'Disabled') {
             logActivity(user.id, `disabled user "${user.name}". Reason: ${user.disableReason}`);
        }
        db.users = db.users.map(u => u.id === user.id ? user : u);
        return Promise.resolve(user);
    },
    addUser: (user: Omit<User, 'id'>): Promise<User> => {
        const newUser = { ...user, id: `user-${Date.now()}` };
        db.users.push(newUser);
        return Promise.resolve(newUser);
    },

    // --- Roles ---
    getRoles: (): Promise<Role[]> => Promise.resolve(db.roles),
    updateRole: (role: Role): Promise<Role> => {
        db.roles = db.roles.map(r => r.id === role.id ? role : r);
        return Promise.resolve(role);
    },

    // --- Dashboard ---
    getDashboardKPIs: (): Promise<any> => Promise.resolve({
        totalCollections: 125000,
        pendingApprovals: db.payments.filter(p => p.status === PaymentStatus.PENDING).length,
        activeJobs: db.serviceJobs.filter(j => j.status === 'In Progress').length,
        unreadMessages: 2,
    }),
    getActivity: (): Promise<any[]> => Promise.resolve(db.activity.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())),

    // --- Finance ---
    getPayments: (): Promise<PaymentInstruction[]> => Promise.resolve(db.payments),
    updatePayment: (payment: PaymentInstruction, actorId: string): Promise<PaymentInstruction> => {
        const oldPayment = db.payments.find(p => p.id === payment.id);
        if(oldPayment && oldPayment.status !== payment.status) {
            payment.approverId = actorId;
            payment.approvalTimestamp = new Date().toISOString();
            if (payment.status === PaymentStatus.REJECTED) {
                 logActivity(actorId, `rejected a payment for "${payment.payee}". Reason: ${payment.rejectionReason}`);
            } else {
                logActivity(actorId, `changed the status of payment for "${payment.payee}" to ${payment.status}.`);
            }
        }
        db.payments = db.payments.map(p => p.id === payment.id ? payment : p);
        return Promise.resolve(payment);
    },
    getCollections: (): Promise<Collection[]> => Promise.resolve(db.collections),
    getDeposits: (): Promise<Deposit[]> => Promise.resolve(db.deposits),

    // --- Master Data ---
    getProjects: (): Promise<Project[]> => Promise.resolve(db.projects),
    getAccounts: (): Promise<AccountHead[]> => Promise.resolve(db.accounts),
    updateAccount: (account: AccountHead, actorId: string): Promise<AccountHead> => {
        const oldAccount = db.accounts.find(a => a.id === account.id);
        if(oldAccount && oldAccount.approvalStatus !== account.approvalStatus) {
            if(account.approvalStatus === ApprovalStatus.APPROVED) {
                logActivity(actorId, `approved the account head "${account.name}".`);
            } else if (account.approvalStatus === ApprovalStatus.REJECTED) {
                logActivity(actorId, `rejected the account head "${account.name}". Reason: ${account.rejectionReason}`);
            }
        }
        db.accounts = db.accounts.map(a => a.id === account.id ? account : a);
        return Promise.resolve(account);
    },

    // --- Assets ---
    getAssets: (): Promise<Asset[]> => Promise.resolve(db.assets),
    updateAsset: (asset: Asset, actorId: string): Promise<Asset> => {
        asset.updatedTimestamp = new Date().toISOString();
        db.assets = db.assets.map(a => a.id === asset.id ? asset : a);
        logActivity(actorId, `updated details for asset "${asset.name}".`);
        return Promise.resolve(asset);
    },
    addAsset: (asset: Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>, actorId: string): Promise<Asset> => {
        const now = new Date().toISOString();
        const newAsset: Asset = { 
            ...asset, 
            id: `asset-${Date.now()}`, 
            movements: [],
            createdTimestamp: now,
            updatedTimestamp: now,
        };
        db.assets.push(newAsset);
        logActivity(actorId, `added a new asset: "${newAsset.name}".`);
        return Promise.resolve(newAsset);
    },
    addMultipleAssets: (assets: Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>[], actorId: string): Promise<Asset[]> => {
        const now = new Date().toISOString();
        const newAssets = assets.map(asset => ({ 
            ...asset, 
            id: `asset-${Date.now()}-${Math.random()}`, 
            movements: [],
            createdTimestamp: now,
            updatedTimestamp: now,
        }));
        db.assets.push(...newAssets);
        logActivity(actorId, `batch imported ${newAssets.length} new assets.`);
        return Promise.resolve(newAssets as Asset[]);
    },
    addAssetMovement: (assetId: string, movement: Omit<AssetMovement, 'id'>, newAssignedToId: string, actorId: string, newStatus?: AssetStatus): Promise<Asset | null> => {
        const asset = db.assets.find(a => a.id === assetId);
        if (!asset) return Promise.resolve(null);
        
        const newMovement = { ...movement, id: `mov-${Date.now()}` };
        asset.movements.push(newMovement);
        asset.updatedTimestamp = new Date().toISOString();

        if (newAssignedToId) asset.assignedToId = newAssignedToId;
        if (newStatus) asset.status = newStatus;

        logActivity(actorId, `logged a movement for asset "${asset.name}" from ${movement.from} to ${movement.to}.`);

        return Promise.resolve(asset);
    },
    disposeAsset: (assetId: string, reason: string, disposalDate: string, actorId: string, documentUrl?: string): Promise<Asset | null> => {
        const asset = db.assets.find(a => a.id === assetId);
        if (!asset) return Promise.resolve(null);
        
        asset.status = AssetStatus.DISPOSED;
        asset.updatedTimestamp = new Date().toISOString();
        
        const movement: Omit<AssetMovement, 'id'> = {
            movementDate: disposalDate,
            movementType: AssetMovementType.EXTERNAL,
            from: asset.assignedToId,
            to: 'Disposed',
            reason,
            documentUrl
        };
        api.addAssetMovement(assetId, movement, 'disposed', actorId);

        logActivity(actorId, `disposed asset "${asset.name}" for reason: ${reason}.`);
        return Promise.resolve(asset);
    },

    // --- Jobs ---
    getServiceJobs: (): Promise<ServiceJob[]> => {
        // Simulate a server-side check for overdue jobs upon fetching
        checkAndEscalateJobs();
        return Promise.resolve(db.serviceJobs);
    },
    updateServiceJob: (job: ServiceJob, actorId: string): Promise<ServiceJob> => {
        const oldJob = db.serviceJobs.find(j => j.id === job.id);
        
        job.updatedDate = new Date().toISOString();

        if (oldJob) {
            if (oldJob.status !== job.status) {
                logActivity(actorId, `updated the status of job "${job.title}" to ${job.status}.`);
            }
            if (oldJob.assignedToId !== job.assignedToId && job.assignedToId !== actorId) {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}`,
                    userIds: [job.assignedToId],
                    message: `The service job '${job.title}' has been reassigned to you.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                };
                db.notifications.unshift(newNotification);
            }
        }
        
        db.serviceJobs = db.serviceJobs.map(j => j.id === job.id ? job : j);
        return Promise.resolve(job);
    },
    addJobComment: (jobId: string, comment: Omit<JobComment, 'id' | 'timestamp'>): Promise<ServiceJob | null> => {
        const job = db.serviceJobs.find(j => j.id === jobId);
        if (!job) return Promise.resolve(null);
        
        const newComment: JobComment = {
            ...comment,
            id: `comment-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        job.comments.push(newComment);
        job.updatedDate = newComment.timestamp;
        
        const author = db.users.find(u => u.id === comment.authorId);
        logActivity(comment.authorId, `added a comment to job "${job.title}".`);

        return Promise.resolve(job);
    },

    // --- Productivity ---
    getTasks: (userId: string): Promise<Task[]> => {
        const userTasks = db.tasks.filter(t => t.assignedTo === userId || t.creatorId === userId);
        return Promise.resolve(userTasks);
    },
    updateTask: (task: Task, actorId: string): Promise<Task> => {
        const oldTask = db.tasks.find(t => t.id === task.id);
        if (oldTask && !oldTask.isCompleted && task.isCompleted) {
            logActivity(actorId, `completed the task: "${task.title}".`);
        }
        db.tasks = db.tasks.map(t => t.id === task.id ? task : t);
        return Promise.resolve(task);
    },
    addTask: (task: Omit<Task, 'id' | 'createdDate'>, actorId: string): Promise<Task> => {
        const newTask = { ...task, id: `task-${Date.now()}`, createdDate: new Date().toISOString() };
        db.tasks.push(newTask);
        const assignee = db.users.find(u => u.id === task.assignedTo);
        logActivity(actorId, `created a new task "${task.title}" and assigned it to ${assignee?.name || 'a user'}.`);
        return Promise.resolve(newTask);
    },
    getAnnouncements: (): Promise<Announcement[]> => Promise.resolve(db.announcements),
    addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>): Promise<Announcement> => {
        const newAnn = { ...ann, id: `ann-${Date.now()}`, timestamp: new Date().toISOString() };
        db.announcements.push(newAnn);
        logActivity(ann.authorId, `posted a new announcement: "${ann.title}".`);
        return Promise.resolve(newAnn);
    },

    // --- Messaging ---
    getThreads: (userId: string): Promise<ChatThread[]> => {
        const threads = db.chatThreads.filter(t => t.participants.includes(userId));
        return Promise.resolve(threads);
    },
    addMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<ChatThread | null> => {
        const thread = db.chatThreads.find(t => t.id === threadId);
        if (!thread) return Promise.resolve(null);
        const newMessage = { ...message, id: `msg-${Date.now()}`, timestamp: new Date().toISOString() };
        thread.messages.push(newMessage);
        thread.lastMessageTimestamp = newMessage.timestamp;
        return Promise.resolve(thread);
    },
    createChatThread: (title: string, participantIds: string[], initialMessage: Omit<Message, 'id' | 'timestamp'>): Promise<ChatThread> => {
        const newMessage: Message = {
            ...initialMessage,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        const newThread: ChatThread = {
            id: `thread-${Date.now()}`,
            title,
            participants: participantIds,
            messages: [newMessage],
            lastMessageTimestamp: newMessage.timestamp,
        };

        db.chatThreads.unshift(newThread);
        return Promise.resolve(newThread);
    },

    // --- Notifications ---
    getNotifications: (userId: string): Promise<Notification[]> => {
        return Promise.resolve(db.notifications.filter(n => n.userIds.includes(userId)));
    },
    markAllAsRead: (userId: string): Promise<Notification[]> => {
        db.notifications.forEach(n => {
            if (n.userIds.includes(userId)) {
                n.isRead = true;
            }
        });
        return api.getNotifications(userId);
    }
};

export const useApi = () => api;