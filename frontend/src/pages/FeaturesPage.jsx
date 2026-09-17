import CompactIntro from '../components/Features/CompactIntro';
import AIEngine from '../components/Features/AIEngine';
import RecruiterWorkspace from '../components/Features/RecruiterWorkspace';
import CompanyProfile from '../components/Features/CompanyProfile';
import CandidateExperience from '../components/Features/CandidateExperience';
import StandaloneTools from '../components/Features/StandaloneTools';
import SecurityAccess from '../components/Features/SecurityAccess';
import ProcessCTA from '../components/Features/ProcessCTA';

export default function FeaturesPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <CompactIntro />
      <AIEngine />
      <RecruiterWorkspace />
      <CompanyProfile />
      <CandidateExperience />
      <StandaloneTools />
      <SecurityAccess />
      <ProcessCTA />
    </div>
  );
}
