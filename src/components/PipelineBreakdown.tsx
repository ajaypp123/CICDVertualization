import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Step {
  name: string;
  commands: string[];
}

interface Job {
  name: string;
  steps: Step[];
}

interface Stage {
  name: string;
  jobs: Job[];
}

interface PipelineBreakdownProps {
  stages?: Stage[];
  selectedNodeId?: string;
  isLoading?: boolean;
}

const PipelineBreakdown: React.FC<PipelineBreakdownProps> = ({
  stages = [],
  selectedNodeId = "",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-full w-full bg-background p-4 border rounded-md">
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-6 w-3/4 bg-muted rounded"></div>
          <div className="h-4 w-1/2 bg-muted rounded"></div>
          <div className="h-20 w-full bg-muted rounded"></div>
          <div className="h-4 w-2/3 bg-muted rounded"></div>
          <div className="h-20 w-full bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="h-full w-full bg-background p-4 border rounded-md flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium">Pipeline Breakdown</h3>
        <p className="text-muted-foreground mt-2">
          Upload a CI/CD configuration file to view the pipeline breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Pipeline Breakdown</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <Accordion type="single" collapsible className="w-full">
          {stages.map((stage, index) => {
            const isSelected = selectedNodeId === `stage-${stage.name}`;
            return (
              <AccordionItem
                key={`stage-${index}`}
                value={`stage-${index}`}
                className={isSelected ? "bg-accent/30 rounded-md" : ""}
              >
                <AccordionTrigger className="px-2">
                  <div className="flex items-center">
                    <span>{stage.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {stage.jobs.length}{" "}
                      {stage.jobs.length === 1 ? "job" : "jobs"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {stage.jobs.map((job, jobIndex) => (
                    <div
                      key={`job-${jobIndex}`}
                      className={`mb-4 p-2 rounded-md ${selectedNodeId === `job-${job.name}` ? "bg-accent/50" : "bg-muted/30"}`}
                    >
                      <h4 className="font-medium text-sm mb-2">{job.name}</h4>
                      <Separator className="my-2" />
                      {job.steps.map((step, stepIndex) => (
                        <div key={`step-${stepIndex}`} className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {step.name}
                          </p>
                          <div className="bg-muted p-2 rounded-md mt-1 text-xs font-mono overflow-x-auto">
                            {step.commands.map((cmd, cmdIndex) => (
                              <div
                                key={`cmd-${cmdIndex}`}
                                className="whitespace-pre-wrap"
                              >
                                $ {cmd}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default PipelineBreakdown;
