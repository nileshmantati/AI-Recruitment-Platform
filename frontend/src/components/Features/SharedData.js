export const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const WORKFLOW_STEPS = [
  { n: 1, label: 'Resume' },
  { n: 2, label: 'Analysis' },
  { n: 3, label: 'Match' },
  { n: 4, label: 'Evaluate' },
  { n: 5, label: 'Apply' },
  { n: 6, label: 'Shortlist' },
  { n: 7, label: 'Interview' },
  { n: 8, label: 'Insight' },
];

export const chartData = [
  { name: 'Jan', applications: 120 },
  { name: 'Feb', applications: 180 },
  { name: 'Mar', applications: 250 },
  { name: 'Apr', applications: 210 },
  { name: 'May', applications: 380 },
  { name: 'Jun', applications: 450 },
  { name: 'Jul', applications: 856 },
];
