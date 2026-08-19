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
      await this.pool.query("DELETE FROM users WHERE email = 'jahzealibeh529@gmail.com'");
      console.log('✅ Deleted account jahzealibeh529@gmail.com from PostgreSQL for fresh signup testing');
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
