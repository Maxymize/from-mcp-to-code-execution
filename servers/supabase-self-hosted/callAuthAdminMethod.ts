/**
 * Call Auth Admin Method - Chiama metodi Auth Admin SDK di Supabase
 *
 * @module servers/supabase-self-hosted/callAuthAdminMethod
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

type AuthAdminMethod =
  | 'get_user_by_id'
  | 'list_users'
  | 'create_user'
  | 'delete_user'
  | 'invite_user_by_email'
  | 'generate_link'
  | 'update_user_by_id'
  | 'delete_factor';

interface CallAuthAdminMethodResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface CallAuthAdminMethodParams {
  method: AuthAdminMethod;
  params: Record<string, unknown>;
}

/**
 * Chiama un metodo Auth Admin dal Supabase Python SDK.
 *
 * Fornisce un'interfaccia sicura e validata per:
 * - Gestione utenti (create, update, delete)
 * - Lista e ricerca utenti
 * - Generazione link di autenticazione
 * - Gestione multi-factor authentication
 *
 * METODI DISPONIBILI:
 * - get_user_by_id: Recupera un utente per ID
 * - list_users: Lista tutti gli utenti con paginazione
 * - create_user: Crea un nuovo utente
 * - delete_user: Elimina un utente per ID
 * - invite_user_by_email: Invia un link di invito via email
 * - generate_link: Genera un link email per vari scopi di autenticazione
 * - update_user_by_id: Aggiorna attributi utente per ID
 * - delete_factor: Elimina un fattore MFA da un utente
 *
 * NOTE IMPORTANTI:
 * - I body delle richieste devono aderire alle specifiche Python SDK
 * - Alcuni metodi hanno strutture parametri nidificate
 * - Campi extra non definiti nei modelli verranno rifiutati
 *
 * @param method Nome del metodo Auth Admin da chiamare
 * @param params Parametri per il metodo
 * @returns Promise con il risultato del metodo
 *
 * @example
 * // Recupera utente per ID
 * const user = await callAuthAdminMethod('get_user_by_id', {
 *   uid: 'user-uuid-here'
 * });
 *
 * @example
 * // Crea nuovo utente
 * const newUser = await callAuthAdminMethod('create_user', {
 *   email: 'user@example.com',
 *   password: 'secure-password'
 * });
 *
 * @example
 * // Aggiorna utente
 * const updated = await callAuthAdminMethod('update_user_by_id', {
 *   uid: 'user-uuid-here',
 *   attributes: {
 *     email: 'new@email.com'
 *   }
 * });
 *
 * @example
 * // Lista utenti
 * const users = await callAuthAdminMethod('list_users', {});
 */
export async function callAuthAdminMethod(
  method: AuthAdminMethod,
  params: Record<string, unknown>
): Promise<CallAuthAdminMethodResult> {
  return callMCPTool<CallAuthAdminMethodResult>('supabase-self-hosted__call_auth_admin_method', {
    method,
    params
  });
}

