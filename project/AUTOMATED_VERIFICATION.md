# Automated Verification Results

Date: 11 August 2026

These checks were executed directly against the running local API after the security fix.

| Check | Result | Evidence |
|---|---|---|
| Valid customer login | PASS | HTTP 200 and a non-empty JWT was returned. The token value was not saved in this file. |
| User profile privacy | PASS | `GET /api/users/2` returned HTTP 200 without `password`, `password_hash`, or a bcrypt value. |
| Helmet headers | PASS | CSP, `X-Content-Type-Options: nosniff`, and `X-Frame-Options` were present. |
| Unknown endpoint | PASS | The API returned HTTP 404. |
| Postman collection structure | PASS | The JSON contains 18 requests. Tests exist for login, password-hash exclusion, and Helmet headers. |

## Important screenshot note

The code defect that caused screenshot 14 to expose `password_hash` is fixed and the live response is now safe. Screenshots 03, 14, and 15 still need to be replaced through the Postman interface by following `TEST_EVIDENCE_CHECKLIST.md`. This file records only checks that were actually executed; it does not claim that the pending Postman screenshots were captured.
