import TeamMembersSettings from '../../Settings/TeamMembersSettings';
import NotificationsSettings from '../../Settings/NotificationsSettings';
import SecuritySettings from '../../Settings/SecuritySettings';
import AISettings from '../../Settings/AISettings';
import HiringWorkflowSettings from '../../Settings/HiringWorkflowSettings';
import IntegrationsSettings from '../../Settings/IntegrationsSettings';
import AppearanceSettings from '../../Settings/AppearanceSettings';
import PrivacySettings from '../../Settings/PrivacySettings';
import DangerZoneSettings from '../../Settings/DangerZoneSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const RecruiterSettingsPage = () => {
    const location = useLocation();
    const hashSection = location.hash.replace('#', '') || 'team';

    const renderSection = () => {
        switch (hashSection) {
            case 'team': return <TeamMembersSettings />;
            case 'notifications': return <NotificationsSettings />;
            case 'security': return <SecuritySettings />;
            case 'ai': return <AISettings />;
            case 'workflow': return <HiringWorkflowSettings />;
            case 'integrations': return <IntegrationsSettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'privacy': return <PrivacySettings />;
            case 'danger': return <DangerZoneSettings />;
            default: return <TeamMembersSettings />;
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-50 rounded-tl-2xl overflow-hidden shadow-inner border-t border-l border-slate-200">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={hashSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-5xl mx-auto pb-20"
                    >
                        {renderSection()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RecruiterSettingsPage;
