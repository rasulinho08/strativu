import { motion } from "motion/react";

const CAPABILITIES = [
  {
    number: "01",
    title: "Product Strategy & Design",
    description: "We translate complex business requirements into coherent product vision — from discovery and user research to interaction design and design systems.",
    skills: ["UX Research", "Design Systems", "Prototyping", "Roadmapping"],
  },
  {
    number: "02",
    title: "Full-Stack Engineering",
    description: "End-to-end software development with obsessive attention to code quality, performance, and maintainability across web, mobile, and API layers.",
    skills: ["React / Next.js", "Node.js / Go", "TypeScript", "REST & GraphQL"],
  },
  {
    number: "03",
    title: "Cloud & Infrastructure",
    description: "Scalable, resilient infrastructure designed for enterprise workloads — from initial architecture through production operations and incident response.",
    skills: ["AWS / GCP / Azure", "Kubernetes", "Terraform", "CI/CD"],
  },
  {
    number: "04",
    title: "Data & AI Integration",
    description: "Bringing machine learning and data intelligence into production environments with the rigor enterprise deployments demand.",
    skills: ["ML Engineering", "LLM Integration", "Data Pipelines", "Analytics"],
  },
  {
    number: "05",
    title: "Platform Architecture",
    description: "Modernizing legacy systems and designing event-driven, microservices architectures that scale with your ambitions.",
    skills: ["Microservices", "Event-Driven", "API Design", "System Migration"],
  },
  {
    number: "06",
    title: "Security & Compliance",
    description: "Enterprise-grade security practices embedded throughout the delivery lifecycle — SOC 2, HIPAA, PCI-DSS, GDPR, and beyond.",
    skills: ["SOC 2 Type II", "HIPAA / PCI", "Pen Testing", "Zero Trust"],
  },
];

export default function Capabilities() {
  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-24"
      >
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">Expertise</span>
        <h1 className="text-6xl lg:text-8xl font-normal mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Our <span className="italic text-gray-400">Capabilities.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          We provide end-to-end engineering services for companies that need to move faster than their hiring timeline allows.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {CAPABILITIES.map((cap) => (
          <div key={cap.number} className="bg-white p-12 hover:bg-gray-50 transition-colors group">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-8 block">{cap.number}</span>
            <h3 className="text-2xl font-medium mb-6 group-hover:translate-x-1 transition-transform">{cap.title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-10 text-sm">{cap.description}</p>
            <div className="flex flex-wrap gap-2">
              {cap.skills.map(skill => (
                <span key={skill} className="text-[10px] font-bold tracking-widest uppercase text-black/40 border border-black/5 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
