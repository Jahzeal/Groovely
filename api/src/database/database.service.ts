import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  async onModuleInit() {
    try {
      await this.pool.query("UPDATE users SET role = 'creator' WHERE email = 'jahzealibeh529@gmail.com'");
    } catch (error) {
      console.error('Database initialization query error:', error);
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
