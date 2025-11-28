/**
 * Retrieve Migrations - Recupera lista delle migrazioni da Supabase
 *
 * @module servers/supabase-self-hosted/retrieveMigrations
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface MigrationInfo {
  version: string;
  name: string;
  sql?: string;
  statement_count: number;
  version_type: 'named' | 'numbered';
}

interface RetrieveMigrationsResult {
  migrations: MigrationInfo[];
}

interface RetrieveMigrationsParams {
  limit?: number;
  offset?: number;
  name_pattern?: string;
  include_full_queries?: boolean;
}

/**
 * Recupera una lista di tutte le migrazioni dal database Supabase.
 *
 * Restituisce informazioni su ogni migrazione:
 * - Version (timestamp)
 * - Name
 * - SQL statements (se richiesto)
 * - Statement count
 * - Version type (named o numbered)
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @param limit Numero massimo di migrazioni da restituire (default: 50, max: 100)
 * @param offset Numero di migrazioni da saltare per paginazione (default: 0)
 * @param name_pattern Pattern opzionale per filtrare per nome (usa ILIKE, case-insensitive)
 * @param include_full_queries Includere gli statement SQL completi (default: false)
 * @returns Promise con la lista delle migrazioni
 *
 * @example
 * // Ultime 10 migrazioni
 * const migrations = await retrieveMigrations({ limit: 10 });
 *
 * @example
 * // Migrazioni che contengono "users" nel nome
 * const userMigrations = await retrieveMigrations({
 *   name_pattern: 'users',
 *   include_full_queries: true
 * });
 */
export async function retrieveMigrations(
  params: RetrieveMigrationsParams = {}
): Promise<RetrieveMigrationsResult> {
  return callMCPTool<RetrieveMigrationsResult>('supabase-self-hosted__retrieve_migrations', {
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
    name_pattern: params.name_pattern ?? '',
    include_full_queries: params.include_full_queries ?? false
  });
}

