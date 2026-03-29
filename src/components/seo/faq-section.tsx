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
    <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">{title}</h2>
        </div>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="mt-4 space-y-2.5">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3.5">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
