import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import FeaturedCollection from "@/components/FeaturedCollection";
import WhyChoose from "@/components/WhyChoose";
import AboutSection from "@/components/AboutSection";
import BibleVerse from "@/components/BibleVerse";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
        <main className="bg-black text-white">
  <Hero />
  <CategorySection />
  <FeaturedCollection />
  <WhyChoose />
  <AboutSection />
  <BibleVerse />
</main>
    </>
  );
}