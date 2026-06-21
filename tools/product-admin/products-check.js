#!/usr/bin/env node
import { buildCheckReport, formatCheckReport } from './product-data.js';

const report = buildCheckReport();
console.log(formatCheckReport(report));

if (!process.argv.includes('--strict')) {
  process.exitCode = 0;
  process.exit();
}

const hasBlockingIssues =
  report.variantMissingPrice.length > 0 ||
  report.variantMissingSku.length > 0 ||
  report.variantMissingStock.length > 0 ||
  report.duplicateSkus.length > 0 ||
  report.imagesMissingFile.length > 0 ||
  report.missingImageProducts.length > 0;

process.exitCode = hasBlockingIssues ? 1 : 0;
