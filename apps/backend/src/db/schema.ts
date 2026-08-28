import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Forecast history — cache + SQL em vez de postgre
export const forecastHistory = sqliteTable("forecast_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  locationId: text("location_id").notNull(),
  locationName: text("location_name").notNull(),
  surfScore: integer("surf_score").notNull(),
  swellHeightM: real("swell_height_m"),
  waveHeightM: real("wave_height_m"),
  windSpeedMs: real("wind_speed_ms"),
  payload: text("payload", { mode: "json" }).$type<unknown>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Portal noticias — moderno, g1/valedoribeira + climmatempo como base
export const noticias = sqliteTable("noticias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  cover: text("cover").notNull().default("/CapaMeteor.jpg"),
  body: text("body").notNull(),
  source: text("source").notNull().default("g1"), // g1 | climmatempo | manual
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// RAG MRAG — todas as informações possíveis
export const ragChunks = sqliteTable("rag_chunks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // forecast | noticias | inmet | docs | readme
  sourceId: text("source_id"),
  content: text("content").notNull(),
  embedding: text("embedding", { mode: "json" }).$type<number[]>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
