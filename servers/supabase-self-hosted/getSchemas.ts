/**
 * Get Schemas - Lista tutti gli schemi del database con dimensioni e conteggi tabelle
 *
 * @module servers/supabase-self-hosted/getSchemas
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

interface SchemaInfo {
  schema_name: string;
  size: string;
  table_count: number;
}

interface GetSchemasResult {
  schemas: SchemaInfo[];
}

/**
 * Lista tutti gli schemi del database con le loro dimensioni e il numero di tabelle.
 *
 * SAFETY: Operazione a basso rischio (sola lettura) eseguibile in modalità SAFE.
 *
 * @returns Promise con la lista degli schemi
 *
 * @example
 * const schemas = await getSchemas();
 * console.log(schemas);
 * // [{ schema_name: 'public', size: '1.2 MB', table_count: 15 }, ...]
 */
export async function getSchemas(): Promise<GetSchemasResult> {
  return callMCPTool<GetSchemasResult>('supabase-self-hosted__get_schemas', {});
}

