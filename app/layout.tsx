import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "A private AI assistant and coding agent powered by the latest open-source models, running on your own Mac. Your code and conversations never leave your machine.";

export const metadata: Metadata = {
  metadataBase: new URL("https://spectraverseinc.com"),
  title: {
    default: "Spectraverse: private, local AI on your Mac",
    template: "%s | Spectraverse",
  },
  description,
  applicationName: "Spectraverse",
  keywords: [
    "local AI",
    "private AI",
    "Ollama",
    "open-source LLM",
    "Mac",
    "Gemma 4",
    "AI coding agent",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://spectraverseinc.com",
    siteName: "Spectraverse",
    title: "Spectraverse: private, local AI on your Mac",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectraverse: private, local AI on your Mac",
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
