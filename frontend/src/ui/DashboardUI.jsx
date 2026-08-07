import { motion } from 'framer-motion';

export const KpiCard = ({ icon: Icon, label, value, color, badge = null, subtitle = null }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="group relative p-5 rounded-[2rem] bg-white border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500"
            style={{
                '--hover-color': color,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 20px 25px -5px ${color}20, 0 8px 10px -6px ${color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)';
            }}
        >
            {/* Background Texture & Glows */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply" />
            <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700"
                style={{ backgroundColor: color }}
            />
            <div
                className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 delay-100"
                style={{ backgroundColor: color }}
            />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div
                    className="p-3.5 rounded-2xl shadow-inner border border-white/50 backdrop-blur-md"
                    style={{ backgroundColor: `${color}15`, color: color, boxShadow: `inset 0 2px 4px 0 ${color}15` }}
                >
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                {badge && (
                    <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-extrabold px-2.5 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 uppercase tracking-wider bg-white/50 backdrop-blur-sm"
                        style={{ color: color, borderColor: `${color}30` }}
                    >
                        {badge}
                    </motion.span>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-slate-500 transition-colors">{label}</p>
                <h3 className="text-3xl font-black text-slate-800 flex items-baseline tracking-tight">
                    {value}
                    {subtitle && <span className="text-sm font-semibold text-slate-400 ml-2 tracking-normal">{subtitle}</span>}
                </h3>
            </div>
        </motion.div>
    );
};