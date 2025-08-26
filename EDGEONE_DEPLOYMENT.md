# EdgeOne 部署指南

## 腾讯云 EdgeOne 部署步骤

### 准备工作

1. **创建 EdgeOne 账户**
   - 访问 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
   - 注册并完成实名认证

2. **安装 EdgeOne CLI**
   ```bash
   npm install -g @tencent-cloud/edgeone-cli
   # 或者
   yarn global add @tencent-cloud/edgeone-cli
   ```

3. **配置认证**
   ```bash
   edgeone login
   # 按提示输入 SecretId 和 SecretKey
   ```

### 方式一：通过控制台部署（推荐）

#### 步骤 1: 创建边缘函数
1. 登录 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 进入 "边缘函数" 页面
3. 点击 "新建函数"
4. 配置函数信息：
   - 函数名称: `inspiration-list`
   - 运行时: `JavaScript`
   - 内存: `128MB`
   - 超时时间: `30秒`

#### 步骤 2: 上传代码
1. 将 `src/` 目录打包为 ZIP 文件
2. 在函数配置页面上传代码包
3. 设置入口文件为 `index.js`

#### 步骤 3: 配置环境变量
在函数配置中添加环境变量：
```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_GATEWAY_URL=https://ai-gateway.eo-edgefunctions7.com/v1beta/models/gemini-2.5-flash:generateContent
NODE_ENV=production
```

#### 步骤 4: 创建 KV 存储
1. 在 EdgeOne 控制台进入 "KV 存储" 页面
2. 创建新的 KV 命名空间: `inspirations-kv`
3. 将 KV 命名空间绑定到边缘函数

#### 步骤 5: 配置静态资源托管
1. 在 EdgeOne 控制台进入 "静态网站托管" 页面
2. 上传 `public/` 目录下的所有文件
3. 设置 `index.html` 为默认文档

#### 步骤 6: 配置路由规则
在 EdgeOne 控制台配置路由：
```
/api/* -> 边缘函数 (inspiration-list)
/* -> 静态资源托管
```

#### 步骤 7: 绑定域名
1. 在域名管理中添加您的域名
2. 配置 SSL 证书
3. 设置 CNAME 记录指向 EdgeOne

### 方式二：使用 CLI 部署

#### 准备部署包
```bash
# 1. 打包边缘函数代码
zip -r function.zip src/

# 2. 准备静态资源
cp -r public/ static/
```

#### 使用 CLI 部署
```bash
# 1. 创建函数
edgeone function create \
  --name inspiration-list \
  --runtime javascript \
  --memory 128 \
  --timeout 30 \
  --code function.zip

# 2. 创建 KV 存储
edgeone kv create --name inspirations-kv

# 3. 绑定 KV 到函数
edgeone function bind-kv \
  --function inspiration-list \
  --kv inspirations-kv \
  --binding INSPIRATIONS_KV

# 4. 设置环境变量
edgeone function env-set \
  --function inspiration-list \
  --key GEMINI_API_KEY \
  --value "your_gemini_api_key"

edgeone function env-set \
  --function inspiration-list \
  --key GEMINI_GATEWAY_URL \
  --value "https://ai-gateway.eo-edgefunctions7.com/v1beta/models/gemini-2.5-flash:generateContent"

# 5. 上传静态资源
edgeone static upload --directory static/

# 6. 配置路由
edgeone route create \
  --pattern "/api/*" \
  --target function \
  --function inspiration-list

edgeone route create \
  --pattern "/*" \
  --target static
```

### 方式三：使用配置文件部署

1. **使用提供的配置文件**
   ```bash
   # 使用 edgeone.config.js 配置文件
   edgeone deploy --config edgeone.config.js
   ```

2. **使用部署脚本**
   ```bash
   # 执行自动化部署脚本
   ./deploy-edgeone.sh production
   ```

### 部署后验证

1. **测试 API 端点**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **测试静态资源**
   ```bash
   curl https://your-domain.com/
   ```

3. **测试 KV 存储**
   - 通过应用创建一个灵感记录
   - 检查数据是否正确保存

### 监控和维护

1. **性能监控**
   - 在 EdgeOne 控制台查看函数执行日志
   - 监控 KV 操作性能
   - 检查静态资源缓存命中率

2. **错误处理**
   - 查看边缘函数错误日志
   - 监控 API 错误率
   - 检查 Gemini API 调用状态

3. **扩容配置**
   - 根据实际使用调整函数内存
   - 优化 KV 存储配置
   - 配置 CDN 缓存策略

### 成本优化

1. **函数优化**
   - 调整内存配置到合适大小
   - 优化代码减少执行时间
   - 使用函数预热避免冷启动

2. **存储优化**
   - 定期清理过期数据
   - 压缩存储数据格式
   - 配置合理的 TTL

3. **带宽优化**
   - 启用静态资源压缩
   - 配置适当的缓存策略
   - 使用 CDN 边缘缓存

### 常见问题

1. **函数超时**
   - 增加函数超时时间
   - 优化代码执行效率
   - 使用异步处理减少响应时间

2. **KV 存储问题**
   - 检查 KV 命名空间绑定
   - 验证读写权限配置
   - 监控 KV 操作日志

3. **域名访问问题**
   - 检查 DNS 解析配置
   - 验证 SSL 证书状态
   - 确认路由规则设置

### 联系支持

- EdgeOne 官方文档: https://cloud.tencent.com/document/product/1552
- 技术支持: 通过腾讯云控制台提交工单
- 社区讨论: 腾讯云开发者社区

---

**注意**: 请确保在部署前已经获得有效的 Gemini API 密钥，并根据实际情况调整配置参数。