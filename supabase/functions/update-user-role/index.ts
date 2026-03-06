import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

function errorResponse(message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 200, headers: jsonHeaders }
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Token de autenticação ausente')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      anonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user: callingUser }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !callingUser) {
      return errorResponse('Usuário não autenticado')
    }

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single()

    if (!roleData || roleData.role !== 'admin') {
      return errorResponse('Apenas administradores podem alterar perfis')
    }

    const { userId, newRole } = await req.json()

    if (!userId || !newRole) {
      return errorResponse('Campos obrigatórios ausentes: userId, newRole')
    }

    const validRoles = ['admin', 'gestor', 'analista', 'visualizador']
    if (!validRoles.includes(newRole)) {
      return errorResponse('Perfil de acesso inválido')
    }

    const { data: existing } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let roleError
    if (existing) {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
      roleError = error
    } else {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: newRole })
      roleError = error
    }

    if (roleError) {
      return errorResponse(roleError.message)
    }

    return new Response(
      JSON.stringify({ success: true, userId, role: newRole }),
      { status: 200, headers: jsonHeaders }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return errorResponse(errorMessage)
  }
})
