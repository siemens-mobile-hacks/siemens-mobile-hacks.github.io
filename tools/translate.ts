import "dotenv/config";
import { OpenAI } from "openai";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { packageDirectorySync } from "package-directory";
import YAML from "yaml";

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
  const client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
  const cacheIndex: CacheIndex = fs.existsSync(cacheIndexFile) ?
    YAML.parse(fs.readFileSync(cacheIndexFile).toString()) :
    {
      state: {},
      money: 0,
      inputTokens: 0,
      outputTokens: 0,
    };

  let totalCost = 0;
  for (const file of fs.globSync(`${translatedPath}/**/*.md`)) {
    const baseName = path.relative(originalPath, file);
    if (!fs.existsSync(`${originalPath}/${baseName}`)) {
      console.log("Remove unclaimed translation: ", baseName);
      fs.unlinkSync(file);
    }
  }

  for (const file of fs.globSync(`${originalPath}/**/*.md`)) {
    const model = "gpt-4o";
    const baseName = path.relative(originalPath, file);
    const markdownInput = fs.readFileSync(`${originalPath}/${baseName}`, 'utf8');
    const markdownHash = crypto.createHash('md5').update(markdownInput).digest('hex');

    if (cacheIndex.state[baseName] === markdownHash)
      continue;

    console.log(baseName);

    const response = await client.responses.create({
      model,
      instructions: `
      You a professional markdown translator.
      Please, translate following markdown content from Russian into technical English.
      Make sure that the translated content is preserve the original formatting and technical terms.
    `,
      input: markdownInput,
      text: {
        format: {
          type: "json_schema",
          name: "TranslatedMarkdown",
          schema: {
            type: "object",
            properties: {
              translatedMarkdownSource: {
                type: "string",
                description: "Contains the translated markdown content."
              }
            },
            required: ["translatedMarkdownSource"],
            additionalProperties: false
          }
        }
      }
    });

    const cost = estimateOpenAICostUSD(model, response.usage.input_tokens, response.usage.output_tokens);
    totalCost += cost;
    console.log(response.usage);
    console.log(`${+cost.toFixed(6)}$`);

    const outputFile = `${translatedPath}/${baseName}`;
    if (!fs.existsSync(path.dirname(outputFile)))
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });

    const modelResponse = JSON.parse(response.output_text) as TranslatedMarkdown;
    fs.writeFileSync(`${translatedPath}/${baseName}`, modelResponse.translatedMarkdownSource);

    cacheIndex.state[baseName] = markdownHash;
    cacheIndex.inputTokens += response.usage.input_tokens;
    cacheIndex.outputTokens += response.usage.output_tokens;
    cacheIndex.money += cost;
    fs.writeFileSync(cacheIndexFile, YAML.stringify(cacheIndex));
  }

  console.log(`Total cost: ${+totalCost.toFixed(6)}$`);
})();

function estimateOpenAICostUSD(model: string, inTokens: number, outTokens: number, fromCache = false): number {
  const pricing: Record<string, { input: number, cached: number, output: number }> = {
    "gpt-4.1":       { input:2.00, cached:0.50, output:8.00 },
    "gpt-4.1-mini":  { input:0.40, cached:0.10, output:1.60 },
    "gpt-4.1-nano":  { input:0.10, cached:0.025,output:0.40 },
    "gpt-4o":        { input:5.00, cached:2.50, output:20.00 },
    "gpt-4o-mini":   { input:0.60, cached:0.30, output:2.40 },
  };
  const p = pricing[model];
  return inTokens/1e6 * (fromCache ? p.cached : p.input) + outTokens/1e6 * p.output;
}
