import { motion } from 'framer-motion';

import { ProductCard } from '@/components/customer/ProductCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import type { HomeProduct } from '@/types/home';

type ProductShelfProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: HomeProduct[];
};

export function ProductShelf({ eyebrow, title, description, products }: ProductShelfProps) {
  return (
    <section className="py-12">
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
