import FeaturesHero from '../components/Features/FeaturesHero';
import ResumeAnalyzerFeature from '../components/Features/ResumeAnalyzerFeature';
import CandidateMatchingFeature from '../components/Features/CandidateMatchingFeature';
import AIEvaluationSearchFeature from '../components/Features/AIEvaluationSearchFeature';
import RecruitmentManagementFeature from '../components/Features/RecruitmentManagementFeature';
import RecruitmentAnalyticsFeature from '../components/Features/RecruitmentAnalyticsFeature';
import SecurityReliabilityFeature from '../components/Features/SecurityReliabilityFeature';
import FeaturesCTA from '../components/Features/FeaturesCTA';
import { motion } from 'framer-motion';

const FeaturesPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col min-h-screen bg-slate-50"
        >
            <FeaturesHero />
            <ResumeAnalyzerFeature />
            <CandidateMatchingFeature />
            <AIEvaluationSearchFeature />
            <RecruitmentManagementFeature />
            <RecruitmentAnalyticsFeature />
            <SecurityReliabilityFeature />
            <FeaturesCTA />
        </motion.div>
    );
};

export default FeaturesPage;
