import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmkfqlxipcvqkcsnmvqj.supabase.co'
const supabaseKey = 'sb_publishable_8AxDuZ9l6h2a-ocCVuxdcw_-m4CX-QP'

export const supabase = createClient(supabaseUrl, supabaseKey)