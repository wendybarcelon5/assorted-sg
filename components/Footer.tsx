"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070707] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}

          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Assorted SG"
                width={50}
                height={50}
                className="rounded-full"
              />

              <div>
                <h2 className="text-2xl font-black uppercase text-white">
                  ASSORTED <span className="text-red-600">SG</span>
                </h2>

                <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
                  Premium Streetwear
                </p>
              </div>
            </div>

            <p className="mt-6 leading-8 text-gray-400">
              Premium men&apos;s fashion designed for everyday confidence.
              Modern streetwear built with quality, style, and comfort.
            </p>
          </div>

          {/* Quick Links */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Quick Links
            </h3>

            <div className="space-y-4">
              <Link
                href="/"
                className="block text-gray-400 transition hover:text-red-500"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="block text-gray-400 transition hover:text-red-500"
              >
                Shop
              </Link>

              <Link
                href="/about"
                className="block text-gray-400 transition hover:text-red-500"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="block text-gray-400 transition hover:text-red-500"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Contact
            </h3>

            <div className="space-y-5 text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-red-600"
                />

                <span>Taguig, Philippines</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="shrink-0 text-red-600"
                />

                <span>+63 969 312 0935</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="shrink-0 text-red-600"
                />

                <span className="break-all">
                  assortedsg@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Social and Payment */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Follow Us
            </h3>

            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61591374251267"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Image
                  src="/social/facebook.png"
                  alt="Facebook"
                  width={42}
                  height={42}
                  className="h-10 w-10 object-contain transition duration-300 hover:scale-110"
                />
              </a>

              <a
                href="https://www.instagram.com/assorted_sg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Image
                  src="/social/instagram.png"
                  alt="Instagram"
                  width={42}
                  height={42}
                  className="h-10 w-10 object-contain transition duration-300 hover:scale-110"
                />
              </a>

              <a
                href="https://messenger.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Messenger"
              >
                <Image
                  src="/social/messenger.png"
                  alt="Messenger"
                  width={42}
                  height={42}
                  className="h-10 w-10 object-contain transition duration-300 hover:scale-110"
                />
              </a>
            </div>

            <h3 className="mb-5 mt-10 text-xl font-bold text-white">
              Payment Methods
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <div className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                <Image
                  src="/payments/gcash.png"
                  alt="GCash"
                  width={90}
                  height={55}
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                <Image
                  src="/payments/maya.png"
                  alt="Maya"
                  width={90}
                  height={55}
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                <Image
                  src="/payments/visa.png"
                  alt="Visa"
                  width={90}
                  height={55}
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                <Image
                  src="/payments/mastercard.png"
                  alt="Mastercard"
                  width={90}
                  height={55}
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                <Image
                  src="/payments/cod.png"
                  alt="Cash on Delivery"
                  width={90}
                  height={55}
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center text-sm text-gray-500 md:flex-row md:text-left">
          <p>
            © 2026{" "}
            <span className="font-semibold text-white">
              Assorted SG
            </span>
            . All Rights Reserved.
          </p>

          <p>Designed with ❤️ in the Philippines.</p>
        </div>
      </div>
    </footer>
  );
}