import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row">

        <div>
          <h2 className="text-3xl font-black">
            <span className="text-white">ASSORTED </span>
            <span className="text-red-600">SG</span>
          </h2>

          <p className="mt-3 text-gray-400">
            Premium Men's Clothing
          </p>
        </div>

        <div className="flex gap-8 uppercase text-sm">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

      </div>

      <div className="border-t border-gray-800 py-6 text-center text-gray-500">
        © {new Date().getFullYear()} Assorted SG. All Rights Reserved.
      </div>
    </footer>
  );
}