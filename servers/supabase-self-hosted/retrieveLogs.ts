/**
 * Retrieve Logs - Recupera log dai servizi del progetto Supabase
 *
 * @module servers/supabase-self-hosted/retrieveLogs
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

type LogCollection =
  | 'postgres'
  | 'api_gateway'
  | 'auth'
  | 'postgrest'
  | 'pooler'
  | 'storage'
  | 'realtime'
  | 'edge_functions'
  | 'cron'
  | 'pgbouncer';

interface LogFilter {
  field: string;
  operator: string;
  value: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  event_message: string;
  metadata?: Record<string, unknown>;
}

interface RetrieveLogsResult {
  logs: LogEntry[];
}

interface RetrieveLogsParams {
  collection: LogCollection;
  limit?: number;
  hours_ago?: number;
  filters?: LogFilter[];
  search?: string;
  custom_query?: string;
}

/**
 * Recupera log dai servizi del progetto Supabase per debugging e monitoring.
 *
 * Restituisce entry di log con timestamp, messaggi e metadati.
 * Fornisce accesso agli stessi log disponibili nella sezione Logs & Analytics della dashboard.
 *
 * COLLEZIONI LOG DISPONIBILI:
 * - postgres: Log server database inclusi query, errori, warning e messaggi di sistema
 * - api_gateway: Richieste API, risposte ed errori processati dal gateway Kong
 * - auth: Log autenticazione e autorizzazione per sign-up, login e operazioni token
 * - postgrest: Log dal servizio RESTful API che espone il database PostgreSQL
 * - pooler: Log connection pooling da pgbouncer e supavisor
 * - storage: Log servizio object storage per upload, download e permessi file
 * - realtime: Log dal servizio real-time subscription per connessioni WebSocket
 * - edge_functions: Log esecuzione funzioni serverless incluse invocazioni ed errori
 * - cron: Log scheduled job (query tramite postgres logs con filtri specifici)
 * - pgbouncer: Log connection pooler
 *
 * STRUTTURA METADATA:
 * - postgres_logs: Usa "parsed.field_name" per campi come error_severity, query
 * - edge_logs: Usa "request.field_name" o "response.field_name" per dettagli HTTP
 * - function_edge_logs: Usa "function_id", "execution_time_ms" per metriche funzioni
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @param collection Collezione log da interrogare (required)
 * @param limit Numero massimo di entry log da restituire (default: 20)
 * @param hours_ago Recupera log dalle ultime N ore (default: 1)
 * @param filters Lista di oggetti filtro con field, operator e value
 * @param search Testo da cercare nei messaggi evento
 * @param custom_query Query SQL custom completa da eseguire invece delle query pre-costruite
 * @returns Promise con le entry di log
 *
 * @example
 * // Log postgres delle ultime 24 ore con errori
 * const errorLogs = await retrieveLogs({
 *   collection: 'postgres',
 *   limit: 20,
 *   hours_ago: 24,
 *   filters: [{ field: 'parsed.error_severity', operator: '=', value: 'ERROR' }]
 * });
 *
 * @example
 * // Cerca nei log di autenticazione
 * const authLogs = await retrieveLogs({
 *   collection: 'auth',
 *   search: 'login',
 *   hours_ago: 2
 * });
 *
 * @example
 * // Query custom per edge functions lente
 * const slowFunctions = await retrieveLogs({
 *   collection: 'edge_functions',
 *   custom_query: `
 *     SELECT id, timestamp, event_message, m.function_id, m.execution_time_ms
 *     FROM function_edge_logs
 *     CROSS JOIN unnest(metadata) AS m
 *     WHERE m.execution_time_ms > 1000
 *     ORDER BY timestamp DESC LIMIT 10
 *   `
 * });
 */
export async function retrieveLogs(params: RetrieveLogsParams): Promise<RetrieveLogsResult> {
  return callMCPTool<RetrieveLogsResult>('supabase-self-hosted__retrieve_logs', {
    collection: params.collection,
    limit: params.limit ?? 20,
    hours_ago: params.hours_ago ?? 1,
    filters: params.filters ?? [],
    search: params.search ?? '',
    custom_query: params.custom_query ?? ''
  });
}

