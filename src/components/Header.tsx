import { 
  FileVideo, 
  Save, 
  Undo2, 
  Redo2, 
  Settings, 
  Upload,
  Download,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="h-14 bg-panel-dark border-b border-border flex items-center justify-between px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <FileVideo className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">ProCut Studio</h1>
      </div>

      {/* Menu Bar */}
      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          File
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Effects
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Export
        </Button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Upload className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Redo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Save className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
