import { offlineDb, type OutboxItem } from "./db";

async function runRequest(item: Omit<OutboxItem, "id" | "createdAt">) {
  const res = await fetch(item.url, {
    method: item.method,
    headers: item.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: item.body !== undefined ? JSON.stringify(item.body) : undefined,
  });
  if (!res.ok) throw new Error(`Request failed: ${item.method} ${item.url}`);
}

// Fires the API call immediately when online; if offline, or the request
// fails outright (dropped connection), queues it instead. The caller has
// already applied the change optimistically to local state, so nothing
// typed is lost either way -- it just quietly syncs later.
export async function writeOrQueue(item: Omit<OutboxItem, "id" | "createdAt">) {
  if (!navigator.onLine) {
    await offlineDb.outbox.add({ ...item, createdAt: Date.now() });
    return;
  }
  try {
    await runRequest(item);
  } catch {
    await offlineDb.outbox.add({ ...item, createdAt: Date.now() });
  }
}

// Replays queued requests in order. Called once on reconnect -- not polled --
// so nothing syncs passively while the connection is unreliable or metered.
let flushing = false;

export async function flushOutbox() {
  // Guards against overlapping calls (e.g. two tabs open, or a reconnect
  // firing again while a previous flush is still in flight) -- without it,
  // two concurrent flushes can both grab the same queued item and race to
  // send it twice.
  if (!navigator.onLine || flushing) return;
  flushing = true;
  try {
    const items = await offlineDb.outbox.orderBy("id").toArray();

    for (const item of items) {
      try {
        await runRequest(item);
        if (item.id != null) await offlineDb.outbox.delete(item.id);
      } catch (err) {
        console.error("Sync failed, will retry on next reconnect", item, err);
        break; // preserve order -- stop rather than skip ahead
      }
    }
  } finally {
    flushing = false;
  }
}
