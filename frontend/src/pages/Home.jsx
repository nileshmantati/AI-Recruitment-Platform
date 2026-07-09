
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import { T } from '../Js/theme.js';
import FAQ from '../components/FAQ.jsx';

const Home = () => {
    return (
        <>
            <section className="text-center" style={{ background: T.bg }}>
                <Hero />
                <Features />
                <HowItWorks />
                <FAQ />
            </section>
        </>
    )
}

export default Home