import type { Language, TaxResult } from "../../fiscal/types";
import { formatNumberByLang } from "../../utils/number-format";

export default function TaxBreakdown({
  result,
  lang = "es",
}: {
  result: TaxResult;
  lang?: Language;
}) {
  const en = lang === "en",
    fmt = (n: number) => `${formatNumberByLang(n, lang)} €`;
  return (
    <div className="space-y-3 text-sm" data-tax-result aria-live="polite">
      <p>
        {en ? "Tax base used" : "Base fiscal utilizada"}:{" "}
        {fmt(result.fiscalBase)}. {result.baseReason[lang]}
      </p>
      <dl className="divide-y divide-line">
        {result.lines.map((line) => (
          <div key={line.tax} className="flex justify-between gap-4 py-2">
            <dt>
              {line.tax}
              {line.tax === "AJD"
                ? en
                  ? " (purchase deed)"
                  : " (adquisición)"
                : ""}
            </dt>
            <dd className="shrink-0 whitespace-nowrap">
              {line.amount === null
                ? en
                  ? "Pending verification"
                  : "Pendiente de verificación"
                : fmt(line.amount)}
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-3 font-heading text-xl text-brand-blue">
          <dt>
            {en ? "Total purchase taxes" : "Total impuestos de adquisición"}
          </dt>
          <dd className="shrink-0 whitespace-nowrap" data-tax-total>
            {result.total === null ? "—" : fmt(result.total)}
          </dd>
        </div>
      </dl>
      {result.provisional && (
        <p className="text-ink-soft">
          {en
            ? "Provisional estimate: outstanding information or legal checks may change the amount."
            : "Estimación provisional: los datos o comprobaciones pendientes pueden cambiar el importe."}
        </p>
      )}
      {result.warnings.map((w, i) => (
        <p key={i} className="text-ink-soft">
          {w[lang]}
        </p>
      ))}
      {result.pending.length > 0 && (
        <details>
          <summary className="cursor-pointer underline">
            {en
              ? "Could a different rate apply? Missing information"
              : "¿Podrías tener otro tipo? Datos que faltan"}
          </summary>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            {result.pending.map((p, i) => (
              <li key={`${p.rule}-${i}`}>
                {p.title[lang]}: {p.missing.map((m) => m[lang]).join("; ")}.
              </li>
            ))}
          </ul>
        </details>
      )}
      <details>
        <summary className="cursor-pointer underline">
          {en
            ? "Why this rate applies: calculation and law"
            : "Por qué se ha aplicado este tipo: cálculo y normativa"}
        </summary>
        {result.lines
          .filter((l) => l.rules.length)
          .map((line) => (
            <section key={line.tax} className="mt-3 space-y-2">
              <h3 className="font-heading">{line.tax}</h3>
              {line.steps.map((s, i) => (
                <p key={i}>
                  {s.label[lang]}: {fmt(s.base)}
                  {s.rate !== undefined
                    ? ` × ${formatNumberByLang(s.rate, lang)} %`
                    : ""}{" "}
                  = {fmt(s.amount)}
                </p>
              ))}
              {line.rules.map((r, i) => (
                <div key={`${r.id}-${i}`} data-tax-rule={r.id}>
                  <p>
                    {r.title[lang]} · {en ? "Buyer" : "Comprador"} {r.buyer} (
                    {formatNumberByLang(r.share * 100, lang)} %).
                  </p>
                  <p>
                    {en
                      ? "Engine rule for purchases from"
                      : "Regla del motor para devengos desde"}{" "}
                    {r.effectiveFrom}
                    {r.effectiveTo ? ` — ${r.effectiveTo}` : ""}.
                  </p>
                  <ul className="list-disc pl-5">
                    {r.requirements.map((x, j) => (
                      <li key={j}>{x[lang]}</li>
                    ))}
                  </ul>
                  <a
                    href={r.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {r.source.title} · {r.source.article}
                  </a>
                </div>
              ))}
            </section>
          ))}
      </details>
      <p className="text-xs text-ink-soft">
        {en ? "Legal review" : "Revisión normativa"}:{" "}
        <time dateTime={result.reviewed}>{result.reviewed}</time>.{" "}
        {en
          ? "Estimate for a residential purchase, not a filed tax return."
          : "Simulación de compra residencial, no una autoliquidación presentada."}
      </p>
    </div>
  );
}
