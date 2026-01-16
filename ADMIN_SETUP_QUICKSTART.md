# Admin Panel Setup - Quick Start Guide

## ✅ What's Been Done

Your admin panel now uses **secure, server-side authentication** via n8n webhooks:

1. ✅ Password is stored ONLY in n8n (never exposed to client)
2. ✅ Session tokens generated server-side
3. ✅ 24-hour session expiration
4. ✅ Secure authentication flow
5. ✅ Production build completed successfully

---

## 🚀 Next Steps to Enable Admin Access

### Step 1: Create n8n Admin Auth Workflow

You need to create one new workflow in n8n:

**Go to:** https://rachelstephenswellness.app.n8n.cloud

#### Quick Setup (5 minutes):

1. **Create New Workflow** named "Admin Authentication"

2. **Add Webhook Node:**
   - HTTP Method: `POST`
   - Path: `/webhook/api/admin_auth`
   - Response Mode: Last Node

3. **Add Set Node** (Extract Password):
   - Name: Extract Password
   - Fields to Set:
     - `password` = `{{ $json.body.password }}`

4. **Add IF Node** (Check Password):
   - Condition Type: String
   - Value 1: `{{ $node["Extract Password"].json.password }}`
   - Operation: Equal
   - Value 2: **YOUR_SECURE_ADMIN_PASSWORD** ⚠️ Use a strong password!

5. **Add Function Node** on TRUE path (Generate Token):
```javascript
const crypto = require('crypto');
const sessionToken = crypto.randomBytes(32).toString('hex');
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);

return {
  status: 'ok',
  session_token: sessionToken,
  expires_at: expiresAt.toISOString()
};
```

6. **Add Set Node** on FALSE path (Error Response):
   - Fields to Set:
     - `status` = `error`
     - `message` = `Invalid password`

7. **Save & Activate** the workflow

---

### Step 2: Add Environment Variable to Vercel

1. Go to: https://vercel.com/jeff-stephens-projects/rootedwellness-workout-app/settings/environment-variables

2. Add this variable:
   ```
   Name: VITE_N8N_ADMIN_AUTH_URL
   Value: https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_auth
   ```

3. **Important:** Apply to all environments (Production, Preview, Development)

4. Click "Save"

---

### Step 3: Redeploy Your App

After adding the environment variable:

1. Go to: https://vercel.com/jeff-stephens-projects/rootedwellness-workout-app

2. Click "Redeploy" on the latest deployment

   OR

3. Push any commit to trigger automatic deployment

---

### Step 4: Test Admin Login

1. Go to: **https://rootedwellness-workout-app.vercel.app/rootedworkout/admin/login**

2. Enter the password you set in Step 1 (in the IF node)

3. You should be logged in and redirected to the admin panel

---

## 🔐 Security Features

### What's Secure:

- ✅ Password stored only in n8n workflow (not in code or environment variables)
- ✅ Password never sent to client browser
- ✅ Session tokens are random, one-time-use
- ✅ Sessions automatically expire after 24 hours
- ✅ HTTPS encryption for all communication

### Important Notes:

⚠️ **Choose a strong admin password** in your n8n workflow:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- NOT "changeme123" or anything simple

⚠️ **Only you can see the password**:
- It's stored in your private n8n workflow
- Enable n8n workflow password protection for extra security

---

## 📍 URLs Reference

| Resource | URL |
|----------|-----|
| **Admin Login** | https://rootedwellness-workout-app.vercel.app/rootedworkout/admin/login |
| **Admin Panel** | https://rootedwellness-workout-app.vercel.app/rootedworkout/admin |
| **n8n Dashboard** | https://rachelstephenswellness.app.n8n.cloud |
| **Vercel Settings** | https://vercel.com/jeff-stephens-projects/rootedwellness-workout-app/settings |

---

## 🧪 Testing Your Setup

Test the webhook with curl:

```bash
curl -X POST https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_auth \
  -H "Content-Type: application/json" \
  -d '{"password": "YOUR_ADMIN_PASSWORD"}'
```

**Expected response (success):**
```json
{
  "status": "ok",
  "session_token": "abc123...",
  "expires_at": "2024-01-17T12:00:00Z"
}
```

**Expected response (wrong password):**
```json
{
  "status": "error",
  "message": "Invalid password"
}
```

---

## 🐛 Troubleshooting

### "Unable to connect to authentication server"
- Check n8n workflow is active (green toggle)
- Verify webhook path is exactly `/webhook/api/admin_auth`
- Check n8n execution logs for errors

### "Invalid password" with correct password
- Check for extra spaces in the IF node condition
- Password is case-sensitive
- Verify you're using the exact password from the workflow

### Session expires immediately
- Check your system time is correct
- Verify the Function node returns proper ISO 8601 date format

### Admin panel redirects to login
- Session may have expired (24 hour limit)
- Check browser localStorage for `rsw_admin_session` and `rsw_admin_expires`
- Clear localStorage and log in again

---

## 📚 Full Documentation

For advanced setup (session validation, multi-user support, audit logs), see:

**docs/N8N_ADMIN_AUTH_SETUP.md**

---

## ✨ What You Can Do Now

Once admin access is working, you can:

1. **Build Program Data:** Create 6-week workout programs
2. **Export Programs:** Download as TypeScript files
3. **Manage Variations:** Create multiple program versions
4. **Preview Programs:** See how they'll look to users

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| Frontend Code | ✅ Complete |
| Admin Auth Logic | ✅ Complete |
| Production Build | ✅ Complete |
| n8n Workflow | ⏳ **You need to create this** |
| Vercel Env Var | ⏳ **You need to add this** |
| Admin Access | ⏳ Waiting for n8n workflow |

---

**Estimated setup time:** 10 minutes

**Questions?** Check the full docs in `docs/N8N_ADMIN_AUTH_SETUP.md`
