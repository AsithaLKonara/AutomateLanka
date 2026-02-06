'use client';

import React from 'react';

export default function IntegrationsSection() {
    const integrations = [
        'Slack', 'Google Sheets', 'GitHub', 'Discord', 'Notion',
        'Airtable', 'Telegram', 'Trello', 'WhatsApp', 'Zoom'
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-white/2">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm font-bold text-white/40 uppercase tracking-widest mb-12">Trusted by 2,000+ automations across</p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 hover:opacity-80 transition-opacity duration-700">
                    {integrations.map(name => (
                        <div key={name} className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 grayscale hover:grayscale-0 transition-all">
                                <img
                                    src={`/icons/integrations/${name.toLowerCase().replace(/ /g, '-')}.svg`}
                                    alt={name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://cdn.worldvectorlogo.com/logos/${name.toLowerCase()}.svg`;
                                    }}
                                />
                            </div>
                            <span className="text-[10px] font-medium">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
