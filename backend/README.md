This backend is a FastAPI starter for the SmartTransit Oracle schema.

Setup:
1. Run the SQL files in `../database`.
2. Copy `.env.example` to `.env` and update Oracle credentials.
3. Install dependencies:
   `pip install -r requirements.txt`
4. Start the API:
   `uvicorn main:app --reload`

Starter endpoints:
- `GET /health`
- `POST /api/auth/login`
- `GET /api/routes`
- `GET /api/tracking/live`
- `GET /api/alerts`
- `GET /api/passes/user/{user_id}`
- `POST /api/complaints`
