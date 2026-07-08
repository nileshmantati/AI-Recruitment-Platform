import React from 'react'
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import { T } from '../Js/theme.js';
import FAQ from '../components/FAQ.jsx';

const Home = () => {
    const { auth } = useAuth();

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