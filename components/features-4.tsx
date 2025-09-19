import {
  Cpu,
  Fingerprint,
  Pencil,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Features() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Privacy First AI Tools
          </h2>
          <p>
            Spectraverse is evolving to be more than just the models. It
            supports an entire to the APIs and platforms helping developers and
            businesses innovate.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">AI code generator</h3>
            </div>
            <p className="text-sm">
              AI code generation tools to create code from natural language or
              patterns, streamlining development and improving efficiency.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Data Ownership</h3>
            </div>
            <p className="text-sm">
              You control your inputs, outputs, and model usage. You control the
              cost.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4" />

              <h3 className="text-sm font-medium">Security</h3>
            </div>
            <p className="text-sm">
              The ultimate security: Your prompts are processed entirely
              offline, invisible to the world.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pencil className="size-4" />

              <h3 className="text-sm font-medium">Performance</h3>
            </div>
            <p className="text-sm">
              Benefit from reduced latency by keeping computation on your
              machine.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4" />

              <h3 className="text-sm font-medium">Control</h3>
            </div>
            <p className="text-sm">
              Your computer. Run, tune, and manage AI entirely on your terms
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">Built for AI</h3>
            </div>
            <p className="text-sm">
              It supports helping developers and businesses innovate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
