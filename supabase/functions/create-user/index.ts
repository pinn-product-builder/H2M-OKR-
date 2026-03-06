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
      return errorResponse('Apenas administradores podem criar usuários')
    }

    const { email, password, name, role } = await req.json()

    if (!email || !password || !name || !role) {
      return errorResponse('Preencha todos os campos obrigatórios: nome, email, senha e perfil')
    }

    if (password.length < 6) {
      return errorResponse('A senha deve ter no mínimo 6 caracteres')
    }

    const validRoles = ['admin', 'gestor', 'analista', 'visualizador']
    if (!validRoles.includes(role)) {
      return errorResponse('Perfil de acesso inválido')
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (createError) {
      const msg = createError.message.includes('already been registered')
        ? 'Este email já está cadastrado no sistema'
        : createError.message
      return errorResponse(msg)
    }

    if (!newUser.user) {
      return errorResponse('Falha ao criar usuário no auth')
    }

    const userId = newUser.user.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        name,
        email,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return errorResponse(`Falha ao criar perfil: ${profileError.message}`)
    }

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
      })

    if (roleError) {
      console.error('Role creation error:', roleError)
      await supabaseAdmin.from('profiles').delete().eq('user_id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return errorResponse(`Falha ao atribuir perfil: ${roleError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email: newUser.user.email,
          name,
          role,
        }
      }),
      { status: 200, headers: jsonHeaders }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return errorResponse(errorMessage)
  }
})
