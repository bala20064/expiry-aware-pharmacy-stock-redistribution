import fs from "fs";
import path from "path";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";

const DB_FILE = path.resolve(process.cwd(), "pharmacy_inventory.db");

let SQL: SqlJsStatic | null = null;
let dbInstance: Database | null = null;

export async function initDb(): Promise<Database> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  if (!dbInstance) {
    if (fs.existsSync(DB_FILE)) {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } else {
      dbInstance = new SQL.Database();
    }
  }
  return dbInstance;
}

export function reloadDb(): void {
  if (SQL && fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    if (dbInstance) {
      dbInstance.close();
    }
    dbInstance = new SQL.Database(fileBuffer);
  }
}

export function saveDb(): void {
  if (dbInstance) {
    const data = dbInstance.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  }
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error("Database not initialized");
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as unknown as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const all = queryAll<T>(sql, params);
  return all.length > 0 ? all[0] : null;
}

export function run(sql: string, params: any[] = []): void {
  if (!dbInstance) throw new Error("Database not initialized");
  dbInstance.run(sql, params);
  saveDb();
}
