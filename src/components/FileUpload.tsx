import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

interface CSVRow {
  first_name: string;
  last_name: string;
  email: string;
  learning_challenges?: string;
  accessibility_needs?: string;
  demographics?: string;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ total: number; processed: number; errors: string[] }>({
    total: 0,
    processed: 0,
    errors: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setProgress({ total: 0, processed: 0, errors: [] });

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        setProgress(prev => ({ ...prev, total: rows.length }));

        const errors: string[] = [];
        let processed = 0;

        // Get current user ID for teacher_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Authentication Error',
            description: 'You must be logged in to upload data.',
            variant: 'destructive'
          });
          setUploading(false);
          return;
        }

        for (const row of rows) {
          try {
            // Validate required fields
            if (!row.first_name || !row.last_name || !row.email) {
              errors.push(`Row ${processed + 1}: Missing required fields (first_name, last_name, email)`);
              processed++;
              setProgress(prev => ({ ...prev, processed: processed, errors }));
              continue;
            }

            // Create user account
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: row.email,
              email_confirm: true,
              user_metadata: {
                first_name: row.first_name,
                last_name: row.last_name
              }
            });

            if (authError) throw authError;

            // Parse learning challenges and accessibility needs
            const learningChallenges = row.learning_challenges 
              ? row.learning_challenges.split(',').map(c => c.trim())
              : [];
            const accessibilityNeeds = row.accessibility_needs
              ? row.accessibility_needs.split(',').map(n => n.trim())
              : [];
            const demographics = row.demographics ? JSON.parse(row.demographics) : {};

            // Insert learner record
            const { error: learnerError } = await supabase
              .from('learners')
              .insert({
                user_id: authData.user.id,
                teacher_id: user.id,
                learning_challenges: learningChallenges,
                accessibility_needs: accessibilityNeeds,
                demographics
              });

            if (learnerError) throw learnerError;

            // Insert user role
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: authData.user.id,
                role: 'learner'
              });

            if (roleError) throw roleError;

            processed++;
            setProgress(prev => ({ ...prev, processed, errors }));

          } catch (error: any) {
            errors.push(`Row ${processed + 1}: ${error.message}`);
            processed++;
            setProgress(prev => ({ ...prev, processed, errors }));
          }
        }

        setUploading(false);

        if (errors.length === 0) {
          toast({
            title: 'Upload Successful',
            description: `Successfully imported ${rows.length} learners.`
          });
          onUploadComplete?.();
        } else {
          toast({
            title: 'Upload Completed with Errors',
            description: `Processed ${rows.length} rows with ${errors.length} errors. Check console for details.`,
            variant: 'destructive'
          });
          console.error('Upload errors:', errors);
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        toast({
          title: 'Parse Error',
          description: 'Failed to parse CSV file. Please check the format.',
          variant: 'destructive'
        });
        setUploading(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Upload Learners
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple learners at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            CSV Format: first_name, last_name, email, learning_challenges (comma-separated), 
            accessibility_needs (comma-separated), demographics (JSON)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Select CSV File'}
            </Button>
          </label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress.processed} / {progress.total}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {progress.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{progress.errors.length} errors encountered</span>
            </div>
            <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-1">
              {progress.errors.slice(0, 5).map((error, i) => (
                <p key={i}>{error}</p>
              ))}
              {progress.errors.length > 5 && (
                <p>... and {progress.errors.length - 5} more errors</p>
              )}
            </div>
          </div>
        )}

        {!uploading && progress.total > 0 && progress.errors.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Upload completed successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}