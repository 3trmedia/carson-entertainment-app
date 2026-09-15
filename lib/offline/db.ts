import Dexie, { type Table } from "dexie";

export type OutboxItem = {
  id?: number;
  method: "POST" | "PUT" | "DELETE";
  url: string;
  body?: Record<string, unknown>;
  createdAt: number;
};

class OfflineDB extends Dexie {
  outbox!: Table<OutboxItem, number>;

  constructor() {
    super("carson-entertainment-offline");
    this.version(1).stores({
      outbox: "++id",
    });
  }
}

export const offlineDb = new OfflineDB();
