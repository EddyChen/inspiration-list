# Inspiration List - 语音灵感记录应用

A voice-based inspiration recording web application built on Tencent EdgeOne platform with AI-powered content analysis.

## ✨ Features

- 🎙️ **Voice Recording** - Real-time audio recording with visual feedback
- 🗣️ **Speech Recognition** - Automatic speech-to-text conversion
- 🤖 **AI Enhancement** - Content analysis and suggestions using Gemini AI
- 💾 **Cloud Storage** - Persistent storage with EdgeOne KV
- 🔍 **Smart Search** - Search and filter your inspirations
- 📱 **PWA Ready** - Installable with offline support
- 🎨 **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start backend (Edge Functions):**
   ```bash
   npm run dev
   ```
   Backend API will be available at `http://localhost:8787`

3. **Start frontend (in another terminal):**
   ```bash
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

4. **Open your browser:**
   Navigate to `http://localhost:3000` to use the application

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🏗️ Architecture

### Frontend
- **Vanilla JavaScript** - No heavy frameworks, optimized for performance
- **Modular Design** - Clean separation of concerns
- **Progressive Enhancement** - Works without JavaScript for basic functionality
- **Service Worker** - Offline support and caching

### Backend
- **EdgeOne Edge Functions** - Serverless compute at the edge
- **KV Storage** - Distributed key-value storage
- **Gemini AI Integration** - Advanced content analysis
- **RESTful API** - Clean and predictable endpoints

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inspirations` | Create new inspiration |
| GET | `/api/inspirations` | List inspirations with filtering |
| GET | `/api/inspirations/{id}` | Get inspiration details |
| DELETE | `/api/inspirations/{id}` | Delete inspiration |
| GET | `/api/health` | Health check |

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup with accessibility
- **CSS3** - Modern styling with flexbox/grid
- **JavaScript ES6+** - Modern JavaScript features
- **Web APIs** - MediaRecorder, Speech Recognition, Service Workers

### Backend
- **Node.js** - JavaScript runtime
- **EdgeOne Edge Functions** - Serverless platform
- **KV Storage** - Distributed database
- **Gemini AI** - Large language model integration

### Development Tools
- **Wrangler** - EdgeOne development CLI
- **Serve** - Static file server
- **NPM Scripts** - Build automation

## 🌐 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|---------|
| Voice Recording | ✅ 60+ | ✅ 65+ | ✅ 14+ | ✅ 79+ |
| Speech Recognition | ✅ 25+ | ❌ | ⚠️ 14.1+ | ✅ 79+ |
| Service Workers | ✅ 45+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| PWA Support | ✅ | ✅ | ✅ | ✅ |

## 🔧 Configuration

### Environment Variables

```toml
# wrangler.toml
[vars]
GEMINI_API_KEY = "your_gemini_api_key"
GEMINI_GATEWAY_URL = "your_gemini_gateway_url"
```

### KV Namespace

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "INSPIRATIONS_KV"
id = "your_kv_namespace_id"
```

## 🎯 Usage

1. **Record Voice** - Click the record button and speak your inspiration
2. **Review Text** - Check the auto-transcribed text
3. **AI Analysis** - Get enhanced content with suggestions and tags
4. **Save & Organize** - Store with automatic categorization
5. **Search & Browse** - Find your inspirations using search and filters

## 🛡️ Security & Privacy

- **No Registration Required** - Anonymous usage
- **Local-First** - Data stored on your device when possible
- **HTTPS Only** - Encrypted communication
- **Data Control** - Delete your data anytime

## 📱 PWA Features

- **Installable** - Add to home screen
- **Offline Support** - Works without internet
- **Background Sync** - Syncs data when back online
- **Push Notifications** - Get notified of updates (optional)

## 🔍 Development

### Project Structure
```
src/                 # Edge Functions backend
public/             # Frontend static files
wrangler.toml       # EdgeOne configuration
package.json        # Dependencies and scripts
```

### Scripts
```bash
npm run dev         # Start Edge Functions dev server
npm start           # Start static file server
npm run deploy      # Deploy to EdgeOne
npm run build       # Build for production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tencent EdgeOne** - For the powerful edge computing platform
- **Google Gemini** - For AI content analysis capabilities
- **Web Standards** - For enabling rich web experiences
- **Open Source Community** - For inspiration and tools

---

**Made with ❤️ for capturing and enhancing your creative inspirations**