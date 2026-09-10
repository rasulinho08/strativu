import { ShieldAlert } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { categoryLabel } from "../lib/format";
import type { Finding } from "../lib/types";

export function FindingsPanel({
  findings,
  approvedIds,
  onToggleFinding,
  onToggleCategory,
}: {
  findings: Finding[];
  approvedIds: Set<string>;
  onToggleFinding: (id: string, checked: boolean) => void;
  onToggleCategory: (category: string, checked: boolean) => void;
}) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center text-muted-foreground">
        <ShieldAlert className="h-6 w-6" />
        <p className="text-sm">No scan results yet. Load a document and run a DLP scan.</p>
      </div>
    );
  }

  const byCategory = new Map<string, Finding[]>();
  for (const f of findings) {
    byCategory.set(f.category, [...(byCategory.get(f.category) ?? []), f]);
  }
  const categories = [...byCategory.keys()];

  return (
    <Accordion type="multiple" defaultValue={categories} className="w-full">
      {categories.map((category) => {
        const items = byCategory.get(category)!;
        const approvedCount = items.filter((f) => approvedIds.has(f.id)).length;
        const allApproved = approvedCount === items.length;
        const noneApproved = approvedCount === 0;

        return (
          <AccordionItem key={category} value={category}>
            <div className="flex items-center gap-3 py-1">
              <Checkbox
                checked={allApproved ? true : noneApproved ? false : "indeterminate"}
                onCheckedChange={(checked) => onToggleCategory(category, checked === true)}
                aria-label={`Toggle all ${category} findings`}
              />
              <AccordionTrigger className="py-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {categoryLabel(category)}
                  <Badge variant="secondary" className="font-normal">
                    {items.length}
                  </Badge>
                  {approvedCount > 0 && (
                    <span className="text-xs text-muted-foreground">{approvedCount} selected</span>
                  )}
                </span>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <ul className="flex flex-col gap-1.5 pl-8">
                {items.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={approvedIds.has(f.id)}
                      onCheckedChange={(checked) => onToggleFinding(f.id, checked === true)}
                    />
                    <span className="truncate font-mono text-[13px]" title={f.value}>
                      {f.value}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {Math.round(f.confidence * 100)}% · {f.source}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
