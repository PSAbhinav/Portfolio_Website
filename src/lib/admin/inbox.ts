import { randomUUID } from "node:crypto";
import type { ContactMessage } from "../contact";
import type { Sql } from "../sql-types";

export type Delivery = "sent" | "pending" | "failed";

export type InboxRow = ContactMessage & {
  id: string;
  delivery: Delivery;
  error: string;
  created_at: string;
};

type StoredRow = Omit<InboxRow, "created_at"> & { created_at: string | Date };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validMessageId(id: unknown): id is string {
  return typeof id === "string" && UUID.test(id);
}

function toRow(row: StoredRow): InboxRow {
  return { ...row, created_at: new Date(row.created_at).toISOString() };
}

export async function saveMessage(sql: Sql, m: ContactMessage, delivery: Delivery, error = ""): Promise<string> {
  const id = randomUUID();
  await sql`
    INSERT INTO contact_inbox(id, name, email, phone, message, delivery, error)
    VALUES(${id}, ${m.name}, ${m.email}, ${m.phone}, ${m.message}, ${delivery}, ${error})`;
  return id;
}

export async function listMessages(sql: Sql): Promise<InboxRow[]> {
  const rows = await sql<StoredRow>`
    SELECT id, name, email, phone, message, delivery, error, created_at
    FROM contact_inbox
    ORDER BY created_at DESC
    LIMIT 200`;
  return rows.map(toRow);
}

export async function getMessage(sql: Sql, id: string): Promise<InboxRow | null> {
  const rows = await sql<StoredRow>`
    SELECT id, name, email, phone, message, delivery, error, created_at
    FROM contact_inbox
    WHERE id = ${id}`;
  return rows[0] ? toRow(rows[0]) : null;
}

export async function markDelivery(sql: Sql, id: string, delivery: Delivery, error = ""): Promise<void> {
  await sql`UPDATE contact_inbox SET delivery = ${delivery}, error = ${error} WHERE id = ${id}`;
}

export async function deleteMessage(sql: Sql, id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM contact_inbox WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
