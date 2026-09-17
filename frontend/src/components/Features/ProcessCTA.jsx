import { Section, Mv } from './Shared';
import { fadeUp } from './SharedData';
import { T } from '../../Js/theme';
import { ArrowRight, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProcessCTA() {
  return (
    <Section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Mv variants={fadeUp}>
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-md"
            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: 'white' }}>
            <Workflow size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            See these features in action.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            We’ve built powerful modular features, but the real magic happens when they work together. 
            Walk through the complete chronological journey of a candidate moving through the platform.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/how-it-works" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
              View the Recruitment Pipeline <ArrowRight size={16} />
            </Link>
          </div>
        </Mv>
      </div>
    </Section>
  );
}
