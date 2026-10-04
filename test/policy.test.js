import test from "node:test";
import assert from "node:assert/strict";
import { approvalFor, toolCatalog } from "../src/policy.js";
import { executeTool } from "../src/tools.js";

test("read-only tools do not require approval", () => assert.equal(approvalFor(toolCatalog[0]).required, false));
test("external changes require approval", () => assert.equal(approvalFor(toolCatalog[1]).required, true));
test("unapproved external action is stopped", () => assert.equal(executeTool("calendar_create_event", {}).requiresApproval, true));
test("time tool returns a local result", () => assert.equal(executeTool("system_get_time", {}).ok, true));
