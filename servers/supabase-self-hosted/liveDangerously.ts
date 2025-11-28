/**
 * Live Dangerously - Toggle modalità unsafe per operazioni database/API
 *
 * @module servers/supabase-self-hosted/liveDangerously
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

type ServiceType = 'api' | 'database';

interface LiveDangerouslyResult {
  service: ServiceType;
  mode: 'safe' | 'unsafe';
  message: string;
}

interface LiveDangerouslyParams {
  service: ServiceType;
  enable_unsafe_mode?: boolean;
}

/**
 * Abilita/disabilita la modalità unsafe per operazioni Management API o Database.
 *
 * COSA FA QUESTO TOOL:
 * Alterna tra modalità safe (default) e unsafe per le operazioni API o Database.
 *
 * MODALITÀ SAFETY SPIEGATE:
 *
 * 1. Database Safety Modes:
 *    - SAFE mode (default): Solo operazioni a basso rischio come query SELECT
 *    - UNSAFE mode: Operazioni a rischio maggiore inclusi INSERT, UPDATE, DELETE e modifiche schema
 *
 * 2. API Safety Modes:
 *    - SAFE mode (default): Solo operazioni a basso rischio che non modificano stato
 *    - UNSAFE mode: Operazioni a rischio maggiore che modificano stato (eccetto quelle bloccate)
 *
 * LIVELLI DI RISCHIO OPERAZIONI:
 * - LOW: Operazioni di lettura sicure con impatto minimo
 * - MEDIUM: Operazioni di scrittura che modificano dati ma non struttura
 * - HIGH: Operazioni che modificano struttura database o impostazioni di sistema
 * - EXTREME: Operazioni distruttive che potrebbero causare perdita dati
 *
 * QUANDO USARE:
 * - Usare PRIMA di tentare operazioni di scrittura o modifiche schema
 * - Abilitare unsafe mode solo quando necessario modificare dati o schema
 * - Tornare sempre a safe mode dopo aver completato le operazioni di scrittura
 *
 * NOTA: Questo tool influenza TUTTE le operazioni successive per il servizio specificato.
 *
 * @param service Quale servizio alternare ('api' o 'database')
 * @param enable_unsafe_mode true per abilitare unsafe mode, false per safe mode (default: false)
 * @returns Promise con lo stato risultante
 *
 * @example
 * // Abilita database unsafe mode
 * await liveDangerously('database', true);
 *
 * // Esegui operazioni di scrittura...
 * await executePostgresql("INSERT INTO users (email) VALUES ('test@test.com');");
 *
 * // Torna a safe mode
 * await liveDangerously('database', false);
 */
export async function liveDangerously(
  service: ServiceType,
  enable_unsafe_mode: boolean = false
): Promise<LiveDangerouslyResult> {
  return callMCPTool<LiveDangerouslyResult>('supabase-self-hosted__live_dangerously', {
    service,
    enable_unsafe_mode
  });
}

