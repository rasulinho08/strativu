import { Download } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const FORMATS = ["docx", "xlsx", "csv", "txt"] as const;

export function ExportMenu({
  disabled,
  onExport,
}: {
  disabled: boolean;
  onExport: (format: (typeof FORMATS)[number], source: "sanitized" | "rehydrated") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Download /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Original values restored</DropdownMenuLabel>
        {FORMATS.map((fmt) => (
          <DropdownMenuItem key={`r-${fmt}`} onClick={() => onExport(fmt, "rehydrated")}>
            .{fmt}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sanitized (tokens only)</DropdownMenuLabel>
        {FORMATS.map((fmt) => (
          <DropdownMenuItem key={`s-${fmt}`} onClick={() => onExport(fmt, "sanitized")}>
            .{fmt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
