import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="text-center">
      <h1 className="text-2xl font-bold">404 — Not found</h1>
      <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
        Back home
      </Link>
    </section>
  );
}
