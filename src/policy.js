export const RISK = Object.freeze({ GREEN: "green", YELLOW: "yellow", RED: "red" });

export const toolCatalog = Object.freeze([
  {
    name: "system_get_time",
    description: "Get the local Windows time. This is read-only.",
    risk: RISK.GREEN,
    enabled: true,
    parameters: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "calendar_create_event",
    description: "Create a calendar event. Calendar connection is not enabled in this MVP.",
    risk: RISK.YELLOW,
    enabled: false,
    parameters: {
      type: "object",
      properties: { title: { type: "string" }, start: { type: "string" } },
      required: ["title", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "gmail_send_email",
    description: "Send email. Gmail connection is not enabled in this MVP.",
    risk: RISK.RED,
    enabled: false,
    parameters: {
      type: "object",
      properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } },
      required: ["to", "subject", "body"],
      additionalProperties: false,
    },
  },
]);

export function approvalFor(tool) {
  if (tool.risk === RISK.GREEN) return { required: false, reason: "Read-only tool" };
  return { required: true, reason: tool.risk === RISK.RED ? "External send or destructive action" : "External change" };
}

export function publicTools() {
  return toolCatalog.map(({ name, description, parameters }) => ({ type: "function", name, description, parameters, strict: true }));
}
