# Q-CHECK POS Test Execution Log

| Timestamp (CAT) | Test ID | Action | Result | Defect | Retest |
| --- | --- | --- | --- | --- | --- |
| 2026-09-06 09:26 | ENV-001 | Inspected local API roles endpoint and database tables. | `roles` endpoint passed after schema synchronization; 19 products, 3 users, 16 transactions, 1 return recorded. | - | - |
| 2026-09-06 09:28 | FT-007 | Submitted `TEST-NEGATIVE-001` with negative price and stock. | API accepted invalid data; negative product stored. | DEF-001 | Pending |
| 2026-09-06 09:29 | IT-003 | Submitted the same one-unit product twice in a checkout cart. | Sale completed and stock became `-1`. | DEF-002 | Pending |
| 2026-09-06 09:30 | FT-011 | Checked returned checkout response against transaction items. | Response reported `items: 0` although two units were stored. | DEF-003 | Pending |
| 2026-09-06 09:31 | FT-015 | Submitted an existing username through the users API. | API returned `500` rather than a validation response. | DEF-004 | Pending |
| 2026-09-06 09:32 | FIX-001 | Added product value/existence validation and aggregate cart validation. | PHP lint passed. | DEF-001, DEF-002 | Applied |
| 2026-09-06 09:33 | RT-001 | Re-submitted negative product, zero price, unknown product receipt, and duplicate cart lines. | All rejected with `422`; no sale created and stock remained unchanged. | DEF-001, DEF-002 | PASS |
| 2026-09-06 09:34 | FIX-002 | Added transaction-item quantity aggregation to receipt lookup. | PHP lint passed. | DEF-003 | Applied |
| 2026-09-06 09:34 | RT-002 | Checked out a one-unit controlled sale. | Response reported `items: 1`. | DEF-003 | PASS |
| 2026-09-06 09:35 | IT-004 / ST-003 | Processed controlled return `RCP-20260906-1018`. | Return saved, transaction marked Returned, stock restored; duplicate and unknown returns rejected. | - | PASS |
| 2026-09-06 09:36 | FIX-003 | Added pre-insert duplicate username validation. | PHP lint passed. | DEF-004 | Applied |
| 2026-09-06 09:36 | RT-003 | Re-submitted existing username. | API returned `422`; no duplicate user added. | DEF-004 | PASS |
| 2026-09-06 09:34-09:36 | SEC-001 to SEC-005 | Checked password hashing, injection string, unauthenticated pages/API, and client-side role routing. | Hashing/injection handling passed; server-side access control failed. | DEF-005 | Open |
| 2026-09-06 09:37 | DB-001 to DB-006 | Checked keys, duplicates, totals, line totals, stock, and cleanup. | No integrity violations; all `TEST-*` rows removed. | - | PASS |
| 2026-09-06 09:37 | PERF-001 to PERF-003 | Timed local dashboard, products API, and sales API. | 111.1 ms, 249.8 ms, and 136.8 ms respectively. | - | PASS |
