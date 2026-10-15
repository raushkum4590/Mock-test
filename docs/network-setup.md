# LAN examination centre setup (Windows)

## Topology

```
[Candidate PC 1..N] ──┐
[Invigilator PC]    ──┼── Gigabit Ethernet switch ── [Exam server PC] ──(Profile A only)── Internet → Neon
                      │                                 static IP, e.g. 192.168.1.10
```

Wired Ethernet is strongly recommended over Wi-Fi. One server PC (4+ cores, 8+ GB RAM, SSD) comfortably serves a few hundred candidates.

## 1. Exam server PC

1. Give it a fixed address: either a DHCP reservation on the router, or a static IP (Settings → Network → Ethernet → Edit IP: `192.168.1.10/24`).
2. Install Node.js 22 LTS. Copy the project to a disk with free space (for example `D:\cbt`), then run:
   ```powershell
   npm ci
   copy .env.example .env    # set DATABASE_URL, AUTH_SECRET, APP_BASE_URL=http://192.168.1.10:3000
   npm run db:migrate
   npm run build
   npm run admin:create -- --username admin --name "Centre Admin"
   ```
3. Open the firewall for the LAN only:
   ```powershell
   New-NetFirewallRule -DisplayName "CBT exam server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Profile Private,Domain -RemoteAddress LocalSubnet -Action Allow
   ```
   Set the Ethernet network's profile to *Private*. Do not open the port on Public networks.
4. Run as a Windows service so the system restarts after crashes and reboots. Example with NSSM (nssm.cc):
   ```powershell
   nssm install CBTServer "C:\Program Files\nodejs\node.exe" "D:\cbt\node_modules\next\dist\bin\next" start -H 0.0.0.0 -p 3000
   nssm set CBTServer AppDirectory D:\cbt
   nssm set CBTServer AppStdout D:\cbt\logs\server.log
   nssm set CBTServer AppStderr D:\cbt\logs\server.log
   nssm set CBTServer Start SERVICE_AUTO_START
   nssm start CBTServer
   ```
   With `SCHEDULER_MODE=embedded`, this one service also runs the scheduler. For extra resilience, add a second service for `node_modules\.bin\tsx scripts\scheduler.ts`; running both is safe.
5. Check the server: from another PC, open `http://192.168.1.10:3000/api/health`. Expect `"status":"ok"` and a recent `scheduler.lastHeartbeat`.
6. Clocks: the server clock is authoritative, so keep Windows Time sync enabled (`w32tm /resync`). Candidate PC clocks do not matter, because the client measures its offset from the server.

**Cookies over plain HTTP:** keep `COOKIE_SECURE=auto` with an `http://` `APP_BASE_URL`. Forcing Secure cookies on http breaks logins. To use TLS on the LAN, put a reverse proxy (IIS ARR / Caddy) with an internal certificate in front, and set `APP_BASE_URL=https://…`.

## 2. Candidate PCs

Install the desktop client (`desktop/`, see desktop/README.md). On each PC, create `C:\ProgramData\CBTClient\cbt-client.json`:

```json
{ "serverUrl": "http://192.168.1.10:3000", "workstationCode": "LAB1-PC01", "kiosk": true, "allowDevTools": false }
```

Register the same workstation codes under **Admin → Candidates → Workstations**. To bind candidates to seats, assign workstations per schedule and enable *Require assigned workstation*.

A plain browser also works (`http://192.168.1.10:3000/login`) for practice sessions, but it has no workstation identity and no kiosk lock.

### Kiosk mode for managed exam PCs (optional)

- `"kiosk": true` opens the client full-screen with no menu and blocks reload, print and devtools shortcuts.
- For stronger lockdown, use Windows **Assigned Access** (Settings → Accounts → Other users → Set up a kiosk) with a dedicated local *exam* account running only the CBT client. Alternatively, use Shell Launcher on Enterprise/Education editions.
- Also disable USB storage through Group Policy, turn off notifications, and disable sleep and screen savers during exams.
- None of this makes cheating impossible. Physical invigilation is still required.

## 3. Load and multi-computer testing

- Automated multi-client tests (concurrent starts, concurrent submits, 10 parallel scheduler workers) run in `npm test`. The browser flow runs in `npm run test:e2e`.
- Before a live exam, do a **rehearsal**: publish a 10-minute schedule (`npm run db:seed -- --demo-schedule 5` creates one), log in from every lab PC, and watch **Admin → Live monitoring**. Check that every PC shows *online*, the exam opens by itself, and all attempts show AUTO_SUBMITTED at the end.
- Test unplugging a candidate's network cable for 30 s. The client shows *Reconnecting…*, the answers made meanwhile sync when it reconnects, and monitoring shows the PC offline, then online.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Candidate PC shows "Connecting to the exam server…" | `ping 192.168.1.10`; open `/api/health` in a browser; check the firewall rule and network profile (Private) |
| Login works on the server but not from other PCs | `COOKIE_SECURE` must not be `true` on http; `APP_BASE_URL` should use the server IP |
| "Cross-site request blocked" | The page was opened from a different host name than the API; add it to `ALLOWED_ORIGINS` |
| Dashboard warns that the scheduler has not reported | The service is not running, or the database is unreachable (see the server log). Start/finish still happen on candidate requests. |
| "Please log in from your assigned computer" | The workstation code in `cbt-client.json` does not match the assignment |
| Hindi shows boxes | Install a Devanagari font (Nirmala UI ships with Windows 10/11; Noto Sans Devanagari otherwise) |
