/* eslint-disable react-refresh/only-export-components */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { stagger } from './SharedData';

export const Section = ({ children, className = '', id, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={stagger}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
};

export const Mv = motion.div;
