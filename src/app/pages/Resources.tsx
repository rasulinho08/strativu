import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    date: "June 2025",
    category: "Engineering",
    title: "Why your microservices migration is failing (and how to fix it)",
    excerpt: "Most microservices migrations stall not because of technical complexity, but because of organizational misalignment.",
    readTime: "8 min",
    img: "1558494949-ef010cbdcc31",
  },
  {
    date: "May 2025",
    category: "AI & ML",
    title: "Production LLM integration: what no one tells you",
    excerpt: "After integrating large language models into five production enterprise platforms, we've learned hard lessons about latency and cost.",
    readTime: "12 min",
    img: "1677442136019-21780ecad995",
  },
  {
    date: "April 2025",
    category: "Design",
    title: "The enterprise design gap: why B2B software doesn't have to be ugly",
    excerpt: "There's a pervasive assumption that enterprise users will accept poor UX. We believe this is a massive competitive opportunity.",
    readTime: "6 min",
    img: "1561070791-2526d30994b5",
  },
];

export default function Resources() {
  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-24"
      >
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">Insights</span>
        <h1 className="text-6xl lg:text-8xl font-normal mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          The <span className="italic text-gray-400">Library.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Thinking from the engineering floor. Our latest articles on software, design, and strategy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {POSTS.map((post, i) => (
          <motion.article 
            key={post.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gray-100 mb-6">
              <img 
                src={`https://images.unsplash.com/photo-${post.img}?w=800&auto=format`} 
                alt={post.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">{post.category}</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">{post.date}</span>
            </div>
            <h3 className="text-xl font-medium mb-4 group-hover:underline underline-offset-4 leading-snug">{post.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-2 text-xs font-semibold group-hover:translate-x-1 transition-transform">
              Read Article <ArrowRight className="w-3 h-3" />
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
