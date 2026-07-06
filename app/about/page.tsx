import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">

          <h1 className="text-center text-5xl font-black uppercase">
            About Assorted SG
          </h1>

          <p className="mt-8 text-center text-lg leading-8 text-gray-300">
            Assorted SG is a clothing brand built on confidence, simplicity,
            and purpose. Our mission is to create premium everyday wear that
            helps men look good, feel confident, and stay true to who they are.
          </p>

          <div className="mt-16 rounded-2xl border border-gray-800 bg-[#111] p-8">
            <h2 className="text-3xl font-bold text-red-500">
              Our Mission
            </h2>

            <p className="mt-6 leading-8 text-gray-300">
              We believe clothing is more than fashion—it is a reflection of
              character. Every piece is designed with quality, comfort, and
              timeless style in mind.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}