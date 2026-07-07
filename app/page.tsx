import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import FeaturedCollection from "@/components/FeaturedCollection";
import NewArrivals from "@/components/NewArrivals";
import WhyChoose from "@/components/WhyChoose";
import AboutSection from "@/components/AboutSection";
import BibleVerse from "@/components/BibleVerse";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export default function Home() {

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="bg-black text-white">
        <Hero />

        <FeaturedCollection />
        
        <NewArrivals />

        <CategorySection />

        <WhyChoose />

        <AboutSection />

        <BibleVerse />
      </main>

      <Footer />
    </>
  );
}