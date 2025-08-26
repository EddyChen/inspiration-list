# Inspiration List - 详细需求文档

## 项目概述

基于 Tencent EdgeOne 平台开发的语音灵感记录 Web 应用，用户可以通过语音输入记录想法和灵感，系统自动将语音转换为文字，并通过 AI 分析扩展内容，最终存储在 KV 数据库中供后续查阅。

## 功能需求

### 1. 语音输入模块
- **语音录制**：支持浏览器内语音录制功能
- **语音转文字**：将录制的语音转换为文本
- **实时反馈**：录制过程中提供可视化反馈（录制状态、音量显示等）
- **格式支持**：支持常见的音频格式（WebM、MP3等）
- **时长限制**：单次录制时长限制为 5 分钟

### 2. AI 内容分析与扩展
- **文本理解**：使用 Gemini API 分析用户输入的文本内容
- **内容扩展**：AI 自动补充细节、提供建议、完善想法
- **结构化输出**：将分析结果转换为结构化的 JSON 格式
- **分类标签**：AI 自动为内容添加相关标签和分类

### 3. 数据存储
- **KV 存储**：使用 EdgeOne KV 存储保存灵感记录
- **数据结构**：标准化的 JSON 数据格式
- **唯一标识**：每条记录具有唯一的 ID
- **时间戳**：记录创建和修改时间

### 4. 内容管理
- **列表查看**：展示所有保存的灵感记录
- **搜索功能**：支持关键词搜索
- **分类筛选**：按标签或分类筛选内容
- **详情查看**：查看单条记录的完整内容
- **删除功能**：删除不需要的记录

## 技术架构

### 前端技术栈
- **框架**：原生 JavaScript 或轻量级框架（Vue.js/React）
- **语音处理**：Web Speech API 或 MediaRecorder API
- **UI 组件**：响应式设计，支持移动端
- **PWA 支持**：离线访问能力

### 后端服务
- **部署平台**：Tencent EdgeOne Edge Functions
- **运行时**：Node.js 或其他支持的运行时
- **API 设计**：RESTful API 设计原则

### 外部服务集成
- **AI 服务**：Gemini API (gemini-2.5-flash 模型)
- **语音转文字**：浏览器内置 Speech Recognition API 或云服务
- **存储服务**：EdgeOne KV 存储

## API 设计

### 1. 创建灵感记录
```
POST /api/inspirations
Content-Type: application/json

{
  "audioData": "base64_encoded_audio",
  "transcribedText": "用户的原始想法"
}

Response:
{
  "id": "unique_id",
  "originalText": "用户的原始想法",
  "enhancedContent": {
    "summary": "AI 生成的摘要",
    "details": "AI 扩展的详细内容",
    "suggestions": ["建议1", "建议2"],
    "tags": ["标签1", "标签2"],
    "category": "分类"
  },
  "createdAt": "2025-08-25T10:00:00Z",
  "updatedAt": "2025-08-25T10:00:00Z"
}
```

### 2. 获取灵感列表
```
GET /api/inspirations?page=1&limit=20&category=all&search=keyword

Response:
{
  "data": [
    {
      "id": "unique_id",
      "originalText": "原始想法摘要",
      "summary": "AI 摘要",
      "tags": ["标签1", "标签2"],
      "category": "分类",
      "createdAt": "2025-08-25T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

### 3. 获取单条记录详情
```
GET /api/inspirations/{id}

Response:
{
  "id": "unique_id",
  "originalText": "用户的原始想法",
  "enhancedContent": {
    "summary": "AI 生成的摘要",
    "details": "AI 扩展的详细内容",
    "suggestions": ["建议1", "建议2"],
    "tags": ["标签1", "标签2"],
    "category": "分类"
  },
  "createdAt": "2025-08-25T10:00:00Z",
  "updatedAt": "2025-08-25T10:00:00Z"
}
```

### 4. 删除记录
```
DELETE /api/inspirations/{id}

Response:
{
  "success": true,
  "message": "记录已删除"
}
```

## 数据模型

### KV 存储数据结构
```json
{
  "id": "inspiration_20250825_001",
  "originalText": "我想做一个能够记录灵感的应用",
  "enhancedContent": {
    "summary": "开发灵感记录应用的想法",
    "details": "这是一个很有创意的想法。你可以考虑以下几个方面：1. 用户体验要简洁直观 2. 支持多种输入方式 3. 智能分类和搜索功能 4. 数据安全和隐私保护",
    "suggestions": [
      "考虑添加图片和语音附件功能",
      "实现跨设备同步",
      "添加灵感分享功能",
      "设置提醒和回顾机制"
    ],
    "tags": ["应用开发", "创意", "产品设计"],
    "category": "技术创新"
  },
  "metadata": {
    "wordCount": 15,
    "language": "zh-CN",
    "sentiment": "positive"
  },
  "createdAt": "2025-08-25T10:00:00Z",
  "updatedAt": "2025-08-25T10:00:00Z"
}
```

## 用户界面设计

### 主页面布局
1. **录制按钮**：大型、醒目的录制按钮，支持点击或长按录制
2. **状态显示**：录制状态、处理进度的可视化反馈
3. **快速操作**：最近记录的快速访问入口

### 列表页面
1. **搜索栏**：关键词搜索和筛选选项
2. **记录卡片**：显示摘要、标签、时间等关键信息
3. **分页控制**：支持无限滚动或分页导航

### 详情页面
1. **完整内容**：原始文本和 AI 扩展内容
2. **操作按钮**：编辑、删除、分享等功能
3. **相关推荐**：基于标签的相关记录推荐

## 部署配置

### EdgeOne 配置
- **域名配置**：绑定自定义域名
- **HTTPS 证书**：启用 SSL/TLS 加密
- **CDN 加速**：全球内容分发网络
- **安全防护**：WAF 和 DDoS 防护

### Edge Functions 配置
```javascript
// wrangler.toml 配置示例
name = "inspiration-list"
main = "src/index.js"
compatibility_date = "2025-08-25"

[env.production]
kv_namespaces = [
  { binding = "INSPIRATIONS_KV", id = "your_kv_namespace_id" }
]

[vars]
GEMINI_API_KEY = "AIzaSyCSApq5WTZRvA5M6daU4k-S-QDfW6OlXkE"
GEMINI_GATEWAY_URL = "https://ai-gateway.eo-edgefunctions7.com/v1beta/models/gemini-2.5-flash:generateContent"
```

## 性能要求

### 响应时间
- **语音转文字**：< 3 秒
- **AI 分析处理**：< 5 秒
- **页面加载**：< 2 秒
- **列表查询**：< 1 秒

### 并发处理
- **同时在线用户**：支持 1000+ 并发用户
- **API 请求限制**：每用户每分钟 30 次请求

## 安全考虑

### 数据安全
- **传输加密**：所有 API 调用使用 HTTPS
- **数据存储**：KV 存储数据加密
- **API 密钥**：安全存储和管理 Gemini API 密钥

### 用户隐私
- **匿名使用**：无需用户注册，基于设备标识
- **数据控制**：用户可以删除自己的所有数据
- **隐私声明**：明确的隐私政策和数据使用说明

## 开发计划

### 第一阶段（MVP）
- [ ] 基础语音录制和转文字功能
- [ ] Gemini API 集成和内容分析
- [ ] 基础的存储和查看功能
- [ ] 简单的 Web 界面

### 第二阶段（功能完善）
- [ ] 搜索和筛选功能
- [ ] 改进的用户界面设计
- [ ] 移动端优化
- [ ] 性能优化

### 第三阶段（高级功能）
- [ ] 智能标签和分类
- [ ] 数据导出功能
- [ ] 多语言支持
- [ ] 高级搜索功能

## 测试策略

### 功能测试
- **语音录制**：不同设备和浏览器的兼容性测试
- **AI 分析**：各种类型输入的处理效果测试
- **存储功能**：数据一致性和可靠性测试

### 性能测试
- **负载测试**：模拟高并发用户访问
- **压力测试**：API 接口的极限测试
- **网络测试**：不同网络环境下的表现

### 安全测试
- **数据安全**：敏感信息泄露风险评估
- **API 安全**：接口安全性和权限控制测试
- **XSS/CSRF**：常见 Web 安全漏洞检测

## 维护和监控

### 日志记录
- **访问日志**：用户访问和 API 调用记录
- **错误日志**：系统错误和异常情况记录
- **性能日志**：响应时间和资源使用情况

### 监控指标
- **可用性监控**：系统运行状态实时监控
- **性能监控**：API 响应时间和成功率
- **资源监控**：KV 存储使用量和 API 调用次数

## 成本估算

### EdgeOne 服务费用
- **CDN 流量**：按实际使用量计费
- **Edge Functions**：按请求次数计费
- **KV 存储**：按存储容量和读写次数计费

### 第三方服务费用
- **Gemini API**：按 API 调用次数计费
- **域名和证书**：年费形式

## 风险评估

### 技术风险
- **API 限制**：Gemini API 调用频率和额度限制
- **浏览器兼容性**：语音录制功能的兼容性问题
- **网络依赖**：需要稳定的网络连接

### 业务风险
- **用户接受度**：语音输入方式的用户习惯培养
- **内容质量**：AI 分析结果的准确性和有用性
- **数据增长**：随着用户增长的存储成本控制

## 总结

本项目将构建一个简洁高效的语音灵感记录应用，充分利用 Tencent EdgeOne 平台的优势和 Gemini AI 的能力，为用户提供便捷的想法记录和管理体验。通过分阶段开发的方式，确保项目的可控性和可扩展性。