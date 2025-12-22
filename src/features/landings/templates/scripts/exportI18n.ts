/**
 * Export Template I18n to Messages Files
 *
 * This script exports template i18n translations to the messages files.
 * Run it whenever template translations change to sync with messages files.
 *
 * Usage:
 *   npx tsx src/features/landings/templates/scripts/exportI18n.ts
 *
 * This will update:
 *   - messages/en.json
 *   - messages/fr.json
 *   - messages/ar.json (if available)
 */

import * as fs from "fs";
import * as path from "path";
import { slotTemplateI18n } from "../i18n/slotTemplate.i18n";
import { exportTemplateI18n } from "../translation/translateTemplate";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const LOCALES = ["en", "fr", "ar"];

interface MessagesFile {
  landings?: {
    templates?: Record<string, any>;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Load a messages file
 */
function loadMessages(locale: string): MessagesFile {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`Messages file not found: ${filePath}`);
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Save a messages file
 */
function saveMessages(locale: string, messages: MessagesFile): void {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n", "utf-8");

  console.log(`✓ Updated ${locale}.json`);
}

/**
 * Update template translations in messages file
 */
function updateTemplateInMessages(
  messages: MessagesFile,
  templateId: string,
  templateI18n: Record<string, any>
): MessagesFile {
  // Ensure structure exists
  if (!messages.landings) {
    messages.landings = {};
  }

  if (!messages.landings.templates) {
    messages.landings.templates = {};
  }

  // Update template translations
  messages.landings.templates[templateId] = templateI18n;

  return messages;
}

/**
 * Main export function
 */
function exportAllTemplates(): void {
  console.log("Exporting template i18n to messages files...\n");

  // Templates to export
  const templates = [
    { id: "slotTemplate", i18n: slotTemplateI18n },
    // Add more templates here as they are created
  ];

  // Process each locale
  for (const locale of LOCALES) {
    console.log(`Processing ${locale}...`);

    // Load existing messages
    const messages = loadMessages(locale);

    // Export each template
    for (const template of templates) {
      const templateI18n = exportTemplateI18n(template.i18n, locale);
      updateTemplateInMessages(messages, template.id, templateI18n);

      console.log(`  - Exported ${template.id}`);
    }

    // Save updated messages
    saveMessages(locale, messages);

    console.log("");
  }

  console.log("✓ Template i18n export complete!");
}

// Run the export
exportAllTemplates();
