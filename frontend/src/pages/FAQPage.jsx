import { useState, useMemo, useEffect } from 'react';
import FAQIntro from '../components/FAQ/FAQIntro';
import FAQFilters from '../components/FAQ/FAQFilters';
import FAQAccordion from '../components/FAQ/FAQAccordion';
import AIHumanDecision from '../components/FAQ/AIHumanDecision';
import StillHaveQuestions from '../components/FAQ/StillHaveQuestions';
import { FAQ_ITEMS, FAQ_CATEGORIES } from '../components/FAQ/faqData';
import { T } from '../Js/theme';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  // Default first key question to be open
  const [openItems, setOpenItems] = useState(() => new Set(['ai-1']));

  useEffect(() => {
    document.title = 'FAQ — AI Recruitment Platform';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return FAQ_ITEMS;
    return FAQ_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // Compute item counts per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    FAQ_CATEGORIES.forEach((cat) => {
      if (cat === 'All') {
        counts['All'] = FAQ_ITEMS.length;
      } else {
        counts[cat] = FAQ_ITEMS.filter((item) => item.category === cat).length;
      }
    });
    return counts;
  }, []);

  // Toggle individual accordion items
  const toggleItem = (id) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50" style={{ background: `radial-gradient(100% 100% at 50% 0%, ${T.primary}12, transparent 60%), radial-gradient(100% 100% at 90% 10%, ${T.secondary}12, transparent 50%), ${T.bg}` }}>
      {/* 1. Header without Search Bar */}
      <FAQIntro />

      {/* 2. Category Filter Tabs */}
      <FAQFilters
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* 3. The Master Data-Driven Accordion with Scroll Animations */}
      <FAQAccordion
        items={filteredItems}
        openItems={openItems}
        toggleItem={toggleItem}
      />

      {/* 4. Streamlined AI + Human Decision Section */}
      <AIHumanDecision />

      {/* 5. Compact Closing Section */}
      <StillHaveQuestions />
    </div>
  );
}
