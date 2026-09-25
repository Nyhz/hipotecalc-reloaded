# Mortgage comparison review — 24 September 2026

Both comparison pages use the same offer dataset and review date. English explanatory text lives in `src/constants/hipotecas-bancos.en.json`; bank and product names retain their Spanish wording.

## Coverage

- 57 current entries across 27 lender, brand and group labels. Some entries represent product families or a banking group; this is not a count of independent banks or the entire Spanish market.
- Each current entry carries an official source URL and an individual review date in `src/constants/hipotecas-bancos.ts`. The source is visible in its expanded conditions.
- 11 previous listings remain separately recorded because current availability or terms could not be confirmed. Their old numerical terms are not displayed or included in offer counts.
- 18 other institution/brand notes remain available. Older notes retain their 24 August date, so this review does not imply they were all reverified.

## Editorial decisions

- Refreshed published TIN/APR examples, fixed periods, subsequent Euribor spreads, borrowing terms, financing limits, bundles and fees where verifiable on official pages.
- BBVA and Bankinter pages did not expose complete, consistently verifiable prices. These entries request a quote. The same rule applies to other personalised or incomplete offers.
- Cajamar exposes fixed and mixed TIN figures but incomplete APR values in the reviewed page content. TIN is retained; APR explicitly requests confirmation.
- Avantio figures use its official simulator consistently because product-page examples differed.
- Split Sabadell's 3/5/7-year mixed offers and Ibercaja's 5/10-year mixed offers into separate rows. Preserved differences between advertised examples and maximum terms, including ABANCA and COINC.
- Added imagin's verified fixed offer; renamed Banco Caminos/Bancofar to CBNK; split Caixa Ontinyent and Colonya into separate institutions.
- Moved EVO, Targobank and Cajasur to integration notes and Triodos to a lending-suspension note, each with its official source.
- Removed previous-rate values because the old examples and sources were not consistently comparable. Trend arrows must only return with equivalent products, terms and discount assumptions.
- Published APR figures are not recalculated using the Euribor in the page header. Discounted APR may exceed standard APR because of bundled costs.

## Maintenance

Review the source linked on each entry before replacing its figures or advancing its date. Preserve introductory periods, discounted/standard ordering and the lender's example assumptions. Do not infer zero fees, current availability, borrowing limits or missing APRs from an empty field. Add an explicit English translation for any new explanatory text; the test suite checks coverage.

The shared FAQ, methodology pages, comparison metadata, structured data and sitemap review dates were aligned with these rules. Search supports both languages and accent-insensitive matching; combined product families participate in each applicable type filter.
