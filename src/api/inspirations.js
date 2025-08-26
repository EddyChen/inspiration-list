import { analyzeWithGemini } from '../utils/gemini.js';
import { generateId, validateInput } from '../utils/helpers.js';

export async function createInspiration(request, env) {
  try {
    // Check if KV is available
    if (!env.INSPIRATIONS_KV) {
      console.warn('INSPIRATIONS_KV not available in development');
      // Return a mock response for development
      const mockInspiration = {
        id: `mock_${Date.now()}`,
        originalText: 'Development mode - KV storage not available',
        enhancedContent: {
          summary: 'This is a mock response for development',
          details: 'In production, this would be enhanced by Gemini AI and stored in KV.',
          suggestions: ['Deploy to EdgeOne for full functionality', 'Configure KV storage', 'Test with real API'],
          tags: ['development', 'mock', 'test'],
          category: 'Development'
        },
        metadata: {
          wordCount: 8,
          language: 'zh-CN',
          sentiment: 'neutral'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockInspiration), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const body = await request.json();
    const { transcribedText, audioData } = body;

    // Validate input
    if (!transcribedText || typeof transcribedText !== 'string' || transcribedText.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'transcribedText is required and must be a non-empty string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (transcribedText.length > 5000) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'transcribedText is too long (max 5000 characters)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique ID
    const id = generateId();
    const now = new Date().toISOString();

    // Analyze content with Gemini AI
    const enhancedContent = await analyzeWithGemini(transcribedText, env);

    // Create inspiration record
    const inspiration = {
      id,
      originalText: transcribedText.trim(),
      enhancedContent,
      metadata: {
        wordCount: transcribedText.trim().split(/\s+/).length,
        language: 'zh-CN', // Default to Chinese, can be detected later
        sentiment: 'neutral' // Can be analyzed by AI later
      },
      createdAt: now,
      updatedAt: now
    };

    // Store in KV
    await env.INSPIRATIONS_KV.put(`inspiration:${id}`, JSON.stringify(inspiration));
    
    // Update index for listing (store IDs with timestamps for sorting)
    const indexKey = 'inspirations:index';
    let index = [];
    try {
      const indexData = await env.INSPIRATIONS_KV.get(indexKey);
      if (indexData) {
        index = JSON.parse(indexData);
      }
    } catch (error) {
      console.warn('Failed to read index, starting fresh:', error);
    }

    // Add new inspiration to index
    index.unshift({ id, createdAt: now });
    
    // Keep only the latest 1000 entries in index to prevent it from growing too large
    if (index.length > 1000) {
      index = index.slice(0, 1000);
    }

    await env.INSPIRATIONS_KV.put(indexKey, JSON.stringify(index));

    return new Response(JSON.stringify(inspiration), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating inspiration:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to create inspiration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getInspirations(request, env) {
  try {
    // Check if KV is available
    if (!env.INSPIRATIONS_KV) {
      console.warn('INSPIRATIONS_KV not available in development');
      return new Response(JSON.stringify({
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    // Get index
    const indexKey = 'inspirations:index';
    const indexData = await env.INSPIRATIONS_KV.get(indexKey);
    let index = [];
    if (indexData) {
      index = JSON.parse(indexData);
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIds = index.slice(startIndex, endIndex);

    // Fetch inspiration records
    const inspirations = [];
    for (const item of paginatedIds) {
      try {
        const data = await env.INSPIRATIONS_KV.get(`inspiration:${item.id}`);
        if (data) {
          const inspiration = JSON.parse(data);
          
          // Apply filters
          let include = true;
          
          if (category && category !== 'all' && inspiration.enhancedContent.category !== category) {
            include = false;
          }
          
          if (search && !inspiration.originalText.toLowerCase().includes(search.toLowerCase()) &&
              !inspiration.enhancedContent.summary.toLowerCase().includes(search.toLowerCase()) &&
              !inspiration.enhancedContent.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) {
            include = false;
          }
          
          if (include) {
            // Return summary version for list
            inspirations.push({
              id: inspiration.id,
              originalText: inspiration.originalText.length > 100 
                ? inspiration.originalText.substring(0, 100) + '...'
                : inspiration.originalText,
              summary: inspiration.enhancedContent.summary,
              tags: inspiration.enhancedContent.tags,
              category: inspiration.enhancedContent.category,
              createdAt: inspiration.createdAt
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch inspiration ${item.id}:`, error);
      }
    }

    return new Response(JSON.stringify({
      data: inspirations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(index.length / limit),
        totalItems: index.length,
        hasNext: endIndex < index.length,
        hasPrev: page > 1
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching inspirations:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to fetch inspirations'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getInspiration(id, env) {
  try {
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid inspiration ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if KV is available
    if (!env.INSPIRATIONS_KV) {
      console.warn('INSPIRATIONS_KV not available in development');
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        message: 'KV storage not available in development mode'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await env.INSPIRATIONS_KV.get(`inspiration:${id}`);
    
    if (!data) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Inspiration not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const inspiration = JSON.parse(data);
    
    return new Response(JSON.stringify(inspiration), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching inspiration:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to fetch inspiration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function deleteInspiration(id, env) {
  try {
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid inspiration ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if KV is available
    if (!env.INSPIRATIONS_KV) {
      console.warn('INSPIRATIONS_KV not available in development');
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        message: 'KV storage not available in development mode'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if inspiration exists
    const data = await env.INSPIRATIONS_KV.get(`inspiration:${id}`);
    if (!data) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Inspiration not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete from KV
    await env.INSPIRATIONS_KV.delete(`inspiration:${id}`);

    // Update index
    const indexKey = 'inspirations:index';
    try {
      const indexData = await env.INSPIRATIONS_KV.get(indexKey);
      if (indexData) {
        let index = JSON.parse(indexData);
        index = index.filter(item => item.id !== id);
        await env.INSPIRATIONS_KV.put(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.warn('Failed to update index after deletion:', error);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Inspiration deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting inspiration:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to delete inspiration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}