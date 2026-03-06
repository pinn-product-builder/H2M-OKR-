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

    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return errorResponse('Preencha todos os campos: nome, email e senha.')
    }

    if (password.length < 6) {
      return errorResponse('A senha deve ter no mínimo 6 caracteres.')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse('Formato de email inválido.')
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        return errorResponse('Este email já está cadastrado. Tente fazer login.')
      }
      return errorResponse(createError.message)
    }

    if (!newUser.user) {
      return errorResponse('Falha ao criar usuário.')
    }

    const userId = newUser.user.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ user_id: userId, name, email })

    if (profileError) {
      console.error('Profile error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return errorResponse('Falha ao criar perfil. Tente novamente.')
    }

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: 'visualizador' })

    if (roleError) {
      console.error('Role error:', roleError)
      await supabaseAdmin.from('profiles').delete().eq('user_id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return errorResponse('Falha ao atribuir perfil. Tente novamente.')
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: userId, email: newUser.user.email, name, role: 'visualizador' }
      }),
      { status: 200, headers: jsonHeaders }
    )

  } catch (error: unknown) {
    console.error('Register error:', error)
    const msg = error instanceof Error ? error.message : 'Erro interno do servidor'
    return errorResponse(msg)
  }
})
