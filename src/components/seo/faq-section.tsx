type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  faqs: readonly FaqItem[];
};

export function FaqSection({ eyebrow = "FAQ", title, description, faqs }: Props) {
  return (
    <section className="mt-5 rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h2>
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-4 space-y-2.5">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-[18px] border border-border bg-secondary/40 px-4 py-3.5">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">{faq.question}</summary>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
