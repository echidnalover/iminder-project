import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Link, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

interface SharedContent {
  id: string;
  content_type: 'plan' | 'study_material';
  content_id: string;
  share_link: string;
  access_type: 'public' | 'private';
  expiration_date: string | null;
  created_at: string;
}

export function SharedContentList() {
  const [sharedContent, setSharedContent] = React.useState<SharedContent[]>([]);

  const fetchSharedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedContent(data || []);
    } catch (error) {
      console.error('Failed to fetch shared content:', error);
      toast.error('Failed to fetch shared content');
    }
  };

  React.useEffect(() => {
    fetchSharedContent();

    // Subscribe to changes
    const subscription = supabase
      .channel('shared_content_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_content' },
        fetchSharedContent
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCopyLink = async (shareLink: string) => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Share link deleted successfully');
      fetchSharedContent();
    } catch (error) {
      console.error('Failed to delete share link:', error);
      toast.error('Failed to delete share link');
    }
  };

  if (sharedContent.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No shared content yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sharedContent.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={item.access_type === 'public' ? 'default' : 'secondary'}>
                    {item.access_type}
                  </Badge>
                  <Badge variant="outline">{item.content_type}</Badge>
                </div>
                {item.expiration_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Expires {format(new Date(item.expiration_date), 'PPP')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(item.share_link)}
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
