# n8n Workflows Setup Guide

This guide will walk you through setting up the 4 required n8n workflows for the RSW Workout App.

## 🚀 Quick Start: Import Pre-Built Workflows

**The fastest way to get started!**

We've created ready-to-import workflow JSON files in the `n8n-workflows/` folder. Simply import them into n8n and update your credentials.

👉 **[Go to n8n-workflows/README.md](./n8n-workflows/README.md) for step-by-step import instructions.**

---

## Alternative: Manual Setup

If you prefer to build the workflows manually, follow the detailed instructions below.

## Prerequisites

Before you begin, make sure you have:
- ✅ Completed the [Airtable Setup](./AIRTABLE_SETUP.md)
- ✅ Your Airtable API Token
- ✅ Your Airtable Base ID
- ✅ n8n installed (cloud or self-hosted)

## n8n Installation Options

### Option 1: n8n Cloud (Easiest)
Sign up at https://n8n.io and start a free trial.

### Option 2: Self-Hosted
```bash
npx n8n
```

Or with Docker:
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

## Setup Overview

You'll create 4 workflows, one for each API endpoint:
1. `/api/init` - Check if user exists
2. `/api/onboard` - Create new user
3. `/api/log_weight` - Log workout weight
4. `/api/get_logs` - Get user's workout logs

## Workflow 1: /api/init - User Initialization

### Purpose
Check if a user exists in Airtable by email.

### Workflow Structure

```
Webhook → Search Airtable → IF Node → Response
```

### Step-by-Step Setup

1. **Create New Workflow**
   - Click **"New workflow"**
   - Name it: `RSW - Init User`

2. **Add Webhook Node**
   - Click **"+"** to add node
   - Search for "Webhook"
   - Select **"Webhook"**
   - Configuration:
     - HTTP Method: `POST`
     - Path: `api/init`
     - Response Mode: `Last Node`
   - Copy the **Production URL** - you'll need this later

3. **Add Airtable Node (Search)**
   - Add node after Webhook
   - Search for "Airtable"
   - Configuration:
     - Credential: Create new Airtable credential with your API token
     - Operation: `Search Records`
     - Base: Select `RSW_Workout_App`
     - Table: `users`
     - Filter by Formula: `{email} = '{{ $json.body.email }}'`

4. **Add IF Node**
   - Add node after Airtable
   - Configuration:
     - Condition: `{{ $json.length > 0 }}`

5. **Add HTTP Response Node (True - Existing User)**
   - Connect to IF node's "true" output
   - Search for "Respond to Webhook"
   - Configuration:
     - Response Code: `200`
     - Response Body:
     ```json
     {
       "status": "existing_user",
       "email": "{{ $('Webhook').item.json.body.email }}",
       "user": "{{ $json[0].fields }}",
       "recent_logs": []
     }
     ```

6. **Add HTTP Response Node (False - New User)**
   - Connect to IF node's "false" output
   - Search for "Respond to Webhook"
   - Configuration:
     - Response Code: `200`
     - Response Body:
     ```json
     {
       "status": "new_user",
       "email": "{{ $('Webhook').item.json.body.email }}"
     }
     ```

7. **Activate Workflow**
   - Click **"Active"** toggle at top right

---

## Workflow 2: /api/onboard - Create New User

### Purpose
Create a new user record in Airtable with onboarding data.

### Workflow Structure

```
Webhook → Create Airtable Record → Response
```

### Step-by-Step Setup

1. **Create New Workflow**
   - Name it: `RSW - Onboard User`

2. **Add Webhook Node**
   - HTTP Method: `POST`
   - Path: `api/onboard`
   - Response Mode: `Last Node`

3. **Add Set Node (Prepare Data)**
   - Add node after Webhook
   - Search for "Set"
   - Keep Using Fields: `false`
   - JSON:
   ```json
   {
     "email": "{{ $json.body.email }}",
     "first_name": "{{ $json.body.first_name }}",
     "primary_goal": "{{ $json.body.primary_goal }}",
     "target_days_per_week": "{{ $json.body.target_days_per_week }}",
     "biggest_obstacle": "{{ $json.body.biggest_obstacle || '' }}",
     "created_at": "{{ $now.toISO() }}",
     "last_active_at": "{{ $now.toISO() }}"
   }
   ```

4. **Add Airtable Node (Create)**
   - Operation: `Create`
   - Base: `RSW_Workout_App`
   - Table: `users`
   - Fields:
     - Map each field from the Set node output

5. **Add HTTP Response Node**
   - Response Code: `200`
   - Response Body:
   ```json
   {
     "status": "ok",
     "user": "{{ $json.fields }}"
   }
   ```

6. **Activate Workflow**

---

## Workflow 3: /api/log_weight - Log Workout Weight

### Purpose
Create a new workout log entry and update user's last_active_at.

### Workflow Structure

```
Webhook → Create Log → Update User Last Active → Response
```

### Step-by-Step Setup

1. **Create New Workflow**
   - Name it: `RSW - Log Weight`

2. **Add Webhook Node**
   - HTTP Method: `POST`
   - Path: `api/log_weight`
   - Response Mode: `Last Node`

3. **Add Set Node (Validate Input)**
   - JSON:
   ```json
   {
     "email": "{{ $json.body.email }}",
     "week": "{{ $json.body.week }}",
     "day": "{{ $json.body.day }}",
     "exercise_name": "{{ $json.body.exercise_name }}",
     "weight": "{{ $json.body.weight }}",
     "timestamp": "{{ $now.toISO() }}"
   }
   ```

4. **Add Airtable Node (Create Log)**
   - Operation: `Create`
   - Base: `RSW_Workout_App`
   - Table: `workout_logs`
   - Fields: Map all fields from Set node

5. **Add Airtable Node (Update User)**
   - Operation: `Update`
   - Base: `RSW_Workout_App`
   - Table: `users`
   - Update Key: `email`
   - Fields to Send:
     - `last_active_at`: `{{ $now.toISO() }}`

6. **Add HTTP Response Node**
   - Response Code: `200`
   - Response Body:
   ```json
   {
     "status": "ok"
   }
   ```

7. **Activate Workflow**

---

## Workflow 4: /api/get_logs - Get User Logs

### Purpose
Retrieve workout logs for a user.

### Workflow Structure

```
Webhook → Search Logs → Response
```

### Step-by-Step Setup

1. **Create New Workflow**
   - Name it: `RSW - Get Logs`

2. **Add Webhook Node**
   - HTTP Method: `POST`
   - Path: `api/get_logs`
   - Response Mode: `Last Node`

3. **Add Airtable Node (Search)**
   - Operation: `Search Records`
   - Base: `RSW_Workout_App`
   - Table: `workout_logs`
   - Filter by Formula: `{email} = '{{ $json.body.email }}'`
   - Sort:
     - Field: `timestamp`
     - Direction: `desc`
   - Max Records: `{{ $json.body.limit || 100 }}`

4. **Add HTTP Response Node**
   - Response Code: `200`
   - Response Body:
   ```json
   {
     "status": "ok",
     "logs": "{{ $json.map(item => item.fields) }}"
   }
   ```

5. **Activate Workflow**

---

## Configure CORS (Important!)

For each webhook node, you need to enable CORS:

1. Click on the Webhook node
2. Scroll to **"Options"**
3. Add **"Response Headers"**:
   ```json
   {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Methods": "POST, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type"
   }
   ```

---

## Update Your .env.local File

After creating all workflows:

1. Copy the **Production URL** from any webhook (without the /api/... path)
2. Update your `.env.local` file:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud
   ```

   Or for self-hosted:
   ```
   VITE_N8N_WEBHOOK_URL=http://localhost:5678
   ```

---

## Testing Your Workflows

### Test /api/init

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/api/init \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response (new user):
```json
{
  "status": "new_user",
  "email": "test@example.com"
}
```

### Test /api/onboard

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "primary_goal": "Build Strength",
    "target_days_per_week": "3",
    "biggest_obstacle": "consistency"
  }'
```

### Test /api/log_weight

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/api/log_weight \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "week": 1,
    "day": 1,
    "exercise_name": "Back Squat",
    "weight": 135
  }'
```

### Test /api/get_logs

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/api/get_logs \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "limit": 100
  }'
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure CORS headers are set on all webhook nodes
   - Check browser console for specific CORS errors

2. **Airtable Authentication Failed**
   - Verify your API token has correct scopes
   - Check that the token has access to your base

3. **Workflow Not Triggering**
   - Make sure the workflow is **Active**
   - Check the execution list for errors
   - Verify the webhook URL matches your .env.local

4. **Data Not Saving**
   - Check Airtable field types match the data being sent
   - Look at the workflow execution log for errors
   - Verify field names match exactly (case-sensitive)

---

## Security Notes

- ⚠️ The CORS setting `"Access-Control-Allow-Origin": "*"` allows any domain. For production, restrict this to your specific domain.
- ⚠️ This V1 setup has no authentication. Add auth middleware in V2.
- ⚠️ Consider rate limiting on n8n webhooks for production use.

---

Next step: [Run the app locally](../README.md)
