/**
 * MOCK sübut məzmunu — logo divarı, statistika, testimonial-lar.
 * Real müştəri/rəqəm gələndə bura yazın. Göstərilib-göstərilməməsi site.ts → proof ilə idarə olunur.
 */
export const logoWall = {
  heading: "Trusted by security and compliance teams",
  logos: [
    "Northline Bank",
    "Helix Health",
    "Atlas Energy",
    "Meridian Insurance",
    "Orbit Telecom",
    "Kaspi Logistics",
  ],
};

export const stats = [
  { value: "3×", label: "faster control-to-evidence mapping" },
  { value: "75%", label: "less time collecting audit evidence" },
  { value: "40h", label: "saved per audit window, per framework" },
  { value: "12", label: "frameworks mapped to one control set" },
];

export const testimonials = [
  {
    quote:
      "We stopped maintaining four spreadsheets of the same controls. One register, every framework, and the auditor could follow the trail themselves.",
    name: "Head of Information Security",
    company: "Regional bank, 1,200 employees",
  },
  {
    quote:
      "The audit trail is the thing. Every change to a control, every piece of evidence, who touched it and when. That is what our auditor actually asks for.",
    name: "Compliance Lead",
    company: "Healthcare provider",
  },
  {
    quote:
      "Evidence collection used to be a two-week scramble before every audit. It now runs in the background and we review exceptions.",
    name: "CTO",
    company: "Fintech, Series B",
  },
];
