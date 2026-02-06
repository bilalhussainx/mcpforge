import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MCPBridge } from '@/lib/mcp-bridge';

const MAX_MESSAGES_PER_SESSION = 20;
const MAX_TOOL_ITERATIONS = 5;
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 2048;

const sessionMessageCounts = new Map<string, number>();

const SYSTEM_PROMPT = `You are MCPForge Assistant, an AI with access to three specialized MCP (Model Context Protocol) servers:

1. **mcp-resume** - Resume parsing and ATS scoring tools:
   - parse_resume: Extract structured data from a resume PDF (requires base64 PDF)
   - score_ats: Score a resume for ATS compatibility (0-100)
   - suggest_improvements: Get actionable improvement suggestions

2. **mcp-portfolio** - Portfolio/website analysis tools:
   - analyze_portfolio: Analyze a developer portfolio website
   - extract_skills: Extract and categorize technical skills
   - generate_summary: Generate a professional summary

3. **mcp-github-insights** - GitHub repository analysis tools:
   - analyze_repo: Analyze a GitHub repository's health and activity
   - get_contributions: Get contribution statistics
   - compare_repos: Compare two repositories

When a user asks about resumes, portfolios, or GitHub repositories, use the appropriate tools. Always explain what you're doing and present results clearly. If a tool call fails because a server is not connected, let the user know gracefully.

Format your responses with markdown for readability. Use headers, bullet points, and code blocks where appropriate.`;

function createSSEMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sessionId = 'default', resumePdf } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting: track messages per session
    const currentCount = sessionMessageCounts.get(sessionId) || 0;
    if (currentCount >= MAX_MESSAGES_PER_SESSION) {
      return new Response(
        JSON.stringify({
          error: `Session limit reached (${MAX_MESSAGES_PER_SESSION} messages). Please start a new session to continue.`,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    sessionMessageCounts.set(sessionId, currentCount + 1);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const stream = new ReadableStream({
      async start(controller) {
        const bridge = new MCPBridge();

        try {
          // Connect to MCP servers
          await bridge.connect();

          // Send server statuses
          const statuses = bridge.getServerStatuses();
          controller.enqueue(
            new TextEncoder().encode(
              createSSEMessage({ type: 'servers', servers: statuses })
            )
          );

          // Send initial protocol logs
          const initialLogs = bridge.logger.getEntries();
          if (initialLogs.length > 0) {
            controller.enqueue(
              new TextEncoder().encode(
                createSSEMessage({ type: 'protocol_log', log: initialLogs })
              )
            );
          }

          // Get available tools
          const claudeTools = bridge.getClaudeTools();

          // Build conversation messages for Claude
          const claudeMessages: Anthropic.MessageParam[] = messages.map(
            (msg: { role: string; content: string }) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })
          );

          // If resume PDF is provided, prepend context to the last user message
          if (resumePdf && claudeMessages.length > 0) {
            const lastMsg = claudeMessages[claudeMessages.length - 1];
            if (lastMsg.role === 'user' && typeof lastMsg.content === 'string') {
              lastMsg.content = `[User has uploaded a resume PDF (base64 encoded). Use it with resume tools when needed. Base64: ${resumePdf.substring(0, 100)}...]\n\n${lastMsg.content}`;
            }
          }

          // Tool calling loop
          let iteration = 0;
          let currentMessages = [...claudeMessages];

          while (iteration < MAX_TOOL_ITERATIONS) {
            iteration++;

            const response = await anthropic.messages.create({
              model: MODEL,
              max_tokens: MAX_TOKENS,
              system: SYSTEM_PROMPT,
              messages: currentMessages,
              tools: claudeTools.length > 0 ? claudeTools as Anthropic.Tool[] : undefined,
            });

            // Process response content blocks
            let hasToolUse = false;
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            for (const block of response.content) {
              if (block.type === 'text') {
                controller.enqueue(
                  new TextEncoder().encode(
                    createSSEMessage({ type: 'text', text: block.text })
                  )
                );
              } else if (block.type === 'tool_use') {
                hasToolUse = true;
                const parsed = bridge.parseToolName(block.name);
                const serverName = parsed?.server || 'unknown';
                const toolName = parsed?.tool || block.name;

                // Send tool call event
                controller.enqueue(
                  new TextEncoder().encode(
                    createSSEMessage({
                      type: 'tool_call',
                      tool: toolName,
                      server: serverName,
                      toolCallId: block.id,
                      input: block.input,
                    })
                  )
                );

                // Execute tool call
                try {
                  const toolArgs: Record<string, unknown> = {
                    ...(block.input as Record<string, unknown>),
                  };

                  // If this is a resume tool and we have a PDF, inject it
                  if (
                    resumePdf &&
                    serverName === 'mcp-resume' &&
                    (toolName === 'parse_resume' || toolName === 'score_ats')
                  ) {
                    if (!toolArgs.pdf_base64 && !toolArgs.resume_text) {
                      toolArgs.pdf_base64 = resumePdf;
                    }
                  }

                  const { result, duration } = await bridge.callTool(block.name, toolArgs);

                  controller.enqueue(
                    new TextEncoder().encode(
                      createSSEMessage({
                        type: 'tool_result',
                        tool: toolName,
                        server: serverName,
                        toolCallId: block.id,
                        result: result.substring(0, 2000),
                      })
                    )
                  );

                  toolResults.push({
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: result,
                  });

                  // Send protocol logs
                  const newLogs = bridge.logger.getEntries();
                  controller.enqueue(
                    new TextEncoder().encode(
                      createSSEMessage({ type: 'protocol_log', log: newLogs.slice(-3) })
                    )
                  );
                } catch (error) {
                  const errMsg = error instanceof Error ? error.message : String(error);

                  controller.enqueue(
                    new TextEncoder().encode(
                      createSSEMessage({
                        type: 'tool_result',
                        tool: toolName,
                        server: serverName,
                        toolCallId: block.id,
                        result: `Error: ${errMsg}`,
                      })
                    )
                  );

                  toolResults.push({
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: `Error calling tool: ${errMsg}`,
                    is_error: true,
                  });
                }
              }
            }

            // If no tool use, we're done
            if (!hasToolUse || response.stop_reason === 'end_turn') {
              break;
            }

            // Add assistant response and tool results to conversation for next iteration
            currentMessages = [
              ...currentMessages,
              { role: 'assistant', content: response.content },
              { role: 'user', content: toolResults },
            ];
          }

          // Send final server statuses
          const finalStatuses = bridge.getServerStatuses();
          controller.enqueue(
            new TextEncoder().encode(
              createSSEMessage({ type: 'servers', servers: finalStatuses })
            )
          );

          // Send done signal
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          controller.enqueue(
            new TextEncoder().encode(
              createSSEMessage({ type: 'error', error: errMsg })
            )
          );
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        } finally {
          try {
            await bridge.disconnect();
          } catch {
            // Ignore disconnect errors
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
