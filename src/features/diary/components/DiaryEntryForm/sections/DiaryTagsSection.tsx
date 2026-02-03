import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

export function DiaryTagsSection() {
  const { setValue, watch } = useFormContext();
  const tags = (watch("tags") ?? []) as string[];

  const [input, setInput] = useState("");

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;

    setValue("tags", [...tags, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter(t => t !== tag)
    );
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Введите теги и нажмите Enter"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
          }
        }}
      />

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => removeTag(tag)}
          >
            {tag} ✕
          </Badge>
        ))}
      </div>
    </div>
  );
}
