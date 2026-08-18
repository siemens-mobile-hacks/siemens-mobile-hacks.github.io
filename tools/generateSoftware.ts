import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

type FileMetadata = {
  path: string;
  description?: string;
  platform?: string;
};

type FileDetails = {
  size: number;
  sha256: string;
};

type VersionMetadata = {
  version: string;
  status?: "current" | "archived";
  released?: string;
  description?: string;
  files: FileMetadata[];
};

type CategoryMetadata = {
  type: "category";
  name: string;
  order?: number;
  description: string;
};

type ProgramMetadata = {
  type: "program";
  name: string;
  summary: string;
  description: string;
  homepage?: string;
  source?: string;
  forum?: string;
  author?: string;
  screenshots: string[];
  versions: VersionMetadata[];
  additional_files?: FileMetadata[];
};

type CatalogMetadata = CategoryMetadata | ProgramMetadata;

type CatalogNode = {
  directory: string;
  metadata: CatalogMetadata;
  children: CatalogNode[];
};

type RepositoryLinks = {
  repositoryUrl: string;
  mediaBaseUrl: string;
  files: Record<string, FileDetails>;
};

const collator = new Intl.Collator("ru", {
  numeric: true,
  sensitivity: "base",
});

function usage(): never {
  console.error("Usage: pnpm generate-software <path-to-soft-repository>");
  process.exit(1);
}

function fail(message: string): never {
  throw new Error(message);
}

function readMetadata(indexPath: string): CatalogMetadata {
  const document = YAML.parseDocument(readFileSync(indexPath, "utf8"), {
    prettyErrors: true,
  });

  if (document.errors.length > 0) {
    fail(`${indexPath}: ${document.errors.map((error) => error.message).join("; ")}`);
  }

  const metadata = document.toJS() as Partial<CatalogMetadata>;
  if (metadata.type !== "category" && metadata.type !== "program") {
    fail(`${indexPath}: unknown type`);
  }
  if (typeof metadata.name !== "string" || metadata.name.length === 0) {
    fail(`${indexPath}: name is missing`);
  }
  if (typeof metadata.description !== "string" || metadata.description.length === 0) {
    fail(`${indexPath}: description is missing`);
  }
  if (metadata.type === "program") {
    if (typeof metadata.summary !== "string" || metadata.summary.length === 0) {
      fail(`${indexPath}: program summary is missing`);
    }
    if (!Array.isArray(metadata.screenshots) || !Array.isArray(metadata.versions)) {
      fail(`${indexPath}: program is missing screenshots or versions`);
    }
  } else if (metadata.order !== undefined && !Number.isInteger(metadata.order)) {
    fail(`${indexPath}: category order must be an integer`);
  }

  return metadata as CatalogMetadata;
}

function readCatalogNode(directory: string): CatalogNode {
  const indexPath = path.join(directory, "index.yaml");
  if (!existsSync(indexPath)) {
    fail(`${directory}: index.yaml is missing`);
  }

  const metadata = readMetadata(indexPath);
  const children: CatalogNode[] = [];

  if (metadata.type === "category") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const childDirectory = path.join(directory, entry.name);
      if (existsSync(path.join(childDirectory, "index.yaml"))) {
        children.push(readCatalogNode(childDirectory));
      }
    }

    children.sort((left, right) => {
      if (left.metadata.type !== right.metadata.type) {
        return left.metadata.type === "category" ? -1 : 1;
      }
      if (left.metadata.type === "category" && right.metadata.type === "category") {
        const orderDifference = (left.metadata.order ?? 0) - (right.metadata.order ?? 0);
        if (orderDifference !== 0) {
          return orderDifference;
        }
      }
      return collator.compare(left.metadata.name, right.metadata.name);
    });
  }

  return { directory, metadata, children };
}

function parseRemoteUrl(remote: string): { host: string; repositoryPath: string } {
  if (remote.includes("://")) {
    const url = new URL(remote);
    return {
      host: url.hostname,
      repositoryPath: url.pathname.replace(/^\/+|\.git$/g, ""),
    };
  }

  const scpLike = remote.match(/^(?:[^@]+@)?([^:]+):\/?(.+)$/);
  if (scpLike === null) {
    fail(`Failed to parse origin URL: ${remote}`);
  }

  return {
    host: scpLike[1],
    repositoryPath: scpLike[2].replace(/\.git$/, ""),
  };
}

function readFileManifest(catalogDirectory: string): Record<string, FileDetails> {
  const manifestPath = path.join(catalogDirectory, "files.yaml");
  if (!existsSync(manifestPath)) {
    fail(`${manifestPath}: file manifest is missing`);
  }

  const document = YAML.parseDocument(readFileSync(manifestPath, "utf8"), {
    prettyErrors: true,
  });
  if (document.errors.length > 0) {
    fail(`${manifestPath}: ${document.errors.map((error) => error.message).join("; ")}`);
  }

  const manifest = document.toJS() as {
    format?: unknown;
    files?: unknown;
  };
  if (manifest.format !== 1 || typeof manifest.files !== "object" || manifest.files === null) {
    fail(`${manifestPath}: invalid file manifest`);
  }

  for (const [filePath, details] of Object.entries(manifest.files)) {
    if (
      typeof details !== "object" ||
      details === null ||
      !("size" in details) ||
      !Number.isInteger(details.size) ||
      (details.size as number) < 0 ||
      !("sha256" in details) ||
      typeof details.sha256 !== "string" ||
      !/^[0-9a-f]{64}$/.test(details.sha256)
    ) {
      fail(`${manifestPath}: invalid metadata for ${filePath}`);
    }
  }

  return manifest.files as Record<string, FileDetails>;
}

function resolveRepositoryLinks(
  catalogRoot: string,
  files: Record<string, FileDetails>,
): RepositoryLinks {
  let remote: string;
  try {
    remote = execFileSync("git", ["-C", catalogRoot, "remote", "get-url", "origin"], {
      encoding: "utf8",
    }).trim();
  } catch {
    fail(`${catalogRoot}: failed to read origin URL`);
  }

  const { host, repositoryPath } = parseRemoteUrl(remote);
  const repositoryUrl = `https://${host}/${repositoryPath}`;
  return {
    repositoryUrl,
    mediaBaseUrl: `${repositoryUrl}/media/branch/main`,
    files,
  };
}

function encodeRepositoryPath(filePath: string): string {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function repositoryFileUrl(
  catalogRoot: string,
  programDirectory: string,
  filePath: string,
  links: RepositoryLinks,
): string {
  const programPath = path.relative(catalogRoot, programDirectory).split(path.sep).join("/");
  const repositoryPath = path.posix.join(programPath, filePath);
  return `${links.mediaBaseUrl}/${encodeRepositoryPath(repositoryPath)}`;
}

function resolveFileDetails(
  repositoryRoot: string,
  programDirectory: string,
  filePath: string,
  links: RepositoryLinks,
): FileDetails {
  const catalogDirectory = path.join(repositoryRoot, "catalog");
  const absolutePath = path.resolve(programDirectory, ...filePath.split("/"));
  const key = path.relative(catalogDirectory, absolutePath).split(path.sep).join("/");
  if (key.startsWith("../") || path.isAbsolute(key)) {
    fail(`${filePath}: path escapes the catalog`);
  }

  const details = links.files[key];
  if (details === undefined) {
    fail(`${key}: metadata is missing from catalog/files.yaml`);
  }
  return details;
}

function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function heading(level: number, title: string): string {
  return `${"#".repeat(Math.min(level, 6))} ${title}`;
}

function platformName(platform: string): string {
  const names: Record<string, string> = {
    win32: "Windows 32-bit",
    win64: "Windows 64-bit",
    dos: "DOS",
    java: "Java",
    j2me: "J2ME",
  };
  return names[platform] ?? platform;
}

function formatFileSize(size: number): string {
  const units = ["Б", "КиБ", "МиБ", "ГиБ"];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unit]}`;
}

function displayUrl(url: string): string {
  const archived = url.match(/^https?:\/\/web\.archive\.org\/web\/[^/]+\/(https?:\/\/.+)$/);
  return archived?.[1] ?? url;
}

function externalLink(url: string): string {
  const archiveMarker = url.match(/^https?:\/\/web\.archive\.org\/web\//)
    ? " (web archive)"
    : "";
  return `[${displayUrl(url)}](${url})${archiveMarker}`;
}

function descriptionSummary(description: string): string {
  const firstParagraph = description.trim().split(/\n\s*\n/, 1)[0];
  const plainText = singleLine(firstParagraph)
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "");
  const maximumLength = 180;
  if (plainText.length <= maximumLength) {
    return plainText;
  }

  const shortened = plainText.slice(0, maximumLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : undefined)}…`;
}

function countPrograms(node: CatalogNode): number {
  if (node.metadata.type === "program") {
    return 1;
  }
  return node.children.reduce((total, child) => total + countPrograms(child), 0);
}

function renderCatalogTree(
  node: CatalogNode,
  currentPage: string,
  catalogDirectory: string,
  outputDirectory: string,
  lines: string[],
  depth = 0,
): void {
  for (const child of node.children) {
    const targetPage = nodeOutputPath(child, catalogDirectory, outputDirectory);
    const href = relativeMarkdownLink(currentPage, targetPage);
    const indent = "  ".repeat(depth);

    if (child.metadata.type === "category") {
      lines.push(
        `${indent}- **[${child.metadata.name}](${href})** (${countPrograms(child)})`,
      );
      renderCatalogTree(
        child,
        currentPage,
        catalogDirectory,
        outputDirectory,
        lines,
        depth + 1,
      );
    } else {
      lines.push(`${indent}- [${child.metadata.name}](${href})`);
    }
  }
}

function renderFileLine(
  file: FileMetadata,
  repositoryRoot: string,
  programDirectory: string,
  links: RepositoryLinks,
): string {
  const url = repositoryFileUrl(repositoryRoot, programDirectory, file.path, links);
  const details = resolveFileDetails(repositoryRoot, programDirectory, file.path, links);
  const name = path.posix.basename(file.path);
  const lines = [`[${name}](${url})`];
  if (file.description !== undefined) {
    lines.push(singleLine(file.description));
  }
  const compatibility: string[] = [];
  if (file.platform !== undefined) {
    compatibility.push(platformName(file.platform));
  }
  compatibility.push(formatFileSize(details.size));
  if (compatibility.length > 0) {
    lines.push(compatibility.join(" · "));
  }
  return lines.join("<br/>");
}

function renderVersionList(
  versions: VersionMetadata[],
  repositoryRoot: string,
  programDirectory: string,
  links: RepositoryLinks,
  lines: string[],
): void {
  for (const version of versions) {
    version.files.forEach((file, index) => {
      const url = repositoryFileUrl(repositoryRoot, programDirectory, file.path, links);
      const details = resolveFileDetails(repositoryRoot, programDirectory, file.path, links);
      const name = path.posix.basename(file.path);
      const versionPrefix = `**${version.version}** — `;
      const released = version.released === undefined ? "" : ` (${version.released})`;
      const block = [`${versionPrefix}[${name}](${url})${released}`];

      const descriptions = [
        index === 0 ? version.description : undefined,
        file.description,
      ].filter((value): value is string => value !== undefined);
      if (descriptions.length > 0) {
        block.push(descriptions.map(singleLine).join(" "));
      }

      const compatibility: string[] = [];
      if (file.platform !== undefined) {
        compatibility.push(platformName(file.platform));
      }
      compatibility.push(formatFileSize(details.size));
      if (compatibility.length > 0) {
        block.push(compatibility.join(" · "));
      }
      lines.push(`- ${block.join("<br/>")}`);
    });
  }
  lines.push("");
}

function renderAdditionalFiles(
  files: FileMetadata[],
  repositoryRoot: string,
  programDirectory: string,
  links: RepositoryLinks,
  lines: string[],
): void {
  for (const file of files) {
    lines.push(`- ${renderFileLine(file, repositoryRoot, programDirectory, links)}`);
  }
  lines.push("");
}

function renderVersions(
  versions: VersionMetadata[],
  repositoryRoot: string,
  programDirectory: string,
  links: RepositoryLinks,
  lines: string[],
): void {
  lines.push(heading(2, "Версии"), "");
  const hasStatuses = versions.some((version) => version.status !== undefined);
  if (hasStatuses) {
    const available = versions.filter((version) => version.status !== "archived");
    const archived = versions.filter((version) => version.status === "archived");
    if (available.length > 0) {
      renderVersionList(available, repositoryRoot, programDirectory, links, lines);
    }
    if (archived.length > 0) {
      lines.push(
        "<details>",
        `<summary><strong>Архивные версии (${archived.length})</strong></summary>`,
        "",
      );
      renderVersionList(archived, repositoryRoot, programDirectory, links, lines);
      lines.push("</details>", "");
    }
    return;
  }

  renderVersionList(versions, repositoryRoot, programDirectory, links, lines);
}

function pageFrontmatter(
  title: string,
  sidebarLabel = title,
  sidebarKey?: string,
  sidebarClassName?: string,
  sidebarPosition?: number,
): string[] {
  const lines = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `sidebar_label: ${JSON.stringify(sidebarLabel)}`,
  ];
  if (sidebarKey !== undefined) {
    lines.push(`sidebar_key: ${JSON.stringify(sidebarKey)}`);
  }
  if (sidebarClassName !== undefined) {
    lines.push(`sidebar_class_name: ${JSON.stringify(sidebarClassName)}`);
  }
  if (sidebarPosition !== undefined) {
    lines.push(`sidebar_position: ${sidebarPosition}`);
  }
  lines.push("---", "{/* Generated by tools/generateSoftware.ts. Do not edit manually. */}");
  return lines;
}

function nodeOutputPath(
  node: CatalogNode,
  catalogDirectory: string,
  outputDirectory: string,
): string {
  const relativeDirectory = path.relative(catalogDirectory, node.directory);
  if (node.metadata.type === "category") {
    return path.join(outputDirectory, relativeDirectory, "index.md");
  }

  return path.join(
    outputDirectory,
    path.dirname(relativeDirectory),
    `${path.basename(relativeDirectory)}.md`,
  );
}

function nodeSidebarKey(node: CatalogNode, catalogDirectory: string): string {
  const relativeDirectory = path
    .relative(catalogDirectory, node.directory)
    .split(path.sep)
    .filter(Boolean)
    .join(".");
  return relativeDirectory.length === 0 ? "soft" : `soft.${relativeDirectory}`;
}

function relativeMarkdownLink(fromPage: string, toPage: string): string {
  const relativePath = path.relative(path.dirname(fromPage), toPage).split(path.sep).join("/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function copyProgramScreenshot(
  programDirectory: string,
  pagePath: string,
  screenshotPath: string,
): string {
  const sourcePath = path.resolve(programDirectory, ...screenshotPath.split("/"));
  const sourceRelativePath = path.relative(programDirectory, sourcePath);
  if (
    sourceRelativePath === ".." ||
    sourceRelativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(sourceRelativePath)
  ) {
    fail(`${screenshotPath}: path escapes the program directory`);
  }
  if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
    fail(`${sourcePath}: screenshot is missing or is not a file`);
  }

  const assetDirectory = path.join(
    path.dirname(pagePath),
    path.basename(pagePath, path.extname(pagePath)),
  );
  const destinationPath = path.resolve(assetDirectory, ...screenshotPath.split("/"));
  const destinationRelativePath = path.relative(assetDirectory, destinationPath);
  if (
    destinationRelativePath === ".." ||
    destinationRelativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(destinationRelativePath)
  ) {
    fail(`${screenshotPath}: destination escapes the program asset directory`);
  }

  mkdirSync(path.dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
  return relativeMarkdownLink(pagePath, destinationPath);
}

function renderProgramPage(
  node: CatalogNode,
  repositoryRoot: string,
  links: RepositoryLinks,
  pagePath: string,
  sidebarKey: string,
): string {
  const metadata = node.metadata as ProgramMetadata;
  const lines = [...pageFrontmatter(metadata.name, metadata.name, sidebarKey), ""];

  lines.push(heading(1, metadata.name), "");
  const headerLines: string[] = [];
  if (metadata.homepage !== undefined) {
    headerLines.push(`**Домашняя страница:** ${externalLink(metadata.homepage)}`);
  }
  if (metadata.source !== undefined) {
    headerLines.push(`**Исходники:** ${externalLink(metadata.source)}`);
  }
  if (metadata.forum !== undefined) {
    headerLines.push(`**Тема на форуме:** ${externalLink(metadata.forum)}`);
  }
  if (metadata.author !== undefined) {
    headerLines.push(`**Автор:** ${metadata.author}`);
  }
  if (headerLines.length > 0) {
    lines.push(headerLines.join("<br/>\n"), "");
  }
  for (const [index, screenshot] of metadata.screenshots.entries()) {
    const localPath = copyProgramScreenshot(node.directory, pagePath, screenshot);
    lines.push(`![${metadata.name}: скриншот ${index + 1}](${localPath})`, "");
  }

  lines.push(metadata.description.trim(), "");

  renderVersions(metadata.versions, repositoryRoot, node.directory, links, lines);

  if (metadata.additional_files !== undefined) {
    lines.push(heading(2, "Дополнительные файлы"), "");
    renderAdditionalFiles(metadata.additional_files, repositoryRoot, node.directory, links, lines);
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderCategoryPage(
  node: CatalogNode,
  links: RepositoryLinks,
  currentPage: string,
  catalogDirectory: string,
  outputDirectory: string,
  root: boolean,
  sidebarKey: string,
): string {
  const metadata = node.metadata as CategoryMetadata;
  const lines = [
    ...pageFrontmatter(
      root ? "Софт" : metadata.name,
      root ? "Софт" : metadata.name,
      sidebarKey,
      root ? undefined : "soft-sidebar-folder",
      root ? undefined : (metadata.order ?? 0),
    ),
    "",
  ];

  lines.push(heading(1, metadata.name), "", metadata.description.trim(), "");

  if (root) {
    lines.push(
      `Исходные метаданные и файлы: [${links.repositoryUrl}](${links.repositoryUrl}).`,
      "",
    );
  }

  const categories = node.children.filter((child) => child.metadata.type === "category");
  const programs = node.children.filter((child) => child.metadata.type === "program");

  if (categories.length > 0) {
    lines.push(heading(2, "Разделы"), "");
    for (const child of categories) {
      const targetPage = nodeOutputPath(child, catalogDirectory, outputDirectory);
      const href = relativeMarkdownLink(currentPage, targetPage);
      lines.push(
        `- **[${child.metadata.name}](${href})** (${countPrograms(child)})<br/>\n  ${descriptionSummary(child.metadata.description)}`,
      );
    }
    lines.push("");
  }

  if (programs.length > 0) {
    lines.push(heading(2, "Программы"), "");
    for (const child of programs) {
      const targetPage = nodeOutputPath(child, catalogDirectory, outputDirectory);
      const href = relativeMarkdownLink(currentPage, targetPage);
      lines.push(
        `- **[${child.metadata.name}](${href})**<br/>\n  ${singleLine((child.metadata as ProgramMetadata).summary)}`,
      );
    }
    lines.push("");
  }

  if (root) {
    lines.push(heading(2, "Дерево файлов"), "");
    renderCatalogTree(
      node,
      currentPage,
      catalogDirectory,
      outputDirectory,
      lines,
    );
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function writeCatalogPages(
  node: CatalogNode,
  repositoryRoot: string,
  links: RepositoryLinks,
  catalogDirectory: string,
  outputDirectory: string,
): number {
  const outputPath = nodeOutputPath(node, catalogDirectory, outputDirectory);
  mkdirSync(path.dirname(outputPath), { recursive: true });

  const contents =
    node.metadata.type === "category"
      ? renderCategoryPage(
          node,
          links,
          outputPath,
          catalogDirectory,
          outputDirectory,
          node.directory === catalogDirectory,
          nodeSidebarKey(node, catalogDirectory),
        )
      : renderProgramPage(
          node,
          repositoryRoot,
          links,
          outputPath,
          nodeSidebarKey(node, catalogDirectory),
        );
  writeFileSync(outputPath, contents, "utf8");

  let written = 1;
  if (node.metadata.type === "category") {
    for (const child of node.children) {
      written += writeCatalogPages(
        child,
        repositoryRoot,
        links,
        catalogDirectory,
        outputDirectory,
      );
    }
  }
  return written;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    usage();
  }

  const repositoryRoot = path.resolve(args[0]);
  const catalogDirectory = path.join(repositoryRoot, "catalog");
  const root = readCatalogNode(catalogDirectory);
  if (root.metadata.type !== "category") {
    fail(`${root.directory}: the catalog root must be a category`);
  }
  const links = resolveRepositoryLinks(
    repositoryRoot,
    readFileManifest(catalogDirectory),
  );
  const websiteRoot = fileURLToPath(new URL("..", import.meta.url));
  const outputDirectory = path.join(websiteRoot, "docs", "soft");
  const legacyOutputPath = path.join(websiteRoot, "docs", "soft.md");

  rmSync(legacyOutputPath, { force: true });
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });
  const written = writeCatalogPages(
    root,
    repositoryRoot,
    links,
    catalogDirectory,
    outputDirectory,
  );
  console.log(`Generated ${written} pages in ${outputDirectory}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}
