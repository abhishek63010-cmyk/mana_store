import Link from "next/link";

export function Pagination({ page, totalPages, href }: { page: number; totalPages: number; href: string }) {
  if (totalPages <= 1) return null;
  const previous = page > 1 ? `${href}${href.includes("?") ? "&" : "?"}page=${page - 1}` : null;
  const next = page < totalPages ? `${href}${href.includes("?") ? "&" : "?"}page=${page + 1}` : null;
  return <nav className="pagination sans" aria-label="Pagination">
    {previous ? <Link href={previous}>Previous</Link> : <span aria-hidden="true">Previous</span>}
    <span>Page {page} of {totalPages}</span>
    {next ? <Link href={next}>Next</Link> : <span aria-hidden="true">Next</span>}
  </nav>;
}
