import { Link } from 'react-router-dom';
import { Section, Mv, fadeUp } from './Shared';
import { T } from '../../Js/theme';
import PrimaryButton from '../PrimaryButton';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <Section className="py-12 sm:py-16" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="max-w-xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Ready to explore the recruitment workflow?
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Create a job, receive applications, let AI analyze resumes, and manage your pipeline
            — all in one connected platform.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <PrimaryButton className="px-6 py-3 text-sm rounded-xl">
                Get Started <ArrowRight size={16} />
              </PrimaryButton>
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors no-underline"
            >
              <Sparkles size={14} />
              Explore Features
            </Link>
          </div>
        </Mv>
      </div>
    </Section>
  );
}
