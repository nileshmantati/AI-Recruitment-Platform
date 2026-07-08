import { T } from '../Js/theme';

const PrimaryButton = ({ children, className = "", ...props }) => (
    <button
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 ${className}`}
        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, boxShadow: `0 10px 30px -10px ${T.primary}66` }}
        {...props}
    >
        {children}
    </button>
);

export default PrimaryButton;