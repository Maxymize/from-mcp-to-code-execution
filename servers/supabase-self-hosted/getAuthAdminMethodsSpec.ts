/**
 * Get Auth Admin Methods Spec - Ottiene le specifiche dei metodi Auth Admin SDK
 *
 * @module servers/supabase-self-hosted/getAuthAdminMethodsSpec
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface MethodSpec {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }[];
  returns: string;
}

interface GetAuthAdminMethodsSpecResult {
  methods: Record<string, MethodSpec>;
}

/**
 * Ottiene le specifiche dei metodi Python SDK per Auth Admin.
 *
 * Restituisce un dizionario completo di tutti i metodi Auth Admin disponibili:
 * - Nomi e descrizioni dei metodi
 * - Parametri required e optional per ogni metodo
 * - Tipi e vincoli dei parametri
 * - Informazioni sui valori di ritorno
 *
 * Utile per esplorare le capacità dell'Auth Admin SDK e capire
 * come formattare correttamente i parametri per callAuthAdminMethod.
 *
 * METODI INCLUSI:
 * - get_user_by_id: Recupera utente per ID
 * - list_users: Lista utenti con paginazione
 * - create_user: Crea nuovo utente
 * - delete_user: Elimina utente
 * - invite_user_by_email: Invia invito via email
 * - generate_link: Genera link autenticazione
 * - update_user_by_id: Aggiorna attributi utente
 * - delete_factor: Elimina fattore MFA
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @returns Promise con le specifiche di tutti i metodi Auth Admin
 *
 * @example
 * const spec = await getAuthAdminMethodsSpec();
 * console.log(spec.methods.create_user);
 * // { name: 'create_user', parameters: [...], returns: '...' }
 */
export async function getAuthAdminMethodsSpec(): Promise<GetAuthAdminMethodsSpecResult> {
  return callMCPTool<GetAuthAdminMethodsSpecResult>(
    'supabase-self-hosted__get_auth_admin_methods_spec',
    {}
  );
}

