import sharp from 'sharp';
import path from 'path';

async function generateThumbnail() {
  const width = 2400;
  const height = 1600; // Exact 3:2 ratio

  const assetsDir = path.resolve('store-assets');
  const mobileAssetsDir = path.resolve('apps/mobile/assets');

  // Load and resize screenshots
  const phoneH = 1200;
  const phoneW = Math.round((1179 / 2556) * phoneH); // ~553px

  // Rounded corner mask for phone screenshots
  const cornerRadius = 36;
  const maskSvg = Buffer.from(`
    <svg width="${phoneW}" height="${phoneH}">
      <rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>
    </svg>
  `);

  // Phone border overlay
  const borderSvg = Buffer.from(`
    <svg width="${phoneW}" height="${phoneH}">
      <rect x="1" y="1" width="${phoneW - 2}" height="${phoneH - 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="#2D2240" stroke-width="3"/>
    </svg>
  `);

  // Process Screenshot 1 (Home - Clarity Sphere)
  const screen1Buffer = await sharp(path.join(assetsDir, 'screenshot-1-soberania-1179x2556.png'))
    .resize(phoneW, phoneH, { fit: 'cover' })
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Process Screenshot 2 (Mapbox Safety Signals)
  const screen2Buffer = await sharp(path.join(assetsDir, 'screenshot-3-mapa-1179x2556.png'))
    .resize(phoneW, phoneH, { fit: 'cover' })
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Process Logo
  const logoSize = 140;
  const logoBuffer = await sharp(path.join(mobileAssetsDir, 'aurora-logo.png'))
    .resize(logoSize, logoSize, { fit: 'contain' })
    .png()
    .toBuffer();

  // SVG overlay for text, badges, and layout branding
  const textOverlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="20%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#191228" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#08070C" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1F1633"/>
          <stop offset="100%" stop-color="#120D1F"/>
        </linearGradient>
      </defs>

      <!-- Base Gradient Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>

      <!-- Subtle Grid Lines (Architectural Aesthetic) -->
      <g stroke="#ffffff" stroke-opacity="0.03" stroke-width="1">
        <line x1="120" y1="0" x2="120" y2="${height}"/>
        <line x1="1100" y1="0" x2="1100" y2="${height}"/>
        <line x1="0" y1="200" x2="${width}" y2="200"/>
        <line x1="0" y1="1400" x2="${width}" y2="1400"/>
      </g>

      <!-- Top Competition Pill -->
      <g transform="translate(120, 160)">
        <rect width="460" height="48" rx="24" fill="#181328" stroke="#372652" stroke-width="1.5"/>
        <circle cx="28" cy="24" r="6" fill="#42C7F5"/>
        <text x="46" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600" fill="#42C7F5" letter-spacing="1.5">REVENUECAT SHIPATON 2026</text>
      </g>

      <!-- Main Title -->
      <text x="120" y="470" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="82" font-weight="800" fill="#FFFFFF" letter-spacing="-1">Aurora App</text>
      <text x="120" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="500" fill="#42C7F5" letter-spacing="0.5">Sovereign Clarity &amp; Urban Safety</text>

      <!-- Mission Statement / Subtitle -->
      <text x="120" y="625" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="400" fill="#B5AED1" letter-spacing="0.2">
        An open-source mobile sanctuary restoring human agency
      </text>
      <text x="120" y="665" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="400" fill="#B5AED1" letter-spacing="0.2">
        against digital compulsions, porn, binge triggers &amp; doomscrolling.
      </text>

      <!-- Feature Highlight Badges -->
      <g transform="translate(120, 740)">
        <!-- Badge 1: Neural Clarity Sphere -->
        <g transform="translate(0, 0)">
          <rect width="440" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Neural Clarity Sphere</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">5 neurobiological recovery phases</text>
        </g>

        <!-- Badge 2: Somatosensory Urge Shield -->
        <g transform="translate(0, 96)">
          <rect width="440" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Somatosensory Urge Shield</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">4-4-4-4 Box Breathing with vagal haptics</text>
        </g>

        <!-- Badge 3: Mapbox Urban Signals -->
        <g transform="translate(0, 192)">
          <rect width="440" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Mapbox Community Signals</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">50m privacy-quantized street safety</text>
        </g>

        <!-- Badge 4: RevenueCat Patron Model -->
        <g transform="translate(0, 288)">
          <rect width="440" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Ethical Patron Commons</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">100% free crisis core powered by RevenueCat</text>
        </g>
      </g>

      <!-- Student Author & Track Footer -->
      <g transform="translate(120, 1340)">
        <line x1="0" y1="0" x2="800" y2="0" stroke="#2C1F42" stroke-width="1"/>
        <text x="0" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF">Alejandro Ortiz • University of the People (UoPeople)</text>
        <text x="0" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="400" fill="#42C7F5">Next Gen Award Track • Open Source (MIT) • B.S. in Computer Science</text>
      </g>

      <!-- Drop Shadows behind Screenshots -->
      <rect x="1170" y="240" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" fill="#000000" opacity="0.6"/>
      <rect x="1710" y="200" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" fill="#000000" opacity="0.6"/>
    </svg>
  `);

  // Final composite
  const finalImage = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 8, g: 7, b: 12, alpha: 1 }
    }
  })
    .composite([
      { input: textOverlaySvg, top: 0, left: 0 },
      { input: logoBuffer, top: 250, left: 120 },
      // Screenshot 1 (Home Screen with Neural Clarity Sphere)
      { input: screen1Buffer, top: 200, left: 1180 },
      // Screenshot 2 (Mapbox Signals Screen)
      { input: screen2Buffer, top: 240, left: 1720 }
    ])
    .jpeg({ quality: 94 })
    .toFile(path.join(assetsDir, 'devpost-thumbnail-3x2.jpg'));

  console.log('✅ devpost-thumbnail-3x2.jpg successfully created!');
}

generateThumbnail().catch(console.error);
