# Airtable Setup Guide

This guide will walk you through setting up your Airtable base for the RSW Workout App.

## Step 1: Create a New Base

1. Log in to Airtable at https://airtable.com
2. Click **"Add a base"** > **"Start from scratch"**
3. Name your base: `RSW_Workout_App`

## Step 2: Create the Users Table

### Table Name: `users`

Create a table named `users` with the following fields:

| Field Name              | Field Type           | Configuration                                      |
|------------------------|----------------------|---------------------------------------------------|
| `email`                | Single line text     | Primary field (rename from "Name")                |
| `first_name`           | Single line text     |                                                   |
| `primary_goal`         | Single select        | Options: Build Strength, Lose Fat, Improve Energy, Feel More Confident, General Health |
| `target_days_per_week` | Single select        | Options: 2, 3, 4, not_sure                        |
| `biggest_obstacle`     | Single select        | Options: time, motivation, knowledge, energy, consistency (optional field) |
| `created_at`           | Date & time          | Include time field                                |
| `last_active_at`       | Date & time          | Include time field                                |

### Field Setup Instructions:

1. **Rename the default "Name" field to `email`**
   - Click on the "Name" column header
   - Select "Customize field type"
   - Change to "Single line text"
   - This will be your primary key

2. **Add all other fields**
   - Click the **"+"** button at the right of the table
   - For each field, select the appropriate field type
   - For Single select fields, add the options listed above

## Step 3: Create the Workout Logs Table

### Table Name: `workout_logs`

Create a table named `workout_logs` with the following fields:

| Field Name      | Field Type       | Configuration                          |
|----------------|------------------|---------------------------------------|
| `log_id`       | Autonumber       | Primary field (rename from "Name")    |
| `email`        | Single line text |                                       |
| `week`         | Number           | Integer, 1-12                         |
| `day`          | Number           | Integer                               |
| `exercise_name`| Single line text |                                       |
| `weight`       | Number           | Decimal, precision 1 (for .5 weights) |
| `timestamp`    | Date & time      | Include time field, GMT timezone      |

### Field Setup Instructions:

1. **Rename the default "Name" field to `log_id`**
   - Click on the "Name" column header
   - Select "Customize field type"
   - Change to "Autonumber"

2. **Add all other fields**
   - For `week` and `day`: Use Number type, Integer format
   - For `weight`: Use Number type, Decimal format with precision 1
   - For `timestamp`: Use Date & time, include time field

## Step 4: Set Up Table Views

### Users Table Views

1. **All Users** (default view)
   - Sort by: `created_at` (descending)

2. **Recent Activity**
   - Sort by: `last_active_at` (descending)

### Workout Logs Table Views

1. **All Logs** (default view)
   - Sort by: `timestamp` (descending)

2. **By Week**
   - Group by: `week`
   - Sort by: `timestamp` (descending)

## Step 5: Get Your Airtable API Credentials

1. Go to https://airtable.com/create/tokens
2. Click **"Create new token"**
3. Name it: `RSW Workout App`
4. Add these scopes:
   - `data.records:read`
   - `data.records:write`
5. Add access to your `RSW_Workout_App` base
6. Click **"Create token"**
7. **Copy the token** - you'll need this for n8n

## Step 6: Get Your Base ID

1. Go to https://airtable.com/api
2. Select your `RSW_Workout_App` base
3. The Base ID is shown in the URL and in the introduction
   - Format: `app...` (starts with "app")
4. **Copy the Base ID** - you'll need this for n8n

## Important Notes

- **Append-Only Logs**: The `workout_logs` table should NEVER have records deleted or modified. Always append new entries.
- **Email as Primary Key**: The `email` field in the `users` table must be unique
- **Exercise Names**: Make sure exercise names in your logs match EXACTLY with the names in your program data (case-sensitive!)

## Example Data

### Sample User Record

```
email: jane@example.com
first_name: Jane
primary_goal: Build Strength
target_days_per_week: 3
biggest_obstacle: consistency
created_at: 2026-01-12 10:00:00
last_active_at: 2026-01-12 14:30:00
```

### Sample Workout Log Record

```
log_id: 1 (auto-generated)
email: jane@example.com
week: 1
day: 1
exercise_name: Back Squat
weight: 135
timestamp: 2026-01-12 14:30:00
```

---

Next step: [Set up n8n workflows](./N8N_SETUP.md)
