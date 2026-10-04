import { toolCatalog, approvalFor } from "./policy.js";

const lookup = new Map(toolCatalog.map((tool) => [tool.name, tool]));

export function getTool(name) {
  return lookup.get(name);
}

export function executeTool(name, args, approved = false) {
  const tool = getTool(name);
  if (!tool) return { ok: false, error: `Unknown tool: ${name}` };
  const approval = approvalFor(tool);
  if (approval.required && !approved) return { ok: false, requiresApproval: true, tool: name, reason: approval.reason, args };
  if (!tool.enabled) return { ok: false, error: `${name} is an adapter placeholder. Connect its OAuth/MCP provider before enabling it.` };
  if (name === "system_get_time") return { ok: true, localTime: new Date().toLocaleString("ja-JP", { dateStyle: "full", timeStyle: "medium" }) };
  return { ok: false, error: `No executor registered for ${name}` };
}
