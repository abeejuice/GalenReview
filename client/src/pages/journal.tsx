import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JournalNote {
  id: string;
  date: string;
  text: string;
}

export default function Journal() {
  const [currentNote, setCurrentNote] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['/api/journal'],
    queryFn: async () => {
      const response = await fetch('/api/journal');
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json() as Promise<JournalNote[]>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/journal', { text });
      return response.json();
    },
    onSuccess: () => {
      setCurrentNote('');
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      toast({
        title: "Note saved",
        description: "Your journal entry has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (currentNote.trim()) {
      saveMutation.mutate(currentNote.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-muted h-48 rounded-lg"></div>
        <div className="animate-pulse bg-muted h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
      </div>

      {/* Today's Note */}
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="What did you work on today? Any insights or observations..."
            rows={4}
            data-testid="textarea-journal-entry"
          />
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !currentNote.trim()}
            data-testid="button-save-journal"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No journal entries yet. Start writing your first note above!
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border-l-2 border-border pl-4 py-2"
                  data-testid={`journal-entry-${note.id}`}
                >
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(note.date).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap">{note.text}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
