import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Copy, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/utils';
import brain from 'brain';
import { toast } from 'sonner';

interface Props {
  contentType: 'plan' | 'study_material';
  contentId: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ contentType, contentId, trigger }: Props) {
  const [isPublic, setIsPublic] = React.useState(false);
  const [expirationDate, setExpirationDate] = React.useState<Date>();
  const [shareLink, setShareLink] = React.useState<string>();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleShare = async () => {
    try {
      const response = await brain.create_share({
        content_type: contentType,
        content_id: contentId,
        access_type: isPublic ? 'public' : 'private',
        expiration_date: expirationDate,
      });

      const data = await response.json();
      setShareLink(data.share_link);
      toast.success('Share link created successfully');
    } catch (error) {
      console.error('Failed to create share link:', error);
      toast.error('Failed to create share link');
    }
  };

  const copyToClipboard = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        toast.success('Share link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-access">Public Access</Label>
            <Switch
              id="public-access"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="grid gap-2">
            <Label>Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !expirationDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {!shareLink ? (
            <Button onClick={handleShare}>Generate Share Link</Button>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with others to give them access to your content.
                {expirationDate &&
                  ` The link will expire on ${format(expirationDate, 'PPP')}.`}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
