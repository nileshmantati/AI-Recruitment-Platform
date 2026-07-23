import { useState, forwardRef } from "react";
import { T } from "../Js/theme";

export const GlassCard = ({ children, className = "", style = {} }) => (
    <div
        className={`rounded-2xl border border-white/40 shadow-xl backdrop-blur-xl ${className}`}
        style={{ background: "rgba(255,255,255,0.65)", ...style }}
    >
        {children}
    </div>
);

export const TextField = forwardRef(({ icon: Icon, label, type = "text", placeholder, rightIcon, onRightClick, error, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const handleBlur = (e) => {
        setFocused(false);
        if (props.onBlur) props.onBlur(e);
    };

    return (
        <div className="mb-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
            <div
                className="flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 transition-all duration-200"
                style={{
                    borderColor: error ? "#EF4444" : (focused ? T.primary : "#E2E8F0"),
                    boxShadow: error ? "0 0 0 4px rgba(239, 68, 68, 0.1)" : (focused ? `0 0 0 4px ${T.primary}1A` : "none")
                }}
            >
                <Icon size={17} className={error ? "text-red-400" : "text-slate-400"} />
                <input
                    type={type}
                    placeholder={placeholder}
                    onFocus={() => setFocused(true)}
                    {...props}
                    onBlur={handleBlur}
                    ref={ref}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {rightIcon && <button type="button" onClick={onRightClick} className="text-slate-400">{rightIcon}</button>}
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
TextField.displayName = "TextField";


export const GhostButton = ({ children, className = "", ...props }) => (
    <button
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${className}`}
        style={{ borderColor: "#E2E8F0", color: "#1E293B", background: "white" }}
        {...props}
    >
        {children}
    </button>
);