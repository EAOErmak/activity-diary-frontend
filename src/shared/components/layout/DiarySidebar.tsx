import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { PlusCircle, List, Settings } from "lucide-react";

export function DiarySidebar() {
  return (
    <div className="flex flex-col gap-4 p-4 border-r border-border h-screen">
      <Link to="/diary/new">
        <Button variant="surface" className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </Link>
      <Link to="/diary">
        <Button variant="surface" className="w-full justify-start">
          <List className="mr-2 h-4 w-4" />
          All Entries
        </Button>
      </Link>
      <Link to="/entry-templates">
        <Button variant="surface" className="w-full justify-start">
          <List className="mr-2 h-4 w-4" />
          Шаблоны
        </Button>
      </Link>
      <Link to="/settings">
        <Button variant="surface" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </Link>
    </div>
  );
}
