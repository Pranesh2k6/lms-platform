import { Ollama } from 'ollama';
import { convertToOllamaTools } from '../services/aiTools.js';

/**
 * Ollama Configuration with Native Tools API
 * Using Qwen2.5:7b for 100% local, zero-cost AI with NATIVE function calling
 * No custom parsing - using Ollama's built-in tools parameter
 */

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

/**
 * Generate a streaming response from Ollama with NATIVE tools API
 * 100% Local - No Cloud APIs - No Custom Parsing
 * @param {string} model - Model name (e.g., 'qwen2.5:7b')
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} tools - Tools/functions available to the AI (Zod format)
 * @param {string} systemPrompt - System prompt for the AI
 * @returns {AsyncGenerator} - Stream of response chunks
 */
export async function* streamOllamaResponse(model, messages, tools, systemPrompt) {
  try {
    // Convert Zod tools to Ollama's native JSON Schema format
    const ollamaTools = convertToOllamaTools(tools);

    console.log('[Ollama Native Tools] Using model:', model);
    console.log('[Ollama Native Tools] Available tools:', Object.keys(tools).length);

    // Convert messages to Ollama format with system prompt
    const ollamaMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }))
    ];

    // Get response from Ollama with native tools support
    const response = await ollama.chat({
      model,
      messages: ollamaMessages,
      tools: ollamaTools,
      stream: false, // Get complete response first to check for tool calls
      options: {
        temperature: 0.7,
        num_predict: 2048,
        top_k: 40,
        top_p: 0.9
      }
    });

    const aiMessage = response.message;

    // Check if Ollama wants to call a tool
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      console.log('[Ollama Native Tools] Tool calls detected:', aiMessage.tool_calls.length);

      // Process each tool call
      for (const toolCall of aiMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = toolCall.function.arguments;

        console.log(`[Ollama Native Tools] Executing: ${functionName}`, functionArgs);

        try {
          // Get the tool from our tools object
          const tool = tools[functionName];

          if (!tool) {
            yield `\nError: Function '${functionName}' not found.\n`;
            continue;
          }

          // Validate parameters with Zod
          const validatedParams = tool.parameters.parse(functionArgs);

          // Execute the tool
          const result = await tool.execute(validatedParams);

          console.log(`[Ollama Native Tools] Result:`, result);

          // Don't show raw execution details to user - let AI provide natural response instead

          // Add tool result to conversation and get natural language response
          const followUpMessages = [
            ...ollamaMessages,
            {
              role: 'assistant',
              content: aiMessage.content || '',
              tool_calls: aiMessage.tool_calls
            },
            {
              role: 'tool',
              content: result
            }
          ];

          // Get final natural language response from Ollama
          const finalResponse = await ollama.chat({
            model,
            messages: followUpMessages,
            stream: true,
            options: {
              temperature: 0.7,
              num_predict: 512
            }
          });

          // Stream the natural language response
          for await (const chunk of finalResponse) {
            if (chunk.message?.content) {
              yield chunk.message.content;
            }
          }

        } catch (error) {
          console.error(`[Ollama Native Tools] Error executing ${functionName}:`, error);
          yield `\nError: ${error.message}\n`;
        }
      }
    } else {
      // No tool calls - just conversational response
      console.log('[Ollama Native Tools] No tool calls - streaming conversational response');

      const content = aiMessage.content || '';

      // Stream the response character by character for better UX
      for (const char of content) {
        yield char;
        // Small delay for streaming effect
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

  } catch (error) {
    console.error('[Ollama Native Tools] Error:', error);
    yield `\n\nError: ${error.message}\n\nPlease try again or rephrase your request.`;
  }
}

/**
 * Check if Ollama is running and model is available
 * @param {string} model - Model name to check
 * @returns {Promise<boolean>}
 */
export async function checkOllamaAvailability(model = 'qwen2.5:7b') {
  try {
    const models = await ollama.list();
    return models.models.some(m => m.name === model || m.name.startsWith(model));
  } catch (error) {
    console.error('Ollama availability check failed:', error.message);
    return false;
  }
}

/**
 * Pull a model if not available
 * @param {string} model - Model name to pull
 */
export async function pullModelIfNeeded(model = 'qwen2.5:7b') {
  try {
    const isAvailable = await checkOllamaAvailability(model);

    if (!isAvailable) {
      console.log(`Pulling model ${model}...`);
      await ollama.pull({ model });
      console.log(`Model ${model} pulled successfully`);
    }
  } catch (error) {
    console.error('Error pulling model:', error.message);
    throw error;
  }
}

export default ollama;
