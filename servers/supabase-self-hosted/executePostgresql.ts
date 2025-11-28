/**
 * Execute PostgreSQL - Esegue statement SQL sul database Supabase
 *
 * @module servers/supabase-self-hosted/executePostgresql
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface ExecutePostgresqlResult {
  rows?: unknown[];
  rowCount?: number;
  command?: string;
  fields?: { name: string; dataTypeID: number }[];
}

interface ExecutePostgresqlParams {
  query: string;
  migration_name?: string;
}

/**
 * Esegue statement PostgreSQL sul database Supabase.
 *
 * IMPORTANTE: Tutti gli statement SQL devono terminare con punto e virgola (;).
 *
 * TIPI DI OPERAZIONE E REQUISITI:
 *
 * 1. Operazioni READ (SELECT, EXPLAIN, etc.):
 *    - Possono essere eseguite direttamente senza requisiti speciali
 *
 * 2. Operazioni WRITE (INSERT, UPDATE, DELETE):
 *    - Richiedono modalità UNSAFE (usare live_dangerously('database', true) prima)
 *
 * 3. Operazioni SCHEMA (CREATE, ALTER, DROP):
 *    - Richiedono modalità UNSAFE
 *    - Operazioni distruttive (DROP, TRUNCATE) richiedono conferma aggiuntiva
 *
 * GESTIONE MIGRAZIONI:
 * Le query che modificano il database vengono automaticamente versionizzate.
 * Fornire opzionalmente un nome migrazione nel formato: verb_noun_detail
 *
 * GESTIONE TRANSAZIONI:
 * - NON usare statement di controllo transazione (BEGIN, COMMIT, ROLLBACK)
 * - Il client wrappa automaticamente le query in transazioni
 *
 * SAFETY:
 * - LOW RISK: Operazioni di lettura (SELECT, EXPLAIN)
 * - MEDIUM RISK: Operazioni di scrittura (INSERT, UPDATE, DELETE)
 * - HIGH RISK: Operazioni schema (CREATE, ALTER)
 * - EXTREME RISK: Operazioni distruttive (DROP, TRUNCATE)
 *
 * @param query Query SQL da eseguire (deve terminare con ;)
 * @param migration_name Nome opzionale della migrazione (formato: verb_noun_detail)
 * @returns Promise con il risultato della query
 *
 * @example
 * // Query di lettura (sempre permessa)
 * const users = await executePostgresql('SELECT * FROM public.users LIMIT 10;');
 *
 * @example
 * // Query di scrittura (richiede UNSAFE mode)
 * // Prima: await liveDangerously('database', true);
 * await executePostgresql(
 *   "INSERT INTO public.users (email) VALUES ('user@example.com');",
 *   'add_test_user'
 * );
 */
export async function executePostgresql(
  query: string,
  migration_name?: string
): Promise<ExecutePostgresqlResult> {
  const params: ExecutePostgresqlParams = { query };

  if (migration_name) {
    params.migration_name = migration_name;
  }

  return callMCPTool<ExecutePostgresqlResult>('supabase-self-hosted__execute_postgresql', params);
}

