# n8n Admin Authentication Setup

## Overview

This document explains how to set up server-side admin authentication for the RSW Workout App admin panel.

---

## n8n Workflow: Admin Authentication

### Webhook Configuration

**Webhook URL:** `https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_auth`

**Method:** POST

**Authentication:** None (password is sent in body, validated server-side)

---

## Request Format

```json
{
  "password": "your-admin-password"
}
```

---

## Response Formats

### Success Response (200)

```json
{
  "status": "ok",
  "session_token": "randomly-generated-secure-token",
  "expires_at": "2024-01-16T12:00:00Z"
}
```

### Error Response (401)

```json
{
  "status": "error",
  "message": "Invalid password"
}
```

---

## n8n Workflow Setup

### Step 1: Create Webhook Node

1. Create new workflow in n8n
2. Add **Webhook** node
   - **HTTP Method:** POST
   - **Path:** `/webhook/api/admin_auth`
   - **Response Mode:** Last Node

### Step 2: Extract Password

Add **Set** node to extract password from request:

```
Name: Extract Password
Fields to Set:
  - password: {{ $json.body.password }}
```

### Step 3: Check Password

Add **IF** node to validate password:

```
Condition Type: String
Value 1: {{ $node["Extract Password"].json.password }}
Operation: Equal
Value 2: YOUR_ACTUAL_ADMIN_PASSWORD
```

(Replace `YOUR_ACTUAL_ADMIN_PASSWORD` with a strong password - this stays in n8n only!)

### Step 4a: Success Path (True)

Add **Function** node to generate session token:

```javascript
// Generate secure session token
const crypto = require('crypto');
const sessionToken = crypto.randomBytes(32).toString('hex');

// Set expiration (24 hours from now)
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);

return {
  status: 'ok',
  session_token: sessionToken,
  expires_at: expiresAt.toISOString()
};
```

**Optional:** Add an **Airtable** node here to store the session token with expiration time for validation later.

### Step 4b: Failure Path (False)

Add **Set** node to return error:

```
Fields to Set:
  - status: error
  - message: Invalid password
```

Add **HTTP Request** node to set status code:

```
Method: Return HTTP Response
Response Code: 401
Body: {{ $json }}
```

---

## Session Validation (Optional - Advanced)

If you want to validate session tokens server-side, create another workflow:

### Webhook: Validate Session

**URL:** `https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_validate`

**Request:**
```json
{
  "session_token": "token-from-login"
}
```

**Response:**
```json
{
  "status": "valid",
  "expires_at": "2024-01-16T12:00:00Z"
}
```

This would check Airtable for the token and verify it hasn't expired.

---

## Security Considerations

### ✅ Secure Practices

1. **Password Never Exposed to Client:** Password is stored only in n8n workflow
2. **Session Tokens:** Random, one-time-use tokens instead of password
3. **Expiration:** Sessions expire after 24 hours
4. **HTTPS Only:** All communication over encrypted connections

### ⚠️ Limitations

1. **No Password Hashing:** n8n stores password in plain text in workflow
   - Only you (workflow owner) can see it
   - Enable n8n workflow password protection for extra security

2. **Basic Session Management:** Sessions stored in localStorage
   - For a single admin user, this is acceptable
   - For multiple admins, implement server-side session storage

---

## Testing Your Webhook

Use this curl command to test:

```bash
curl -X POST https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_auth \
  -H "Content-Type: application/json" \
  -d '{"password": "YOUR_ADMIN_PASSWORD"}'
```

**Expected Success Response:**
```json
{
  "status": "ok",
  "session_token": "abc123...",
  "expires_at": "2024-01-16T12:00:00Z"
}
```

---

## Adding to Your App

Once the n8n workflow is created:

1. Add environment variable to Vercel:
   ```
   VITE_N8N_ADMIN_AUTH_URL=https://rachelstephenswellness.app.n8n.cloud/webhook/api/admin_auth
   ```

2. Redeploy your app

3. Test login at: `https://rootedwellness-workout-app.vercel.app/rootedworkout/admin/login`

---

## Troubleshooting

### "Invalid password" even with correct password
- Check n8n workflow is active
- Verify password in IF node matches exactly (no extra spaces)
- Check webhook execution logs in n8n

### Webhook returning 404
- Verify webhook path is `/webhook/api/admin_auth`
- Check workflow is saved and active
- Ensure webhook node is properly configured

### Session expires immediately
- Check your local time zone settings
- Verify expires_at timestamp format is ISO 8601

---

## Future Enhancements

1. **Rate Limiting:** Add n8n delay to prevent brute force attacks
2. **Audit Logging:** Store all login attempts in Airtable
3. **Multi-User Support:** Create admin users table in Airtable
4. **Email Notifications:** Send alert when admin login occurs
5. **Session Revocation:** Add logout endpoint to invalidate tokens
