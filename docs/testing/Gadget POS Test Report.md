# University of Zambia
## Department of Computer Science & Informatics

**CSC 4630 - Advanced Software Engineering**

# Electronic & Gadget Store POS
## SYSTEM TEST REPORT

**Date:** 6 September 2026  
**Test environment:** Local development environment only; 

---

## 1. Executive Summary

The Electronic & Gadget Store POS was tested as a local PHP/MySQL application. The test cycle verified authentication, products, stock receiving, checkout, returns, reports data, UI helpers, and database consistency. Four application defects were found, safely fixed, and retested successfully. The system remains **PARTIALLY READY** for a course demonstration because protected pages and mutation APIs have no server-side authentication or authorization enforcement. Categories and several report features are not implemented.

## 2. Test Objectives

Determine what works, identify defects and risks, verify safe fixes, validate local data integrity, and assess readiness against the implemented POS use cases.

## 3. Scope

In scope: local frontend, PHP API, MySQL data, role navigation behavior, product/inventory workflows, checkout, returns, reports data, security basics, UI/accessibility code review, and local performance.

Out of scope: deployment, hosting, cloud services, CI/CD, destructive load testing, and production infrastructure.

## 4. Test Environment

| Item | Observed environment |
| --- | --- |
| Operating environment | Windows local development workstation, PowerShell |
| Application URL | `http://localhost/project/Q-CHECK-POS---CLASS-PROJECT/` |
| Web server | Apache 2.4.58 (Win64), from response headers/logs |
| Web PHP runtime | PHP 8.2.12, from Apache response headers |
| CLI PHP | PHP 8.3.12 |
| Database | MySQL 8.0.39 on `127.0.0.1:3306` |
| Database name | `gadget_pos` |
| Browser evidence | Chrome 152 requests observed in Apache access log; no browser automation available |
| Frameworks/libraries | Plain PHP, vanilla ES modules, CSS; no package manager or automated test framework found |
| Initial data observed | 19 products, 3 users, 16 transactions, 1 return |

No passwords or secrets are included in this report. A local pre-QA database backup was created outside the repository before data-affecting tests.

## 5. Features Tested

Login/authentication; products; inventory and receiving; POS checkout; receipts; returns; users and roles; transaction history; reports data; local database integrity; local API performance; UI/UX; accessibility; responsive code paths; and basic security controls.

## 6. Testing Approach

Testing combined HTTP API calls, direct read-only SQL verification, controlled temporary test records, PHP/JavaScript syntax checks, code review, and static UI/accessibility review. Temporary records used the `TEST-*` convention and were removed after retesting. Existing data and the user's local database credential/image changes were not modified.

## 7. Unit Testing Results

| Test ID | Unit | Scenario | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- | --- |
| UT-001 | `currency` helper | Format 100 | Formatted currency value returned | PASS | - |
| UT-002 | `stockStatus` helper | 0/2, 2/2, 3/2 stock/reorder | Returned Out, Low, Good respectively | PASS | - |
| UT-003 | `escapeHtml` helper | HTML event payload | Markup escaped | PASS | - |
| UT-004 | Product service | Negative price/stock | Initially accepted; fix rejects with 422 | PASS | DEF-001 |
| UT-005 | Sale service | Duplicate product cart lines | Initially oversold; fix aggregates quantity and rejects | PASS | DEF-002 |
| UT-006 | Product service | Unknown product receipt/update | Rejected with 422 after fix | PASS | DEF-001 |

## 8. Integration Testing Results

| Test ID | Components | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- |
| IT-001 | Database -> roles API -> frontend data load | Roles API returned 200 and role data after schema sync | PASS | - |
| IT-002 | Product -> receive stock -> inventory | Two received units returned 200; stock changed as expected | PASS | - |
| IT-003 | POS -> transaction -> transaction items -> stock | Controlled sale saved correct monetary/line data and reduced stock | PASS | - |
| IT-004 | Return -> transaction -> stock | Return saved, status changed to Returned, stock restored | PASS | - |
| IT-005 | Users -> roles | Unknown role rejected with 422 | PASS | - |
| IT-006 | Checkout -> receipt response | Initially item count was zero; response reports one after fix | PASS | DEF-003 |

## 9. Functional Testing Results

| Test ID | Feature | Scenario | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- | --- |
| FT-001 | Authentication | Valid administrator login | API returned 200 and Admin profile | PASS | - |
| FT-002 | Authentication | Valid manager login | API returned 200 and Manager profile | PASS | - |
| FT-003 | Authentication | Valid cashier login | API returned 200 and Cashier profile | PASS | - |
| FT-004 | Authentication | Invalid password and SQL injection string | Both returned 401 | PASS | - |
| FT-005 | Authentication | Temporarily inactive cashier | Login returned 401; account restored Active | PASS | - |
| FT-006 | Products | Missing required product field | Returned 422 | PASS | - |
| FT-007 | Products | Negative/zero price and negative stock | Rejected with 422 after fix | PASS | DEF-001 |
| FT-008 | Inventory | Unknown product/zero receive quantity | Rejected with 422 after fix | PASS | DEF-001 |
| FT-009 | Inventory | Out-of-stock product checkout | Rejected with 422 | PASS | - |
| FT-010 | Products | Valid temporary product creation | Created product and image path behavior exposed by API | PASS | - |
| FT-011 | POS | Checkout, VAT, receipt, stock reduction | 100.00 + 16% VAT = 116.00; stock 3 -> 1 | PASS | DEF-003 |
| FT-012 | Returns | Valid return and duplicate/unknown receipt | Valid return passed; duplicate and unknown receipts rejected | PASS | - |
| FT-013 | Users | Duplicate username | Initially 500; returned 422 after fix | PASS | DEF-004 |
| FT-014 | Categories | Create/edit/search/category relationship | No category-management feature exists | NOT IMPLEMENTED | DEF-007 |
| FT-015 | Reports | Filters/top sellers/trends | Basic aggregate report exists; requested filters/details do not | PARTIAL | DEF-008 |
| FT-016 | Users and roles | Role list and invalid role validation | Role list passed; valid new role/user workflow not fully exercised to avoid persistent data | PARTIAL | - |

## 10. System / End-to-End Testing Results

| Test ID | Workflow | Actual Result | Status |
| --- | --- | --- | --- |
| ST-001 | Cashier sale: product -> cart -> checkout -> transaction -> stock | Controlled API workflow completed and database values matched | PASS |
| ST-002 | Manager receive stock -> inventory | Controlled API workflow completed; stock increased | PASS |
| ST-003 | Sale -> receipt -> return -> stock restoration | Completed; transaction status and stock were correct | PASS |
| ST-004 | Admin creates role/user -> new user permissions | Existing role list verified; full workflow not completed because server-side authorization is absent | PARTIAL |

## 11. Regression Testing Results

| Test ID | Retest | Result | Status |
| --- | --- | --- | --- |
| RT-001 | DEF-001 negative values, unknown product, zero quantity | All returned 422; no invalid data persisted | PASS |
| RT-002 | DEF-002 repeated cart lines | Checkout returned 422; no sale created and stock stayed 1 | PASS |
| RT-003 | DEF-003 receipt item count | New checkout response returned `items: 1` | PASS |
| RT-004 | DEF-004 duplicate username | Returned 422; no duplicate user created | PASS |

## 12. Database & Data Integrity Testing

| Test ID | Check | Actual Result | Status |
| --- | --- | --- | --- |
| DB-001 | Foreign keys | `transaction_items` references transactions and products | PASS |
| DB-002 | Duplicate SKU/username | No duplicate rows found | PASS |
| DB-003 | Transaction totals | No `total != subtotal + vat` rows found | PASS |
| DB-004 | Line totals | No `line_total != quantity * unit_price` rows found | PASS |
| DB-005 | Orphans/negative stock | No orphan items or negative stock after cleanup | PASS |
| DB-006 | QA cleanup | Zero remaining `TEST-*` products/transactions/returns | PASS |

## 13. Security Testing Results

| Test ID | Check | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- |
| SEC-001 | Password storage | `password_hash` / `password_verify` used | PASS | - |
| SEC-002 | SQL injection login string | Authentication rejected it with 401 | PASS | - |
| SEC-003 | Direct protected page URL | Dashboard and Users pages returned 200 without server session | FAIL | DEF-005 |
| SEC-004 | Unauthenticated mutation API | Product creation succeeded without authentication | FAIL | DEF-005 |
| SEC-005 | Server role enforcement | API accepts caller-supplied user data; no server-side authorization layer | FAIL | DEF-005 |

## 14. Performance Testing Results

Local, single-request timings only; no load testing was performed.

| Test ID | Operation | Approximate result | Status |
| --- | --- | --- | --- |
| PERF-001 | Dashboard page | 111.1 ms, HTTP 200 | PASS |
| PERF-002 | Products API | 249.8 ms, HTTP 200 | PASS |
| PERF-003 | Sales API | 136.8 ms, HTTP 200 | PASS |

## 15. UI/UX & Usability Testing

| Test ID | Check | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- |
| UX-001 | Labels, empty states, loading and feedback | Implemented in the current frontend; static inspection passed | PASS | - |
| UX-002 | POS hierarchy/cart checkout clarity | Product catalogue, stock state, cart totals and empty cart are clear in code review | PASS | - |
| UX-003 | Return reason entry | Uses a browser prompt and whole-receipt return; no item-level selection | PARTIAL | DEF-009 |
| UX-004 | Responsive table/layout behavior | CSS has table scrolling and breakpoints; no automated viewport browser run available | PARTIAL | - |

## 16. Accessibility Testing

| Test ID | Check | Actual Result | Status |
| --- | --- | --- | --- |
| A11Y-001 | Labels and required fields | Visible labels, required indicators, and native required validation exist | PASS |
| A11Y-002 | Focus and semantics | Focus-visible styles, ARIA live feedback, headings, table scopes, and button labels present | PASS |
| A11Y-003 | Keyboard/screen-reader behavior in real browser | No assistive-technology run available | NOT TESTABLE |

## 17. Compatibility / Responsive Testing

| Test ID | Check | Actual Result | Status |
| --- | --- | --- | --- |
| COMP-001 | Local desktop route availability | Dashboard returned HTTP 200; Chrome requests observed in server log | PASS |
| COMP-002 | Tablet/mobile browser layouts | CSS breakpoints inspected; no device/browser automation available | PARTIAL |

## 18. User Acceptance / Beta Testing

| Test ID | Actor expectation | Result | Status |
| --- | --- | --- | --- |
| UAT-001 | Cashier can complete a normal sale | Sale/receipt/return workflow passed, but server authorization risk remains | PARTIAL |
| UAT-002 | Manager can receive stock and inspect inventory/reports | Receiving passed; reports are basic and lack filters | PARTIAL |
| UAT-003 | Administrator manages users/roles safely | Basic role/user validation exists; server-side access control is missing | PARTIAL |

## 19. Test Summary

| Category | Total | Pass | Fail | Partial | Blocked | Not Implemented | Not Testable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Unit | 6 | 6 | 0 | 0 | 0 | 0 | 0 |
| Integration | 6 | 6 | 0 | 0 | 0 | 0 | 0 |
| Functional | 16 | 13 | 0 | 2 | 0 | 1 | 0 |
| System | 4 | 3 | 0 | 1 | 0 | 0 | 0 |
| Regression | 4 | 4 | 0 | 0 | 0 | 0 | 0 |
| Database | 6 | 6 | 0 | 0 | 0 | 0 | 0 |
| Security | 5 | 2 | 3 | 0 | 0 | 0 | 0 |
| Performance | 3 | 3 | 0 | 0 | 0 | 0 | 0 |
| UI/UX | 4 | 2 | 0 | 2 | 0 | 0 | 0 |
| Accessibility | 3 | 2 | 0 | 0 | 0 | 0 | 1 |
| Compatibility | 2 | 1 | 0 | 1 | 0 | 0 | 0 |
| User Acceptance | 3 | 0 | 0 | 3 | 0 | 0 | 0 |
| **Total** | **62** | **48** | **3** | **9** | **0** | **1** | **1** |

### Master Test Table

| Test ID | Test Type | Feature | Scenario | Expected Result | Actual Result | Status | Defect ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UT-004 | Unit | Product validation | Negative price/stock | Reject invalid data | Initially accepted; retest returned 422 | PASS | DEF-001 |
| UT-005 | Unit | Sale validation | Duplicate product lines exceed stock | Reject combined quantity | Initially oversold; retest returned 422 | PASS | DEF-002 |
| IT-003 | Integration | Sale/inventory | Checkout persists sale/items and reduces stock | Correct monetary data and stock decrement | 100.00 + 16.00 VAT = 116.00; stock 3 -> 1 | PASS | - |
| IT-004 | Integration | Return/inventory | Return marks sale and restores stock | Return record, Returned status, stock restoration | All verified in SQL | PASS | - |
| FT-005 | Functional | Authentication | Inactive user login | Reject inactive account | Returned 401; account restored | PASS | - |
| FT-009 | Functional | POS | Out-of-stock checkout | Reject unavailable item | Returned 422 | PASS | - |
| FT-013 | Functional | Users | Duplicate username | Validation response/no duplicate | Initially 500; retest 422 | PASS | DEF-004 |
| ST-003 | System | Sale/return | Full controlled sale and return | Sale, receipt, return, stock consistency | Completed and verified | PASS | - |
| DB-004 | Database | Transaction items | Line total calculation | Quantity x unit price | No invalid rows found | PASS | - |
| SEC-003 | Security | Protected pages | Direct page request without session | Deny access | Returned HTTP 200 | FAIL | DEF-005 |
| SEC-004 | Security | Mutation API | Unauthenticated product creation | Deny access | Product created | FAIL | DEF-005 |
| UX-003 | Usability | Returns | Item-level reasoned return | Clear item/quantity workflow | Whole-receipt browser prompt only | PARTIAL | DEF-009 |

Pass percentage: **94.1%** of definitive PASS/FAIL results (48 PASS of 51). This percentage must not be interpreted as demonstration readiness because all three failures concern access control.

## 20. WHAT CURRENTLY WORKS

- Valid administrator, manager, and cashier authentication; invalid/inactive credentials are rejected.
- Product validation now rejects missing and invalid numeric values.
- Stock receiving validates quantity and product existence.
- Checkout creates transaction and item records, calculates 16% VAT, and adjusts stock.
- Receipt response includes the correct item count after the fix.
- Returns create records, mark sales Returned, restore stock, and reject duplicate/unknown returns.
- Foreign-key, duplicate, monetary, line-total, and post-test cleanup checks passed.
- Product/sales API and dashboard response times were acceptable in this small local dataset.

## 21. Defects Found

| Defect ID | Feature | Description | Severity | Initial Status |
| --- | --- | --- | --- | --- |
| DEF-001 | Products/Inventory | Negative price/stock was accepted; unknown product receipt did not fail. | HIGH | FAIL |
| DEF-002 | POS checkout | Duplicate lines for the same product could oversell and make stock negative. | CRITICAL | FAIL |
| DEF-003 | Receipt/API | Checkout response returned `items: 0` despite stored items. | MEDIUM | FAIL |
| DEF-004 | Users | Duplicate username produced database-backed HTTP 500. | MEDIUM | FAIL |
| DEF-005 | Security/Authorization | Pages and APIs lack server-side session and role authorization. | HIGH | OPEN |
| DEF-007 | Categories | Category management is absent. | MEDIUM | NOT IMPLEMENTED |
| DEF-008 | Reports | Only basic sales aggregates; no date filters, trends, top sellers, or low-stock report details. | MEDIUM | PARTIAL |
| DEF-009 | Returns | Whole-receipt-only return uses browser prompt; no item/quantity return workflow. | MEDIUM | PARTIAL |

## 22. DEFECTS FOUND AND FIXED

| Defect ID | Cause | Fix | Files Changed | Retest | Final Status |
| --- | --- | --- | --- | --- | --- |
| DEF-001 | Missing numeric/existence validation | Added product price/stock/reorder checks and product existence checks. | `backend/Services/ProductService.php` | Invalid cases returned 422. | FIXED - RETEST PASSED |
| DEF-002 | Per-line rather than aggregate stock validation | Aggregated quantities by product before availability validation. | `backend/Services/SaleService.php` | Duplicate-line cart returned 422; no sale/stock change. | FIXED - RETEST PASSED |
| DEF-003 | Receipt lookup omitted item aggregation | Joined/aggregated transaction items in receipt lookup. | `backend/Repositories/TransactionRepository.php` | New checkout reported `items: 1`. | FIXED - RETEST PASSED |
| DEF-004 | Duplicate handled only by database exception | Added pre-insert username uniqueness check. | `backend/Services/UserService.php` | Duplicate username returned 422. | FIXED - RETEST PASSED |

## 23. KNOWN OUTSTANDING ISSUES

### Critical

None confirmed after retesting.

### High

- **DEF-005:** No server-side session/authentication/authorization middleware. A user can request protected PHP pages and invoke product, sale, return, user, and role APIs without a verified server-side identity. Do not demonstrate this system as secure until it is addressed.

### Medium

- **DEF-007:** Category management is not implemented.
- **DEF-008:** Reports do not provide date filtering, sales trend, top-selling products, or low-stock detail reporting.
- **DEF-009:** Returns are full-receipt only, with a native prompt for the reason; item-level/quantity return is not implemented.
- Return stock adjustments and return-record creation are not wrapped in one database transaction; failure midway could leave inconsistent stock (code-review risk; not fault-injected).
- Receipt number generation uses row counts and has a concurrency collision risk (code-review risk; not load tested).

### Low

- Browser/device responsive and assistive-technology testing remains incomplete.

## 24. Known Limitations

No automated test framework, browser automation, screen-reader tooling, multi-browser run, load test, payment processing, server session layer, category module, or advanced reports were found. Findings were limited to the local application and its local MySQL instance.

## 25. NEXT TESTING PRIORITIES

**P1 - Must test/fix before demonstration**

- Implement and test server-side authentication, sessions, and role authorization for pages and every mutation API.
- Put return stock restoration and return-record insertion in one database transaction; test rollback.
- Replace row-count receipt numbering with a collision-safe identifier and test concurrent checkout behavior.

**P2 - Should test**

- Run browser-based responsive, keyboard-only, and screen-reader checks.
- Add report date filters and reconcile paid/returned revenue semantics with direct SQL.
- Add/verify category management if it is a course requirement.

**P3 - Additional confidence testing**

- Introduce an automated unit/integration suite.
- Run bounded local performance tests with larger seed volumes.

## 26. Course Demonstration Readiness

**PARTIALLY READY**

Core local POS, inventory, receipt, return, validation, and data-integrity workflows were verified. The demonstration risk is high if the lecturer checks direct URLs or APIs because access is enforced only in the client. Missing category management and basic-only reports also leave expected use cases incomplete.

## 27. Conclusion

The local POS demonstrates a functional core and the QA cycle fixed four concrete defects with successful regression evidence. It should be demonstrated only with the outstanding access-control and feature limitations clearly understood. The next engineering priority is server-side authorization, not additional cosmetic changes.

## 28. Appendix - Detailed Test Cases

The master tables in Sections 7-18 record the executed test cases, inputs, expected behavior, actual evidence, statuses, and linked defects. Chronological evidence is available in [test_execution_log.md](test_execution_log.md).
