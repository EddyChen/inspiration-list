class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    async request(url, options = {}) {
        const fullURL = this.baseURL + url;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(fullURL, config);
            
            // Handle different content types
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new ApiError(
                    data.message || data.error || `HTTP ${response.status}`,
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Network or other errors
            throw new ApiError(
                error.message || '网络请求失败',
                0,
                null
            );
        }
    }

    async get(url, params = {}) {
        const searchParams = new URLSearchParams(params);
        const urlWithParams = searchParams.toString() ? `${url}?${searchParams}` : url;
        
        return this.request(urlWithParams, {
            method: 'GET'
        });
    }

    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    // Inspiration-specific methods
    async createInspiration(transcribedText, audioData = null) {
        return this.post('/api/inspirations', {
            transcribedText,
            audioData
        });
    }

    async getInspirations(options = {}) {
        const params = {
            page: options.page || 1,
            limit: options.limit || 20,
            ...(options.category && options.category !== 'all' && { category: options.category }),
            ...(options.search && { search: options.search })
        };

        return this.get('/api/inspirations', params);
    }

    async getInspiration(id) {
        return this.get(`/api/inspirations/${id}`);
    }

    async deleteInspiration(id) {
        return this.delete(`/api/inspirations/${id}`);
    }

    // Health check
    async healthCheck() {
        try {
            await this.get('/api/health');
            return true;
        } catch {
            return false;
        }
    }
}

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    get isNetworkError() {
        return this.status === 0;
    }

    get isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    get isServerError() {
        return this.status >= 500;
    }
}

// Request retry utility
class RetryClient extends ApiClient {
    constructor(baseURL, options = {}) {
        super(baseURL);
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.retryCondition = options.retryCondition || this.defaultRetryCondition;
    }

    defaultRetryCondition(error) {
        // Retry on network errors or 5xx server errors
        return error.isNetworkError || error.isServerError;
    }

    async requestWithRetry(url, options = {}, retryCount = 0) {
        try {
            // Call parent class request method directly to avoid circular reference
            return await super.request(url, options);
        } catch (error) {
            if (retryCount < this.maxRetries && this.retryCondition(error)) {
                console.log(`Retrying request (${retryCount + 1}/${this.maxRetries}):`, url);
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
                
                return this.requestWithRetry(url, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    async request(url, options = {}) {
        return this.requestWithRetry(url, options);
    }
}

// Progress tracking wrapper
class ProgressClient extends ApiClient {
    constructor(baseURL) {
        super(baseURL);
        this.onProgress = null;
    }

    async request(url, options = {}) {
        if (this.onProgress) {
            this.onProgress({ type: 'start', url });
        }

        try {
            const result = await super.request(url, options);
            
            if (this.onProgress) {
                this.onProgress({ type: 'success', url, result });
            }
            
            return result;
        } catch (error) {
            if (this.onProgress) {
                this.onProgress({ type: 'error', url, error });
            }
            
            throw error;
        }
    }
}

// Cache wrapper for GET requests
class CacheClient extends ApiClient {
    constructor(baseURL, options = {}) {
        super(baseURL);
        this.cache = new Map();
        this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes default
        this.enableCache = options.enableCache !== false;
    }

    getCacheKey(url, options) {
        return JSON.stringify({ url, options });
    }

    isValidCacheEntry(entry) {
        return entry && (Date.now() - entry.timestamp) < this.cacheTTL;
    }

    async get(url, params = {}) {
        if (!this.enableCache) {
            return super.get(url, params);
        }

        const cacheKey = this.getCacheKey(url, params);
        const cachedEntry = this.cache.get(cacheKey);

        if (this.isValidCacheEntry(cachedEntry)) {
            console.log('Cache hit:', url);
            return cachedEntry.data;
        }

        const result = await super.get(url, params);
        
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    }

    clearCache() {
        this.cache.clear();
    }

    removeCacheEntry(url, params = {}) {
        const cacheKey = this.getCacheKey(url, params);
        this.cache.delete(cacheKey);
    }
}

// Create default client instance
const apiClient = new RetryClient('http://localhost:8787', {
    maxRetries: 2,
    retryDelay: 1000
});

// Export for use in other modules
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.RetryClient = RetryClient;
window.ProgressClient = ProgressClient;
window.CacheClient = CacheClient;
window.apiClient = apiClient;