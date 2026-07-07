import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="bg-black pt-32 text-white">

        {/* Hero */}
        <section className="border-b border-white/10 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Contact Assorted SG
          </p>

          <h1 className="mt-5 text-5xl font-black uppercase md:text-7xl">
            We'd Love To
            <span className="block text-red-600">
              Hear From You
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-400">
            Questions, orders, collaborations, or feedback?
            Our team is always ready to help.
          </p>
        </section>

        {/* Contact Cards */}
        <section className="mx-auto mt-20 max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition hover:border-red-600">
              <Phone className="mx-auto text-red-600" size={42} />
              <h3 className="mt-6 text-xl font-bold">Phone</h3>
              <p className="mt-4 text-gray-400">
                +63 969 312 0935
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition hover:border-red-600">
              <Mail className="mx-auto text-red-600" size={42} />
              <h3 className="mt-6 text-xl font-bold">Email</h3>
              <p className="mt-4 text-gray-400">
                assortedsg@gmail.com
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition hover:border-red-600">
              <MapPin className="mx-auto text-red-600" size={42} />
              <h3 className="mt-6 text-xl font-bold">Address</h3>
              <p className="mt-4 text-gray-400">
                Taguig, Philippines
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-center transition hover:border-red-600">
              <MessageCircle className="mx-auto text-red-600" size={42} />
              <h3 className="mt-6 text-xl font-bold">Messenger</h3>
              <p className="mt-4 text-gray-400">
                Chat with us anytime
              </p>
            </div>

          </div>
        </section>

        {/* Contact Form */}
        <section className="mx-auto mt-24 max-w-5xl px-6">
          <div className="rounded-3xl border border-white/10 bg-[#111] p-10">

            <h2 className="text-4xl font-black">
              Send Us A Message
            </h2>

            <p className="mt-4 text-gray-400">
              Fill out the form below and we'll respond as soon as possible.
            </p>

            <form className="mt-10 space-y-6">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-xl border border-gray-700 bg-black px-5 py-4 outline-none transition focus:border-red-600"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-gray-700 bg-black px-5 py-4 outline-none transition focus:border-red-600"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-xl border border-gray-700 bg-black px-5 py-4 outline-none transition focus:border-red-600"
              />

              <textarea
                rows={6}
                placeholder="Message"
                className="w-full rounded-xl border border-gray-700 bg-black px-5 py-4 outline-none transition focus:border-red-600"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 py-4 font-bold uppercase transition hover:bg-red-700"
              >
                Send Message
              </button>

            </form>

          </div>
        </section>

{/* Business Hours */}

<section className="mx-auto mt-24 max-w-5xl px-6">

  <div className="rounded-3xl border border-white/10 bg-[#111] p-10">

    <div className="flex items-center gap-4">

      <Clock size={34} className="text-red-600" />

      <h2 className="text-3xl font-black">
        Business Hours
      </h2>

    </div>

    <div className="mt-10 rounded-2xl border border-green-600/30 bg-green-600/10 p-8 text-center">

      <h3 className="text-3xl font-black text-green-400">
        Open 24/7
      </h3>

      <p className="mt-4 text-lg text-gray-300">
        Our online store is open 24 hours a day, 7 days a week.
      </p>

      <p className="mt-3 text-gray-400">
        You can browse products and place orders anytime.
        Customer support responses may vary depending on availability.
      </p>

    </div>

  </div>

</section>
           
        {/* Follow Us */}
<section className="mx-auto mt-24 mb-24 max-w-5xl px-6 text-center">

  <h2 className="text-4xl font-black uppercase">
    Follow Us
  </h2>

  <p className="mt-4 text-gray-400">
    Stay connected and never miss our latest drops.
  </p>

  <div className="mt-10 flex justify-center gap-8">

    <a
      href="https://www.facebook.com/profile.php?id=61591374251267"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/10 bg-[#111] p-5 transition hover:scale-110 hover:border-red-600"
    >
      <Image
        src="/social/facebook.png"
        alt="Facebook"
        width={36}
        height={36}
      />
    </a>

    <a
      href="https://instagram.com/YOUR_PAGE"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/10 bg-[#111] p-5 transition hover:scale-110 hover:border-red-600"
    >
      <Image
        src="/social/instagram.png"
        alt="Instagram"
        width={36}
        height={36}
      />
    </a>

    <a
      href="https://m.me/YOUR_PAGE"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/10 bg-[#111] p-5 transition hover:scale-110 hover:border-red-600"
    >
      <Image
        src="/social/messenger.png"
        alt="Messenger"
        width={36}
        height={36}
      />
    </a>

  </div>

</section>

      </main>

      <Footer />
    </>
  );
}