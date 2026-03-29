This folder contains the Oracle-first database foundation for SmartTransit.

Files:
- `schema.sql`: normalized DDL with core tables, constraints, and indexes.
- `seed.sql`: starter sample data aligned with the current frontend demo.
- `plsql.sql`: core triggers, procedures, functions, and a scheduler job.

Suggested execution order:
1. `schema.sql`
2. `seed.sql`
3. `plsql.sql`
