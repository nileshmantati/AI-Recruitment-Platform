import { useState, useRef } from 'react';
import { T } from '../../Js/theme.js';
import { Sparkles, UploadCloud, Search, CheckCircle, FileText, Bot, User, ArrowRight, X } from 'lucide-react';

const mockCandidates = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Senior Frontend Engineer",
        score: 94,
        summary: "Exceptional React architecture skills. Matches your requirement for state management expertise perfectly.",
        strengths: ["React", "Redux", "System Design"],
        status: "Shortlisted"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Full Stack Developer",
        score: 88,
        summary: "Strong backend background with Node.js. Missing deep Tailwind CSS experience but highly adaptable.",
        strengths: ["Node.js", "Express", "PostgreSQL"],
        status: "Pending"
    },
    {
        id: 3,
        name: "Priya Sharma",
        role: "UI/UX Designer & Dev",
        score: 82,
        summary: "Great eye for design and competent in CSS. Might need ramp-up time on complex React logic.",
        strengths: ["Tailwind", "Figma", "CSS"],
        status: "Evaluated"
    }
];

const RecruiterResumeAIPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500); // Mock search delay
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        setDragOver(false);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000); // Mock scan delay
    };

    const prevent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 80) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
        return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    return (
        <main className="flex-1 pb-12 overflow-x-hidden">
            <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        <Sparkles className="text-indigo-500" size={28} />
                        Resume AI
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
                        Supercharge your hiring. Use AI to instantly search your talent pool, extract skills from bulk resumes, and rank candidates with precision.
                    </p>
                </div>

                {/* AI Search Bar */}
                <div className="relative rounded-2xl bg-white shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden group transition-all focus-within:ring-2 focus-within:ring-indigo-400">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Bot className={`w-6 h-6 transition-colors ${isScanning ? 'text-indigo-600 animate-pulse' : 'text-indigo-400 group-focus-within:text-indigo-600'}`} />
                    </div>
                    <form onSubmit={handleSearch} className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 sm:py-5 text-sm sm:text-base bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400"
                            placeholder="Ask AI: 'Find me Senior React developers with 5+ years experience willing to relocate'"
                        />
                        <button
                            type="submit"
                            disabled={isScanning}
                            className="mr-2 my-2 px-6 rounded-xl font-bold text-white text-sm whitespace-nowrap transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            {isScanning ? 'Scanning...' : 'Search'}
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Upload & Quick Stats */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Drag & Drop Upload */}
                        <div
                            className={`relative rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer ${dragOver ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}
                            onDragOver={(e) => { prevent(e); setDragOver(true); }}
                            onDragEnter={(e) => { prevent(e); setDragOver(true); }}
                            onDragLeave={(e) => { prevent(e); setDragOver(false); }}
                            onDrop={handleFileUpload}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />

                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 shadow-inner">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Bulk Parse Resumes</h3>
                            <p className="text-xs font-medium text-slate-500 mb-6 px-4">
                                Drag & drop multiple PDF/DOCX files here to automatically extract skills and rank candidates.
                            </p>
                            <button className="rounded-xl px-5 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors w-full">
                                Browse Files
                            </button>
                        </div>

                        {/* AI Insights Summary Card */}
                        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <Sparkles size={16} className="text-indigo-400" />
                                Pool Insights
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-3xl font-extrabold tracking-tight">142</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Total Resumes Scanned</p>
                                </div>
                                <div className="pt-4 border-t border-slate-700/50">
                                    <p className="text-sm font-semibold text-slate-200 mb-2">Most Common Missing Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 rounded bg-slate-800 text-xs font-medium border border-slate-700 text-slate-300">Docker</span>
                                        <span className="px-2 py-1 rounded bg-slate-800 text-xs font-medium border border-slate-700 text-slate-300">GraphQL</span>
                                        <span className="px-2 py-1 rounded bg-slate-800 text-xs font-medium border border-slate-700 text-slate-300">AWS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: AI Leaderboard */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">AI Top Matches</h3>
                                    <p className="text-sm text-slate-500 mt-1">Candidates ranked by AI based on your active jobs</p>
                                </div>
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                                    View All <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Scanning State */}
                            {isScanning ? (
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                                        <Bot className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">Analyzing Resumes...</h4>
                                    <p className="text-sm text-slate-500 max-w-sm">The AI is extracting core competencies, scoring relevancy, and cross-referencing with your job descriptions.</p>
                                </div>
                            ) : (
                                /* Candidate Grid */
                                <div className="space-y-4">
                                    {mockCandidates.map((candidate, idx) => (
                                        <div key={candidate.id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all bg-slate-50/50 hover:bg-white relative overflow-hidden">

                                            {/* Rank Badge */}
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            {/* Left: Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-indigo-600 border border-indigo-50 font-bold text-lg">
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900 text-lg">{candidate.name}</h4>
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{candidate.role}</span>
                                                    </div>

                                                    {/* AI Summary */}
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-sm text-slate-600 font-medium italic">"{candidate.summary}"</p>
                                                    </div>

                                                    {/* Strengths */}
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {candidate.strengths.map((skill, i) => (
                                                            <span key={i} className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
                                                                <CheckCircle size={10} /> {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Score & Actions */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 min-w-[120px]">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Match</p>
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-lg font-black border-2 ${getScoreColor(candidate.score)}`}>
                                                        {candidate.score}%
                                                    </span>
                                                </div>
                                                <button className="mt-0 sm:mt-3 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 rounded-xl text-sm font-bold text-slate-600 transition-colors shadow-sm">
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RecruiterResumeAIPage;
