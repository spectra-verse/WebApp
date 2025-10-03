import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FormattedModel } from "@/hooks/useOllamaModels";
export default function ModelSelector({
  selectedModel,
  setSelectedModel,
  models,
  isLoading,
}: {
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  models: FormattedModel[];
  isLoading: boolean;
}) {
  return (
    <div className="mb-2 flex w-full items-center justify-between">
      <div className="relative">
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 pointer-events-none">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
