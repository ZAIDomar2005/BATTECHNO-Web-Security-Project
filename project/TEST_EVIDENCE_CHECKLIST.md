# Final screenshot checklist

Use real Postman screenshots from the running API. The SVG files are only visual summaries and should not be used as execution evidence.

## Screenshot 03 - valid login

1. Re-import `postman_collection.json` so the latest test and visualizer script is loaded.
2. Open `3. Valid Login (200 OK)` and click Send.
3. Open the Visualize tab in the response area.
4. Confirm it shows `JWT returned: Yes (value hidden for security)` and `200 OK`.
5. Save as `screenshots/03_Valid_Login_200.png`.

Do not include the full JWT value in the screenshot.

## Screenshot 14 - no password hash

1. Restart the API after the code update.
2. Open `14. Confirm No password_hash In User Results (200 OK)` and click Send.
3. Confirm the response is 200 and contains only `id`, `name`, `email`, `role`, and `created_at`.
4. Open Test Results and confirm both tests pass.
5. Save as `screenshots/14_Confirm_No_Password_Hash_200.png`.

The response must not include `password`, `password_hash`, or a bcrypt value.

## Screenshot 15 - Helmet headers

1. Open `15. Inspect Security Response Headers (Helmet Verification)` and click Send.
2. Open the response Headers view (not only Body).
3. Show at least `content-security-policy`, `x-content-type-options`, and `x-frame-options`.
4. Save as `screenshots/15_Inspect_Security_Headers_200.png`.

## Final check

- Screenshots 01 and 02 already have the corrected filenames.
- Screenshot 10 is now named `10_Invalid_Email_400.png`.
- Do not include `.env`, database credentials, passwords, or reusable JWT values in the submission.
