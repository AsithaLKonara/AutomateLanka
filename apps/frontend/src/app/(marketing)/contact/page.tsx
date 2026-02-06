'use client';

import React from 'react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';
import { Mail, MessageSquare, Twitter, Github, Send } from 'lucide-react';

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        alert('Thank you for your message! Our team will get back to you shortly.');
    };

    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
            <SiteHeader />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
                    {/* Contact Info (Left) */}
                    <div className="lg:w-1/3">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">
                            Let's Connect
                        </h1>
                        <p className="text-white/50 text-lg mb-12 leading-relaxed">
                            Have questions about our platform or want to discuss enterprise solutions? Our team is here to help you automate your future.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <Mail className="text-[#8b5cf6]" size={24} />
                                </div>
                                <div>
                                    <div className="font-bold mb-1">Email Support</div>
                                    <div className="text-white/40 text-sm italic">support@automatelanka.com</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <MessageSquare className="text-[#8b5cf6]" size={24} />
                                </div>
                                <div>
                                    <div className="font-bold mb-1">Sales Inquiries</div>
                                    <div className="text-white/40 text-sm italic">sales@automatelanka.com</div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-16">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8b5cf6] mb-6">Socials</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 transition-all">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 transition-all">
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form (Right) */}
                    <div className="lg:w-2/3 bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#8b5cf6]/10 transition-colors" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-[#0e0918]/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        className="w-full bg-[#0e0918]/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-white/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Subject</label>
                                <select className="w-full bg-[#0e0918]/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all text-white/20 focus:text-white">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Sales & Partnerships</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Message</label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="How can we help?"
                                    className="w-full bg-[#0e0918]/50 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-white/20 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center justify-center gap-2 group/btn"
                            >
                                Send Message
                                <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
