export async function analyzeWithGemini(text, env) {
  try {
    // Check if we're in development mode or if API is not properly configured
    if (!env.GEMINI_API_KEY || !env.GEMINI_GATEWAY_URL || 
        env.GEMINI_API_KEY === 'AIzaSyCSApq5WTZRvA5M6daU4k-S-QDfW6OlXkE') {
      console.warn('Gemini API not configured for development, using fallback analysis');
      return generateFallbackAnalysis(text);
    }

    const prompt = `请分析以下灵感记录文本，并提供结构化的分析结果。

原始文本：
"${text}"

请按照以下JSON格式返回分析结果：
{
  "summary": "简洁的摘要（1-2句话）",
  "details": "详细的扩展内容和建议（3-5句话）",
  "suggestions": ["具体建议1", "具体建议2", "具体建议3"],
  "tags": ["相关标签1", "相关标签2", "相关标签3"],
  "category": "主要分类（如：技术创新、生活想法、工作改进、创意设计等）"
}

请确保返回有效的JSON格式，不要包含其他文字。`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    };

    console.log('Calling Gemini API with URL:', env.GEMINI_GATEWAY_URL);
    
    const response = await fetch(env.GEMINI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GEMINI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Gemini API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Try to parse the JSON response
    let enhancedContent;
    try {
      // Clean up the response - remove any markdown formatting or extra text
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      enhancedContent = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.warn('Raw response:', generatedText);
      return generateFallbackAnalysis(text);
    }

    // Validate and normalize the structure
    return validateAndNormalizeContent(enhancedContent, text);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return intelligent fallback content based on the input
    return generateFallbackAnalysis(text);
  }
}

// Generate intelligent fallback analysis based on text content
function generateFallbackAnalysis(text) {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Detect language
  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  const language = hasChinese ? 'zh' : 'en';
  
  // Generate category based on keywords
  let category = '一般想法';
  const categories = {
    '技术创新': ['技术', '软件', '应用', '开发', '编程', '代码', 'app', 'tech', 'code', 'software'],
    '工作改进': ['工作', '项目', '团队', '管理', '效率', 'work', 'project', 'team', 'efficiency'],
    '生活想法': ['生活', '日常', '健康', '家庭', 'life', 'daily', 'health', 'family'],
    '创意设计': ['设计', '创意', '艺术', '美术', 'design', 'creative', 'art'],
    '学习成长': ['学习', '教育', '知识', '技能', 'learn', 'education', 'knowledge', 'skill'],
    '商业想法': ['商业', '创业', '产品', '市场', 'business', 'startup', 'product', 'market']
  };
  
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Generate tags based on content
  const commonTags = ['想法', '灵感'];
  const specificTags = [];
  
  if (words.includes('app') || words.includes('应用')) specificTags.push('应用开发');
  if (words.includes('design') || words.includes('设计')) specificTags.push('设计');
  if (words.includes('business') || words.includes('商业')) specificTags.push('商业');
  if (wordCount < 10) specificTags.push('简短想法');
  if (wordCount > 50) specificTags.push('详细想法');
  
  const tags = [...commonTags, ...specificTags].slice(0, 4);
  
  // Generate summary
  const summary = text.length > 80 ? text.substring(0, 80) + '...' : text;
  
  // Generate contextual details and suggestions
  const details = language === 'zh' ? 
    `这是一个${wordCount > 20 ? '详细的' : '简洁的'}想法。建议进一步思考具体的实施步骤，考虑可能遇到的挑战和所需的资源。可以尝试将想法分解为更小的可执行任务。` :
    `This is a ${wordCount > 20 ? 'detailed' : 'concise'} idea. Consider thinking further about specific implementation steps, potential challenges, and required resources. Try breaking the idea down into smaller, actionable tasks.`;
    
  const suggestions = language === 'zh' ? [
    '深入研究相关领域',
    '寻找类似的成功案例',
    '制定详细的行动计划',
    '与他人讨论获得反馈'
  ] : [
    'Research the relevant field in depth',
    'Look for similar success stories',
    'Create a detailed action plan',
    'Discuss with others for feedback'
  ];

  return {
    summary,
    details,
    suggestions: suggestions.slice(0, 3),
    tags,
    category
  };
}

// Validate and normalize enhanced content structure
function validateAndNormalizeContent(content, originalText) {
  const normalized = { ...content };
  
  // Ensure all required fields exist with defaults
  if (!normalized.summary || typeof normalized.summary !== 'string') {
    normalized.summary = originalText.length > 50 ? originalText.substring(0, 50) + '...' : originalText;
  }
  
  if (!normalized.details || typeof normalized.details !== 'string') {
    normalized.details = '这个想法具有潜在价值，值得进一步探索和发展。';
  }
  
  if (!normalized.suggestions || !Array.isArray(normalized.suggestions)) {
    normalized.suggestions = ['深入思考这个想法', '收集相关信息', '制定实施计划'];
  }
  
  if (!normalized.tags || !Array.isArray(normalized.tags)) {
    normalized.tags = ['灵感', '想法'];
  }
  
  if (!normalized.category || typeof normalized.category !== 'string') {
    normalized.category = '一般想法';
  }
  
  // Ensure arrays have reasonable lengths
  normalized.suggestions = normalized.suggestions.slice(0, 5);
  normalized.tags = normalized.tags.slice(0, 6);
  
  return normalized;
}