import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";

import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";

export function DocumentInput({
  disabled,
  onLoadText,
  onLoadFile,
}: {
  disabled: boolean;
  onLoadText: (text: string) => void;
  onLoadFile: (file: File) => void;
}) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Tabs defaultValue="paste" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="paste">Paste text</TabsTrigger>
        <TabsTrigger value="upload">Upload file</TabsTrigger>
      </TabsList>

      <TabsContent value="paste" className="flex flex-col gap-2">
        <Textarea
          placeholder="Paste the document text you want to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32"
          disabled={disabled}
        />
        <Button
          size="sm"
          className="self-end"
          disabled={disabled || text.trim().length === 0}
          onClick={() => onLoadText(text)}
        >
          <FileText /> Load document
        </Button>
      </TabsContent>

      <TabsContent value="upload" className="flex flex-col gap-3">
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Upload className="h-6 w-6" />
          <p>DOCX, XLSX, or CSV — up to 25MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.xlsx,.csv,.txt"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLoadFile(file);
              e.target.value = "";
            }}
          />
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => fileInputRef.current?.click()}>
            Choose file
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
