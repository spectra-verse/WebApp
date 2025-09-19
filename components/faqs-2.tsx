"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function FAQsTwo() {
  const faqItems = [
    {
      id: "item-1",
      question: "What is Spectraverse?",
      answer:
        "Spectraverse is an integrated webapp to seamlessly test different LLM models such as GPT4, Claude, Gemini, etc.",
    },
    {
      id: "item-2",
      question: "What are LLM?",
      answer:
        "LLM stands for Large Language Model. It's a type of artificial intelligence model trained on vast amounts of text data to understand and generate human-like text. These models, like GPT-4, can perform various tasks, such as answering questions, generating content, translating languages, and more, by leveraging patterns learned from the data they were trained on ",
    },
    {
      id: "item-3",
      question: "Where can I test different AI models?",
      answer:
        " You can use Spectraverse's AI Playground to test different models, including GPT4, Claude, Perplexity and more. ",
    },
    {
      id: "item-4",
      question: "Is Spectraverse Free to use?",
      answer:
        " You can start using Spectraverse for free, and later upgrade your plan to access all its features. ",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            Discover quick and comprehensive answers to common questions about
            our platform, services, and features.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <Accordion
            type="single"
            collapsible
            className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-muted-foreground mt-6 px-8">
            Can't find what you're looking for? Contact our{" "}
            <Link href="#" className="text-primary font-medium hover:underline">
              customer support team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
