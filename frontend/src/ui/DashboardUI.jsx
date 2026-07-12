export const KpiCard = ({ icon: Icon, label, value, color }) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-transform ease-in-out hover:-translate-y-2 hover:shadow-lg">
            <div className="absolute -right-5 -top-5 h-18 w-18 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-150"
                style={{ background: color }} />
            <div className="mb-4 flex items-center justify-between" >
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: `${color}18`, color }}
                >
                    <Icon size={18} />
                </div>
            </div >
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
        </div >
    );
}