import { Pool, PoolClient } from "pg";

export class DatabaseClient {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
    });
  }

  public async query(opts: QueryOptions) {
    return this.pool.query(opts.text, opts.values);
  }

  public async trans(task: (client: PoolClient) => Promise<any>) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const value = await task(client);
      await client.query("COMMIT");
      return value;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

export interface QueryOptions {
  text: string;
  values: any[];
}
