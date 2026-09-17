import JourneyOverview from '../components/HowItWorks/JourneyOverview';
import CreateJob from '../components/HowItWorks/CreateJob';
import CandidateApplication from '../components/HowItWorks/CandidateApplication';
import ResumeAnalysis from '../components/HowItWorks/ResumeAnalysis';
import CandidateMatching from '../components/HowItWorks/CandidateMatching';
import Evaluation from '../components/HowItWorks/Evaluation';
import Pipeline from '../components/HowItWorks/Pipeline';
import ShortlistInterview from '../components/HowItWorks/ShortlistInterview';
import Analytics from '../components/HowItWorks/Analytics';
import DualJourney from '../components/HowItWorks/DualJourney';
import ResumeJourney from '../components/HowItWorks/ResumeJourney';
import AIBoundary from '../components/HowItWorks/AIBoundary';
import WorkflowSummary from '../components/HowItWorks/WorkflowSummary';
import FinalCTA from '../components/HowItWorks/FinalCTA';

export default function HowItWorksPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <JourneyOverview />
      <CreateJob />
      <CandidateApplication />
      <ResumeAnalysis />
      <CandidateMatching />
      <Evaluation />
      <Pipeline />
      <ShortlistInterview />
      <Analytics />
      <DualJourney />
      <ResumeJourney />
      <AIBoundary />
      <WorkflowSummary />
      <FinalCTA />
    </div>
  );
}
