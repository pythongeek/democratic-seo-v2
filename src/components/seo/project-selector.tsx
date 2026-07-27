"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Plus } from "lucide-react";

export function ProjectSelector() {
  const [project, setProject] = useState("default");

  return (
    <div className="flex items-center gap-2">
      <Select value={project} onValueChange={setProject}>
        <SelectTrigger className="w-[200px]">
          <FolderOpen className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Project</SelectItem>
          <SelectItem value="openseo">OpenSEO Website</SelectItem>
        </SelectContent>
      </Select>
      <Button size="icon" variant="outline">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
