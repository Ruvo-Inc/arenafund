import { Pool } from 'pg';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

// Environment variables come from Secret Manager via Cloud Run --set-secrets
const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  CLOUD_SQL_INSTANCE_CONNECTION_NAME,
  NODE_ENV,
} = process.env as Record<string, string | undefined>;

let pool: Pool | null = null;
let connector: Connector | null = null;

export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  // Defensive checks for critical envs
  const missing: string[] = [];
  if (!DB_USER) missing.push('DB_USER');
  if (!DB_PASSWORD) missing.push('DB_PASSWORD');
  if (!DB_NAME) missing.push('DB_NAME');
  if (missing.length) {
    console.error(
      `Database env missing: ${missing.join(', ')}. Present flags -> ` +
        `CLOUD_SQL_INSTANCE_CONNECTION_NAME=${!!CLOUD_SQL_INSTANCE_CONNECTION_NAME}, DB_HOST=${!!DB_HOST}, DB_PORT=${!!DB_PORT}`
    );
    throw new Error(`Database configuration missing required env: ${missing.join(', ')}`);
  }

  // If Cloud SQL connector is available (preferred in Cloud Run), use it.
  if (CLOUD_SQL_INSTANCE_CONNECTION_NAME) {
    console.log('Initializing PG pool via Cloud SQL Connector');
    connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: CLOUD_SQL_INSTANCE_CONNECTION_NAME,
      ipType: IpAddressTypes.PUBLIC,
    });

    pool = new Pool({
      ...clientOpts,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      // Keep SSL off here because connector provides TLS where needed
      // and pg will use provided socket/SSL options from connector
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  } else {
    // Fallback: direct TCP using public IP (for local dev)
    console.log('Initializing PG pool via direct TCP');
    pool = new Pool({
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : 5432,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  pool.on('error', (err) => {
    console.error('Unexpected PG pool error', err);
  });

  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (connector) {
    connector.close();
    connector = null;
  }
}
