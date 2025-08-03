import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileWarning, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  onFileAccepted: (file: File) => void;
  onFileProcessed?: (data: any) => void;
  onProcessingStart?: () => void;
  onProcessingError?: (error: string) => void;
  onProcessingComplete?: () => void;
  isProcessing?: boolean;
}

const FileUploader = ({
  onFileAccepted,
  onFileProcessed,
  onProcessingStart,
  onProcessingError,
  onProcessingComplete,
  isProcessing = false,
}: FileUploaderProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File) => {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return "File size exceeds 2MB limit";
    }

    // Check file extension
    const validExtensions = [".yml", ".yaml", ".groovy"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return "Invalid file format. Please upload .yml, .yaml, or .groovy files";
    }

    return null;
  };

  const processFile = async (file: File) => {
    try {
      onProcessingStart?.();

      // Read file content
      const content = await file.text();

      // Determine file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let fileType: "jenkins" | "github" | "gitlab" = "github";

      if (fileExtension === "groovy") {
        fileType = "jenkins";
      } else if (
        file.name.includes("gitlab") ||
        content.includes("gitlab-ci")
      ) {
        fileType = "gitlab";
      }

      // Mock processing - in real implementation, parse the actual file
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

      // Generate mock pipeline data
      const pipelineData = {
        stages: [
          {
            name: "Build",
            jobs: [
              {
                name: "build-job",
                steps: [
                  {
                    name: "Install dependencies",
                    commands: ["npm install"],
                  },
                  {
                    name: "Build application",
                    commands: ["npm run build"],
                  },
                ],
              },
            ],
          },
          {
            name: "Test",
            jobs: [
              {
                name: "test-job",
                steps: [
                  {
                    name: "Run unit tests",
                    commands: ["npm run test:unit"],
                  },
                  {
                    name: "Run integration tests",
                    commands: ["npm run test:integration"],
                  },
                ],
              },
            ],
          },
          {
            name: "Deploy",
            jobs: [
              {
                name: "deploy-job",
                steps: [
                  {
                    name: "Deploy to staging",
                    commands: ["deploy-script --env=staging"],
                  },
                  {
                    name: "Run smoke tests",
                    commands: ["npm run test:smoke"],
                  },
                ],
              },
            ],
          },
        ],
        mermaidDefinition: `
          graph TD
            A[Build] --> B[Test]
            B --> C[Deploy to Staging]
            C --> D{Approval}
            D -->|Approved| E[Deploy to Production]
            D -->|Rejected| F[Notify Team]
            E --> G[Post-deployment Tests]
            F --> H[Update Ticket]
        `,
        fileType,
        fileName: file.name,
        fileSize: file.size,
      };

      onFileProcessed?.(pipelineData);
      onProcessingComplete?.();
    } catch (error) {
      onProcessingError?.(
        "Failed to process file. Please check the file format and try again.",
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onFileAccepted(file);
      processFile(file);
    },
    [
      onFileAccepted,
      onFileProcessed,
      onProcessingStart,
      onProcessingError,
      onProcessingComplete,
    ],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: false,
    maxFiles: 1,
    accept: {
      "text/yaml": [".yml", ".yaml"],
      "text/plain": [".groovy"],
    },
  });

  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-background p-6 rounded-xl border-2 border-dashed border-muted-foreground/25">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-8 rounded-lg transition-colors ${isDragging ? "bg-primary/10" : "bg-background"}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />

        {isProcessing ? (
          <div className="w-full space-y-4 text-center">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
            <h3 className="text-lg font-medium">Processing file...</h3>
            <Progress value={65} className="w-full max-w-md mx-auto" />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              {error ? (
                <FileWarning className="h-12 w-12 text-destructive" />
              ) : (
                <Upload className="h-12 w-12 text-primary" />
              )}
            </div>

            <h3 className="text-lg font-medium mb-2">
              Upload CI/CD Configuration File
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Drag and drop your pipeline configuration file here, or click the
              button below
            </p>

            <Button onClick={open} className="mb-2">
              Browse Files
            </Button>

            <p className="text-xs text-muted-foreground">
              Supports .yml, .yaml, and .groovy files (max 2MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploader;
