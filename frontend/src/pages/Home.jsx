import { motion } from 'framer-motion';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import { T } from '../Js/theme.js';
import FAQ from '../components/FAQ.jsx';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Home = () => {
    return (
        <>
            <motion.section
                className="text-center"
                style={{ background: T.bg }}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants}><Hero /></motion.div>
                <motion.div variants={itemVariants}><Features /></motion.div>
                <motion.div variants={itemVariants}><HowItWorks /></motion.div>
                <motion.div variants={itemVariants}><FAQ /></motion.div>
            </motion.section>
        </>
    )
}

export default Home