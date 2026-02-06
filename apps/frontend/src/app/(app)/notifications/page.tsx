'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, ShieldCheck, AlertTriangle, Zap, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialNotifications = [
    { id: '1', type: 'success', title: 'Workflow Executed', description: 'GitHub to Slack sync completed successfully.', time: '2 mins ago', read: false },
    { id: '2', type: 'warning', title: 'High Usage Alert', description: 'You have used 80% of your monthly execution quota.', time: '1 hour ago', read: false },
    { id: '3', type: 'system', title: 'System Update', description: 'AutomateLanka will undergo maintenance on Feb 15th.', time: '5 hours ago', read: true },
    { id: '4', type: 'success', title: 'New Integration', description: 'Shopify connector has been updated to v2.4.', time: '1 day ago', read: true },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
                    <p className="text-white/40 mt-1">Stay updated with your workflow activity and system alerts.</p>
                </div>
                <button className="text-sm font-bold text-[#8b5cf6] hover:underline px-2">Mark all as read</button>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Filter Bar */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex gap-2">
                        {['All', 'Unread', 'System'].map(f => (
                            <button key={f} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${f === 'All' ? 'bg-[#8b5cf6] text-white' : 'hover:bg-white/5 text-white/40'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] w-48 transition-all"
                        />
                    </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                        {notifications.map((n) => (
                            <motion.div
                                key={n.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`p-6 flex items-start gap-4 transition-colors relative group ${!n.read ? 'bg-[#8b5cf6]/5' : 'hover:bg-white/[0.02]'}`}
                            >
                                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6]" />}

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                        n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                    }`}>
                                    {n.type === 'success' ? <ShieldCheck size={20} /> :
                                        n.type === 'warning' ? <AlertTriangle size={20} /> :
                                            <Zap size={20} />}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={`text-sm font-bold truncate ${!n.read ? 'text-white' : 'text-white/70'}`}>{n.title}</h3>
                                        <span className="text-[10px] uppercase font-bold tracking-tight text-white/20 whitespace-nowrap">{n.time}</span>
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed truncate">{n.description}</p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                                            title="Mark as read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {notifications.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-white/20" size={32} />
                            </div>
                            <h3 className="text-white font-bold">All caught up!</h3>
                            <p className="text-white/40 text-sm mt-1">No new notifications at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
