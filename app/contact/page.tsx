import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">

          <h1 className="text-center text-5xl font-black uppercase">
            Contact Us
          </h1>

          <p className="mt-6 text-center text-gray-400">
            We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>

          <form className="mt-16 space-y-6 rounded-2xl border border-gray-800 bg-[#111] p-8">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-lg border border-gray-700 bg-black px-4 py-4 outline-none focus:border-red-600"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full rounded-lg border border-gray-700 bg-black px-4 py-4 outline-none focus:border-red-600"
            />

            <textarea
              rows={6}
              placeholder="Your Message"
              className="w-full rounded-lg border border-gray-700 bg-black px-4 py-4 outline-none focus:border-red-600"
            />

            <button
              className="w-full rounded-lg bg-red-600 py-4 font-bold uppercase transition hover:bg-red-700"
            >
              Send Message
            </button>

          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}