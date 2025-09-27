import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlashcardIntakeSchema, McqIntakeSchema } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Intake() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'flashcard' | 'mcq'>('flashcard');
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { type: 'flashcard' | 'mcq'; content: any }) => {
      const response = await apiRequest(
        'POST',
        `/api/intake/${data.type}`,
        data.content
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Item submitted successfully",
        description: "Redirecting to item detail...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setLocation(`/item/${data.itemId}`);
    },
    onError: (error: any) => {
      let errorMessages: string[] = [];
      
      try {
        const errorData = JSON.parse(error.message.split(': ')[1] || '{}');
        if (errorData.issues) {
          errorMessages = errorData.issues.map((issue: any) => 
            `${issue.path?.join('.')}: ${issue.message}`
          );
        } else {
          errorMessages = [errorData.error || 'Submission failed'];
        }
      } catch {
        errorMessages = [error.message || 'Submission failed'];
      }
      
      setErrors(errorMessages);
    },
  });

  const validateJson = () => {
    try {
      const obj = JSON.parse(jsonText);
      setErrors([]);
      
      const schema = activeTab === 'flashcard' ? FlashcardIntakeSchema : McqIntakeSchema;
      schema.parse(obj);
      
      setErrors(['✓ Validation passed']);
    } catch (error: any) {
      if (error.issues) {
        setErrors(error.issues.map((issue: any) => `${issue.path?.join('.')}: ${issue.message}`));
      } else {
        setErrors([error.message || 'Invalid JSON']);
      }
    }
  };

  const handleSubmit = () => {
    try {
      const obj = JSON.parse(jsonText);
      const schema = activeTab === 'flashcard' ? FlashcardIntakeSchema : McqIntakeSchema;
      schema.parse(obj);
      
      submitMutation.mutate({
        type: activeTab,
        content: obj,
      });
    } catch (error: any) {
      if (error.issues) {
        setErrors(error.issues.map((issue: any) => `${issue.path?.join('.')}: ${issue.message}`));
      } else {
        setErrors([error.message || 'Invalid JSON']);
      }
    }
  };

  const clearForm = () => {
    setJsonText('');
    setErrors([]);
  };

  const getPlaceholder = () => {
    if (activeTab === 'flashcard') {
      return `{
  "subject": "Medicine",
  "topic": "GI bleeding",
  "front_text": "What are the common causes of upper GI bleeding?",
  "back_text": "1. Peptic ulcer disease (60-70%)\\n2. Variceal bleeding (10-20%)\\n3. Mallory-Weiss tear (5-15%)\\n4. Boerhaave syndrome (<1%)",
  "references": [
    {"source": "Harrison's Principles of Internal Medicine", "page": "2011"}
  ]
}`;
    } else {
      return `{
  "subject": "Thorax",
  "topic": "Trachea",
  "stem": "The trachea is supported by how many C-shaped cartilaginous rings?",
  "options": ["15-20", "20-25", "10-15", "25-30"],
  "correct_index": 0,
  "explanation": {
    "summary": "The trachea is supported by 15-20 C-shaped cartilaginous rings that prevent collapse during inspiration.",
    "references": [
      {"source": "Gray's Anatomy", "page": "1032"}
    ]
  }
}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Intake</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'flashcard' | 'mcq')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="flashcard" data-testid="tab-flashcard">Flashcard</TabsTrigger>
          <TabsTrigger value="mcq" data-testid="tab-mcq">MCQ</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Paste JSON
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={validateJson}
                      data-testid="button-validate"
                    >
                      Validate
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={submitMutation.isPending}
                      onClick={handleSubmit}
                      data-testid="button-submit"
                    >
                      {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearForm}
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={20}
                  className="font-mono text-xs"
                  placeholder={getPlaceholder()}
                  data-testid="textarea-json"
                />
                
                {errors.length > 0 && (
                  <Alert className="mt-4" variant={errors[0].startsWith('✓') ? 'default' : 'destructive'}>
                    <AlertDescription>
                      <div className="space-y-1">
                        {errors.map((error, index) => (
                          <div key={index} data-testid={`error-${index}`}>{error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick form (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For MVP, use JSON paste. We'll add full form fields later.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
