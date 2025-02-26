import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "./ShareDialog";
import { ExportMenu } from "./ExportMenu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "sonner";
import brain from "brain";

interface Props {
  analysisId: string;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Analysis {
  id: string;
  type: "pdf" | "youtube";
  sourceUrl?: string;
  fileName?: string;
  summary: string;
  keyPoints: string[];
  quiz: Quiz[];
  createdAt: string;
}

export function AnalysisResults({ analysisId }: Props) {
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({});
  const [showResults, setShowResults] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await brain.get_analysis({ pathArgs: { analysis_id: analysisId } });
        const result = await response.json();
        setAnalysis(result);
      } catch (error) {
        console.error("Failed to fetch analysis:", error);
        toast.error("Failed to load analysis results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId, toast]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Loading analysis results...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">No analysis results found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Analysis Results
            {analysis.fileName && <span className="text-sm ml-2">({analysis.fileName})</span>}
            {analysis.sourceUrl && (
            <a
              href={analysis.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm ml-2 text-blue-500 hover:underline"
            >
              (View Source)
            </a>
          )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <ShareDialog contentType="study_material" contentId={analysisId} />
            <ExportMenu contentType="study_material" contentId={analysisId} />
          </div>
        </div>
        <CardDescription>
          Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="keypoints">Key Points</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <div className="prose max-w-none">
              <p>{analysis.summary}</p>
            </div>
          </TabsContent>

          <TabsContent value="keypoints" className="mt-4">
            <ul className="list-disc pl-6 space-y-2">
              {analysis.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <div className="space-y-8">
              {analysis.quiz.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-4">
                  <p className="font-medium">{question.question}</p>
                  <RadioGroup
                    value={selectedAnswers[questionIndex]}
                    onValueChange={(value) => handleAnswerSelect(questionIndex, value)}
                    disabled={showResults}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-2 p-2 rounded ${showResults && option === question.correctAnswer ? 'bg-green-50' : ''} ${
                          showResults &&
                          selectedAnswers[questionIndex] === option &&
                          option !== question.correctAnswer
                            ? 'bg-red-50'
                            : ''
                        }`}
                      >
                        <RadioGroupItem value={option} id={`q${questionIndex}-${optionIndex}`} />
                        <Label htmlFor={`q${questionIndex}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <div className="flex justify-end">
                {!showResults ? (
                  <Button
                    onClick={checkAnswers}
                    disabled={Object.keys(selectedAnswers).length !== analysis.quiz.length}
                  >
                    Check Answers
                  </Button>
                ) : (
                  <Button onClick={resetQuiz}>Try Again</Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
