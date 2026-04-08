# Smart Transit

Smart Transit is a full-stack public transport project built for route planning, live tracking, metro schedules, pass management, alerts, and complaint handling. The project uses a React frontend, a FastAPI backend, and Oracle Database with SQL, PL/SQL, views, triggers, procedures, analytics queries, and role-based security examples.

## Features

- Route search with direct and transfer-based trip suggestions
- Live map with Bengaluru transit routes
- Metro schedule page with tabular timetable display
- Pass management and renewal flow
- Alerts and delayed vehicle tracking
- Complaint filing and complaint analytics
- Oracle DBMS features such as views, triggers, procedures, functions, transactions, reports, and roles

## Tech Stack

- Frontend: React, Vite
- Backend: FastAPI, Python, `oracledb`
- Database: Oracle XE / Oracle 18c+
- Mapping: Leaflet

## Project Structure

```text
smart_transit/
|-- frontend/        # React + Vite frontend
|-- backend/         # FastAPI backend
|-- database/        # Oracle schema, seed, PL/SQL, views, reports, security
```

## Frontend Pages

- Home: route search, trip history, favorites
- Live Map: DB-backed route planning and line display
- Schedules: metro timetable view
- Pass Manager: user passes and expiring pass info
- Alerts: active alerts and delayed vehicle view
- Complaints: complaint filing and history
- Reports: complaint analytics

## Backend API Highlights

### Core APIs

- `GET /health`
- `GET /api/routes`
- `GET /api/routes/network`
- `GET /api/routes/plan?from=...&to=...`
- `GET /api/tracking/live`
- `GET /api/alerts`
- `GET /api/passes/user/{user_id}`
- `GET /api/complaints/user/{user_id}`

### DBMS-integrated APIs

- `GET /api/tracking/active-routes`
  Uses `vw_active_live_routes`
- `GET /api/tracking/delayed`
  Uses `vw_delayed_vehicles`
- `GET /api/passes/expiring`
  Uses `vw_expiring_passes`
- `GET /api/analytics/complaints-by-route`
  Uses `vw_complaint_summary_by_route`
- `POST /api/passes/book`
  Uses `pr_book_pass`
- `POST /api/passes/renew/{pass_number}`
  Uses `pr_renew_pass`
- `POST /api/complaints/log`
  Uses `pr_log_complaint`

## Database Setup

Connect as the application user:

```powershell
sqlplus smart_transit/smart_transit123@localhost:1521/xepdb1
```

Then run:

```sql
@C:\Users\srikr\smart_transit\database\reset.sql
@C:\Users\srikr\smart_transit\database\schema.sql
@C:\Users\srikr\smart_transit\database\seed.sql
@C:\Users\srikr\smart_transit\database\views.sql
@C:\Users\srikr\smart_transit\database\plsql.sql
```

Optional:

```sql
@C:\Users\srikr\smart_transit\database\reports.sql
@C:\Users\srikr\smart_transit\database\transactions_demo.sql
```

Run `security.sql` only as `SYS` or `SYSTEM`.

## Backend Setup

Inside `backend/.env`:

```env
ORACLE_USER=smart_transit
ORACLE_PASSWORD=smart_transit123
ORACLE_DSN=localhost:1521/xepdb1
API_TITLE=SmartTransit API
API_VERSION=0.1.0
DEBUG=true
```

Install dependencies:

```powershell
cd C:\Users\srikr\smart_transit\backend
pip install -r requirements.txt
```

Run backend:

```powershell
uvicorn main:app --reload
```

Backend URL:

- [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## Frontend Setup

Install and run:

```powershell
cd C:\Users\srikr\smart_transit\frontend
npm install
npm run dev
```

Frontend URL:

- [http://localhost:5173](http://localhost:5173)

## DBMS Concepts Used

- Normalized relational schema
- Primary keys, foreign keys, unique constraints, indexes
- Views for simplified querying
- Triggers for automatic updates and auditing
- PL/SQL functions and procedures
- Transaction handling with `SAVEPOINT`, `COMMIT`, and `ROLLBACK`
- Analytics/report queries
- Role-based security and grants

## Important Database Objects

### Views

- `vw_active_live_routes`
- `vw_delayed_vehicles`
- `vw_expiring_passes`
- `vw_complaint_summary_by_route`

### Procedures

- `pr_book_pass`
- `pr_renew_pass`
- `pr_log_complaint`
- `pr_find_route_interchanges`
- `pr_assign_driver`

### Functions

- `fn_calculate_fare`
- `fn_best_fare`
- `fn_estimate_eta`
- `fn_pass_is_valid`

### Triggers

- updated_at triggers
- pass expiry trigger
- live tracking runtime status trigger
- complaint status audit trigger

## Sample Stops

Some currently seeded stops include:

- Majestic Bus Stand
- Majestic Metro
- Whitefield Metro
- Challaghatta
- Garudacharpalya
- Mysore Road
- Madavara
- Silk Institute
- Nagasandra/Peenya Industry
- Yelachenahalli
- R V Road
- Bommasandra
- Cubbon Park
- MG Road
- Indiranagar

## Notes

- Route planning currently depends on the stops and route network available in the Oracle seed data.
- To support more locations, expand `seed.sql` and `route_stops`.
- Generated `__pycache__` files should not be committed.

## Authors

Sri Krishnika R
Bhavika Ajith
Namitha Susan Cherian
Nidhi J
Pranika Saxena

