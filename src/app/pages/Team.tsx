import { motion } from "motion/react";

const TEAM = [
  {
    name: "Marcus Chen",
    role: "Founder & CEO",
    bio: "Former VP Engineering at Stripe. Built and led engineering teams of 200+ across three continents.",
    img: "1507003211169-0a1dd7228f2d",
  },
  {
    name: "Priya Nathaniel",
    role: "Chief Design Officer",
    bio: "Previously design lead at Linear and Figma. Defined product design language for tools used by millions.",
    img: "1494790108755-2616b612b786",
  },
  {
    name: "James Okafor",
    role: "CTO & Principal Engineer",
    bio: "12 years building high-frequency trading infrastructure at Jane Street. Expert in distributed systems at scale.",
    img: "1472099645785-5658abf4ff4e",
  },
  {
    name: "Sofia Reyes",
    role: "Head of Client Success",
    bio: "Previously at McKinsey Digital, advising Fortune 100 enterprise software transformations globally.",
    img: "1438761681033-6461ffad8d80",
  },
];

export default function Team() {
  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-24"
      >
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">Leadership</span>
        <h1 className="text-6xl lg:text-8xl font-normal mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          The <span className="italic text-gray-400">Experts.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Our leadership team consists of seasoned operators who have built products at the world's most successful tech companies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {TEAM.map((member, i) => (
          <motion.div 
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100 mb-6">
              <img 
                src={`https://images.unsplash.com/photo-${member.img}?w=600&auto=format`} 
                alt={member.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <h3 className="text-xl font-medium mb-1">{member.name}</h3>
            <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-4">{member.role}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
