import React, { useState } from "react";
import FileUploader from "./FileUploader";
import PipelineVisualizer from "./PipelineVisualizer";
import PipelineBreakdown from "./PipelineBreakdown";
import { Card, CardContent } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Toaster } from "./ui/toaster";

interface PipelineData {
  stages: {
    name: string;
    jobs: {
      name: string;
      steps: {
        name: string;
        commands: string[];
      }[];
    }[];
  }[];
  mermaidDefinition: string;
  fileType: "jenkins" | "github" | "gitlab";
  fileName: string;
  fileSize: number;
}

const Home = () => {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
    toast({
      title: "File Uploaded Successfully",
      description: `${file.name} (${(file.size / 1024).toFixed(1)} KB) is being processed...`,
    });
  };

  const handleFileProcessed = (data: PipelineData) => {
    setPipelineData(data);
    setSelectedNode(null);
    setError(null);

    toast({
      title: "Pipeline Processed Successfully!",
      description: `Found ${data.stages.length} stages in your ${data.fileType.toUpperCase()} pipeline configuration.`,
    });
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(null);
  };

  const handleProcessingError = (errorMessage: string) => {
    setIsProcessing(false);
    setError(errorMessage);
    setPipelineData(null);

    toast({
      title: "Processing Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4 px-6">
        <h1 className="text-2xl font-bold">CI/CD Pipeline Visualizer</h1>
        <p className="text-muted-foreground">
          Upload your pipeline configuration to generate an interactive
          flowchart
        </p>
      </header>

      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <Card>
            <CardContent className="pt-6">
              <FileUploader
                onFileAccepted={handleFileAccepted}
                onFileProcessed={handleFileProcessed}
                onProcessingStart={handleProcessingStart}
                onProcessingError={handleProcessingError}
                onProcessingComplete={handleProcessingComplete}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {pipelineData && (
            <Card className="flex-1">
              <CardContent className="pt-6 h-full">
                <PipelineBreakdown
                  stages={pipelineData.stages}
                  selectedNode={selectedNode}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-full lg:w-2/3">
          <Card className="h-full">
            <CardContent className="pt-6 h-full">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Processing pipeline configuration...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-destructive">
                    <p className="text-lg font-semibold mb-2">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : !pipelineData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg mb-2">No pipeline data</p>
                    <p>
                      Upload a CI/CD configuration file to visualize your
                      pipeline
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <PipelineVisualizer
                    fileContent={pipelineData.mermaidDefinition}
                    fileType={pipelineData.fileType}
                    isProcessing={false}
                    error={""}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>CI/CD Pipeline Visualizer - Client-side processing for privacy</p>
      </footer>

      <Toaster />
    </div>
  );
};

export default Home;
