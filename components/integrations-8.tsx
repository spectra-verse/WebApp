import {
  Ollama,
  Gemma,
  DeepSeek,
  Qwen,
  Mistral,
  LMStudio,
} from "@/components/logos";
import Link from "next/link";

export default function IntegrationsSection() {
  return (
    <section id="integrations">
      <div className="bg-muted dark:bg-background py-24 md:py-32">
        <div className="mx-auto flex flex-col px-6 md:grid md:max-w-5xl md:grid-cols-2 md:gap-12">
          <div className="order-last mt-6 flex flex-col gap-12 md:order-first">
            <div className="space-y-6">
              <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
                Integrate with your favorite LLMs
              </h2>
              <p className="text-muted-foreground">
                Connect seamlessly with popular, open source llms to enhance
                your workflow.
              </p>
              <div className="flex gap-4 items-center justify-center">
                <Link
                  href="/chat"
                  className="bg-slate-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          <div className="-mx-6 px-6 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] sm:mx-auto sm:max-w-md md:-mx-6 md:ml-auto md:mr-0">
            <div className="bg-background dark:bg-muted/50 rounded-2xl border p-3 shadow-lg md:pb-12">
              <div className="grid grid-cols-2 gap-2">
                <Integration
                  icon={<Ollama className="size-10" />}
                  name="Ollama"
                  description="Run large language models locally on your machine."
                />
                <Integration
                  icon={<Gemma className="size-10" />}
                  name="Gemma"
                  description="Lightweight, open models from Google DeepMind."
                />
                <Integration
                  icon={<DeepSeek className="size-10" />}
                  name="DeepSeek"
                  description="High-performance open-source reasoning models."
                />
                <Integration
                  icon={<Qwen className="size-10" />}
                  name="Qwen"
                  description="Alibaba's powerful multilingual language models."
                />
                <Integration
                  icon={<Mistral className="size-10" />}
                  name="Mistral"
                  description="Fast, efficient open-weight models from Mistral AI."
                />
                <Integration
                  icon={<LMStudio className="size-10" />}
                  name="LM Studio"
                  description="Discover, download, and run local LLMs with ease."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Integration = ({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) => {
  return (
    <div className="hover:bg-muted dark:hover:bg-muted/50 space-y-4 rounded-lg border p-4 transition-colors">
      <div className="flex size-fit items-center justify-center">{icon}</div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-muted-foreground line-clamp-1 text-sm md:line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
