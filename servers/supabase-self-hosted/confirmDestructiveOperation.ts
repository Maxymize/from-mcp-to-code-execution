/**
 * Confirm Destructive Operation - Conferma ed esegue operazioni distruttive
 *
 * @module servers/supabase-self-hosted/confirmDestructiveOperation
 * @see https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { callMCPTool } from '../../client.js';

type OperationType = 'api' | 'database';

interface ConfirmDestructiveOperationResult {
  success: boolean;
  result?: unknown;
  message?: string;
}

interface ConfirmDestructiveOperationParams {
  operation_type: OperationType;
  confirmation_id: string;
  user_confirmation?: boolean;
}

/**
 * Esegue un'operazione distruttiva database o API dopo conferma.
 *
 * Usare SOLO dopo aver rivisto i rischi con l'utente.
 *
 * COME FUNZIONA:
 * - Questo tool esegue un'operazione ad alto rischio precedentemente rifiutata usando il suo ID di conferma
 * - L'operazione sarà esattamente la stessa che ha generato l'ID
 * - Non serve riscrivere la query o i parametri API - il sistema li ricorda
 *
 * PASSAGGI:
 * 1. Spiegare i rischi all'utente e ottenere approvazione
 * 2. Usare questo tool con l'ID di conferma dal messaggio di errore
 * 3. La query originale verrà eseguita così com'è
 *
 * NOTA: Gli ID di conferma scadono dopo 5 minuti per sicurezza
 *
 * @param operation_type Tipo di operazione ('api' o 'database')
 * @param confirmation_id L'ID fornito nel messaggio di errore (required)
 * @param user_confirmation Impostare a true per confermare l'esecuzione (default: false)
 * @returns Promise con il risultato dell'operazione
 *
 * @example
 * // Dopo che una DROP TABLE è stata rifiutata con un confirmation_id
 * // e l'utente ha confermato di voler procedere:
 * const result = await confirmDestructiveOperation(
 *   'database',
 *   'abc123-conf-id',
 *   true
 * );
 */
export async function confirmDestructiveOperation(
  operation_type: OperationType,
  confirmation_id: string,
  user_confirmation: boolean = false
): Promise<ConfirmDestructiveOperationResult> {
  return callMCPTool<ConfirmDestructiveOperationResult>(
    'supabase-self-hosted__confirm_destructive_operation',
    {
      operation_type,
      confirmation_id,
      user_confirmation
    }
  );
}

