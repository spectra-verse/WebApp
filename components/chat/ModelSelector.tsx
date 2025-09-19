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
    <div className="mb-4">
      <Select
        value={selectedModel}
        onValueChange={setSelectedModel}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select model" />
          )}
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
