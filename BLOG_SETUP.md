# Owner account and live publishing

Updates is a casual feed for quick notes, things you're working on, interesting links and photos. Articles is for longer professional writing. Updates, Portfolio and Articles have tag filters. With Supabase connected, Updates reads from the database. Click the **+** on `#/updates` to sign in and compose directly on that page. You can save private drafts, edit, publish, unpublish and delete. Posts appear immediately without rebuilding the website. Existing `#/blog` and `#/write` links still open Updates.

## Configured project

- Organization: **artuanDev's Org**.
- Project: **artuanDev's Project** (`xhvydebwlnixpyehzcvp`), in London (`eu-west-2`).
- Dashboard: https://supabase.com/dashboard/project/xhvydebwlnixpyehzcvp.
- The owner account is created, confirmed, and activated. Owner-specific credentials are in the gitignored local `.env`.
- The project URL and publishable key are configured in local env files and GitHub Pages Actions variables. Env files stay untracked. GitHub Pages receives website updates; the existing Vercel deployment remains available with automatic Git deployments disabled.
- The owner password is saved as `BLOG_OWNER_INITIAL_PASSWORD` in the **gitignored local `.env` only**. It is not a `VITE_` variable and is not included in the browser build. Use it with the owner email after clicking **+** on Updates. Set a personal password through Supabase user management when ready, and update or remove the local password afterward.
- The schema is installed. Updates starts empty; the owner writes their own posts. All 15 database policy checks passed, and both security and performance advisors reported no findings.
- `node supabase/tests/live-blog-smoke.mjs` explicitly verifies real owner sign-in, membership, draft privacy, publication, unpublication, and token refresh. It deletes its temporary post and signs out afterward. It needs the owner credentials in local `.env`.

## Activate your owner account

1. Create a Supabase project at https://supabase.com/dashboard.
2. In its SQL Editor, run [supabase/schema.sql](supabase/schema.sql). [supabase/seed.sql](supabase/seed.sql) intentionally inserts no posts; Updates starts empty.
3. In **Authentication → Users → Add user**, create your account with your email and a password. Confirm it in the dashboard if necessary. There is no public sign-up flow on this site. You can also disable new signups in Supabase Auth settings.
4. In [supabase/activate-owner.sql](supabase/activate-owner.sql), replace `OWNER_EMAIL_HERE` with the owner's email in the SQL Editor, then run it. It locates that Auth user and grants owner access, and safely stops if the account does not exist. Keep the filled-in version local. Alternatively, copy that user's UUID and run:

   ```sql
   insert into public.site_owners (user_id) values ('YOUR-USER-UUID');
   ```

   A signed-in account only becomes an owner through this database entry. Browser clients cannot add owners. Database row-level policies let visitors read published posts and let the owner manage posts and upload images. Draft post text is readable only by the owner. Uploaded images use a public bucket so they can be shown in published posts; don't upload confidential draft images.
5. From the project connection/API settings, copy the project URL and **publishable** key. Add them to local `.env`:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Use only the publishable key (or the legacy `anon` key). Secret keys and `service_role` keys bypass database permissions and must never go in these browser settings.
6. Set the same two values for your production host. On **GitHub Pages**, add repository **Settings → Secrets and variables → Actions → Variables** named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; the workflow already reads them. Rebuild/redeploy GitHub Pages after setting them. The legacy Vercel deployment is retained without new website deployments. On another static host, set these variables during its build.
7. Open **Updates → +**. Sign in using your owner account. The site remembers your session on that browser, refreshes it as needed, and checks your owner membership when opening the inline editor.

Until this setup is complete, visitors can read the bundled caustics post and use all tag filters; the writing page explains that account setup is pending. There is no pretend login or browser-only publishing.

## Share an update

- Open **Updates**, click **+**, and sign in as the owner. English and Español are shown together: write each version yourself, then click **Post update** or press **Ctrl/⌘ + Enter**. You can leave either version blank. No titles or tags are required; the date and URL name are set automatically.
- Paste links into your note to make them clickable. Each language has an **Add a photo** button: choose a file and it uploads directly into that version. Edit its description in the inserted image text if needed.
- Check **Pin to top** to keep the update above unpinned posts. Pins are shared across both languages. Edit the update and uncheck it to return to date order.
- **More options** contains optional English and Spanish titles, tags, dates and links. There is no automatic translation or copying between versions. Visitors see their selected language, or the other original version if theirs is empty. The URL name stays fixed after saving a post to the database.
- Separate paragraphs with blank lines. Use `## Heading`, `**bold**`, inline backticks for code, or fenced code blocks. Raw HTML is displayed as text.
- Choose an image, add its description/caption, and click **Add image**. It uploads to Supabase and is inserted into the body. The first upload also becomes the cover if you have not set one.
- **Preview** shows the update, **Save draft** keeps it private, and **Post update** makes it public. For a published entry, **Save changes** updates it and **Unpublish to draft** hides it from visitors.
- Signed-in owners can use **Edit** beside an update or open **Your updates** in the composer to choose a saved post or draft. Use **New update** to start another note.
- To remove a saved post, click **Delete update** and confirm **Delete permanently**. Cancel leaves it unchanged. Deletion removes the post from the database and its backup on this device; uploaded images remain available.

Unsaved edits are backed up per post and owner account in that browser, including when switching the site's language. This is recovery storage; saving and publishing use the shared database. Sign out after using a shared computer. To change or recover the owner's password, use Supabase's user management.

## Validation

`npm test` checks tag grouping and text-to-block parsing. `npm run build` verifies the site compiles. After building, `npm run test:browser` covers filtering, routing, post content, sign-in, uploads, edit recovery and draft/publish behavior with a mocked API. It uses a hidden local Chrome browser on Windows; set `CHROME_PATH` if Chrome is installed elsewhere. The database policy tests in `supabase/tests/blog_security.sql` need a configured Supabase test database and pgTAP; run them before activating a real project (for example with `supabase test db`). A live account and real upload/publish check require your project credentials.

Reference: [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [publishable keys](https://supabase.com/docs/guides/getting-started/api-keys), and [storage access control](https://supabase.com/docs/guides/storage/security/access-control).
