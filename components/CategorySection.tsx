const categories = [
  { title: "Jackets", image: "/images/jackets.jpg" },
  { title: "Shirts", image: "/images/shirts.jpg" },
  { title: "Pants", image: "/images/pants.jpg" },
  { title: "Shorts", image: "/images/shorts.jpg" },
];

export default function CategorySection() {
  return (
    <section
        id="categories"
         className="bg-[#0d0d0d] py-24"
    >

      <div className="mx-auto max-w-7xl px-8">

        <h2 className="mb-4 text-center text-5xl font-black uppercase">
          Shop by Category
        </h2>

        <p className="mb-16 text-center text-gray-400">
          Find the perfect fit for every occasion.
        </p>

        <div className="grid gap-8 md:grid-cols-2">

          {categories.map((category) => (

            <div
              key={category.title}
              className="group relative h-[420px] overflow-hidden rounded-2xl"
            >

              <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

              <div className="absolute bottom-8 left-8">

                <h3 className="text-4xl font-black uppercase">
                  {category.title}
                </h3>

                <div className="mt-4 inline-block rounded-full border border-red-600 px-5 py-2 text-sm font-bold uppercase tracking-wider transition group-hover:bg-red-600">
                    View Collection →
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}