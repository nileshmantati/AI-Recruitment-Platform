/* eslint-disable react-refresh/only-export-components */
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const Section = ({ children, className = '', id, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduced = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={reduced ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : stagger}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
};
