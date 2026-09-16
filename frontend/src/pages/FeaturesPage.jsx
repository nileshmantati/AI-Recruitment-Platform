import CompactIntro from '../components/Features/CompactIntro';
import ResumeIntelligence from '../components/Features/ResumeIntelligence';
import CandidateMatching from '../components/Features/CandidateMatching';
import EvaluationSearch from '../components/Features/EvaluationSearch';
import ConnectedWorkflow from '../components/Features/ConnectedWorkflow';
import RecruiterWorkspace from '../components/Features/RecruiterWorkspace';
import RecruitmentAnalytics from '../components/Features/RecruitmentAnalytics';
import CandidateExperience from '../components/Features/CandidateExperience';
import CompanyProfile from '../components/Features/CompanyProfile';
import SecurityAccess from '../components/Features/SecurityAccess';
import FinalWorkflowSummary from '../components/Features/FinalWorkflowSummary';

export default function FeaturesPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <CompactIntro />
      <ResumeIntelligence />
      <CandidateMatching />
      <EvaluationSearch />
      <ConnectedWorkflow />
      <RecruiterWorkspace />
      <RecruitmentAnalytics />
      <CandidateExperience />
      <CompanyProfile />
      <SecurityAccess />
      <FinalWorkflowSummary />
    </div>
  );
}
