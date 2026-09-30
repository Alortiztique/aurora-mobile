import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const mobileDir = path.resolve('c:/dev/aurora-mobile');
const outDir = path.join(mobileDir, 'store-assets');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Convert logo to base64
const logoBase64 = fs.readFileSync(path.join(mobileDir, 'apps/mobile/assets/aurora-logo.png')).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// 1. Full Lock Screen (1179 x 2556)
const lockScreenSvg = `
<svg width="1179" height="2556" viewBox="0 0 1179 2556" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="lockGlow" cx="50%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#1A112C" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#09070D" stop-opacity="1"/>
      <stop offset="100%" stop-color="#050408" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F1535" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#120D22" stop-opacity="0.95"/>
    </linearGradient>
    <clipPath id="logoRound">
      <circle cx="32" cy="32" r="32"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1179" height="2556" fill="url(#lockGlow)"/>

  <!-- Status Bar -->
  <g transform="translate(70, 40)">
    <text x="0" y="44" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600">9:41</text>
    <!-- Dynamic Island -->
    <rect x="420" y="-8" width="220" height="70" rx="35" fill="#000000"/>
    <g transform="translate(940, 16)" fill="#FFFFFF">
      <rect x="0" y="16" width="6" height="12" rx="2"/>
      <rect x="10" y="12" width="6" height="16" rx="2"/>
      <rect x="20" y="8" width="6" height="20" rx="2"/>
      <rect x="30" y="4" width="6" height="24" rx="2"/>
      <rect x="52" y="4" width="46" height="24" rx="7" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <rect x="56" y="8" width="34" height="16" rx="4" fill="#4ADE80"/>
    </g>
  </g>

  <!-- Lock Icon -->
  <g transform="translate(565, 170)">
    <rect x="10" y="24" width="30" height="24" rx="6" fill="#A59DB5"/>
    <path d="M16 24 V16 C16 10, 34 10, 34 16 V24" fill="none" stroke="#A59DB5" stroke-width="4"/>
  </g>

  <!-- Date & Time Display -->
  <g transform="translate(589, 360)">
    <text x="0" y="-50" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="600" text-anchor="middle" letter-spacing="1">Wednesday, September 30</text>
    <text x="0" y="120" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="160" font-weight="200" text-anchor="middle" letter-spacing="-4">9:41</text>
  </g>

  <!-- Notification Stack -->
  <g transform="translate(60, 680)">

    <!-- Notification 1: Daily Sovereignty Pledge (Morning) -->
    <g transform="translate(0, 0)">
      <rect width="1059" height="210" rx="36" fill="url(#cardBg)" stroke="#362552" stroke-width="1.5"/>
      <g transform="translate(36, 34)">
        <image href="${logoDataUri}" x="0" y="0" width="64" height="64" clip-path="url(#logoRound)"/>
      </g>
      <text x="124" y="62" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="1">AURORA APP</text>
      <text x="960" y="62" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">now</text>
      <text x="124" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="800">Daily Sovereignty Pledge</text>
      <text x="124" y="156" fill="#C5BCD3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400">
        “Today I choose presence and mental peace.” Tap to confirm your daily focus.
      </text>
    </g>

    <!-- Notification 2: Neurobiological Milestone (Phase II Active) -->
    <g transform="translate(0, 240)">
      <rect width="1059" height="210" rx="36" fill="url(#cardBg)" stroke="#42C7F5" stroke-width="2"/>
      <g transform="translate(36, 34)">
        <image href="${logoDataUri}" x="0" y="0" width="64" height="64" clip-path="url(#logoRound)"/>
      </g>
      <text x="124" y="62" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="1">AURORA CLARITY SPHERE</text>
      <text x="940" y="62" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">12m ago</text>
      <text x="124" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="800">14 Days Clean: D2 Receptors Regenerating</text>
      <text x="124" y="156" fill="#8CE0FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="500">
        Phase II Active: REM sleep cycles stabilizing. Natural motivation returning.
      </text>
    </g>

    <!-- Notification 3: Habit Shield & Deliberate Friction Intercept -->
    <g transform="translate(0, 480)">
      <rect width="1059" height="210" rx="36" fill="url(#cardBg)" stroke="#794BBE" stroke-width="1.5"/>
      <g transform="translate(36, 34)">
        <image href="${logoDataUri}" x="0" y="0" width="64" height="64" clip-path="url(#logoRound)"/>
      </g>
      <text x="124" y="62" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="1">AURORA SHIELD</text>
      <text x="940" y="62" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">1h ago</text>
      <text x="124" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="800">Compulsive Trigger Neutralized</text>
      <text x="124" y="156" fill="#C5BCD3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400">
        Deliberate friction prevented impulse loop. Your prefrontal cortex is in control.
      </text>
    </g>

  </g>

  <!-- Bottom Lock Screen Controls: Flashlight & Camera -->
  <g transform="translate(100, 2350)">
    <circle cx="50" cy="50" r="46" fill="#1C142B" fill-opacity="0.8"/>
    <text x="50" y="62" fill="#FFFFFF" font-size="34" text-anchor="middle">🔦</text>
  </g>
  <g transform="translate(980, 2350)">
    <circle cx="50" cy="50" r="46" fill="#1C142B" fill-opacity="0.8"/>
    <text x="50" y="62" fill="#FFFFFF" font-size="34" text-anchor="middle">📷</text>
  </g>

  <!-- Home Indicator Bar -->
  <rect x="419" y="2510" width="340" height="10" rx="5" fill="#FFFFFF" opacity="0.4"/>
</svg>
`;

// 2. Standalone Floating Notification Banner with Transparent Background (1080 x 420)
// This is perfect for drag & dropping into CapCut/Premiere right over video!
const bannerOverlaySvg = `
<svg width="1080" height="420" viewBox="0 0 1080 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="popGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A122E" stop-opacity="0.96"/>
      <stop offset="100%" stop-color="#100A1F" stop-opacity="0.98"/>
    </linearGradient>
    <clipPath id="popLogo">
      <circle cx="34" cy="34" r="34"/>
    </clipPath>
    <filter id="popShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <g transform="translate(30, 40)" filter="url(#popShadow)">
    <rect width="1020" height="230" rx="38" fill="url(#popGrad)" stroke="#42C7F5" stroke-width="2.5"/>

    <g transform="translate(36, 36)">
      <image href="${logoDataUri}" x="0" y="0" width="68" height="68" clip-path="url(#popLogo)"/>
    </g>

    <text x="130" y="68" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="1.5">AURORA APP • HABIT SHIELD</text>
    <text x="940" y="68" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600">now</text>

    <text x="130" y="124" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800">Compulsive Trigger Blocked • Dopamine Protected</text>
    <text x="130" y="172" fill="#C5BCD3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="500">
      “I deserve mental peace and respect in my daily life”
    </text>

    <circle cx="100" cy="164" r="6" fill="#4ADE80"/>
  </g>
</svg>
`;

async function main() {
  console.log('Rendering Lock Screen & Notification Banners...');

  const lockDest = path.join(outDir, 'screenshot-notifications-lockscreen-1179x2556.png');
  await sharp(Buffer.from(lockScreenSvg)).png({ compressionLevel: 9 }).toFile(lockDest);
  console.log(`✅ Lock Screen Created: ${lockDest}`);

  const bannerDest = path.join(outDir, 'notification-banner-transparent-overlay.png');
  await sharp(Buffer.from(bannerOverlaySvg)).png({ compressionLevel: 9 }).toFile(bannerDest);
  console.log(`✅ Banner Overlay Created: ${bannerDest}`);

  // Copy to brain artifacts for preview
  const brainDir = 'C:/Users/aleja/.gemini/antigravity/brain/2de82b1e-942b-4dc0-8002-9ce5233891e8';
  fs.copyFileSync(lockDest, path.join(brainDir, 'screenshot-notifications-lockscreen-1179x2556.png'));
  fs.copyFileSync(bannerDest, path.join(brainDir, 'notification-banner-transparent-overlay.png'));
}

main().catch(err => {
  console.error('Error rendering notifications:', err);
  process.exit(1);
});
