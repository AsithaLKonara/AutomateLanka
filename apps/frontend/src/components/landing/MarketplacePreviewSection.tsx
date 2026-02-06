'use client';

import React from 'react';
import { ArrowRight, Download, Eye, Zap } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePreviewSection() {
    const workflows = [
        {
            title: "Telegram <-> OpenAI Chatbot",
            desc: "Create an intelligent chatbot on Telegram using GPT-4.",
            tags: ["AI", "Chatbot"],
            downloads: "2.4k",
            color: "bg-blue-500"
        },
        {
            title: "Google Sheets CRM",
            desc: "Turn a Google Sheet into a full backend CRM with Stripe integration.",
            tags: ["Productivity", "Sales"],
            downloads: "1.8k",
            color: "bg-green-500"
        },
        {
            title: "Twitter Auto-Poster",
            desc: "Automatically post formatted tweets from a Notion content calendar.",
            tags: ["Social", "Marketing"],
            downloads: "5.2k",
            color: "bg-cyan-500"
        },
        {
            title: "Crypto Price Alerts",
            desc: "Get real-time SMS alerts via Twilio when BTC hits a target price.",
            tags: ["Finance", "API"],
            downloads: "900",
            color: "bg-orange-500"
        },
        {
            title: "Email Parser to Notion",
            desc: "Extract data from invoice emails and save to Notion database.",
            tags: ["Automation", "Email"],
            downloads: "3.1k",
            color: "bg-purple-500"
        },
        {
            title: "PostgreSQL Backup",
            desc: "Automated daily backups of your Supabase DB to S3.",
            tags: ["DevOps", "Database"],
            downloads: "1.2k",
            color: "bg-indigo-500"
        }
    ];

    return (
        <section className="py-32 bg-[#0e0918]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl font-bold mb-4">Explore the Marketplace</h2>
                        <p className="text-xl text-white/60">2,057+ workflows ready to deploy.</p>
                    </div>
                    <Link href="/marketplace" className="flex items-center gap-2 text-n8n-primary font-bold hover:text-white transition-colors">
                        View all workflows <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map((wf, i) => (
                        <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-n8n-primary/30 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-xl ${wf.color}/20 flex items-center justify-center text-${wf.color.replace('bg-', '')}-400`}>
                                    <Zap size={24} className="text-white" fill="currentColor" />
                                </div>
                                <div className="flex gap-3 text-xs font-medium text-white/40">
                                    <span className="flex items-center gap-1 hover:text-white transition-colors"><Download size={14} /> {wf.downloads}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-2 group-hover:text-n8n-primary transition-colors">{wf.title}</h3>
                            <p className="text-sm text-white/60 mb-6 line-clamp-2">{wf.desc}</p>

                            <div className="flex gap-2">
                                {wf.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
