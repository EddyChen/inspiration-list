# EdgeOne Pages 开发、调试和部署指南

## 📋 项目概述

这是一个基于 **EdgeOne Pages** 的语音灵感记录应用，使用 EdgeOne Pages Functions 提供 API 服务，KV 存储数据持久化。

## 🏗️ 项目结构（已调整符合 EdgeOne Pages）

```
inspiration-list/
├── functions/              # EdgeOne Pages Functions
│   └── api/
│       └── [[route]].js    # 捕获所有 /api/* 路径的函数
├── public/                 # 静态文件（自动部署）
│   ├── index.html         # 主页面
│   ├── css/               # 样式文件
│   ├── js/                # 前端 JavaScript
│   ├── assets/            # 图标和资源
│   ├── manifest.json      # PWA 配置
│   └── sw.js             # Service Worker
├── src/                   # 工具函数（被 functions 引用）
│   ├── utils/
│   │   ├── gemini.js     # Gemini AI 集成
│   │   └── helpers.js    # 工具函数
│   └── ...
├── edgeone.json          # EdgeOne Pages 配置文件
├── package.json          # 项目配置
└── README.md             # 项目说明
```

## 🚀 开发环境设置

### 1. 安装 EdgeOne CLI

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 验证安装
edgeone --version
```

### 2. 项目初始化

```bash
# 克隆项目
git clone git@github.com:EddyChen/inspiration-list.git
cd inspiration-list

# 安装依赖
npm install
```

### 3. 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 或者直接使用 EdgeOne CLI
edgeone dev
```

这将启动：
- 📱 **前端服务**: `http://localhost:8788` (静态文件)
- ⚡ **Functions 服务**: `http://localhost:8788/api/*` (EdgeOne Functions)

## 🔧 调试指南

### 1. 本地调试 Functions

```bash
# 开启调试模式
edgeone dev --debug

# 查看函数日志
edgeone logs
```

### 2. 环境变量配置

在 `edgeone.json` 中配置开发环境变量：

```json
{
  "functions": {
    "environment": {
      "development": {
        "GEMINI_API_KEY": "your_dev_api_key",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 3. 调试工具

- **浏览器开发者工具**: 调试前端 JavaScript
- **EdgeOne 控制台**: 查看函数执行日志
- **Network 面板**: 检查 API 调用

## 📦 部署流程

### 1. 关联项目到 EdgeOne Pages

```bash
# 关联项目（首次部署）
npm run link

# 或者直接使用 CLI
edgeone link
```

按提示选择或创建 EdgeOne Pages 项目。

### 2. 配置生产环境

在 EdgeOne 控制台或通过 CLI 配置：

```bash
# 设置生产环境变量
edgeone env set GEMINI_API_KEY "your_production_api_key"
edgeone env set NODE_ENV "production"
```

### 3. 创建 KV 存储

```bash
# 创建 KV 命名空间
edgeone kv create inspirations-kv

# 绑定到项目
edgeone kv bind INSPIRATIONS_KV inspirations-kv
```

### 4. 部署到生产环境

```bash
# 部署到生产环境
npm run deploy

# 或指定环境部署
npm run deploy:prod
```

## 📋 EdgeOne CLI 常用命令

### 项目管理

```bash
# 查看项目信息
edgeone project info

# 查看项目列表
edgeone project list

# 删除项目
edgeone project delete
```

### 函数管理

```bash
# 查看函数列表
edgeone function list

# 查看函数日志
edgeone function logs

# 创建新函数
edgeone function create
```

### KV 存储管理

```bash
# 列出 KV 命名空间
edgeone kv list

# 查看 KV 数据
edgeone kv get key_name

# 设置 KV 数据
edgeone kv put key_name value

# 删除 KV 数据
edgeone kv delete key_name
```

### 环境变量管理

```bash
# 查看环境变量
edgeone env list

# 设置环境变量
edgeone env set KEY value

# 删除环境变量
edgeone env unset KEY
```

## 🔍 监控和维护

### 1. 查看部署状态

```bash
# 查看部署历史
edgeone deployment list

# 查看当前部署信息
edgeone deployment info
```

### 2. 性能监控

- 访问 [EdgeOne 控制台](https://edgeone.cloud.tencent.com/) 查看：
  - 函数执行次数和耗时
  - KV 存储使用情况  
  - 错误日志和性能指标

### 3. 日志查看

```bash
# 实时查看函数日志
edgeone logs --follow

# 查看历史日志
edgeone logs --from 1h
```

## 📁 重要配置文件说明

### `edgeone.json` - 项目配置

```json
{
  "name": "inspiration-list",
  "compatibility_date": "2025-08-25",
  "functions": {
    "directory": "functions",
    "environment": {
      "production": {
        "GEMINI_API_KEY": "your_production_key"
      },
      "development": {
        "GEMINI_API_KEY": "your_dev_key"
      }
    }
  },
  "kv": {
    "namespaces": [
      {
        "binding": "INSPIRATIONS_KV",
        "namespace_id": "your_kv_namespace_id"
      }
    ]
  }
}
```

### `functions/api/[[route]].js` - API 函数

- 处理所有 `/api/*` 路径的请求
- 集成 KV 存储和 Gemini API
- 包含完整的 CRUD 操作

## 🚨 常见问题解决

### 1. 函数部署失败

```bash
# 检查函数语法
edgeone function validate

# 查看详细错误信息
edgeone deployment info --verbose
```

### 2. KV 存储连接问题

```bash
# 验证 KV 绑定
edgeone kv list

# 测试 KV 连接
edgeone kv get test_key
```

### 3. 环境变量未生效

```bash
# 重新设置环境变量
edgeone env set GEMINI_API_KEY "new_value"

# 重新部署
edgeone deploy
```

## 🔐 安全最佳实践

1. **API 密钥管理**: 
   - 使用 EdgeOne 环境变量存储敏感信息
   - 区分开发和生产环境密钥

2. **CORS 配置**:
   - 在生产环境限制允许的域名
   - 配置合适的 CORS 头部

3. **输入验证**:
   - 所有用户输入都进行验证和清理
   - 防止 XSS 和注入攻击

## 📞 支持和文档

- **EdgeOne Pages 文档**: https://edgeone.cloud.tencent.com/
- **CLI 文档**: https://edgeone.cloud.tencent.com/pages/document/162936923278893056
- **Functions 文档**: https://edgeone.cloud.tencent.com/pages/document/162936866445025280
- **控制台**: https://edgeone.cloud.tencent.com/

## 📈 下一步优化

1. **性能优化**:
   - 配置函数内存和超时
   - 优化 KV 存储访问模式
   - 启用静态资源 CDN 缓存

2. **功能增强**:
   - 添加用户认证
   - 实现数据备份
   - 增加更多 AI 分析功能

3. **监控告警**:
   - 设置错误率告警
   - 配置性能监控
   - 实现健康检查