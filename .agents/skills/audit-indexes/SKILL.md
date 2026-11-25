---
name: audit-indexes
description: Audits PostgreSQL database indexes for ghurki-cricket using Supabase MCP. Checks live index scan counts against the recorded baseline, runs Supabase database performance advisors, reviews slow queries from pg_stat_statements, and provides recommendations on index efficiency. Trigger on /audit-indexes, "audit indexes", "check indexes", or when evaluating database performance.
---

# Database Index Audit Skill

Use this skill whenever the user triggers `/audit-indexes`, asks to "audit indexes", "check index usage", or review database query performance.

## Context & Configuration
- **Supabase Project Ref**: `azgwgqqemmedczncqhrn`
- **MCP Server**: `supabase_mcp`
- **Baseline File**: `.agents/skills/audit-indexes/baseline.json`
- **Prisma Schema**: `packages/db/prisma/schema/schema.prisma`
- **Benchmark Script**: `scripts/benchmark-routers.ts`

---

## Audit Workflow

### Step 1: Read the Last Baseline
Read `.agents/skills/audit-indexes/baseline.json`.
Extract:
- `updated_at`: The date and time the baseline was recorded.
- `indexes`: Mapping of `indexname -> baseline_count`.
- `tables`: Mapping of `tablename -> { seq_scan: baseline_count }`.

### Step 2: Query Current Database Telemetry via Supabase MCP
Use the `call_mcp_tool` tool with server `supabase_mcp`:

1. **Live Index Scans**:
   Call `execute_sql` with:
   ```sql
   SELECT
       relname as tablename,
       indexrelname as indexname,
       idx_scan,
       idx_tup_read,
       idx_tup_fetch
   FROM
       pg_stat_user_indexes
   WHERE
       schemaname = 'public'
   ORDER BY
       tablename, indexname;
   ```

2. **Live Table Scans (Sequential vs Index)**:
   Call `execute_sql` with:
   ```sql
   SELECT
       relname as tablename,
       seq_scan,
       seq_tup_read,
       idx_scan,
       idx_tup_fetch
   FROM
       pg_stat_user_tables
   WHERE
       schemaname = 'public'
   ORDER BY
       tablename;
   ```

3. **Supabase Performance Advisor**:
   Call `get_advisors` with `project_id: "azgwgqqemmedczncqhrn"` and `type: "performance"`.
   Verify if there are any `unindexed_foreign_keys` or `unused_index` findings.

4. **Slow & Frequent Queries**:
   Call `execute_sql` with:
   ```sql
   SELECT
       calls,
       total_exec_time::numeric(10,2) as total_ms,
       mean_exec_time::numeric(10,2) as avg_ms,
       rows,
       query
   FROM
       pg_stat_statements
   WHERE
       query ILIKE '%public%' OR
       query ILIKE '%batting%' OR
       query ILIKE '%bowling%' OR
       query ILIKE '%matches%' OR
       query ILIKE '%dates%' OR
       query ILIKE '%innings%'
   ORDER BY
       total_exec_time DESC
   LIMIT 15;
   ```

---

### Step 3: Compute the Delta ($\Delta$) & Categorize
For each index, calculate:
$$\Delta \text{ Scans} = \text{Current } \texttt{idx\_scan} - \text{Baseline } \texttt{idx\_scan}$$

For each table, calculate:
$$\Delta \text{ Seq Scans} = \text{Current } \texttt{seq\_scan} - \text{Baseline } \texttt{seq\_scan}$$

Classify each index:
- **⭐ High Utility**: $\Delta \ge 100$ scans. Actively speeding up frequent queries.
- **✅ Moderate Utility**: $1 \le \Delta < 100$ scans. Serving occasional filtered queries.
- **🛡️ FK Covering**: $\Delta = 0$ scans, but required to cover a foreign key constraint and prevent locking during updates/deletes.
- **💤 Idle / Candidate for Removal**: $\Delta = 0$ scans, NOT a foreign key, and not on a table with $< 100$ rows.

*Note on Small Tables*: In PostgreSQL, tables with $< 100$ rows (like `players` with 22 rows or `dates` with 94 rows) fit in a single 8 KB page. The Postgres cost planner intentionally performs sequential in-memory scans (0.01ms) rather than reading an index page then jumping to heap. Do NOT drop FK indexes on small tables.

---

### Step 4: Present Audit Findings to User
Format the output cleanly:
1. **Summary Table**:
   - Table Name
   - Index Name
   - Baseline Count (from `baseline.json`)
   - Current Count
   - $\Delta$ (Hits since baseline)
   - Status & Role
2. **Table Scan Health**:
   - Report tables that had $\Delta \text{ Seq Scans} > 0$.
   - Identify which queries caused sequential scans and whether a composite index could prevent them.
3. **Slow Query Insights**:
   - Top 3 slowest or most called queries from `pg_stat_statements`.
4. **Actionable Recommendations**:
   - Specific indexes to keep, add, or drop in `schema.prisma`.

---

### Step 5: Updating the Baseline
If the user approves resetting or recording a new baseline after the audit:
1. Update `.agents/skills/audit-indexes/baseline.json` with the current timestamp and live counts.
2. If the user asks to reset query statement stats, run `SELECT pg_stat_statements_reset();` via `execute_sql`.
