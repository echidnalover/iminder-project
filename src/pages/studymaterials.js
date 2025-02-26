import React from "react";
import { MaterialAnalyzer } from "../components/MaterialAnalyzer";
import { AnalysisResults } from "../components/AnalysisResults";

export default function StudyMaterials() {
  const [currentAnalysisId, setCurrentAnalysisId] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Study Materials</h1>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div>
            <MaterialAnalyzer
              onAnalysisComplete={(analysisId) => setCurrentAnalysisId(analysisId)}
            />
          </div>
          {currentAnalysisId && (
            <div>
              <AnalysisResults analysisId={currentAnalysisId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
