# Deploy to Firebase Hosting

## Prerequisites:
```bash
npm install -g firebase-tools
```

## Steps:

1. **Login to Firebase:**
```bash
firebase login
```

2. **Build the application:**
```bash
npm run build
```

3. **Deploy to Firebase:**
```bash
firebase deploy
```

## Manual Steps:
1. Your app will be available at: https://furryfriend-29e84.web.app
2. The dynamic routes will work as a SPA (Single Page Application)
3. Firebase Authentication and Firestore will work seamlessly

## Note:
- This approach treats your app as a SPA
- All routing is handled client-side
- Perfect for Firebase ecosystem integration
- Some SEO limitations compared to SSR
