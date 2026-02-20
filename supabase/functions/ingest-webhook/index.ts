import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface IngestPayload {
  type: 'financeiro' | 'operacional' | 'marketing'
  source: string
  data: Record<string, unknown>[]
}

function validatePayload(body: unknown): { valid: true; payload: IngestPayload } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Body must be a JSON object' }
  }

  const obj = body as Record<string, unknown>
  if (!['financeiro', 'operacional', 'marketing'].includes(obj.type as string)) {
    return { valid: false, error: 'type must be one of: financeiro, operacional, marketing' }
  }

  if (!obj.source || typeof obj.source !== 'string') {
    return { valid: false, error: 'source must be a non-empty string' }
  }

  if (!Array.isArray(obj.data) || obj.data.length === 0) {
    return { valid: false, error: 'data must be a non-empty array of objects' }
  }

  return { valid: true, payload: obj as unknown as IngestPayload }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate API key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing x-api-key header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate the API key against a stored secret
    const expectedKey = Deno.env.get('INGEST_WEBHOOK_KEY')
    if (!expectedKey || apiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const validation = validatePayload(body)
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { type, source, data } = validation.payload

    // Create import log
    const { data: logEntry, error: logError } = await supabase
      .from('import_logs')
      .insert({
        source_file: `webhook:${source}`,
        import_type: 'webhook',
        target_table: `fact_${type}`,
        total_rows: data.length,
        status: 'processing',
      })
      .select('id')
      .single()

    if (logError) {
      console.error('Failed to create import log:', logError)
      return new Response(JSON.stringify({ error: 'Failed to create import log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const importLogId = logEntry.id
    let processedRows = 0
    let errorRows = 0
    const errors: { row: number; message: string }[] = []

    // Insert data into the appropriate fact table
    const targetTable = `fact_${type}`

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        const record: Record<string, unknown> = {
          ...row,
          import_log_id: importLogId,
          fonte: source,
        }

        // Ensure required 'tipo' field exists
        if (!record.tipo) {
          record.tipo = source
        }

        // For financeiro, ensure 'valor' exists
        if (type === 'financeiro' && record.valor === undefined) {
          throw new Error('Campo "valor" é obrigatório para dados financeiros')
        }

        const { error: insertError } = await supabase
          .from(targetTable)
          .insert(record)

        if (insertError) {
          throw new Error(insertError.message)
        }

        processedRows++
      } catch (err) {
        errorRows++
        errors.push({ row: i + 1, message: (err as Error).message })
      }
    }

    // Update import log with results
    const finalStatus = errorRows === 0 ? 'success' : errorRows === data.length ? 'error' : 'partial'
    
    await supabase
      .from('import_logs')
      .update({
        status: finalStatus,
        processed_rows: processedRows,
        error_rows: errorRows,
        skipped_rows: 0,
        errors: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importLogId)

    return new Response(JSON.stringify({
      success: true,
      import_log_id: importLogId,
      status: finalStatus,
      processed_rows: processedRows,
      error_rows: errorRows,
      total_rows: data.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook ingestion error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})