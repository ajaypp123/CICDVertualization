import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Loader2, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PipelineBreakdown from "./PipelineBreakdown";

interface PipelineVisualizerProps {
  fileContent?: string;
  fileType?: "jenkins" | "github" | "gitlab";
  isProcessing?: boolean;
  error?: string;
}

const PipelineVisualizer = ({
  fileContent = "",
  fileType = "github",
  isProcessing = false,
  error = "",
}: PipelineVisualizerProps) => {
  const [mermaidDefinition, setMermaidDefinition] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<Record<string, any>>({});
  const [zoom, setZoom] = useState<number>(1);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
      },
    });
  }, []);

  useEffect(() => {
    if (fileContent && !isProcessing) {
      try {
        // This is a placeholder for the actual parsing logic
        // In a real implementation, you would parse the fileContent based on fileType
        const parsedDefinition = parsePipelineToMermaid(fileContent, fileType);
        setMermaidDefinition(parsedDefinition);

        // Mock node details for demonstration
        const mockDetails = generateMockNodeDetails(parsedDefinition);
        setNodeDetails(mockDetails);

        // Render the mermaid diagram
        if (chartRef.current) {
          mermaid
            .render("mermaid-svg-container", parsedDefinition)
            .then(({ svg }) => {
              if (chartRef.current) {
                chartRef.current.innerHTML = svg;

                // Add click event listeners to nodes
                setTimeout(() => {
                  const nodes = chartRef.current?.querySelectorAll(".node");
                  nodes?.forEach((node) => {
                    node.addEventListener("click", () => {
                      const nodeId = node.id.replace("flowchart-", "");
                      setSelectedNode(nodeId);
                    });
                  });
                }, 100);
              }
            })
            .catch((err) => {
              console.error("Mermaid rendering error:", err);
            });
        }
      } catch (err) {
        console.error("Error parsing pipeline:", err);
      }
    }
  }, [fileContent, fileType, isProcessing]);

  // Placeholder function to parse pipeline config to Mermaid syntax
  const parsePipelineToMermaid = (content: string, type: string): string => {
    // This is a simplified mock implementation
    // In a real app, you would parse the actual file content based on type
    return `
      graph TD
        A[Build] --> B[Test]
        B --> C[Deploy to Staging]
        C --> D{Approval}
        D -->|Approved| E[Deploy to Production]
        D -->|Rejected| F[Notify Team]
        E --> G[Post-deployment Tests]
        F --> H[Update Ticket]
    `;
  };

  // Generate mock node details for demonstration
  const generateMockNodeDetails = (mermaidDef: string): Record<string, any> => {
    return {
      A: {
        name: "Build",
        steps: [
          { name: "Install dependencies", command: "npm install" },
          { name: "Build application", command: "npm run build" },
        ],
      },
      B: {
        name: "Test",
        steps: [
          { name: "Run unit tests", command: "npm run test:unit" },
          {
            name: "Run integration tests",
            command: "npm run test:integration",
          },
        ],
      },
      C: {
        name: "Deploy to Staging",
        steps: [
          {
            name: "Deploy to staging environment",
            command: "deploy-script --env=staging",
          },
        ],
      },
      D: {
        name: "Approval",
        steps: [{ name: "Wait for manual approval", command: "Manual step" }],
      },
      E: {
        name: "Deploy to Production",
        steps: [
          {
            name: "Deploy to production environment",
            command: "deploy-script --env=production",
          },
        ],
      },
      F: {
        name: "Notify Team",
        steps: [
          {
            name: "Send notification",
            command: "notify-script --channel=team-channel",
          },
        ],
      },
      G: {
        name: "Post-deployment Tests",
        steps: [
          { name: "Run smoke tests", command: "npm run test:smoke" },
          {
            name: "Run performance tests",
            command: "npm run test:performance",
          },
        ],
      },
      H: {
        name: "Update Ticket",
        steps: [
          {
            name: "Update JIRA ticket",
            command: "jira-update-script --status=rejected",
          },
        ],
      },
    };
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-background border rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">
          Processing pipeline configuration...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-background border rounded-lg">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your file and try again.
        </p>
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-background border rounded-lg">
        <p className="text-lg font-medium">No pipeline configuration loaded</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload a CI/CD configuration file to visualize the pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <Card className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pipeline Visualization</h2>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Move className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pan (Drag to move)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Always show the Mermaid text as a fallback */}
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">
              Mermaid Definition (Copy to Mermaid Playground)
            </h3>
            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto bg-background p-3 rounded border">
              {fileContent.trim()}
            </pre>
          </div>

          <div className="overflow-auto border rounded-md p-4 min-h-[400px]">
            <div
              ref={chartRef}
              className="mermaid-container"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                minHeight: "400px",
              }}
            >
              {/* Mermaid chart will be rendered here */}
              {!chartRef.current?.innerHTML && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Interactive chart will render here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PipelineVisualizer;
