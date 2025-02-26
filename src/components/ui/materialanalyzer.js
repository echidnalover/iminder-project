import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "sonner";
import brain from "brain";
import { Upload, Link } from "lucide-react";

interface Props {
  onAnalysisComplete: (analysisId: string) => void;
}

export function MaterialAnalyzer({ onAnalysisComplete }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      setIsLoading(true);
      const response = await brain.analyze_pdf({ file });
      const result = await response.json();
      onAnalysisComplete(result.id);
      toast.success("PDF analysis complete!");
    } catch (error) {
      console.error("PDF analysis failed:", error);
      toast.error("Failed to analyze PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeAnalysis = async () => {
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    try {
      setIsLoading(true);
      const response = await brain.analyze_youtube({ body: { url: youtubeUrl } });
      const result = await response.json();
      onAnalysisComplete(result.id);
      toast.success("YouTube video analysis complete!");
    } catch (error) {
      console.error("YouTube analysis failed:", error);
      toast.error("Failed to analyze YouTube video");
    } finally {
      setIsLoading(false);
      setYoutubeUrl("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze Study Material</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
            <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Upload a PDF file to analyze
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Select PDF"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Link className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Paste YouTube URL here"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleYoutubeAnalysis}
                disabled={isLoading || !youtubeUrl}
                className="w-full"
              >
                {isLoading ? "Analyzing..." : "Analyze Video"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
