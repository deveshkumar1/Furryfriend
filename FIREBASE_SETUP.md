# Firebase Admin SDK Setup Guide

## Issue: "Creation Failed" Error When Creating Users

The error you're encountering is due to missing Firebase Admin SDK credentials. The Firebase Admin SDK requires a service account to perform server-side operations like creating users.

## Error Details
```
Firebase error: Caller does not have required permission to use project furryfriend-29e84. 
Grant the caller the roles/serviceusage.serviceUsageConsumer role...
```

This happens because the Firebase Admin SDK is not properly authenticated.

## Solution: Add Firebase Service Account Credentials

### Step 1: Generate Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `furryfriend-29e84`
3. Click the gear icon (⚙️) and select "Project settings"
4. Go to the "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file (keep it secure!)

### Step 2: Add Credentials to Environment Variables

You have two options:

#### Option 1: Full Service Account JSON (Recommended)
Add the entire service account JSON to your `.env.local` file:

```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"furryfriend-29e84",...}'
```

#### Option 2: Individual Fields
Extract specific fields from the JSON:

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@furryfriend-29e84.iam.gserviceaccount.com"
```

### Step 3: Restart Your Development Server

After updating your environment variables:

```bash
npm run dev
# or
yarn dev
```

### Step 4: Test User Creation

Try creating a new user through the admin panel at `/admin/users/new`

## Security Notes

- Never commit service account credentials to version control
- Add `.env.local` to your `.gitignore` file
- Use different service accounts for development and production
- Consider using Firebase App Check for additional security

## Troubleshooting

If you still encounter issues:

1. Verify the service account JSON is valid
2. Check that the Firebase project ID matches your environment
3. Ensure the service account has the necessary IAM roles:
   - Firebase Admin SDK Administrator Service Agent
   - Service Usage Consumer

## Environment File Example

Your `.env.local` should look like this:

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="furryfriend-29e84.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="furryfriend-29e84"
# ... other public config

# Firebase Admin SDK (choose one option)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
# OR
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@furryfriend-29e84.iam.gserviceaccount.com"
```
