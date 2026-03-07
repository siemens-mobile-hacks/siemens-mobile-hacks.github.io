import "dotenv/config";
import { OpenAI } from "openai";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { packageDirectorySync } from "package-directory";
import YAML from "yaml";
import dedent from "dedent";

const VERSION = 1;

const originalPath = `${packageDirectorySync()}/docs/`;
const translatedPath = `${packageDirectorySync()}/i18n/en/docusaurus-plugin-content-docs/current/`;
const cacheIndexFile = `${packageDirectorySync()}/i18n/index.yaml`;

type TranslatedMarkdown = {
  translatedMarkdownSource: string;
};

type CacheIndex = {
  state: Record<string, string>;
  money: number;
  inputTokens: number;
  outputTokens: number;
};

(async function () {
  const client = new OpenAI({ apiKey: process.env['OPENAI_KEY'] });
  const cacheIndex: CacheIndex = fs.existsSync(cacheIndexFile) ?
    YAML.parse(fs.readFileSync(cacheIndexFile).toString()) :
    {
      state: {},
    };

  for (const file of fs.globSync(`${translatedPath}/**/*`)) {
    const baseName = path.relative(translatedPath, file);
    if (fs.lstatSync(file).isDirectory())
      continue;

    if (!fs.existsSync(`${originalPath}/${baseName}`)) {
      console.log("Remove unclaimed translation: ", baseName);
      fs.unlinkSync(file);
    }
  }

  for (const file of fs.globSync(`${originalPath}/**/*`)) {
    const baseName = path.relative(originalPath, file);
    const outputFile = `${translatedPath}/${baseName}`;

    if (fs.lstatSync(file).isDirectory())
      continue;

    if (!fs.existsSync(path.dirname(outputFile)))
      fs.mkdirSync(path.dirname(outputFile), {recursive: true});

    if (file.endsWith(".md")) {
      const model = "gpt-5.4";
      const markdownInput = fs.readFileSync(`${originalPath}/${baseName}`, 'utf8');
      const markdownHash = crypto.createHash('md5').update([VERSION, markdownInput].join(":")).digest('hex');

      if (fs.existsSync(outputFile) && cacheIndex.state[baseName] === markdownHash)
        continue;

      console.log(baseName);
      const response = await client.responses.create({
        model,
        instructions: dedent(`
          Translate the following Markdown document from Russian to English as professional software documentation.

          PRIORITY ORDER:
          1. Preserve syntax, formatting, and document structure exactly.
          2. Translate only human-readable natural language.
          3. Prefer natural technical English over literal word-for-word translation.
          4. If translation would require changing syntax, formatting, or structure, preserve the original syntax, formatting, or structure.

          TRANSLATE:
          - Headings, paragraphs, blockquotes, list items, and table cell text.
          - Natural-language comments inside fenced code blocks, but only when the code itself remains unchanged.
          - Alt text for images only if it is human-readable natural language.
          - YAML frontmatter values only if they are human-readable prose (for example, \`title\`), but never change keys.

          DO NOT CHANGE:
          - Fenced code block contents, except translatable natural-language comments.
          - Inline code spans (\`...\`).
          - Identifiers, commands, file names, paths, constants, register names, API names, config keys, class names, function names, variable names, menu paths, or URLs.
          - Markdown syntax, heading levels, list structure, tables, links, indentation, spacing, blank lines, or directive markers.
          - Documentation directives such as:
            :::warning
            :::note
            :::tip
            :::danger

          DIFF INPUT RULES:
          - If the input is a diff or contains diff hunks, preserve all diff syntax exactly.
          - Never modify lines that start with \`---\`, \`+++\`, \`@@\`, \`+\`, or \`-\`.
          - Do not translate comments inside added, removed, or context diff lines if that would change the diff line itself.

          STYLE:
          - Use clear, concise, natural technical English typical of software and hardware documentation.
          - Translate accurately without adding information, removing information, or changing meaning.
          - Do not rewrite for style beyond what is necessary for correct and natural English.
          - Keep sentence and paragraph boundaries the same whenever possible.
          - Preserve the original tone: factual, technical, and concise.

          NATURAL ENGLISH PREFERENCE:
          - Prefer idiomatic technical English over Russian-influenced phrasing when meaning stays the same.
          - Avoid awkward literal constructions such as:
            - "is applicable"
            - "possible by two methods"
            - "performed from"
            - "the input was entered"
            - "from Infineon itself"
          - Prefer standard documentation phrasing such as:
            - "can be used"
            - "can be done in two ways"
            - "in PTEST mode"
            - "enter the code quickly"
            - "Infineon's own"
          - Use imperative phrasing naturally for instructions and procedural steps when the original text is instructional.

          TERMINOLOGY:
          - Keep technical terms consistent within the document.
          - Prefer conventional technical wording used by native English documentation writers.
          - Do not translate product names, protocol names, chipset names, firmware names, or tool names.

          SELF-CHECK BEFORE FINALIZING:
          - Verify that all Markdown syntax is preserved.
          - Verify that code was not modified except for allowed natural-language comments.
          - Verify that identifiers, paths, URLs, and inline code were not changed.
          - Verify that no diff markers or diff lines were modified.
          - Verify that the result reads as natural technical English, not as a literal word-for-word translation.

          OUTPUT:
          - Return only the translated Markdown document.
        `),
        input: markdownInput,
        temperature: 0,
        text: {
          format: {
            type: "json_schema",
            name: "TranslatedMarkdown",
            schema: {
              type: "object",
              properties: {
                translatedMarkdownSource: {
                  type: "string",
                  description: "The translated markdown content."
                }
              },
              required: ["translatedMarkdownSource"],
              additionalProperties: false
            }
          }
        }
      });
      console.log(response.usage);

      const modelResponse = JSON.parse(response.output_text) as TranslatedMarkdown;
      fs.writeFileSync(`${translatedPath}/${baseName}`, modelResponse.translatedMarkdownSource);

      cacheIndex.state[baseName] = markdownHash;
      fs.writeFileSync(cacheIndexFile, YAML.stringify(cacheIndex));
    } else {
      if (fs.existsSync(outputFile))
        fs.unlinkSync(outputFile);
      fs.symlinkSync(path.relative(path.dirname(outputFile), file), outputFile);
    }
  }
})();
