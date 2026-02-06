'use client';

import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Key, Camera, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                <p className="text-white/40 mt-1">Manage your personal information and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-1">
                    {[
                        { label: 'General', icon: User, active: true },
                        { label: 'Security', icon: Shield, active: false },
                        { label: 'Notifications', icon: Bell, active: false },
                        { label: 'API Keys', icon: Key, active: false },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.active
                                    ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
                    >
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-3xl font-bold">
                                JD
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold text-white">John Doe</h2>
                            <p className="text-sm text-white/40">Premium Plan • Member since Jan 2026</p>
                            <button className="mt-3 text-xs font-bold text-[#8b5cf6] hover:underline">Change Profile Photo</button>
                        </div>
                    </motion.div>

                    {/* General Settings Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-white/20" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="John Doe"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-white/20" />
                                    </div>
                                    <input
                                        type="email"
                                        defaultValue="john@example.com"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold">Two-Factor Authentication</div>
                                    <div className="text-xs text-white/40">Add an extra layer of security to your account.</div>
                                </div>
                                <div className="w-12 h-6 bg-[#8b5cf6] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/40 hover:text-white transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                        <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
                        <p className="text-xs text-red-400/60 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500 text-white transition-all">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
