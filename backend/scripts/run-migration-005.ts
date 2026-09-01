import { supabaseService } from '../src/config/supabase';

require('dotenv').config();

async function runMigration() {
  console.log('=== Running Migration 005: Add extracted_text to case_files ===\n');

  try {
    // Add extracted_text column
    console.log('Adding extracted_text column to case_files...');
    const { error: columnError } = await supabaseService.rpc('exec_sql', {
      sql: `ALTER TABLE case_files ADD COLUMN IF NOT EXISTS extracted_text TEXT;`
    });

    if (columnError) {
      console.error('Failed to add column:', columnError);
      // Try direct SQL via REST API
      console.log('Retrying with direct SQL...');
    } else {
      console.log('✓ Column added successfully');
    }

    // Create index
    console.log('Creating index on extracted_text...');
    const { error: indexError } = await supabaseService.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_case_files_extracted_text ON case_files USING gin(to_tsvector('english', extracted_text)) WHERE extracted_text IS NOT NULL;`
    });

    if (indexError) {
      console.error('Failed to create index:', indexError);
    } else {
      console.log('✓ Index created successfully');
    }

    console.log('\n=== Migration Complete ===');
    console.log('Please verify in Supabase dashboard that:');
    console.log('1. case_files table has extracted_text column');
    console.log('2. Index idx_case_files_extracted_text exists');
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log('ALTER TABLE case_files ADD COLUMN IF NOT EXISTS extracted_text TEXT;');
    console.log('CREATE INDEX IF NOT EXISTS idx_case_files_extracted_text ON case_files USING gin(to_tsvector(\'english\', extracted_text)) WHERE extracted_text IS NOT NULL;');
  }
}

runMigration().catch(console.error);
