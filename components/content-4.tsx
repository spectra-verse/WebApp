import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32 mt-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-6xl font-medium">
            Private AI.
            <br /> Right on Your Machine
          </h2>
          <div className="space-y-6">
            <p>
              Run Ollama locally with a clean, modern web interface. No cloud,
              no tracking, no data sharing — just fast, secure AI directly on
              your computer.
            </p>
            <p>
              Your private sandbox to explore, create, and innovate with LLMs.
              Experiment without limits, free from usage fees and prying eyes.
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="gap-1 pr-1.5"
            >
              <Link href="#">
                <span>Create Account</span>
                <ChevronRight className="size-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
