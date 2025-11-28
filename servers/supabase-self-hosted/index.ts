/**
 * Supabase Self-Hosted MCP Tools
 *
 * Progressive disclosure pattern - importa solo ciò che ti serve.
 * Pattern Code Execution per riduzione token fino al 98.7%.
 *
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 * @module servers/supabase-self-hosted
 *
 * @example
 * // Importa solo i tool necessari (progressive disclosure)
 * import { executePostgresql, getSchemas } from './servers/supabase-self-hosted';
 *
 * // Esegui query
 * const schemas = await getSchemas();
 * const users = await executePostgresql('SELECT * FROM users LIMIT 10;');
 *
 * @example
 * // Per operazioni di scrittura, abilita prima UNSAFE mode
 * import { liveDangerously, executePostgresql } from './servers/supabase-self-hosted';
 *
 * await liveDangerously('database', true);
 * await executePostgresql("INSERT INTO logs (msg) VALUES ('test');");
 * await liveDangerously('database', false);
 */

// ============================================================================
// DATABASE SCHEMA TOOLS
// ============================================================================

/**
 * Lista tutti gli schemi del database con dimensioni e conteggi tabelle.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { getSchemas } from './getSchemas.js';

/**
 * Lista tutte le tabelle, foreign tables e views in uno schema.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { getTables } from './getTables.js';

/**
 * Ottiene la struttura dettagliata di una tabella specifica.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { getTableSchema } from './getTableSchema.js';

// ============================================================================
// SQL EXECUTION TOOLS
// ============================================================================

/**
 * Esegue statement PostgreSQL sul database.
 * SAFETY: Varia in base al tipo di query (READ/WRITE/SCHEMA)
 */
export { executePostgresql } from './executePostgresql.js';

/**
 * Recupera lista delle migrazioni dal database.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { retrieveMigrations } from './retrieveMigrations.js';

// ============================================================================
// MANAGEMENT API TOOLS
// ============================================================================

/**
 * Esegue richieste dirette alla Supabase Management API.
 * SAFETY: Varia in base al metodo HTTP (GET=safe, altri=unsafe)
 */
export { sendManagementApiRequest } from './sendManagementApiRequest.js';

/**
 * Ottiene le specifiche complete della Management API.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { getManagementApiSpec } from './getManagementApiSpec.js';

// ============================================================================
// AUTH ADMIN TOOLS
// ============================================================================

/**
 * Chiama metodi Auth Admin SDK (gestione utenti).
 * SAFETY: Varia in base al metodo chiamato
 */
export { callAuthAdminMethod } from './callAuthAdminMethod.js';

/**
 * Ottiene le specifiche dei metodi Auth Admin SDK.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { getAuthAdminMethodsSpec } from './getAuthAdminMethodsSpec.js';

// ============================================================================
// LOGGING TOOLS
// ============================================================================

/**
 * Recupera log dai servizi del progetto Supabase.
 * SAFETY: Operazione a basso rischio (sola lettura)
 */
export { retrieveLogs } from './retrieveLogs.js';

// ============================================================================
// SAFETY & CONTROL TOOLS
// ============================================================================

/**
 * Toggle modalità unsafe per operazioni database/API.
 * Usare prima di operazioni di scrittura o schema.
 */
export { liveDangerously } from './liveDangerously.js';

/**
 * Conferma ed esegue operazioni distruttive (DROP, TRUNCATE, etc.).
 * Usare solo dopo conferma esplicita dell'utente.
 */
export { confirmDestructiveOperation } from './confirmDestructiveOperation.js';

// ============================================================================
// RE-EXPORT CLIENT (per uso avanzato)
// ============================================================================

export { callMCPTool, listMCPTools, closeMCPServer, closeAllMCPServers } from '../../client.js';
