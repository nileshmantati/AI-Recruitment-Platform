import { Section, Mv } from './Shared';
import { fadeUp, stagger } from './SharedData';
import { T } from '../../Js/theme';
import { BrainCircuit, Braces, Zap, ShieldCheck } from 'lucide-react';

const ENGINE_FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Powered by Gemini 2.5 Flash',
    desc: 'Leverages Google’s state-of-the-art multimodal model for high-speed, high-accuracy context understanding and reasoning.',
    color: T.primary
  },
  {
    icon: Braces,
    title: 'Structured JSON Extraction',
    desc: 'Converts unstructured PDF and DOCX text into perfectly formatted JSON, standardizing every candidate profile.',
    color: T.accent
  },
  {
    icon: Zap,
    title: 'Sub-second Processing',
    desc: 'Built on a high-performance Celery task queue, ensuring bulk resume uploads are processed asynchronously and instantly.',
    color: T.secondary
  },
  {
    icon: ShieldCheck,
    title: 'Data Privacy',
    desc: 'Candidate data is securely transmitted and never used to train the underlying foundation models without explicit consent.',
    color: T.success
  }
];

export default function AIEngine() {
  return (
    <Section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${T.primary}, ${T.accent}, transparent)` }}
      />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Copy */}
          <Mv variants={fadeUp}>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-5"
              style={{ color: T.accent, background: `${T.accent}15` }}>
              <BrainCircuit size={14} /> Core Technology
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              An intelligent engine built for scale.
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg">
              At the heart of the platform is a sophisticated AI extraction and evaluation engine. 
              We don't just search for keywords — we use advanced LLM reasoning to understand context, 
              measure experience relevancy, and generate structured data from chaotic documents.
            </p>
          </Mv>

          {/* Right: Grid of tech features */}
          <Mv variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ENGINE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Mv key={feature.title} variants={fadeUp} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}15`, color: feature.color }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{feature.desc}</p>
                </Mv>
              );
            })}
          </Mv>
          
        </div>
      </div>
    </Section>
  );
}
