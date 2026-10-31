import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible play policy",
};

const SECTIONS: ReadonlyArray<{ readonly heading: string; readonly body: string }> = [
  {
    heading: "What this page will say",
    body: "The final wording is being written with a lawyer. Until then this page is a placeholder and creates no rights or obligations for anyone.",
  },
  {
    heading: "Questions in the meantime",
    body: "If you need an answer before launch, ask support and it will be answered directly. Nothing on this site depends on a draft being correct.",
  },
];

/** A draft page. Marked as one, at the top, in words. */
export default function Page() {
  return (
    <article className="mx-auto flex w-full max-w-[640px] flex-col gap-3 py-2">
      <p className="border-warn/40 rounded-control border bg-warn-tint px-2 py-1.5 text-small text-warn">
        Draft, final text before launch.
      </p>
      <h1 className="font-semibold text-ink text-page">Responsible play policy</h1>
      {SECTIONS.map((section) => (
        <section key={section.heading}>
          <h2 className="text-small font-semibold text-ink">{section.heading}</h2>
          <p className="mt-1 text-small text-ink-muted">{section.body}</p>
        </section>
      ))}
    </article>
  );
}
