export const NODE_CATEGORIES = [
    { id: 'trigger', label: 'Triggers', color: '#10b981', icon: 'zap' },
    { id: 'action', label: 'Actions', color: '#3b82f6', icon: 'play' },
    { id: 'logic', label: 'Logic', color: '#f59e0b', icon: 'git-branch' },
];

export const NODE_DEFINITIONS: Record<string, any> = {
    webhook: {
        type: 'trigger',
        label: 'Webhook',
        description: 'Trigger workflow via HTTP request',
        icon: 'globe',
        defaultConfig: { method: 'POST', path: '/webhook' },
    },
    schedule: {
        type: 'trigger',
        label: 'Schedule',
        description: 'Run workflow on a recurring schedule',
        icon: 'clock',
        defaultConfig: { cron: '0 * * * *' },
    },
    slack: {
        type: 'action',
        label: 'Slack',
        description: 'Send a message to a Slack channel',
        icon: 'message-square',
        defaultConfig: { channel: '', text: '' },
    },
    email: {
        type: 'action',
        label: 'Email',
        description: 'Send an email via SMTP',
        icon: 'mail',
        defaultConfig: { to: '', subject: '', body: '' },
    },
    condition: {
        type: 'logic',
        label: 'Condition',
        description: 'Route workflow based on boolean logic',
        icon: 'split',
        defaultConfig: { condition: '' },
    },
};
