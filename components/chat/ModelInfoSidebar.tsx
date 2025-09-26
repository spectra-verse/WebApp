"use client"

interface ModelInfoSidebarProps {
  className?: string
}

export default function ModelInfoSidebar({ className = "" }: ModelInfoSidebarProps) {
  const modelInfo = {
    source: "Platform",
    modelName: "phi3",
    parameterSize: "3.8B",
    capabilities: ["Completions"],
    modifiedAt: "9th Aug 2025"
  }

  return (
    <div className={`w-80 border-l bg-background p-6 space-y-6 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Model Information</h3>

        {/* Source */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Source</label>
          <p className="text-sm text-foreground">{modelInfo.source}</p>
        </div>

        {/* Model Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Model Name</label>
          <p className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
            {modelInfo.modelName}
          </p>
        </div>

        {/* Parameter Size */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Parameter Size</label>
          <p className="text-sm text-foreground">{modelInfo.parameterSize}</p>
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Capabilities</label>
          <ul className="space-y-1">
            {modelInfo.capabilities.map((capability, index) => (
              <li key={index} className="text-sm text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                {capability}
              </li>
            ))}
          </ul>
        </div>

        {/* Modified At */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Modified At</label>
          <p className="text-sm text-foreground">{modelInfo.modifiedAt}</p>
        </div>
      </div>
    </div>
  )
}