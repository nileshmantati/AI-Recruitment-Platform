import { useState } from 'react';
import { T } from '../Js/theme.js';
import Badge from '../ui/Badge.jsx'
import { ChevronDown } from "lucide-react";

const FAQ = () => {
    const [open, setOpen] = useState(0);

    const faqs = [
        { q: "How accurate is the AI candidate matching?", a: "Our models are trained on role-specific data and typically reach 90-95% alignment with human recruiter rankings." },
        { q: "Can I integrate with my existing ATS?", a: "Yes, Hirelytics AI connects with most major applicant tracking systems via API." },
        { q: "Is candidate data kept secure?", a: "All data is encrypted at rest and in transit, with SOC 2 compliant infrastructure." },
        { q: "Do you offer a free trial?", a: "Every plan includes a 14-day free trial with full feature access." },
    ];
    return (
        <section className="mx-auto max-w-3xl px-6 py-10">
            <div className="mb-12 text-center">
                <Badge color={T.secondary}>FAQ</Badge>
                <h2 className="mt-4 text-4xl! font-extrabold! text-slate-900">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
                {faqs.map((f, i) => (
                    <div key={f.q} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                        <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-6 py-3.5 text-left">
                            <span className="text-sm font-semibold text-slate-900">{f.q}</span>
                            <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} style={{ display: "grid" }}>
                            <div className="overflow-hidden">
                                <p className="px-6 text-start text-sm leading-relaxed text-slate-600">{f.a}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default FAQ