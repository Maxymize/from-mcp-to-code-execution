/**
 * Get Tables - Lista tabelle, foreign tables e views in uno schema
 *
 * @module servers/supabase-self-hosted/getTables
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface TableInfo {
  table_name: string;
  table_type: 'table' | 'view' | 'foreign table';
  row_count: number;
  size: string;
  column_count: number;
  index_count?: number;
  last_vacuum?: string;
  last_analyze?: string;
}

interface GetTablesResult {
  tables: TableInfo[];
}

interface GetTablesParams {
  schema_name: string;
}

/**
 * Lista tutte le tabelle, foreign tables e views in uno schema con metadati dettagliati.
 *
 * Fornisce informazioni su:
 * - Nomi tabelle/views
 * - Tipi di oggetto (table, view, foreign table)
 * - Conteggi righe
 * - Dimensioni su disco
 * - Conteggi colonne
 * - Informazioni sugli indici
 * - Timestamp ultimo vacuum/analyze
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @param schema_name Nome dello schema da ispezionare (es. 'public', 'auth')
 * @returns Promise con la lista delle tabelle e metadati
 *
 * @example
 * const tables = await getTables('public');
 * console.log(tables);
 * // { tables: [{ table_name: 'users', table_type: 'table', row_count: 1000, ... }] }
 */
export async function getTables(schema_name: string): Promise<GetTablesResult> {
  return callMCPTool<GetTablesResult>('supabase-self-hosted__get_tables', {
    schema_name
  });
}

