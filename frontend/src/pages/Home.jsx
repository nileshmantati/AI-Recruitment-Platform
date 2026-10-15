import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import FAQ from '../components/FAQ.jsx';
import { T } from '../Js/theme.js';

const Home = () => {
    return (
        <div className="text-center" style={{ background: T.bg }}>
            <Hero />
            <Features />
            <HowItWorks />
            <FAQ />
        </div>
    );
};

export default Home;