/**
 * Komanda. Hələlik adsız — rol və fokus sahəsi göstərilir.
 * Real ad/şəkil əlavə etmək üçün: name, photo ("/team/ad.png"), links doldurun.
 */
export type TeamMember = {
  name: string | null;
  role: string;
  focus: string;
  photo: string | null;
  links?: { label: string; href: string }[];
};

export const team: TeamMember[] = [
  {
    name: null,
    role: "Founder & CEO",
    focus: "Cybersecurity, governance and enterprise risk. Sets the product thesis and owns the compliance domain model.",
    photo: null,
  },
  {
    name: null,
    role: "GRC Product Lead",
    focus: "Business analysis and framework mapping. Turns auditor questions into product requirements.",
    photo: null,
  },
  {
    name: null,
    role: "Lead Software Engineer",
    focus: "Backend, cloud infrastructure and the tenancy model. Owns the audit-trail architecture.",
    photo: null,
  },
  {
    name: null,
    role: "Platform Engineer",
    focus: "Integrations, evidence collectors and the automation pipeline.",
    photo: null,
  },
];
