import { motion, useReducedMotion } from 'framer-motion';

import { ProductCard } from '@/components/customer/ProductCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import type { HomeProduct } from '@/types/home';
import type { SearchProduct } from '@/types/product';

type ProductShelfProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Array<HomeProduct | SearchProduct>;
};

export function ProductShelf({ eyebrow, title, description, products }: ProductShelfProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-12">
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <motion.div
          initial={prefersReducedMotion ? 'show' : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 } },
          }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div
              key={product.slug}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeOut' }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
