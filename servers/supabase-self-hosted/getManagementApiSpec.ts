/**
 * Get Management API Spec - Ottiene le specifiche complete della Supabase Management API
 *
 * @module servers/supabase-self-hosted/getManagementApiSpec
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface GetManagementApiSpecParams {
  path?: string;
  method?: string;
  domain?: string;
  all_paths?: boolean;
}

interface GetManagementApiSpecResult {
  spec: unknown;
}

/**
 * Ottiene la specifica completa della Supabase Management API.
 *
 * Restituisce la specifica OpenAPI completa per la Management API, includendo:
 * - Tutti gli endpoint e operazioni disponibili
 * - Parametri required e optional per ogni operazione
 * - Schemi request e response
 * - Requisiti di autenticazione
 * - Informazioni di safety per ogni operazione
 *
 * MODALITÀ DI UTILIZZO:
 * 1. Senza parametri: Restituisce tutti i domini (default)
 * 2. Con path e method: Restituisce la specifica completa per un endpoint API specifico
 * 3. Con solo domain: Restituisce tutti i path e metodi in quel dominio
 * 4. Con all_paths=true: Restituisce tutti i path e metodi
 *
 * DOMINI DISPONIBILI:
 * - Analytics: Endpoint relativi ad analytics
 * - Auth: Endpoint autenticazione e autorizzazione
 * - Database: Endpoint gestione database
 * - Domains: Endpoint configurazione domini custom
 * - Edge Functions: Endpoint gestione funzioni serverless
 * - Environments: Endpoint configurazione ambienti
 * - OAuth: Endpoint integrazione OAuth
 * - Organizations: Endpoint gestione organizzazioni
 * - Projects: Endpoint gestione progetti
 * - Rest: Endpoint RESTful API
 * - Secrets: Endpoint gestione secrets
 * - Storage: Endpoint gestione storage
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @param params Parametri opzionali per filtrare la specifica
 * @returns Promise con la specifica API
 *
 * @example
 * // Tutti i domini
 * const allDomains = await getManagementApiSpec({});
 *
 * @example
 * // Specifica per un endpoint specifico
 * const endpointSpec = await getManagementApiSpec({
 *   path: '/v1/projects/{ref}/functions',
 *   method: 'GET'
 * });
 *
 * @example
 * // Tutti gli endpoint Auth
 * const authSpec = await getManagementApiSpec({ domain: 'Auth' });
 */
export async function getManagementApiSpec(
  params: GetManagementApiSpecParams = {}
): Promise<GetManagementApiSpecResult> {
  return callMCPTool<GetManagementApiSpecResult>(
    'supabase-self-hosted__get_management_api_spec',
    { params }
  );
}

