import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="container py-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <Home className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-2">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
