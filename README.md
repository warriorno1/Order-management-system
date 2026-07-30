# Order-management-system
A full-stack order management application with a Node.js/Express backend,
React dashboard, MongoDB database, and an automated scheduler that transitions
order statuses based on elapsed time.

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB (Atlas)
- Frontend: React (Vite)
- Scheduler: node-cron (local) + GitHub Actions Cron (cloud)
- Deployment: Render (backend), Vercel (frontend)

## System Design

### Database Choice
MongoDB was chosen because orders are naturally document-shaped — each order
has a variable-depth structure  that maps
well to a flexible schema. MongoDB Atlas also provides a free managed cluster,
simplifying deployment, and Mongoose gives clean schema validation, defaults,
and indexing on top of it.

### Collections
orders
- orderId (String, unique, required) — business-facing identifier
- customerName, phone, productName (String, required)
- amount (Number, required, min 0)
- paymentStatus (String, enum: PENDING/PAID/FAILED, default PENDING)
- orderStatus (String, enum: PLACED/PROCESSING/READY_TO_SHIP/DELIVERED/CANCELLED, default PLACED)
- statusHistory (embedded array of {fromStatus, toStatus, changedAt, changedBy})
- idempotencyKey (String, unique, sparse) — duplicate prevention
- createdAt, updatedAt (auto-managed via Mongoose timestamps)

schedulerLogs
- startedAt, finishedAt (Date)
- ordersScanned, ordersUpdated (Number)
- status (String, enum: SUCCESS/FAILED)
- errorMessage (String, optional)

### Status History Storage
Status history is stored as an embedded array within each order document
rather than a separate collection. Since the dashboard and order-detail views
always need history alongside the order itself, embedding avoids a second
query/join. The trade-off: if an order accumulated an extremely large number
of transitions, the document could grow large — not a concern at this
assignment's scale, but a separate `orderStatusHistory` collection referencing
orderId would be the next step if that became an issue.

### Scheduler Logs Storage
Scheduler runs are logged in a separate `schedulerLogs` collection, one
document per execution, capturing start/end time, counts, and outcome. This
is independent of individual orders — it's an audit trail of the scheduler's
own behavior, used both for debugging and as evidence the job is running on
schedule.

### Duplicate Order Prevention
Order creation accepts an optional `idempotencyKey` from the client. This
field has a unique + sparse index in MongoDB. Before inserting, the API
checks for an existing order with the same key; if a duplicate does slip
through(under simultaneous requests), MongoDB's own unique index rejects the
second insert at the database level (error code 11000), which the API
catches and returns as a clean 409 Conflict rather than a raw DB error.

### Race Condition Handling
The scheduler's status transitions use `findOneAndUpdate` with the **current
status included in the query filter** (e.g. `{ _id, orderStatus: 'PLACED' }`),
not just the document ID. This makes each transition atomic at the database
level: if two scheduler runs overlap, or a manual PATCH changes an order's
status in between, the second attempt's query simply no longer matches (since
the status has already changed), so it's silently skipped rather than
double-processed. This was manually verified by firing two concurrent
scheduler requests against the same eligible order and confirming only one
transition was recorded.

### Scalability
- Indexes on `orderStatus`, `createdAt`, and a compound index on bothtogether support efficient filtering and the scheduler's core query.
- `GET /orders` supports pagination to avoid returning unbounded result setsas order volume grows.
- The scheduler currently processes orders in a loop within a single request;at much larger volumes, this could move to a queue-based worker (e.g.processing in batches, or offloading to a background job queue) to avoidlong-running HTTP requests.
- The API is stateless, so it can be horizontally scaled behind a load balancer if needed; MongoDB Atlas supports read replicas for read-heavy  scaling.

### Scheduler Service Used
GitHub Actions Cron was used to trigger the scheduler in production, since
it's free, version-controlled alongside the code (the workflow file lives in
`.github/workflows/scheduler.yml`), and easy for a reviewer to inspect and
verify runs directly in the repo's Actions tab. For local development, an
in-process `node-cron` job calls the same endpoint every 5 minutes.

Setup: the workflow runs on a `*/5 * * * *` cron schedule and calls
`POST /api/scheduler/run-status-update` on the deployed backend, passing the
`x-scheduler-secret` header from a GitHub Actions repository secret
(`SCHEDULER_SECRET`), with the target URL also stored as a secret
(`SCHEDULER_URL`). Note: GitHub Actions' scheduled triggers have inherent
timing jitter (typically a few minutes of delay is normal on their platform).

## Environment Variables

### Backend (`Backend/.env`)
 Variable  Description 

 PORT | Port the server listens on (defaults to 3000 locally; Render sets its own) |
 MONGO_URI | MongoDB Atlas connection string |
 SCHEDULER_SECRET | Secret key required in the `x-scheduler-secret` header to call the scheduler endpoint |
 FRONTEND_URL | Allowed CORS origin for the frontend |

### Frontend (`Frontend/.env`)
 Variable | Description |

 VITE_API_BASE_URL | Base URL of the backend API (e.g. `http://localhost:3000/api`) 

 ## Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)

### Backend

cd Backend
npm install
cp .env.example .env   # then fill in real values
npm run dev

Server runs at http://localhost:3000

### Frontend

cd Frontend
npm install
cp .env.example .env   # then fill in real values
npm run dev

App runs at http://localhost:5173

## Scheduler Setup

### Local testing
The backend automatically starts an in-process cron job (every 5 minutes)
when run locally via `npm run dev`. To test faster, manually trigger it:

POST http://localhost:3000/api/scheduler/run-status-update
Header: x-scheduler-secret: 07ca9d57068d607820221abe96dba7f2c2740958c5e5a17ee6d5e13394bb88ac


### Production (GitHub Actions)
1. Deploy the backend and note its public URL.
2. In the GitHub repo, go to Settings → Secrets and variables → Actions.
3. Add secrets:
   - `SCHEDULER_URL`: `https://order-management-backend.onrender.com/api/scheduler/run-status-update`
   - `SCHEDULER_SECRET`: same value as the backend's `SCHEDULER_SECRET`
4. The workflow at `.github/workflows/scheduler.yml` runs automatically every
   5 minutes, or can be triggered manually from the Actions tab.

   ## API Documentation

A Postman collection covering all endpoints is available at
`docs/postman_collection.json` — import it into Postman to explore and test
every route.

### Endpoints summary
| Method | Route | Description |
|---|---|---|
| POST | /api/order | Create a new order |
| GET | /api/order | List orders (supports `?status=` and `?page=&limit=`) |
| GET | /api/order/:id | Get a single order by orderId |
| PATCH | /api/order/:id | Manually update order/payment status |
| POST | /api/scheduler/run-status-update | Trigger scheduler run (protected) |


