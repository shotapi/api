# ShotAPI

[![Status](https://img.shields.io/badge/status-beta-yellow)](https://github.com/shotapi/api)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![API](https://img.shields.io/badge/API-live-green)](https://shotapi.io)
[![GitHub Stars](https://img.shields.io/github/stars/shotapi/api)](https://github.com/shotapi/api)

Fast, affordable Screenshot API. **ScreenshotOne compatible**.

🌐 **Website**: [shotapi.io](https://shotapi.io)

## Quick Start

```bash
# Take a screenshot
curl "https://api.shotapi.io/take?url=https://example.com" > screenshot.png

# Full page screenshot
curl "https://api.shotapi.io/take?url=https://example.com&full_page=true" > full.png

# Custom viewport
curl "https://api.shotapi.io/take?url=https://example.com&viewport_width=1920&viewport_height=1080" > hd.png
```

## API Reference

### `GET /take`

Take a screenshot of any URL.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | **required** | URL to screenshot |
| `format` | string | `png` | Output format: `png`, `jpeg`, `webp`, `pdf` |
| `viewport_width` | int | `1280` | Browser viewport width |
| `viewport_height` | int | `1024` | Browser viewport height |
| `full_page` | boolean | `false` | Capture entire scrollable page |
| `device_scale_factor` | float | `1` | Device scale (2 for retina) |
| `image_quality` | int | `80` | Quality 0-100 (jpeg/webp only) |
| `delay` | int | `0` | Wait seconds before capture |
| `selector` | string | - | CSS selector to capture |
| `dark_mode` | boolean | `false` | Render in dark mode |

#### Example Response Headers

```
Content-Type: image/png
X-Screenshot-Duration-Ms: 1234
Cache-Control: public, max-age=3600
```

## ScreenshotOne Compatibility

ShotAPI is designed as a **drop-in replacement** for ScreenshotOne.

```javascript
// Just change the base URL
const BASE_URL = "https://api.shotapi.io";  // was: api.screenshotone.com

// Same parameters work
const url = `${BASE_URL}/take?url=https://example.com&format=png&full_page=true`;
```

## Self-Hosting

```bash
# Clone
git clone https://github.com/shotapi/api.git
cd api

# Install
npm install
npx playwright install chromium

# Run
npm run dev
```

### Docker

```bash
docker build -t shotapi .
docker run -p 3000:3000 shotapi
```

### Deploy to Fly.io

```bash
fly launch
fly deploy
```

## Free Tier

- **100 requests/day** - No API key required
- Rate limited by IP

## Pricing (Coming Soon)

| Plan | Price | Requests/mo |
|------|-------|-------------|
| Free | $0 | 3,000 |
| Starter | $9/mo | 10,000 |
| Pro | $29/mo | 50,000 |

## License

MIT
