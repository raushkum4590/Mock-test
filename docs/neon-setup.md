# Neon setup (Profile A – connected centre)

1. Create a project at console.neon.tech. Choose the region **closest to the exam centre**: for India, AWS `ap-south-1` (Mumbai). Every answer save makes several database round trips; from India to Singapore that is about 100 ms each, and to Mumbai it is much less.
2. Create a database (for example `cbt`) and copy the **pooled** connection string (the host contains `-pooler`).
3. In `.env` on the exam server, set:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/cbt?sslmode=verify-full
   ```
   `node-postgres` already treats `sslmode=require` as `verify-full` and warns about the change in v9, so writing `verify-full` keeps today's behaviour and silences the warning.
4. Run:
   ```
   npm run db:check      # read-only: version, latency, tables
   npm run db:migrate    # creates tables; verifies the database is UTF-8
   npm run admin:create -- --username admin --name "Centre Admin"
   ```
5. Optional: `npm run db:seed` loads the sample exam and demo candidates.

## Operational notes

- The connection string is a secret. Keep it only in `.env` on the server; never put it in `.env.example`, client code or the Electron client. If it was ever shared (chat, email, a commit), **reset the role password** in the Neon console.
- Neon computes scale to zero when idle. The first query after idling takes a second or two. The scheduler writes a heartbeat only every 10 s. To avoid cold starts during exams, set the compute's *suspend timeout* above the exam length, or disable auto-suspend for exam days.
- **Internet loss** in Profile A means the exam server cannot reach the database. Neon does not work offline.
  - Candidates see "Server unreachable" and their answers queue locally.
  - The scheduler keeps retrying, and the official deadlines are re-applied once the connection returns.
  - Acknowledged answers are safe. Unacknowledged ones at the deadline are not accepted later (see architecture.md).
  - If outages are likely, apply an Emergency hold, or run the centre on Profile B.
- Use Neon **branches** for rehearsals: branch from production, point a test server at the branch, and delete it afterwards.
- Backups: Neon has point-in-time restore. Also keep the application-level JSON backups (`npm run backup`) for portability.
