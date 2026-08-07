import NotificationsSettings from '../../Settings/NotificationsSettings';
import SecuritySettings from '../../Settings/SecuritySettings';
import PrivacySettings from '../../Settings/PrivacySettings';
import AppearanceSettings from '../../Settings/AppearanceSettings';
import CandidateBillingSettings from '../../Settings/CandidateBillingSettings';
import CandidateHelpSettings from '../../Settings/CandidateHelpSettings';
import DangerZoneSettings from '../../Settings/DangerZoneSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const CandidateSettingsPage = () => {
    const location = useLocation();
    const hashSection = location.hash.replace('#', '') || 'notifications';

    const renderSection = () => {
        switch (hashSection) {
            case 'notifications': return <NotificationsSettings />;
            case 'security': return <SecuritySettings />;
            case 'privacy': return <PrivacySettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'billing': return <CandidateBillingSettings />;
            case 'help': return <CandidateHelpSettings />;
            case 'danger': return <DangerZoneSettings />;
            default: return <NotificationsSettings />;
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-50 rounded-tl-2xl overflow-hidden shadow-inner border-t border-l border-slate-200">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={hashSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-4xl mx-auto pb-20"
                    >
                        {renderSection()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CandidateSettingsPage;
