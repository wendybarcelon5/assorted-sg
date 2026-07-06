import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">

      {/* Background Image */}
      <img
        src="/images/hero.jpg"
        alt="Assorted SG Hero"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">

          {/* Badge */}
          <span className="inline-block rounded-full border border-red-600 bg-red-600/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-red-500">
            New Collection
          </span>

          {/* Heading */}
          <h1 className="mt-6 max-w-3xl text-5xl font-black uppercase leading-tight md:text-7xl lg:text-8xl">
            Wear Confidence.
            <span className="block text-red-600">
              Live With Purpose.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Designed for men who value simplicity, confidence, and timeless streetwear.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-xl bg-red-600 px-8 py-4 font-bold uppercase transition hover:bg-red-700"
            >
              Shop Now
            </Link>

            <Link
              href="/about"
              className="rounded-xl border border-white px-8 py-4 font-bold uppercase transition hover:bg-white hover:text-black"
            >
              Learn More
            </Link>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-10 w-6 rounded-full border-2 border-white flex justify-center">
          <div className="mt-2 h-2 w-2 rounded-full bg-white"></div>
        </div>
      </div>

    </section>
  );
}