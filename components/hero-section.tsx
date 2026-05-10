import Link from "next/link";

export default function HeroSection() {
  return (
    <>
      <main className="overflow-hidden">
        <section className="relative">
          <div className="relative py-24 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-12">
              <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                <h1 className="mt-8 text-6xl font-semibold md:text-5xl xl:text-7xl xl:[line-height:1.25]">
                  Run all your AI models
                  <br />{" "}
                  <span className="border-b-4 border-b-stone-800">locally</span>
                  <br />
                  in one place
                </h1>
                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                  Your all in one AI companion. Generate Images, videos, codes,
                  docs, debug your web apps all with Spectraverse interface.
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                  Highly customizable components for building modern websites
                  and applications, with your personal spark.
                </p>

                <div className="mt-8">
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
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
