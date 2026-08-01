import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4">
            {/* Ambient background decoration */}
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50"></div>

            <div className="relative z-10 max-w-lg w-full text-center">
                {/* Visual Icon Badge */}
                <div className="inline-flex items-center justify-center p-3 mb-6 bg-red-50 border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
                    <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
                        <AlertTriangle className="w-10 h-10 animate-spin-slow" />
                    </div>
                </div>

                {/* Main 404 Text Gradient */}
                <h1 className="text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-red-700 via-red-500 to-rose-300 mb-2 drop-shadow-sm">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                    Page Not Found
                </h2>
                <p className="text-base text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Sorry, we couldn’t find the page you’re looking for. It might have been moved, renamed, or no longer exists.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;