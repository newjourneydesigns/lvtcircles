#!/usr/bin/env node

// Migration script to update database schema from 'leader' to 'active'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eruboulvrgrodccmjjbe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydWJvdWx2cmdyb2RjY21qamJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMzOTUsImV4cCI6MjA2ODY2OTM5NX0.FJ0nu1Ov8jbAdZy8SX9qs2gJ60_qdROsIkwRg8k9GK0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Starting migration: leader → active')
  
  try {
    // Step 1: Update existing records that have status 'leader' to 'active'
    console.log('📝 Step 1: Updating existing records...')
    const { data: updateData, error: updateError } = await supabase
      .from('circle_leaders')
      .update({ status: 'active' })
      .eq('status', 'leader')
      .select()
    
    if (updateError) {
      console.error('❌ Error updating records:', updateError)
      return
    }
    
    console.log(`✅ Updated ${updateData?.length || 0} records from 'leader' to 'active'`)
    
    // Step 2 & 3: We can't directly alter constraints with the JS client,
    // but the constraint update needs to be done via SQL
    console.log('📝 Step 2: Updating database constraint...')
    
    const { data: constraintData, error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE circle_leaders 
        DROP CONSTRAINT IF EXISTS circle_leaders_status_check;
        
        ALTER TABLE circle_leaders 
        ADD CONSTRAINT circle_leaders_status_check 
        CHECK (status IN ('invite', 'pipeline', 'active', 'paused'));
      `
    })
    
    if (constraintError) {
      console.error('❌ Error updating constraint:', constraintError)
      console.log('ℹ️  You may need to run the constraint update manually in the Supabase SQL editor')
    } else {
      console.log('✅ Database constraint updated successfully')
    }
    
    // Step 4: Verify the changes
    console.log('📝 Step 3: Verifying changes...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('circle_leaders')
      .select('status')
    
    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError)
      return
    }
    
    const statusCounts = verifyData.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Current status distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

runMigration()
