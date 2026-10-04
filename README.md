# NEXUS Desktop MVP

NEXUS is a voice-first personal AI assistant for Windows. This MVP is deliberately a working vertical slice: a local Core server, Push-to-Talk, OpenAI conversation and function-routing, a future-facing tool layer, an approval gate, Japanese speech output, and a reactive HUD.

## What works now

- `NEXUS Core` runs locally on `127.0.0.1`.
- Hold the **HOLD TO TALK** button (or the Space key) to use browser speech recognition; release to send the utterance.
- NEXUS uses the OpenAI Responses API if `OPENAI_API_KEY` is present. It otherwise starts safely in demo mode.
- The UI maps work to actual lifecycle states: `STANDBY → LISTENING → UNDERSTANDING → ACCESSING → ANALYZING → RESPONDING`.
- Browser speech synthesis reads answers. The core, rings, and waveform animate during activity.
- Tool definitions are isolated in `src/policy.js`; tool execution is isolated in `src/tools.js`.
- Green tools can run; Yellow and Red tools require user approval before the Core can execute them.

## Start on Windows

1. Install a current Node.js runtime if it is not already available.
2. Set an environment variable (do not put the key in a file committed to Git):

   ```powershell
   [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'your-key', 'User')
   ```

3. Open a new terminal in this folder and run:

   ```powershell
   node src/server.js
   ```

4. Open `http://127.0.0.1:4310` in Microsoft Edge or Chrome. `start-nexus.cmd` is a convenience launcher.

Set `OPENAI_MODEL` to a model your project can use; the default is `gpt-5`.

## Security model

| Class | Examples | Behavior |
| --- | --- | --- |
| Green | Search/read/status/time | Runs automatically |
| Yellow | Create or change calendar/Notion content | Shows an approval dialog |
| Red | Send email, delete, publish, financial action | Shows an explicit approval dialog; disabled until a dedicated adapter is enabled |

Secrets stay in the operating-system environment. The UI never receives `OPENAI_API_KEY`, and `.env` is ignored by Git.

## Future adapters

`calendar_create_event` and `gmail_send_email` are intentionally disabled interface contracts. Add OAuth or MCP-backed implementations only after credentials, scopes, audit logging, and approval copy have been defined. Notion follows the same adapter pattern.

## Test

```powershell
node --test
```

## Architecture

```text
Browser voice / typed request
        │
        ▼
  NEXUS HUD ── lifecycle states + approval UI
        │ HTTP (localhost only)
        ▼
  NEXUS Core ── OpenAI Responses API ── Tool catalog
        │                                      │
        └──────── Browser speech output ───────┴── Green / Yellow / Red policy
```
