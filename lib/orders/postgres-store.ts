import postgres from "postgres";
import type { Order, OrderStore } from "./types";

type Row = { data: Order };

export class PostgresOrderStore implements OrderStore {
  private sql: postgres.Sql;
  private ready: Promise<void> | null = null;

  constructor(url: string) {
    this.sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10, prepare: false });
  }

  private init() {
    this.ready ??= this.sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        idempotency_key TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        status TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        total_bani INTEGER NOT NULL,
        data JSONB NOT NULL
      )`
      .then(() => undefined)
      .catch((e) => {
        this.ready = null;
        throw e;
      });
    return this.ready;
  }

  async save(order: Order) {
    await this.init();
    const inserted = await this.sql<Row[]>`
      INSERT INTO orders (id, idempotency_key, created_at, status, email, phone, total_bani, data)
      VALUES (${order.id}, ${order.idempotencyKey}, ${order.createdAt}, ${order.status},
              ${order.customer.email}, ${order.customer.phone}, ${order.totalBani}, ${this.sql.json(order)})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING data`;
    if (inserted.length) return { order, created: true };
    const [row] = await this.sql<Row[]>`SELECT data FROM orders WHERE idempotency_key = ${order.idempotencyKey}`;
    return { order: row.data, created: false };
  }

  async get(id: string) {
    await this.init();
    const [row] = await this.sql<Row[]>`SELECT data FROM orders WHERE id = ${id}`;
    return row?.data ?? null;
  }
}
