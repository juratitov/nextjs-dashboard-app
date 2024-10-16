import { Client, Pool, QueryResultRow } from 'pg';

const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_HOST_PORT),
});

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_HOST_PORT),
});

const db = {
  client,
  connected: false,
};

// Connect to the PostgreSQL server
export async function connectToDatabase() {
  if (!db.connected) {
    await client.connect();
    db.connected = true;
  }
  return client;
}

// Disconnect the client (optional)
export async function disconnectFromDatabase() {
  if (db.connected) {
    await client.end();
    db.connected = false;
  }
}

const queryClient = <R extends QueryResultRow>(text: string, params?: any[]) =>
  client.query<R>(text, params);

const queryPool = <R extends QueryResultRow>(text: string, params?: any[]) =>
  pool.query<R>(text, params);

export { queryClient, queryPool };
