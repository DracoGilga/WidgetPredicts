# GITS Predictions Widget

An interactive, cyberpunk-themed Twitch prediction widget designed for streamers and OBS Studio. Built with **Vue 3 (Vite)** and powered by **ComfyJS**, this tool allows content creators to display their chat's real-time channel point bets with seamless animations and an automated Twitch authentication flow.

# Authors & Credits
- DracoGilga ([DracoGilga](https://github.com/DracoGilga))

- JesteredOne ([JesteredOne](https://github.com/jesteredone))

## Contributors

<a href="https://github.com/jesteredone/WidgetPredicts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jesteredone/WidgetPredicts" />
</a>

## Features

- **Cyberpunk Aesthetic:** Sleek user interface featuring dynamic progress bars and custom font styles.
- **Chromatic Glitch Animation:** Eye-catching visual feedback triggered automatically whenever channel points change.
- **Implicit OAuth Login:** Safe and effortless Twitch authentication directly on the frontend.
- **Environment Variables Support:** Pre-configured environments for local testing and production deployment.
- **Vercel Optimization:** Single Page Application (SPA) routing fix included via `vercel.json` to avoid 404 errors on refresh.
- **Manual Test Mode:** Click anywhere on the widget screen during development to simulate active bets with randomized data.

---

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Routing:** Vue Router
- **Twitch Integration:** ComfyJS (Twitch IRC/API wrapper)
- **Deployment:** Vercel

---

## Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Open your terminal in the project's root directory and run:
```bash
npm install
```
3. Twitch Developer Application Setup
To connect this widget to Twitch, you need a Client ID:

Go to the Twitch Developer Console.

Register a new application (e.g., GITS Predictions Widget).

Set the OAuth Redirect URLs to:

Local testing: http://localhost:5173/widget

Set the Category to Application Integration.

Set the Client Type to Public.

Click Create, then copy your unique Client ID.

4. Environment Variables Configuration
Create two environment files in the root directory of your project:

```Plaintext
VITE_TWITCH_CLIENT_ID=client_id
VITE_TWITCH_REDIRECT_URI=http://localhost:5173/widget
```

# Local Development
To spin up the local development server, run:

```Bash
npm run dev
```
Open http://localhost:5173/ in your browser, enter your Twitch username, authorize the app, and you will be redirected to the widget page.

# Local Testing Mode
Since Twitch requires Affiliate or Partner status to open predictions on live channels, a Manual Test Mode is embedded into the code. While on the /widget page, simply click anywhere on the screen to simulate active bets, update progress bars, and test the chromatic glitch animation.

# Deployment on Vercel
This project is fully ready for zero-configuration deployment on Vercel.

The included vercel.json file ensures that all URL requests point back to index.html, allowing Vue Router to handle sub-routes like /widget correctly without causing 404 Not Found errors:

```Bash
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Once deployed, make sure your production URL matches the one registered in both your Twitch Console and your .env.production file.

