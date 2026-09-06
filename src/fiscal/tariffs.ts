import type { Tariff, TaxStep } from "./types";
import { cents, money, text } from "./requirements";

export const flat = (rate: number): Tariff => ({ kind: "flat", rate });
export const bands = (
  kind: "progressive" | "whole-value",
  rows: [number | null, number][],
): Tariff => ({ kind, bands: rows.map(([upTo, rate]) => ({ upTo, rate })) });
export const partial = (
  limit: number,
  rate: number,
  excessRate: number,
): Tariff => ({ kind: "partial", limit, rate, excessRate });
export const quota = (
  underlying: Tariff,
  percent: number,
  adjustment: "bonificacion" | "deduccion" = "bonificacion",
  limit?: number,
): Tariff => ({ kind: "quota", underlying, percent, adjustment, limit });

/** Calculate on the whole property's value, then allocate to the acquired share. */
export function assess(
  tariff: Tariff,
  base: number,
  share = 1,
): { amount: number; steps: TaxStep[] } {
  const steps: TaxStep[] = [];
  const add = (slice: number, rate: number, index = 1) => {
    if (slice <= 0) return;
    steps.push({
      label: text(`Tramo ${index}`, `Band ${index}`),
      base: money(slice * share),
      rate,
      amount: money(((slice * rate) / 100) * share),
    });
  };
  if (tariff.kind === "flat") add(base, tariff.rate);
  else if (tariff.kind === "whole-value") {
    const band = tariff.bands.find(
      (b) => b.upTo === null || cents(base) <= cents(b.upTo),
    );
    if (!band) throw new Error("Incomplete whole-value tariff");
    add(base, band.rate);
    if (steps[0])
      steps[0].label = text(
        "Tipo sobre toda la base",
        "Rate on the entire base",
      );
  } else if (tariff.kind === "partial") {
    add(Math.min(base, tariff.limit), tariff.rate);
    add(Math.max(0, money(base - tariff.limit)), tariff.excessRate, 2);
  } else if (tariff.kind === "progressive") {
    let previous = 0;
    tariff.bands.forEach((band, i) => {
      const slice = Math.max(0, Math.min(base, band.upTo ?? base) - previous);
      add(slice, band.rate, i + 1);
      previous = band.upTo ?? base;
    });
    if (tariff.meanRounding === "balear" && base > 0) {
      // Art. 10 ATIB: the third decimal rounds up only when strictly greater than 5.
      let lower = 0;
      const full = tariff.bands.reduce((total, band) => {
        const slice = Math.max(0, Math.min(base, band.upTo ?? base) - lower);
        lower = band.upTo ?? base;
        return total + (slice * band.rate) / 100;
      }, 0);
      const scaled = Math.floor((full / base) * 100 * 1000 + 1e-8);
      const rate = (Math.floor(scaled / 10) + (scaled % 10 > 5 ? 1 : 0)) / 100;
      const before = money(steps.reduce((s, x) => s + x.amount, 0));
      const after = money(((base * rate) / 100) * share);
      steps.push({
        label: text(
          "Ajuste por tipo medio ATIB (dos decimales)",
          "ATIB mean-rate rounding adjustment (two decimals)",
        ),
        base: money(base * share),
        rate,
        amount: money(after - before),
      });
    }
  } else {
    const full = assess(tariff.underlying, base, share);
    steps.push(...full.steps);
    const eligible =
      tariff.limit === undefined
        ? full.amount
        : assess(tariff.underlying, Math.min(base, tariff.limit), share).amount;
    steps.push({
      label: text(
        `${tariff.adjustment === "deduccion" ? "Deducción" : "Bonificación"} de cuota del ${tariff.percent} %`,
        `${tariff.percent}% tax-bill relief`,
      ),
      base: eligible,
      amount: -money((eligible * tariff.percent) / 100),
    });
  }
  return { amount: money(steps.reduce((s, x) => s + x.amount, 0)), steps };
}
