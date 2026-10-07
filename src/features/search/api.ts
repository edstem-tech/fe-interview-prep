export interface Product {
  id: number;
  title: string;
  brand: string | null;
  category: string;
  price: number;
  thumbnail: string;
}

interface SearchResponse {
  products: Product[];
}

/**
 * Searches the public DummyJSON product catalogue. `signal` lets the caller abort
 * an in-flight request when a newer query supersedes it. Throws on a non-2xx
 * response so the hook can surface an error state.
 */
export async function searchProducts(query: string, signal: AbortSignal): Promise<Product[]> {
  const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20&select=title,brand,category,price,thumbnail`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }
  const data = (await response.json()) as SearchResponse;
  return data.products;
}
