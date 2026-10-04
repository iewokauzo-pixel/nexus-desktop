import { publicTools } from "./policy.js";
import { executeTool } from "./tools.js";

const SYSTEM = `You are NEXUS, a concise and warm personal AI assistant running on a Windows PC. Answer in Japanese unless asked otherwise. You may use available tools when useful. Never claim an unavailable Calendar, Gmail, or Notion integration completed. State briefly when a tool needs a connection or approval.`;

export async function runNexus({ message, approvedTool }, emit) {
  emit("UNDERSTANDING", "Request understood");
  if (approvedTool) {
    emit("ACCESSING", approvedTool.name);
    const result = executeTool(approvedTool.name, approvedTool.args, true);
    emit("ANALYZING", "Tool result received");
    return { text: result.ok ? `実行しました。${JSON.stringify(result)}` : `実行できませんでした。${result.error}`, toolResult: result };
  }
  if (!process.env.OPENAI_API_KEY) {
    emit("ANALYZING", "Demo mode");
    return { text: `NEXUSは起動しています。OpenAIを使うには OPENAI_API_KEY をWindowsの環境変数に設定してください。\n\n受信: ${message}`, demo: true };
  }
  emit("ACCESSING", "OpenAI Responses API");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5", instructions: SYSTEM, input: message, tools: publicTools() }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed (${response.status}). Check OPENAI_API_KEY and OPENAI_MODEL.`);
  const data = await response.json();
  const call = data.output?.find((item) => item.type === "function_call");
  if (!call) {
    emit("ANALYZING", "Response ready");
    return { text: data.output_text || "応答を取得できませんでした。" };
  }
  const args = JSON.parse(call.arguments || "{}");
  emit("ACCESSING", call.name);
  const result = executeTool(call.name, args, false);
  if (result.requiresApproval) return { approval: result, text: `${call.name} は承認が必要です。` };
  emit("ANALYZING", "Tool result received");
  return { text: result.ok ? `確認結果です。${JSON.stringify(result)}` : `ツールを実行できませんでした。${result.error}`, toolResult: result };
}
