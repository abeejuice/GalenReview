import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Evidence from "@/components/Evidence";
import { ItemDetail } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ItemDetailPage() {
  const [, params] = useRoute('/item/:id');
  const itemId = params?.id;
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ['/api/items', itemId],
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      return response.json() as Promise<ItemDetail>;
    },
    enabled: !!itemId,
  });

  const actionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiRequest('PATCH', `/api/items/${itemId}`, actionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items', itemId] });
      toast({
        title: "Action completed",
        description: "Item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-pulse bg-muted h-96 rounded-lg"></div>
        <div className="animate-pulse bg-muted h-96 rounded-lg"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    );
  }

  const handleAction = (action: string, data: any = {}) => {
    actionMutation.mutate({ action, ...data });
  };

  const handleEdit = () => {
    const patch: any = {};
    
    if (item.type === 'FLASHCARD') {
      if (editData.backText) patch.backText = editData.backText;
    } else if (item.type === 'MCQ') {
      if (editData.explanation) patch.explanation = editData.explanation;
    }
    
    if (Object.keys(patch).length > 0) {
      handleAction('edit', { patch });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span data-testid="item-title">
                {item.subject} • {item.topic}
              </span>
              <div className="flex space-x-2">
                <Badge variant="outline">{item.type}</Badge>
                <Badge variant="secondary">{item.status}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.type === 'FLASHCARD' && item.flashcard ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Front</h3>
                  <p className="p-3 bg-muted rounded-md" data-testid="flashcard-front">
                    {item.flashcard.frontText}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2">Back</h3>
                  <p className="p-3 bg-muted rounded-md whitespace-pre-wrap" data-testid="flashcard-back">
                    {item.flashcard.backText}
                  </p>
                </div>
              </div>
            ) : item.type === 'MCQ' && item.mcq ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Stem</h3>
                  <p className="p-3 bg-muted rounded-md" data-testid="mcq-stem">
                    {item.mcq.stem}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2">Options</h3>
                  <ol className="list-decimal ml-5 space-y-1" data-testid="mcq-options">
                    {item.mcq.options.map((option, index) => (
                      <li 
                        key={index} 
                        className={index === item.mcq?.correctIndex ? 'font-semibold text-green-700' : ''}
                      >
                        {option} {index === item.mcq?.correctIndex && '✓'}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2">Explanation</h3>
                  <p className="p-3 bg-muted rounded-md whitespace-pre-wrap" data-testid="mcq-explanation">
                    {item.mcq.explanation.summary}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Auto-checks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Auto-checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" data-testid="groundedness-score">
                <span>Groundedness:</span>
                <span>{item.autoChecks?.groundednessScore ?? '—'}</span>
              </div>
              <div className="flex justify-between" data-testid="faithfulness-score">
                <span>Faithfulness:</span>
                <span>{item.autoChecks?.faithfulnessScore ?? '—'}</span>
              </div>
              <div className="flex justify-between" data-testid="reference-coverage">
                <span>Ref coverage:</span>
                <span>{item.autoChecks?.referenceCoverage ?? '—'}</span>
              </div>
              <div className="flex justify-between" data-testid="duplicates-count">
                <span>Duplicates:</span>
                <span>{item.autoChecks?.possibleDuplicates?.length || 0}</span>
              </div>
              <div className="flex justify-between" data-testid="conflicts-count">
                <span>Conflicts:</span>
                <span>{item.autoChecks?.claimsWithNumbers?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <Evidence references={item.references || []} />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleAction('request_changes', { note: 'Please revise' })}
                disabled={actionMutation.isPending}
                data-testid="button-request-changes"
              >
                Request Changes
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleAction('publish')}
                disabled={actionMutation.isPending}
                data-testid="button-publish"
              >
                Publish
              </Button>
            </div>

            {/* Quick Edit */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Quick edit</h4>
              {item.type === 'FLASHCARD' ? (
                <Textarea
                  placeholder={item.flashcard?.backText || ''}
                  value={editData.backText || ''}
                  onChange={(e) => setEditData({ ...editData, backText: e.target.value })}
                  rows={4}
                  data-testid="textarea-edit-flashcard"
                />
              ) : (
                <Textarea
                  placeholder={item.mcq?.explanation?.summary || ''}
                  value={editData.explanation?.summary || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    explanation: { summary: e.target.value }
                  })}
                  rows={4}
                  data-testid="textarea-edit-mcq"
                />
              )}
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={actionMutation.isPending}
                data-testid="button-save-edit"
              >
                {actionMutation.isPending ? 'Saving...' : 'Save edits'}
              </Button>
            </div>

            {/* Remap Competency */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Remap competency</h4>
              <Input
                placeholder="Competency ID"
                value={editData.competencyId || ''}
                onChange={(e) => setEditData({ ...editData, competencyId: e.target.value })}
                data-testid="input-competency-id"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAction('remap_competency', { competencyId: editData.competencyId })}
                disabled={actionMutation.isPending}
                data-testid="button-remap-competency"
              >
                Update mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
