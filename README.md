# 🎙️ Inspiration List - 语音灵感记录应用

基于 **EdgeOne Pages** 的智能语音灵感记录应用，支持实时语音转文字、AI 内容分析和数据持久化。

## ✨ 功能特性

- 🎙️ **实时语音录制** - 支持高质量音频录制和可视化
- 🗣️ **智能语音识别** - 使用 Web Speech API 进行实时转文字
- 🤖 **AI 内容增强** - 集成 Gemini API 进行智能分析和分类
- 💾 **数据持久化** - 使用 EdgeOne KV 存储确保数据安全
- 📱 **PWA 支持** - 支持离线使用和手机安装
- 🌐 **响应式设计** - 完美适配桌面和移动设备

## 🏗️ 技术架构

- **前端**: 原生 JavaScript + 模块化设计
- **后端**: EdgeOne Pages Functions
- **存储**: EdgeOne KV 数据库
- **AI**: Gemini API + 智能回退机制
- **部署**: EdgeOne Pages 平台

## 🚀 快速开始

### 环境要求

- Node.js 16+
- EdgeOne CLI
- 现代浏览器（支持 WebRTC）

### 安装和运行

```bash
# 1. 克隆项目
git clone git@github.com:EddyChen/inspiration-list.git
cd inspiration-list

# 2. 安装依赖
npm install

# 3. 安装 EdgeOne CLI（如果没有）
npm install -g edgeone

# 4. 启动本地开发
npm run dev
```

访问 `http://localhost:8788` 开始使用应用。

### 部署到 EdgeOne Pages

```bash
# 1. 关联项目
npm run link

# 2. 配置环境变量
edgeone env set GEMINI_API_KEY "your_api_key"

# 3. 创建 KV 存储
edgeone kv create inspirations-kv
edgeone kv bind INSPIRATIONS_KV inspirations-kv

# 4. 部署
npm run deploy
```

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