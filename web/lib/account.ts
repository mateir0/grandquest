'use server'

/**
 * Account deletion: removes the Supabase Auth user via the service-role
 * client. `ON DELETE CASCADE` on `profiles` and `quest_progress` removes
 * the data rows. The service role key lives only here, on the server —
 * it is never exposed to the client.
 */

import {redirect} from 'next/navigation'
import {createClient as createAdminClient} from '@supabase/supabase-js'
import {createClient} from './supabase/server'

export async function deleteAccountServer(): Promise<{error: string} | never> {
  const supabase = createClient()
  const {
    data: {user},
  } = await supabase.auth.getUser()
  if (!user) return {error: 'You are not signed in.'}

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return {error: 'Account deletion is not configured on this deployment.'}
  }

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: {autoRefreshToken: false, persistSession: false},
  })
  const {error} = await admin.auth.admin.deleteUser(user.id)
  if (error) return {error: error.message}

  await supabase.auth.signOut()
  redirect('/')
}
