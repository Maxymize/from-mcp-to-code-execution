/**
 * Get Table Schema - Ottiene la struttura dettagliata di una tabella
 *
 * @module servers/supabase-self-hosted/getTableSchema
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default?: string;
  character_maximum_length?: number;
}

interface PrimaryKeyInfo {
  constraint_name: string;
  columns: string[];
}

interface ForeignKeyInfo {
  constraint_name: string;
  column_name: string;
  referenced_table_schema: string;
  referenced_table_name: string;
  referenced_column_name: string;
}

interface IndexInfo {
  index_name: string;
  columns: string[];
  is_unique: boolean;
  index_type: string;
}

interface GetTableSchemaResult {
  columns: ColumnInfo[];
  primary_key?: PrimaryKeyInfo;
  foreign_keys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  constraints: unknown[];
  triggers: unknown[];
}

interface GetTableSchemaParams {
  schema_name: string;
  table: string;
}

/**
 * Ottiene la struttura dettagliata di una tabella specifica.
 *
 * Restituisce informazioni complete su:
 * - Definizioni colonne (nomi, tipi, vincoli)
 * - Chiave primaria
 * - Relazioni foreign key
 * - Indici
 * - Constraints
 * - Triggers
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @param schema_name Nome dello schema (es. 'public', 'auth')
 * @param table Nome della tabella da ispezionare
 * @returns Promise con la struttura completa della tabella
 *
 * @example
 * const schema = await getTableSchema('public', 'users');
 * console.log(schema.columns);
 * // [{ column_name: 'id', data_type: 'uuid', is_nullable: false, ... }]
 */
export async function getTableSchema(
  schema_name: string,
  table: string
): Promise<GetTableSchemaResult> {
  return callMCPTool<GetTableSchemaResult>('supabase-self-hosted__get_table_schema', {
    schema_name,
    table
  });
}

