Ok -# n8n Workflow Import Files

This folder contains pre-built n8n workflows that you can import directly into n8n. This is much faster than building the workflows manually!

## Files

1. **1-init-user.json** - `/api/init` - Check if user exists
2. **2-onboard-user.json** - `/api/onboard` - Create new user
3. **3-log-weight.json** - `/api/log_weight` - Log workout weight
4. **4-get-logs.json** - `/api/get_logs` - Get user's workout logs

## Prerequisites

Before importing:

1. ✅ Complete [Airtable Setup](../AIRTABLE_SETUP.md)
2. ✅ Have your Airtable Base ID ready
3. ✅ Have your Airtable API Token ready
4. ✅ Have n8n running (cloud or self-hosted)

## Import Steps

### 1. Set up Airtable Credentials in n8n

First, add your Airtable credentials to n8n:

1. In n8n, click **Settings** (gear icon in sidebar)
2. Click **Credentials**
3. Click **Add Credential**
4. Search for and select **"Airtable Personal Access Token"**
5. Name it: `Airtable Personal Access Token`
6. Paste your Airtable API Token
7. Click **Save**
8. **Copy the Credential ID** from the URL (or remember the name)

### 2. Import Each Workflow

For each of the 4 JSON files:

1. **In n8n, click "+" to create a new workflow**

2. **Click the three dots (⋮) menu** in the top right

3. **Select "Import from File"**

4. **Choose the JSON file** (e.g., `1-init-user.json`)

5. **The workflow will be imported!**

### 3. Update Placeholders in Each Workflow

After importing each workflow, you need to update two placeholders:

#### For ALL Airtable nodes in the workflow:

1. **Click on each Airtable node** (they'll have red warning icons)

2. **Update the Base ID**:
   - In the "Base" field, click the dropdown
   - Select "From List"
   - Choose your `RSW_Workout_App` base
   - OR paste your Base ID directly

3. **Update the Credential**:
   - Click the Credential dropdown
   - Select your "Airtable Personal Access Token" credential

4. **Repeat for all Airtable nodes in the workflow**

### 4. Test Each Workflow

After importing and configuring all 4 workflows:

1. **Activate each workflow** (toggle at top right)

2. **Get the webhook URLs**:
   - Click on the Webhook node in each workflow
   - Copy the "Production URL"
   - It should look like: `https://your-n8n-instance.app.n8n.cloud/webhook/api/init`

3. **Test with curl** (see examples below)

## Testing Your Workflows

### Test 1: Init User (New User)

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/api/init \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{
  "status": "new_user",
  "email": "test@example.com"
}
```

### Test 2: Onboard User

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "primary_goal": "Build Strength",
    "target_days_per_week": "3",
    "biggest_obstacle": "consistency"
  }'
```

Expected response:
```json
{
  "status": "ok",
  "user": {
    "email": "test@example.com",
    "first_name": "Test",
    ...
  }
}
```

### Test 3: Init User (Existing User)

Run the init test again - should now return existing user:

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/api/init \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{
  "status": "existing_user",
  "email": "test@example.com",
  "user": {...}
}
```

### Test 4: Log Weight

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/api/log_weight \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "week": 1,
    "day": 1,
    "exercise_name": "Back Squat",
    "weight": 135
  }'
```

Expected response:
```json
{
  "status": "ok"
}
```

### Test 5: Get Logs

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/api/get_logs \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "limit": 100
  }'
```

Expected response:
```json
{
  "status": "ok",
  "logs": [
    {
      "email": "test@example.com",
      "week": 1,
      "day": 1,
      "exercise_name": "Back Squat",
      "weight": 135,
      "timestamp": "2026-01-12T..."
    }
  ]
}
```

## Update Your App Configuration

After all workflows are working:

1. **Get your base webhook URL**:
   - From any webhook, copy the URL up to (but not including) `/webhook/`
   - Example: `https://your-n8n-instance.app.n8n.cloud`

2. **Update `.env.local`** in your app:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook
   ```

## Troubleshooting

### "Could not find credential"
- Make sure you've created the Airtable credential in n8n first
- Update each Airtable node to use your credential

### "Base not found"
- Replace `YOUR_BASE_ID` with your actual Airtable Base ID
- Or select your base from the dropdown

### CORS errors in browser
- The workflows already include CORS headers set to `*` (allow all)
- For production, change `*` to your specific domain

### Webhook not triggering
- Make sure the workflow is **Active** (toggle at top right)
- Check that you're using the Production URL, not Test URL
- Verify the path matches (e.g., `/webhook/api/init`)

### Data not saving to Airtable
- Check the workflow execution log (clock icon in top bar)
- Verify field names match your Airtable table exactly
- Make sure your API token has write permissions

## Next Steps

Once all 4 workflows are imported, tested, and working:

1. ✅ Update `.env.local` with your n8n webhook URL
2. ✅ Run your app: `npm run dev`
3. ✅ Test the complete user flow in the app
4. ✅ Add your 12-week program data to `data/program.ts`

## Production Security

Before going to production:

1. **Update CORS** in all webhook nodes:
   - Change `Access-Control-Allow-Origin: *`
   - To `Access-Control-Allow-Origin: https://your-deployed-domain.com`

2. **Consider adding authentication** to the webhooks (V2 feature)

3. **Set up rate limiting** in n8n if available

---

**Congratulations!** Your backend is now fully configured. 🎉
