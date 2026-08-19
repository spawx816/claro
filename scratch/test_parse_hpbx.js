import { parseAndGenerateHPBXFromText } from '../src/utils/hpbxQuotationModel.js';

const testInput = "Cotízame una HPBX Pymes para el cliente Acme SRL, 6 usuarios, 1 Switch PoE de 8 puertos, 5 teléfonos GXP 1625 y 1 teléfono GXP 2130.";

const result = parseAndGenerateHPBXFromText(testInput);

console.log("=== PARSED RESULT ===");
console.log("Customer:", result.quote.customer);
console.log("Summary:", result.quote.summary);
console.log("QuoteData:", result.quoteData);
console.log("\n=== MARKDOWN ===\n");
console.log(result.markdown);
