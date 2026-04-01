This folder contains the Oracle-first database foundation for SmartTransit.

Files:
- `schema.sql`: normalized DDL with core tables, constraints, and indexes.
- `seed.sql`: starter sample data aligned with the current frontend demo.
- `views.sql`: reusable SQL views for live routes, delays, expiring passes, and complaint summaries.
- `plsql.sql`: triggers, procedures, functions, transaction-safe operations, and a scheduler job.
- `reports.sql`: analytics/report queries for project demonstration.
- `transactions_demo.sql`: sample procedure calls that demonstrate transaction handling.
- `security.sql`: example Oracle roles and grants for admin, app, and reporting access.
- `reset.sql`: drops the project tables, views, triggers, procedures, functions, and job so the schema can be recreated.

Suggested execution order:
1. `schema.sql`
2. `seed.sql`
3. `views.sql`
4. `plsql.sql`
5. `reports.sql` (run when you want analytics output)
6. `transactions_demo.sql` (optional demo calls)

Security notes:
- Run `security.sql` as `SYS`, `SYSTEM`, or another DBA-enabled account.
- The application user can continue using the normal schema scripts without the security script.
