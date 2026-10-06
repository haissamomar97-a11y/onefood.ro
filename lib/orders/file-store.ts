import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order, OrderStore } from "./types";

// Doar pentru dezvoltare locală și teste. În producție se folosește Postgres.
export class FileOrderStore implements OrderStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private file = process.env.ORDERS_FILE ?? path.join(process.cwd(), ".data", "orders.json")) {}

  private async readAll(): Promise<Order[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8")) as Order[];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  save(order: Order) {
    // serializăm scrierile ca să nu se suprascrie reciproc
    const run = this.queue.then(async () => {
      const all = await this.readAll();
      const existing = all.find((o) => o.idempotencyKey === order.idempotencyKey);
      if (existing) return { order: existing, created: false };
      all.push(order);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(all, null, 2));
      await fs.rename(tmp, this.file);
      return { order, created: true };
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  async get(id: string) {
    return (await this.readAll()).find((o) => o.id === id) ?? null;
  }
}
