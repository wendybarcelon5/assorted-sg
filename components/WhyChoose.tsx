const features = [
  {
    title: "Premium Quality",
    description:
      "Every piece is carefully selected to deliver comfort, durability, and timeless style.",
  },
  {
    title: "Nationwide Shipping",
    description:
      "Fast and reliable delivery across the Philippines, right to your doorstep.",
  },
  {
    title: "Wear with Confidence",
    description:
      "Designed for men who value simplicity, confidence, and purpose in every outfit.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-[#0d0d0d] py-24">
      <div className="mx-auto max-w-7xl px-8">

        <h2 className="text-center text-5xl font-black uppercase">
          Why Choose Assorted SG
        </h2>

        <p className="mt-4 text-center text-gray-400">
          More than clothing—built for confidence and everyday wear.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-800 bg-[#111] p-8 transition hover:border-red-600"
            >
              <h3 className="text-2xl font-bold text-red-500">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-300 leading-7">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}