const { createClient } = require('@supabase/supabase-js');

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SRK',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `missing required environment variables: ${missingEnvVars}`
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SRK
);

module.exports = supabase;