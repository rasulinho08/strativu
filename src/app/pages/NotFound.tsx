import { Btn, Container, TextLink } from "../components/site/primitives";
import { Ambience } from "../components/site/fx";
import { usePageMeta } from "../components/site/Seo";

export function NotFound() {
  usePageMeta("Page not found", "The page you asked for does not exist.");
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      <Ambience className="-z-10" />
      <Container>
        <div className="max-w-[640px]">
          <p className="eyebrow mb-5">404</p>
          <h1 className="t-h1 text-ink">Page not found.</h1>
          <p className="t-lead mt-6">
            The address may have changed, or it never existed. Everything on the site is reachable from the pages
            below.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Btn to="/" arrow>
              Back to the start
            </Btn>
            <TextLink to="/platform">Platform</TextLink>
            <TextLink to="/coverage">Coverage</TextLink>
            <TextLink to="/company/contact">Contact</TextLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
