import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="bg-black py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">

        {/* Left Side */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            About Assorted SG
          </p>

          <h2 className="mt-4 text-4xl font-black uppercase md:text-5xl">
            More Than Clothing.
          </h2>

          <p className="mt-8 text-lg leading-8 text-gray-300">
            Assorted SG is built for men who believe confidence begins with
            character. Every collection is created with simplicity, quality,
            and purpose in mind.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our goal isn't to chase trends—it's to create timeless pieces that
            you can wear every day with confidence.
          </p>

          <Link
            href="/shop"
            className="mt-10 inline-block rounded-xl bg-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-700"
          >
            Shop Collection
          </Link>
        </div>

        {/* Right Side */}
        <div className="rounded-3xl border border-gray-800 bg-[#111] p-10">
          <h3 className="text-3xl font-black text-red-500">
            Our Mission
          </h3>

          <p className="mt-6 leading-8 text-gray-300">
            To inspire confidence through premium everyday clothing while
            remaining grounded in faith, integrity, and purpose.
          </p>

          <div className="mt-10 border-t border-gray-700 pt-8">
            <p className="italic text-gray-400">
              "Commit to the Lord whatever you do,
              and He will establish your plans."
            </p>

            <p className="mt-4 font-bold uppercase text-red-500">
              Proverbs 16:3
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}