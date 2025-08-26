// EdgeOne Pages Function - API 路由处理器
// 使用 [[route]] 文件名来捕获所有 /api/* 路径

import { analyzeWithGemini } from '../../src/utils/gemini.js';
import { generateId, validateInput, sanitizeText } from '../../src/utils/helpers.js';

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    try {
      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // 解析 URL 路径
      const url = new URL(request.url);
      const pathname = url.pathname;

      // 路由处理
      let response;

      if (pathname === '/api/health') {
        response = await handleHealth(request, env);
      } else if (pathname === '/api/inspirations') {
        response = await handleInspirations(request, env);
      } else if (pathname.startsWith('/api/inspirations/')) {
        const id = pathname.split('/').pop();
        response = await handleInspirationById(request, env, id);
      } else {
        response = new Response(JSON.stringify({
          error: 'Not Found',
          message: '请求的资源不存在'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 添加 CORS 头部
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('EdgeOne Function Error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

// 健康检查
async function handleHealth(request, env) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理 inspirations 集合请求
async function handleInspirations(request, env) {
  const method = request.method;

  if (method === 'GET') {
    return await getInspirations(request, env);
  } else if (method === 'POST') {
    return await createInspiration(request, env);
  } else {
    return new Response(JSON.stringify({
      error: 'Method Not Allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理单个 inspiration 请求
async function handleInspirationById(request, env, id) {
  const method = request.method;

  if (method === 'GET') {
    return await getInspiration(request, env, id);
  } else if (method === 'DELETE') {
    return await deleteInspiration(request, env, id);
  } else {
    return new Response(JSON.stringify({
      error: 'Method Not Allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 获取 inspirations 列表
async function getInspirations(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const category = url.searchParams.get('category') || 'all';
    const search = url.searchParams.get('search') || '';

    // 开发环境模拟数据
    if (!env.INSPIRATIONS_KV) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          inspirations: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 存储获取数据
    const keys = await env.INSPIRATIONS_KV.list();
    let inspirations = [];

    for (const key of keys.keys) {
      const data = await env.INSPIRATIONS_KV.get(key.name, 'json');
      if (data) {
        inspirations.push(data);
      }
    }

    // 过滤和搜索
    if (category !== 'all') {
      inspirations = inspirations.filter(item => item.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      inspirations = inspirations.filter(item => 
        item.transcribedText.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 排序和分页
    inspirations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = inspirations.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedInspirations = inspirations.slice(startIndex, startIndex + limit);

    return new Response(JSON.stringify({
      success: true,
      data: {
        inspirations: paginatedInspirations,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get inspirations error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '获取数据失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 创建新的 inspiration
async function createInspiration(request, env) {
  try {
    const data = await request.json();
    
    // 验证输入
    const validation = validateInput(data, {
      transcribedText: { required: true, type: 'string', minLength: 1, maxLength: 5000 }
    });

    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: '输入验证失败',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 清理文本
    const transcribedText = sanitizeText(data.transcribedText);

    // 使用 Gemini API 分析内容
    const enhancedContent = await analyzeWithGemini(transcribedText, env);

    // 创建 inspiration 对象
    const inspiration = {
      id: generateId(),
      transcribedText,
      audioData: data.audioData || null,
      summary: enhancedContent.summary,
      details: enhancedContent.details,
      suggestions: enhancedContent.suggestions,
      tags: enhancedContent.tags,
      category: enhancedContent.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存到 KV 存储
    if (env.INSPIRATIONS_KV) {
      await env.INSPIRATIONS_KV.put(inspiration.id, JSON.stringify(inspiration));
    }

    return new Response(JSON.stringify({
      success: true,
      data: inspiration
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create inspiration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '创建失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 获取单个 inspiration
async function getInspiration(request, env, id) {
  try {
    if (!env.INSPIRATIONS_KV) {
      return new Response(JSON.stringify({
        success: false,
        error: '存储服务不可用'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const inspiration = await env.INSPIRATIONS_KV.get(id, 'json');

    if (!inspiration) {
      return new Response(JSON.stringify({
        success: false,
        error: '数据不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: inspiration
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get inspiration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '获取数据失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 删除 inspiration
async function deleteInspiration(request, env, id) {
  try {
    if (!env.INSPIRATIONS_KV) {
      return new Response(JSON.stringify({
        success: false,
        error: '存储服务不可用'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查是否存在
    const existing = await env.INSPIRATIONS_KV.get(id);
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: '数据不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 删除
    await env.INSPIRATIONS_KV.delete(id);

    return new Response(JSON.stringify({
      success: true,
      message: '删除成功'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete inspiration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '删除失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}