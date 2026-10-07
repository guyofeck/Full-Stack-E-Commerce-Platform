"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types/productTypes";
import { generateProductPlaceholder } from "@/app/utils/placeholderImage";

const STORAGE_KEY = "recentlyViewedProducts";

type ViewedProduct = Pick<Product, "id" | "slug" | "name"> & {
  image: string;
  price: number | null;
};

function isViewedProduct(value: unknown): value is ViewedProduct {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    (item.price === null ||
      (typeof item.price === "number" && Number.isFinite(item.price)))
  );
}

export default function RecentlyViewed({ product }: { product: Product }) {
  const [products, setProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    let history: ViewedProduct[] = [];
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) history = stored.filter(isViewedProduct);
    } catch {
      // Invalid or unavailable storage must not prevent viewing a product.
    }

    const inStockVariants = product.variants.filter((variant) => variant.stock > 0);
    const current: ViewedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.variants[0]?.images[0] || generateProductPlaceholder(product.name),
      price: inStockVariants.length
        ? Math.min(...inStockVariants.map((variant) => variant.price))
        : null,
    };
    const recent = [current, ...history.filter((item) => item.id !== current.id)].slice(0, 4);
    setProducts(recent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      // The strip still works for this page when browser storage is disabled/full.
    }
  }, [product]);

  if (!products.length) return null;

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h2 id="recently-viewed-heading" className="text-xl font-semibold text-gray-900 mb-4">
        Recently viewed
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/product/${encodeURIComponent(item.slug)}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <div className="bg-gray-50 flex items-center justify-center h-36 sm:h-44">
              <Image
                src={item.image}
                alt={item.name}
                width={180}
                height={180}
                className="object-contain w-full h-full p-4"
                sizes="(max-width: 1023px) 50vw, 25vw"
                onError={(event) => {
                  event.currentTarget.src = generateProductPlaceholder(item.name);
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold text-indigo-700">
                {item.price === null ? "Out of stock" : `$${item.price.toFixed(2)}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
