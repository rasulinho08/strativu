import { useForm, ValidationError } from "@formspree/react";
import { Btn } from "./primitives";
import { site } from "../../data/site";
import { Check } from "lucide-react";

const field =
  "w-full h-11 px-3.5 rounded-[var(--radius)] border border-line bg-surface text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";
const label = "block mono-label mb-2";

export function EarlyAccessForm({ kind = "early-access" }: { kind?: "early-access" | "contact" }) {
  const [state, handleSubmit] = useForm(site.formspreeId);

  if (state.succeeded) {
    return (
      <div className="rounded-[var(--radius)] border border-brand-line bg-brand-soft p-6">
        <div className="flex items-center gap-2 text-brand-ink font-medium">
          <Check className="w-4 h-4" /> Received.
        </div>
        <p className="mt-2 text-[15px] text-ink-2">
          {kind === "early-access"
            ? "We review requests weekly and reply from a named person, not a sequence. Expect an answer within five working days."
            : "We reply within two working days."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="form" value={kind} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={label}>Name</label>
          <input id="name" name="name" required className={field} placeholder="Full name" />
        </div>
        <div>
          <label htmlFor="email" className={label}>Work email</label>
          <input id="email" name="email" type="email" required className={field} placeholder="you@company.com" />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-[13px] text-warn" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="company" className={label}>Company</label>
          <input id="company" name="company" required className={field} placeholder="Company name" />
        </div>
        <div>
          <label htmlFor="role" className={label}>Role</label>
          <input id="role" name="role" className={field} placeholder="e.g. Head of Security" />
        </div>
      </div>
      {kind === "early-access" && (
        <div>
          <label htmlFor="frameworks" className={label}>Frameworks you are audited against</label>
          <input id="frameworks" name="frameworks" className={field} placeholder="ISO 27001, SOC 2, …" />
        </div>
      )}
      <div>
        <label htmlFor="message" className={label}>{kind === "early-access" ? "What does your compliance programme look like today?" : "Message"}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${field} h-auto py-3 resize-y`}
          placeholder={kind === "early-access" ? "Team size, tooling, next audit window, what breaks." : "How can we help?"}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-[13px] text-warn" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <Btn type="submit" size="lg" disabled={state.submitting} arrow>
          {state.submitting ? "Sending…" : kind === "early-access" ? "Request early access" : "Send message"}
        </Btn>
        <p className="text-[13px] text-ink-3">No mailing list. We only write back about your request.</p>
      </div>
    </form>
  );
}
