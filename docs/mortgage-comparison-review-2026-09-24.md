# Mortgage comparison review — 24 September 2026

Both comparison pages use the same 60 offers from 20 lender/brand labels. These are product variants, not 60 independent mortgages or a census of the Spanish market. Explanatory text is translated in `src/constants/hipotecas-bancos.en.json`; lender and product names retain their Spanish wording.

## Publication rules

- Every displayed offer has a verifiable numerical TIN and APR. No quote-request or personalised-price placeholders remain.
- Official source URLs and extraction dates remain in `src/constants/hipotecas-bancos.ts` for internal auditing. The comparison has one review date in its header; expanded rows show conditions without source links or repeated editorial dates.
- Removed the previous-listings and other-institutions sections, their datasets and their obsolete translations. Neither section is rendered in either language.
- Removed unpriced entries for Deutsche Bank, UCI, Laboral Kutxa, CBNK, the aggregate Grupo Caja Rural listing, Caixa Ontinyent and Colonya, plus Kutxabank’s fixed product. Kutxabank’s priced variable offer remains. Official product and tariff searches did not provide a current complete comparable price for these removed entries; old tariffs are not advertised as current offers.
- EVO, Targobank, Cajasur and Triodos are not counted as separate current offers. Earlier integration and suspension research is available in repository history.

## Sources and examples resolved in this follow-up

| Lender | Official evidence and treatment |
| --- | --- |
| ING | [Fixed FIPRE](https://www.ing.es/sobre-ing/pdf/InfPrecontractualFIPRE-HipotecaFija.pdf), [variable FIPRE](https://www.ing.es/sobre-ing/pdf/InfPrecontractualFIPRE.pdf), [mixed FIPRE](https://www.ing.es/sobre-ing/pdf/InfPrecontractualFIPRE-Mixta.pdf), dated 4 September 2026. Read and visually checked the current example tables. Seven rows: fixed, variable with 1/3-year initial periods, and mixed with 5/10/15/20-year fixed periods. Discounted and standard rates remain in the same order even where insurance makes the discounted APR higher. |
| BBVA | [Fixed](https://www.bbva.es/personas/productos/hipotecas/hipoteca-fija.html) and [variable](https://www.bbva.es/personas/productos/hipotecas/hipoteca-variable.html) pages, including their dynamically loaded representative-example dialogs. €150,000 over 25 years; offers valid through 30 September. No personal-data form submission was needed. |
| Bankinter | Current live [fixed](https://www.bankinter.com/banca/hipotecas-prestamos/hipotecas/hipoteca-fija), [variable](https://www.bankinter.com/banca/hipotecas-prestamos/hipotecas/hipoteca-variable) and [mixed](https://www.bankinter.com/banca/hipotecas-prestamos/hipotecas/hipoteca-mixta) examples. The older prices in the linked FIPRE were not substituted for current live prices. Fixed example uses 30 years; variable and mixed examples use 25. Mixed 5/10/15-year periods have separate rows. |
| Mediolanum | [Freedom Variable](https://www.bancomediolanum.es/es/w/financiacion/hipotecas/hipoteca-freedom-variable) and [Freedom Mixta](https://www.bancomediolanum.es/es/w/financiacion/hipotecas/hipoteca-freedom-mixta). September campaign, €150,000 over 25 years. The mixed example distinguishes its first year from years 2–5 and the variable period. |
| Caja de Ingenieros | Current [fixed](https://www.caixaenginyers.com/es/hipoteca-fija) and [mixed](https://www.caixaenginyers.com/es/hipoteca-mixta) pages. Six fixed examples distinguish 15/20/30-year terms and 60%/80% financing. Two mixed examples distinguish 5/10-year fixed periods. Used fresh page figures rather than older search snippets. |
| Arquia | [Mixed](https://www.arquia.com/particulares/hipotecas/hipoteca-mixta/) and [variable](https://www.arquia.com/particulares/hipotecas/hipoteca-variable/) examples. The mixed legal example specifies 36 initial fixed months and a €750 opening fee; variable specifies 12 months and no opening fee. APR examples use Euribor of 2.855%. |
| Cajamar | Loaded the complete dynamic [fixed](https://www.cajamar.es/es/particulares/productos-y-servicios/financiacion/hipotecas/hipoteca-tipo-fijo/) and [mixed](https://www.cajamar.es/es/particulares/productos-y-servicios/financiacion/hipotecas/hipoteca-tipo-mixto/) examples: €100,000 over 30 years. Fixed APR 3.72%/3.91%; mixed 3.96%/4.17%. Opening and published early-repayment conditions are included. |
| MyInvestor | Loaded the [variable new-purchase calculator](https://myinvestor.es/hipotecas/hipoteca-variable/): €100,000 over 30 years, first-year 2.75%, then Euribor +0.79%, APR 3.96%. The page’s older static legal example/headline has APR 3.49% with different assumptions; it is not mixed with the loaded calculator’s example. |

Santander’s income/card/insurance discount example and repayment fees, Kutxabank’s income/pension/home-insurance requirements, and Avantio’s 0.70-point discount breakdown were also made concrete. Where only an opening fee could be verified, the fee field states that known fee without implying that all other fees are zero.

## Retained decisions

- Sabadell’s 3/5/7-year mixed offers and Ibercaja’s 5/10-year offers remain separate.
- ABANCA and COINC examples retain their stated example terms, which differ from the maximum available terms. Avantio uses its official simulator consistently where product-page examples differ.
- APR is not recalculated using the Euribor in the page header. Each lender’s example has its own amount, term and assumptions.
- Historical trend arrows require genuinely comparable earlier products, terms and discount conditions. None were inferred from the replacement of old estimates.

## Maintenance and verification

Review the source recorded on each entry before changing its figures or extraction date. Preserve introductory periods, discounted/standard order and the example’s assumptions. Do not infer missing APRs or zero fees. Add English translations for all new explanatory text.

The shared FAQs and both methodology pages describe the current publication rules. Automated checks require numerical TIN/APR, source provenance, translation coverage and the complete ING term variants. Search remains bilingual and accent-insensitive. Visual checks cover desktop and mobile layouts, expandable conditions, the single header review date, and absence of the removed sections and lender source links.
