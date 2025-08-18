# Deploy to Netlify

## Steps:
1. Push your code to GitHub
2. Go to netlify.com and sign up
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard
6. Deploy

## netlify.toml (create this file):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
```
