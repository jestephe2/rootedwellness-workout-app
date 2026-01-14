# RSW Workout App - 6-Week Strength Journey

A web application for tracking workouts in Rachel Stephens Wellness's 6-week strength training program with cycle-aware guidance.

## Features

- ✅ Email-based authentication (no passwords in V1)
- ✅ Onboarding flow for new users
- ✅ 12-week program display with week/day selectors
- ✅ Exercise tracking with weight logging
- ✅ Cycle phase guidance (Menstrual, Follicular, Ovulatory, Luteal)
- ✅ Auto-save weight inputs
- ✅ Airtable backend for data persistence
- ✅ n8n webhook orchestration

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router v6
- **Backend**: n8n webhooks
- **Database**: Airtable

## Project Structure

```
format html/
├── pages/              # Page components
│   ├── EmailEntry.tsx  # Landing page with email input
│   ├── Onboarding.tsx  # New user questionnaire
│   └── Dashboard.tsx   # Main workout tracking interface
├── components/         # Reusable UI components
├── services/           # API integration
│   └── api.ts          # n8n webhook service
├── data/               # Static data
│   ├── program.ts      # 12-week training program
│   └── phaseGuidance.ts # Cycle phase guidance
├── docs/               # Setup documentation
│   ├── AIRTABLE_SETUP.md
│   └── N8N_SETUP.md
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app with routing
├── index.tsx           # React entry point
└── index.html          # HTML template
```

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Airtable account
- n8n instance (cloud or self-hosted)

### 1. Backend Setup

**Important**: Set up the backend BEFORE running the app.

1. **Set up Airtable**
   - Follow the guide: [docs/AIRTABLE_SETUP.md](./docs/AIRTABLE_SETUP.md)
   - Create the `users` and `workout_logs` tables
   - Get your API token and Base ID

2. **Set up n8n Workflows**
   - Follow the guide: [docs/N8N_SETUP.md](./docs/N8N_SETUP.md)
   - Create 4 workflows for the API endpoints
   - Configure CORS on all webhooks
   - Get your n8n webhook URL

### 2. Configure Environment Variables

1. Open `.env.local`
2. Update with your n8n webhook URL:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud
   ```

### 3. Add Your Program Data

1. Open `data/program.ts`
2. Replace the template data with your actual 12-week program
3. Make sure exercise names match EXACTLY across:
   - Program data
   - Weight logging
   - Airtable records

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Flow

### For New Users

1. **Landing Page**: Enter email
2. **Onboarding**: Complete questionnaire with:
   - First name
   - Primary goal
   - Target days per week
   - Biggest obstacle (optional)
3. **Dashboard**: Access workout program

### For Existing Users

1. **Landing Page**: Enter email
2. **Dashboard**: Immediately see dashboard with saved data

### Dashboard Features

- **Week Selector**: Choose from weeks 1-12
- **Day Selector**: Choose from available days in the week
- **Cycle Phase Dropdown**: Select current phase for guidance
- **Exercise List**: View exercises with sets/reps
- **Weight Inputs**: Log weights (auto-saves on blur)
- **Phase Guidance**: See recommendations based on cycle phase

## Data Structure

### User Profile
```typescript
{
  email: string;
  first_name: string;
  primary_goal: string;
  target_days_per_week: '2' | '3' | '4' | 'not_sure';
  biggest_obstacle?: string;
  created_at: string;
  last_active_at: string;
}
```

### Workout Log
```typescript
{
  log_id: string;
  email: string;
  week: number;        // 1-12
  day: number;
  exercise_name: string;
  weight: number;
  timestamp: string;
}
```

## API Endpoints

All endpoints are POST requests to your n8n instance:

- `POST /api/init` - Check if user exists
- `POST /api/onboard` - Create new user
- `POST /api/log_weight` - Log exercise weight
- `POST /api/get_logs` - Get user's workout logs

See [docs/N8N_SETUP.md](./docs/N8N_SETUP.md) for detailed API contracts.

## Local Storage

The app uses localStorage to persist:
- `rsw_email` - User's email
- `rsw_user` - User profile data
- `rsw_phase` - Selected cycle phase
- `rsw_week` - Selected week
- `rsw_day` - Selected day
- `rsw_logs` - Cached workout logs

## Customization

### Brand Colors

Brand colors are defined in `index.html`:

```javascript
colors: {
  brand: {
    green: '#707756',   // Primary action color
    tan: '#b78c61',     // Secondary text
    beige: '#c8b7a4',   // Tertiary/labels
    cream: '#edede4',   // Background
    text: '#2d3025'     // Primary text
  }
}
```

### Phase Guidance

Edit phase-specific guidance in `data/phaseGuidance.ts`.

### Program Data

Replace the template in `data/program.ts` with your actual 12-week program.

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Drag and drop the `dist/` folder

3. **Any static host**
   - Upload the `dist/` folder contents

### Important: Update CORS

After deploying, update the CORS settings in your n8n webhooks:

```json
{
  "Access-Control-Allow-Origin": "https://your-deployed-domain.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## V1 Limitations

This is V1 - intentionally minimal to ship fast:

- ❌ No password authentication
- ❌ No email verification
- ❌ Cycle phase is NOT stored (local only)
- ❌ No weekly summaries/check-ins
- ❌ No adherence tracking
- ❌ No data export

These features are planned for V2.

## Troubleshooting

### "Unable to connect" error
- Check that n8n workflows are **Active**
- Verify `.env.local` has correct webhook URL
- Check browser console for CORS errors
- Test webhooks directly with curl (see N8N_SETUP.md)

### Weights not saving
- Check n8n execution log for errors
- Verify Airtable API token permissions
- Ensure exercise names match exactly

### User not found after onboarding
- Check Airtable `users` table for the record
- Verify email is stored correctly
- Check browser localStorage for `rsw_user`

### Styling issues
- Hard refresh browser (Cmd/Ctrl + Shift + R)
- Check that Tailwind CDN is loading
- Verify custom colors in index.html

## Support

For issues or questions:
1. Check the [docs/](./docs/) folder
2. Review n8n execution logs
3. Check Airtable data directly
4. Review browser console for errors

## License

Private - Rachel Stephens Wellness

---

**Built with** ❤️ **for the RSW community**
