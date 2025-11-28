/**
 * Send Management API Request - Esegue richieste Supabase Management API
 *
 * @module servers/supabase-self-hosted/sendManagementApiRequest
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface SendManagementApiRequestResult {
  status: number;
  data: unknown;
}

interface SendManagementApiRequestParams {
  method: HttpMethod;
  path: string;
  path_params: Record<string, string>;
  request_params: Record<string, unknown>;
  request_body: Record<string, unknown>;
}

/**
 * Esegue una richiesta diretta alla Supabase Management API.
 *
 * Permette chiamate dirette all'API di gestione Supabase per gestire
 * impostazioni progetto, risorse e configurazioni.
 *
 * FORMATTAZIONE RICHIESTA:
 * - Usare i path esattamente come definiti nelle specifiche API
 * - Il parametro {ref} viene automaticamente iniettato dalle impostazioni
 * - Formattare i body secondo le specifiche API
 *
 * GESTIONE PATH PARAMETERS:
 * - Il placeholder {ref} (project reference) è automaticamente iniettato
 * - Altri placeholder devono essere forniti nel dizionario path_params:
 *   * {function_slug}: Per operazioni Edge Functions
 *   * {id}: Per operazioni su risorse specifiche
 *   * {slug}: Per operazioni organizzazione
 *   * {branch_id}: Per operazioni branch database
 *
 * SISTEMA SAFETY:
 * - LOW RISK: Operazioni di lettura (GET) - permesse in SAFE mode
 * - MEDIUM/HIGH RISK: Operazioni di scrittura (POST, PUT, PATCH, DELETE) - richiedono UNSAFE mode
 * - EXTREME RISK: Operazioni distruttive - richiedono UNSAFE mode e conferma
 *
 * @param method Metodo HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param path Path API (es. /v1/projects/{ref}/functions)
 * @param path_params Parametri path come dict (es. {"function_slug": "my-function"})
 * @param request_params Query parameters come dict
 * @param request_body Request body come dict
 * @returns Promise con risposta API
 *
 * @example
 * // GET request con path e query parameters
 * const functions = await sendManagementApiRequest(
 *   'GET',
 *   '/v1/projects/{ref}/functions/{function_slug}',
 *   { function_slug: 'my-function' },
 *   { version: '1' },
 *   {}
 * );
 *
 * @example
 * // POST request con body
 * const newFunction = await sendManagementApiRequest(
 *   'POST',
 *   '/v1/projects/{ref}/functions',
 *   {},
 *   {},
 *   { name: 'test-function', slug: 'test-function' }
 * );
 */
export async function sendManagementApiRequest(
  method: HttpMethod,
  path: string,
  path_params: Record<string, string> = {},
  request_params: Record<string, unknown> = {},
  request_body: Record<string, unknown> = {}
): Promise<SendManagementApiRequestResult> {
  return callMCPTool<SendManagementApiRequestResult>(
    'supabase-self-hosted__send_management_api_request',
    {
      method,
      path,
      path_params,
      request_params,
      request_body
    }
  );
}

