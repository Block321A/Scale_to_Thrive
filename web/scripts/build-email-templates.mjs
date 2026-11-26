// Writes the Supabase email templates to ../supabase/email-templates/*.html
// Run: npm run build:emails
import { writeFileSync, mkdirSync } from "node:fs";
import { AUTH_TEMPLATES, renderAuthTemplate } from "../src/lib/email-auth-templates.ts";

const dir = new URL("../../supabase/email-templates/", import.meta.url);
mkdirSync(dir, { recursive: true });
let index = "# Supabase email templates\n\nPaste each file into Supabase: Authentication -> Emails -> (template). Set the subject too.\n\n| Supabase template | Subject | File |\n|---|---|---|\n";
for (const t of AUTH_TEMPLATES) {
  writeFileSync(new URL(`${t.file}.html`, dir), renderAuthTemplate(t));
  index += `| ${t.where} | ${t.subject} | \`${t.file}.html\` |\n`;
}
writeFileSync(new URL("README.md", dir), index);
console.log(`Wrote ${AUTH_TEMPLATES.length} templates`);
