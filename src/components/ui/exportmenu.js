import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';

interface Props {
  contentType: 'plan' | 'study_material';
  contentId: string;
  trigger?: React.ReactNode;
}

export function ExportMenu({ contentType, contentId, trigger }: Props) {
  const handleExport = async (format: 'pdf' | 'markdown' | 'html') => {
    try {
      const response = await brain.export_content({
        content_type: contentType,
        content_id: contentId,
        format,
      });

      const data = await response.json();

      if (format === 'pdf') {
        // For PDF, we get a download URL
        window.open(data.download_url, '_blank');
      } else {
        // For markdown and HTML, we get the content directly
        const blob = new Blob([data.content], {
          type: format === 'html' ? 'text/html' : 'text/markdown',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format === 'html' ? 'html' : 'md'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export as ${format}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          <Download className="mr-2 h-4 w-4" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')}>
          <Download className="mr-2 h-4 w-4" />
          Export as HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
