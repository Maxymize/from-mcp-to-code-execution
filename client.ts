/**
 * MCP Client Bridge - Code Execution Pattern
 *
 * Questo modulo funge da ponte tra il codice eseguito dall'agente e i server MCP.
 * Implementa il pattern JSON-RPC 2.0 per la comunicazione con i server MCP.
 *
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Tipi per JSON-RPC 2.0
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Configurazione server MCP
interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// Registry dei server MCP disponibili
const MCP_SERVERS: Record<string, MCPServerConfig> = {
  'supabase-self-hosted': {
    command: 'supabase-db-mcp',
    args: [],
    env: {
      // Connessione al database Supabase locale (supabase-docufacile3)
      // Porta 54322 mappata da Docker (0.0.0.0:54322->5432/tcp)
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ||
        'postgresql://postgres:postgres@localhost:54322/postgres',
      // Opzionali per funzionalità estese
      SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
    }
  },
  // Altri server possono essere aggiunti qui
};

// Gestione delle connessioni attive
const activeConnections: Map<string, {
  process: ChildProcess;
  requestId: number;
  pendingRequests: Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>;
}> = new Map();

/**
 * Crea una richiesta JSON-RPC 2.0
 */
function createJsonRpcRequest(method: string, params?: Record<string, unknown>): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
}

/**
 * Avvia un server MCP se non è già in esecuzione
 */
async function ensureServerRunning(serverName: string): Promise<void> {
  if (activeConnections.has(serverName)) {
    return;
  }

  const config = MCP_SERVERS[serverName];
  if (!config) {
    throw new Error(`Unknown MCP server: ${serverName}. Available servers: ${Object.keys(MCP_SERVERS).join(', ')}`);
  }

  const serverProcess = spawn(config.command, config.args, {
    env: { ...process.env, ...config.env },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const connection = {
    process: serverProcess,
    requestId: 0,
    pendingRequests: new Map<number, {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
    }>()
  };

  let buffer = '';

  serverProcess.stdout?.on('data', (data: Buffer) => {
    buffer += data.toString();

    // Processa linee complete (JSON-RPC usa newline come delimitatore)
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response: JsonRpcResponse = JSON.parse(line);
        const pending = connection.pendingRequests.get(response.id);

        if (pending) {
          connection.pendingRequests.delete(response.id);

          if (response.error) {
            pending.reject(new Error(`MCP Error (${response.error.code}): ${response.error.message}`));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (e) {
        // Ignora linee non-JSON (potrebbero essere log)
        console.error(`[${serverName}] Non-JSON output:`, line);
      }
    }
  });

  serverProcess.stderr?.on('data', (data: Buffer) => {
    // Log stderr per debug, ma non interrompere
    console.error(`[${serverName}] stderr:`, data.toString());
  });

  serverProcess.on('error', (error) => {
    console.error(`[${serverName}] Process error:`, error);
    activeConnections.delete(serverName);
  });

  serverProcess.on('exit', (code) => {
    console.log(`[${serverName}] Process exited with code:`, code);
    activeConnections.delete(serverName);
  });

  activeConnections.set(serverName, connection);

  // Inizializza la connessione MCP
  await sendRequest(serverName, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'oltre-mcp-client',
      version: '1.0.0'
    }
  });
}

/**
 * Invia una richiesta JSON-RPC al server MCP
 */
async function sendRequest(serverName: string, method: string, params?: Record<string, unknown>): Promise<unknown> {
  const connection = activeConnections.get(serverName);
  if (!connection) {
    throw new Error(`Server ${serverName} is not running`);
  }

  const request = createJsonRpcRequest(method, params);
  request.id = ++connection.requestId;

  return new Promise((resolve, reject) => {
    connection.pendingRequests.set(request.id, { resolve, reject });

    const requestStr = JSON.stringify(request) + '\n';
    connection.process.stdin?.write(requestStr);

    // Timeout dopo 30 secondi
    setTimeout(() => {
      if (connection.pendingRequests.has(request.id)) {
        connection.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout for ${method}`));
      }
    }, 30000);
  });
}

/**
 * Chiama uno strumento MCP
 *
 * @param fullToolName Nome completo dello strumento nel formato 'server_name__tool_name'
 * @param params Parametri per la chiamata dello strumento
 * @returns Risultato della chiamata
 *
 * @example
 * const result = await callMCPTool('supabase-self-hosted__execute_postgresql', {
 *   query: 'SELECT * FROM users LIMIT 10'
 * });
 */
export async function callMCPTool<T = unknown>(fullToolName: string, params: object): Promise<T> {
  const [serverName, toolName] = fullToolName.split('__');

  if (!serverName || !toolName) {
    throw new Error(`Invalid tool name format: ${fullToolName}. Expected 'server_name__tool_name'.`);
  }

  // Normalizza il nome del server (sostituisce - con _)
  const normalizedServerName = serverName.replace(/_/g, '-');

  await ensureServerRunning(normalizedServerName);

  const result = await sendRequest(normalizedServerName, 'tools/call', {
    name: toolName,
    arguments: params
  });

  return result as T;
}

/**
 * Lista gli strumenti disponibili da un server MCP
 *
 * @param serverName Nome del server MCP
 * @returns Lista degli strumenti con descrizioni e parametri
 */
export async function listMCPTools(serverName: string): Promise<unknown> {
  await ensureServerRunning(serverName);
  return sendRequest(serverName, 'tools/list', {});
}

/**
 * Chiude la connessione a un server MCP
 */
export function closeMCPServer(serverName: string): void {
  const connection = activeConnections.get(serverName);
  if (connection) {
    connection.process.kill();
    activeConnections.delete(serverName);
  }
}

/**
 * Chiude tutte le connessioni MCP attive
 */
export function closeAllMCPServers(): void {
  for (const [serverName] of activeConnections) {
    closeMCPServer(serverName);
  }
}

// Cleanup automatico alla chiusura del processo
process.on('exit', closeAllMCPServers);
process.on('SIGINT', () => {
  closeAllMCPServers();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeAllMCPServers();
  process.exit(0);
});

// Export per uso come modulo
export { MCP_SERVERS, MCPServerConfig };
