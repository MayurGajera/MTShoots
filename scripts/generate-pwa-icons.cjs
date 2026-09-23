const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Standard App Icon SVG (512x512)
function getStandardSvg(size = 512) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#241E1C"/>
        <stop offset="50%" stop-color="#181615"/>
        <stop offset="100%" stop-color="#0E0C0B"/>
      </linearGradient>
      <linearGradient id="terracotta" x1="120" y1="180" x2="260" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#E06B40"/>
        <stop offset="100%" stop-color="#C85A32"/>
      </linearGradient>
      <linearGradient id="cream" x1="260" y1="180" x2="380" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FAF8F5"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F2C581"/>
        <stop offset="100%" stop-color="#D9A05B"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="24" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Background Base with subtle border -->
    <rect width="512" height="512" rx="112" fill="url(#bg)"/>
    <rect x="2" y="2" width="508" height="508" rx="110" stroke="url(#terracotta)" stroke-width="4" stroke-opacity="0.25"/>

    <!-- Subtle ambient glow in center -->
    <circle cx="256" cy="256" r="140" fill="#C85A32" opacity="0.12" filter="url(#glow)"/>

    <!-- Camera Container Icon -->
    <g filter="url(#shadow)">
      <!-- Outer Camera Body -->
      <rect x="76" y="140" width="360" height="260" rx="60" stroke="#FFFFFF" stroke-width="22" stroke-opacity="0.9" fill="#1C1816" fill-opacity="0.6"/>

      <!-- Viewfinder / Pentaprism Notch -->
      <path d="M 184 140 L 206 94 L 306 94 L 328 140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Stylized 'M' in Terracotta -->
      <path d="M 130 330 L 130 200 L 195 275 L 256 200 L 256 330" stroke="url(#terracotta)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Stylized 'T' in Cream/White -->
      <path d="M 276 200 L 382 200 M 329 200 L 329 330" stroke="url(#cream)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Golden Shutter / Focus Dot -->
      <circle cx="370" cy="140" r="18" fill="url(#gold)"/>
      <circle cx="370" cy="140" r="24" stroke="url(#gold)" stroke-width="3" opacity="0.6"/>

      <!-- Golden Lens Center Dot -->
      <circle cx="256" cy="256" r="14" fill="url(#gold)"/>
    </g>
  </svg>`;
}

// 2. Maskable Icon SVG (512x512) - Scaled down to ~65% so safe zone fits any circular mask
function getMaskableSvg(size = 512) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgMask" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#241E1C"/>
        <stop offset="50%" stop-color="#181615"/>
        <stop offset="100%" stop-color="#0E0C0B"/>
      </linearGradient>
      <linearGradient id="terracotta" x1="120" y1="180" x2="260" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#E06B40"/>
        <stop offset="100%" stop-color="#C85A32"/>
      </linearGradient>
      <linearGradient id="cream" x1="260" y1="180" x2="380" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FAF8F5"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F2C581"/>
        <stop offset="100%" stop-color="#D9A05B"/>
      </linearGradient>
    </defs>

    <!-- Full Bleed Background for Adaptive Android Mask -->
    <rect width="512" height="512" fill="url(#bgMask)"/>

    <!-- Subtle ambient glow in center -->
    <circle cx="256" cy="256" r="120" fill="#C85A32" opacity="0.2"/>

    <!-- Emblem scaled into 65% safe zone (center at 256, 256, scale ~0.68) -->
    <g transform="translate(82, 82) scale(0.68)">
      <!-- Outer Camera Body -->
      <rect x="76" y="140" width="360" height="260" rx="60" stroke="#FFFFFF" stroke-width="24" stroke-opacity="0.9" fill="#1C1816" fill-opacity="0.7"/>

      <!-- Viewfinder / Pentaprism Notch -->
      <path d="M 184 140 L 206 94 L 306 94 L 328 140" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Stylized 'M' in Terracotta -->
      <path d="M 130 330 L 130 200 L 195 275 L 256 200 L 256 330" stroke="url(#terracotta)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Stylized 'T' in Cream/White -->
      <path d="M 276 200 L 382 200 M 329 200 L 329 330" stroke="url(#cream)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Golden Shutter / Focus Dot -->
      <circle cx="370" cy="140" r="20" fill="url(#gold)"/>

      <!-- Golden Lens Center Dot -->
      <circle cx="256" cy="256" r="16" fill="url(#gold)"/>
    </g>
  </svg>`;
}

async function run() {
  console.log("Generating PWA App Icons...");

  const standard512Svg = Buffer.from(getStandardSvg(512));
  const maskable512Svg = Buffer.from(getMaskableSvg(512));

  // 1. icon-512.png
  await sharp(standard512Svg).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  console.log("Created icon-512.png");

  // 2. icon-192.png
  await sharp(standard512Svg).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  console.log("Created icon-192.png");

  // 3. icon-512-maskable.png
  await sharp(maskable512Svg).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512-maskable.png'));
  console.log("Created icon-512-maskable.png");

  // 4. icon-192-maskable.png
  await sharp(maskable512Svg).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192-maskable.png'));
  console.log("Created icon-192-maskable.png");

  // 5. apple-touch-icon.png (180x180)
  await sharp(standard512Svg).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log("Created apple-touch-icon.png");

  // Also put apple-touch-icon.png in public root for iOS fallback
  await sharp(standard512Svg).resize(180, 180).png().toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log("Created public/apple-touch-icon.png");

  // 6. Favicons
  await sharp(standard512Svg).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  await sharp(standard512Svg).resize(16, 16).png().toFile(path.join(__dirname, '../public/favicon-16x16.png'));
  await sharp(standard512Svg).resize(48, 48).png().toFile(path.join(__dirname, '../public/favicon.ico'));
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), getStandardSvg(512));
  console.log("Created favicons");

  console.log("All PWA icons generated successfully!");
}

run().catch(console.error);