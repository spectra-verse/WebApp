import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FormattedModel } from "@/hooks/useOllamaModels";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isActive = (path: string) => {
    return pathname === path;
  };
  return (
    <div className="mb-12 flex w-full items-center justify-between">
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
      <div>
        <button
          onClick={() => {}}
          className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive("/chat")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
