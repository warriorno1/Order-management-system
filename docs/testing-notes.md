# Manual Testing Verification

-  Order creation with valid data — 201
-  Order creation with missing fields — 400
-  Duplicate order via idempotency key — 409
-  Get orders with status filter — correct filtering confirmed
-  Get orders pagination — confirmed page/limit behavior
-  Get single order by ID — 200 valid, 404 invalid
-  Manual PATCH order update — status history entry added correctly
-  Scheduler: PLACED → PROCESSING after 10 min — confirmed
-  Scheduler: PROCESSING → READY_TO_SHIP after 20 min — confirmed
-  Scheduler secret header rejection — 401 confirmed for missing/wrong secret
-  Scheduler concurrent run race condition — no double-processing confirmed
-  Frontend loading/empty/error states — all confirmed working
-  Frontend refresh button — confirmed