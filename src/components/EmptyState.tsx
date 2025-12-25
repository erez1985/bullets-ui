import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNote: () => void;
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center bg-card paper-texture">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          No Note Selected
        </h2>
        <p className="text-muted-foreground mb-6">
          Select a note from the list or create a new one to get started with your thoughts.
        </p>
        <Button onClick={onCreateNote} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Note
        </Button>
      </div>
    </div>
  );
}
