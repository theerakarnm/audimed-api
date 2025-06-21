import { integer, text, timestamp, pgTable } from "drizzle-orm/pg-core";

const commonColumns = {
  createdAt: timestamp("created_at", { precision: 3, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
};

/** Group Chat table: to group files by a chat session or conversation */
export const icd10 = pgTable("icd_10", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  group: text("group"),
  groupName: text("group_name"),

  ...commonColumns,
});

/** Group Chat table: to group files by a chat session or conversation */
export const icd9 = pgTable("icd_9", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").notNull(),
  description: text("description").notNull(),

  ...commonColumns,
});