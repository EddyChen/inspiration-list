# Inspiration List - Deployment Guide

## Overview

This is a complete voice-based inspiration recording application built for Tencent EdgeOne platform, featuring:

- 🎙️ Voice recording with real-time audio visualization
- 🗣️ Speech-to-text conversion using Web Speech API  
- 🤖 AI content analysis and enhancement using Gemini API
- 💾 Data persistence with EdgeOne KV storage
- 📱 Progressive Web App (PWA) with offline support
- 🎨 Responsive design for mobile and desktop

## Project Structure

```
inspiration-list/
├── src/                    # Edge Functions backend
│   ├── index.js           # Main Edge Function entry point
│   ├── api/               # API route handlers
│   │   ├── router.js      # Request routing
│   │   └── inspirations.js # Inspiration CRUD operations
│   └── utils/             # Utility functions
│       ├── gemini.js      # Gemini AI integration
│       └── helpers.js     # Helper utilities
├── public/                # Frontend static files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Application styles
│   ├── js/                # JavaScript modules
│   │   ├── app.js         # Main application controller
│   │   ├── voice-recorder.js    # Voice recording functionality
│   │   ├── speech-recognition.js # Speech-to-text
│   │   ├── api-client.js        # API communication
│   │   ├── ui-components.js     # UI components
│   │   └── utils.js             # Utility functions
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── assets/           # Images and icons
├── wrangler.toml         # EdgeOne configuration
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Wrangler CLI for EdgeOne development
- Modern browser with WebRTC support

### Local Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend (Edge Functions):**
   ```bash
   npm run dev
   ```
   This starts the EdgeOne Edge Functions development server on `http://localhost:8787`

3. **Start the frontend (in a separate terminal):**
   ```bash
   npm start
   ```
   This serves static files on `http://localhost:3000`

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8787/api

### Development Features

- **Hot reload:** Frontend files are served with live reload
- **API testing:** Backend API endpoints are available for testing
- **Mock data:** KV storage is simulated for development
- **Error handling:** Comprehensive error boundaries and fallbacks

## Production Deployment

### 1. EdgeOne Account Setup

1. Create a Tencent EdgeOne account
2. Set up a new Edge Functions project
3. Create a KV namespace for data storage

### 2. Environment Configuration

Update `wrangler.toml` with your production values:

```toml
name = "inspiration-list"
main = "src/index.js"
compatibility_date = "2025-08-25"

# Production KV namespace
[[kv_namespaces]]
binding = "INSPIRATIONS_KV"
preview_id = "your_preview_kv_namespace_id"  
id = "your_production_kv_namespace_id"

# Environment variables
[vars]
GEMINI_API_KEY = "your_actual_gemini_api_key"
GEMINI_GATEWAY_URL = "https://ai-gateway.eo-edgefunctions7.com/v1beta/models/gemini-2.5-flash:generateContent"
```

### 3. Gemini API Setup

1. Get a Gemini API key from Google AI Studio
2. Configure the EdgeOne AI Gateway for Gemini access
3. Update the `GEMINI_API_KEY` and `GEMINI_GATEWAY_URL` in your configuration

### 4. Deploy to EdgeOne

1. **Deploy Edge Functions:**
   ```bash
   npm run deploy
   ```

2. **Upload static files:**
   Upload the `public/` directory contents to EdgeOne static hosting or CDN

3. **Configure domain:**
   Set up your custom domain and SSL certificate

### 5. Domain and SSL Setup

1. Configure your domain in EdgeOne console
2. Enable HTTPS with automatic SSL certificate
3. Set up CDN acceleration for global performance

## API Reference

### Base URL
- Development: `http://localhost:8787/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### Create Inspiration
```http
POST /api/inspirations
Content-Type: application/json

{
  "transcribedText": "用户的想法文本",
  "audioData": "base64_encoded_audio_data"
}
```

#### Get Inspirations List
```http
GET /api/inspirations?page=1&limit=20&category=all&search=keyword
```

#### Get Single Inspiration
```http
GET /api/inspirations/{id}
```

#### Delete Inspiration
```http
DELETE /api/inspirations/{id}
```

#### Health Check
```http
GET /api/health
```

## Browser Support

### Required Features
- **MediaRecorder API** for voice recording
- **Web Speech API** for speech recognition
- **Service Workers** for PWA functionality
- **LocalStorage** for offline data

### Supported Browsers
- Chrome 60+
- Firefox 65+
- Safari 14+ (limited speech recognition)
- Edge 79+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 60+
- Samsung Internet 8+

## Performance Optimization

### Frontend Optimizations
- Lazy loading of modules
- Service worker caching
- Image optimization
- Minified CSS and JS (for production)

### Backend Optimizations
- Edge-side caching
- Efficient KV operations
- Request deduplication
- Error handling and retries

### CDN Configuration
- Static asset caching (24h)
- HTML caching (no-cache)
- GZIP compression
- Image format optimization

## Security Considerations

### Data Protection
- HTTPS encryption for all communications
- Client-side data validation
- API rate limiting
- KV data encryption

### Privacy
- No user registration required
- Local device-based storage
- Optional data deletion
- Privacy-focused design

### API Security
- Input validation and sanitization
- XSS protection
- CSRF protection (through SameSite cookies)
- Content Security Policy headers

## Monitoring and Analytics

### Error Tracking
- Global error handlers
- API error logging
- User feedback collection
- Performance monitoring

### Usage Analytics
- Page view tracking
- Feature usage metrics
- Error rate monitoring
- Performance metrics

## Troubleshooting

### Common Issues

1. **Voice recording not working:**
   - Check microphone permissions
   - Ensure HTTPS is enabled
   - Verify browser compatibility

2. **Speech recognition failing:**
   - Check network connectivity
   - Verify browser speech API support
   - Test with different languages

3. **API errors:**
   - Verify KV namespace configuration
   - Check Gemini API key validity
   - Monitor Edge Functions logs

4. **Performance issues:**
   - Enable CDN caching
   - Optimize asset delivery
   - Monitor KV operation latency

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting guide
2. Review EdgeOne documentation
3. Create an issue in the project repository