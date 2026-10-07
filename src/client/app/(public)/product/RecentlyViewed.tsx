"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types/productTypes";
import { generateProductPlaceholder } from "@/app/utils/placeholderImage";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_PRODUCTS = 4;

type ViewedProduct = {
  id: string;
  slug: string;
  name: string;
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
    let history: ViewedProduct[] = [];
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) history = stored.filter(isViewedProduct);
    } catch {
      // Malformed or unavailable storage must not break the product page.
    }

    const seen = new Set([current.id]);
    const recent = [current];
    for (const item of history) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        recent.push(item);
      }
      if (recent.length === MAX_PRODUCTS) break;
    }
    setProducts(recent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      // Still show this visit when browser storage is disabled or full.
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
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="min-w-40 w-40 sm:min-w-0 sm:w-auto sm:flex-1 shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <div className="relative h-36 bg-gray-50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 160px, 300px"
                className="object-contain p-4"
                onError={(event) => {
                  event.currentTarget.src = generateProductPlaceholder(item.name);
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
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
