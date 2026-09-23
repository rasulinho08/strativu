/**
 * Sayt konfiqurasiyası.
 * Buradakı dəyərləri dəyişmək kifayətdir — kod dəyişmək lazım deyil.
 */
export const site = {
  name: "Strativu",
  tagline: "Compliance evidence, engineered.",
  domain: "https://strativu.com",
  /** Sosial şəbəkə önizləmə şəkli (1200×630). public/og.png */
  ogImage: "/og.png",

  /** Hero-da və CTA yanında görünən status sətri. */
  status: {
    label: "In development",
    detail: "Early access opening Q1 2027",
  },

  logo: {
    /** Tam loqo (işarə + yazı). Açıq temada göstərilir. */
    src: "/brand/logo-full.png",
    /** Yalnız işarə. Tünd temada CSS yazı ilə birlikdə göstərilir. */
    mark: "/brand/logo-mark.png",
    /** Tünd tema üçün hazır açıq-rəngli loqo faylınız varsa yolunu yazın: "/brand/logo-dark.png". */
    darkSrc: null as string | null,
    height: 28,
  },

  /** Formspree form ID-si (Contact və Early access formları). */
  formspreeId: "xvzjezqa",

  company: {
    legalName: "Strativu LLC",
    jurisdiction: "Registered in Baku, Azerbaijan",
    /** Qeydiyyat nömrəsi. Real nömrə gələnə qədər null — null olanda saytda göstərilmir. */
    registrationNo: null as string | null,
    email: "hello@strativu.com",
    address: "Baku, Azerbaijan",
    /**
     * Sosial linklər. Hesab hələ yoxdursa null yazın — null olan link saytda göstərilmir.
     * Status səhifəsi yalnız həqiqətən işləyən status.strativu.com olanda doldurulmalıdır.
     */
    statusPage: null as string | null,
    linkedin: "https://www.linkedin.com/company/strativu" as string | null,
    github: null as string | null,
  },
};
