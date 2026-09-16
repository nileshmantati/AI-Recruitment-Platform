import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { Users, Briefcase, Eye, Sparkles } from 'lucide-react';
import { T } from '../../Js/theme';

function CandidateExperienceCards() {
  const features = [
    { icon: Briefcase, title: 'Explore Jobs', desc: 'Browse and search all active job listings. Filter by location, type, and skills.' },
    { icon: Eye, title: 'Track Applications', desc: 'View real-time application status updates — from pending to interview scheduled.' },
    { icon: Sparkles, title: 'Resume AI', desc: 'Upload a resume for instant AI analysis. View scores, skill gaps, and improvement suggestions.' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <Mv key={i} variants={fadeUp} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 group-hover:scale-110 transition-transform" style={{ background: `${T.secondary}15`, color: T.secondary }}>
            <f.icon size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
        </Mv>
      ))}
    </div>
  );
}

export default function CandidateExperience() {
  return (
    <Section className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
          <Badge color={T.secondary}><Users size={14} className="mr-1" />CANDIDATE EXPERIENCE</Badge>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            A Separate Experience for Candidates
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Candidates get their own dashboard to explore jobs, track applications, and use the AI resume analyzer — all without accessing recruiter tools.
          </p>
        </Mv>
        <CandidateExperienceCards />
      </div>
    </Section>
  );
}
