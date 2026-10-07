import { useMemo } from 'react';

interface HighlightProps {
  text: string;
  query: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders `text` with every case-insensitive occurrence of `query` wrapped in a
 * highlighted <mark>. Splitting on a capturing group keeps the matched segments
 * in the resulting array so we can style them without losing the original text.
 */
export default function Highlight({ text, query }: HighlightProps) {
  const parts = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [text];
    return text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'ig'));
  }, [text, query]);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() && part !== '' ? (
          <mark key={index} className="rounded bg-yellow-200 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
