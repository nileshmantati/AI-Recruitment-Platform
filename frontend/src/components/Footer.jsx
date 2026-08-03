import { FaTwitter, FaLinkedin, FaGithub, FaArrowRight } from "react-icons/fa";
import { T } from "../Js/theme";

const Footer = () => {
    return (
        <footer className="relative bg-slate-950 pt-12 sm:pt-16 pb-4 text-slate-300 border-t border-slate-800/60 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 blur-[120px] rounded-full pointer-events-none opacity-40 animate-pulse" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})` }}></div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5 lg:gap-8">

                    <div className="md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                                <i className="bi bi-robot me-2" style={{ color: T.primary }}></i>
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                    AI
                                </span> Recruiter
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
                            Revolutionizing hiring with AI-powered intelligence. Find the perfect fit, faster and smarter.
                        </p>

                        <form className="flex w-full max-w-sm items-center rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-md p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
                            <input
                                type="email"
                                placeholder="Subscribe for updates"
                                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 outline-none"
                                required
                            />
                            <button
                                type="submit"
                                className="flex h-10 w-12 items-center justify-center rounded-lg text-white transition-all hover:scale-105 active:scale-95 shadow-md"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` }}
                            >
                                <FaArrowRight size={14} />
                            </button>
                        </form>
                    </div>

                    {[
                        { title: "Product", links: ["Features", "AI Matching", "Pricing", "API"] },
                        { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
                        { title: "Resources", links: ["Documentation", "Help Center", "Community", "Security"] },
                    ].map((col) => (
                        <div key={col.title}>
                            <h4 className="mb-4 sm:mb-5 text-xs font-semibold text-slate-50 uppercase tracking-wider">{col.title}</h4>
                            <ul className="space-y-3 ps-0 text-sm text-slate-400">
                                {col.links.map((l) => (
                                    <li key={l}>
                                        <a href="#" className="inline-block no-underline text-slate-400 transition-all duration-200 hover:text-blue-400 hover:translate-x-1">
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 sm:mt-16 flex flex-col gap-4 items-center justify-between border-t border-slate-800/80 pt-6 sm:flex-row">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} AI Recruiter. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        {[FaTwitter, FaLinkedin, FaGithub].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-slate-100 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;