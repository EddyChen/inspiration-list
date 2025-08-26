// Utility functions for the Inspiration List application

// DOM Utilities
const DOM = {
    // Element selection
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    // Element creation
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Show/hide elements
    show(element, display = 'block') {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.style.display = display;
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },

    toggle(element, display = 'block') {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.style.display = element.style.display === 'none' ? display : 'none';
        }
    },

    // Class manipulation
    addClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },

    removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },

    toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },

    hasClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        return element ? element.classList.contains(className) : false;
    }
};

// String utilities
const StringUtils = {
    truncate(str, length, suffix = '...') {
        if (!str || typeof str !== 'string') return '';
        if (str.length <= length) return str;
        return str.substring(0, length).trim() + suffix;
    },

    capitalize(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    slugify(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[\s_-]+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    stripHtml(str) {
        if (!str || typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent || div.innerText || '';
    },

    wordCount(str) {
        if (!str || typeof str !== 'string') return 0;
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
};

// Date utilities
const DateUtils = {
    formatDate(date, format = 'zh-CN') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        if (format === 'zh-CN') {
            return d.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        return d.toLocaleString(format);
    },

    formatRelativeTime(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return '刚刚';
        } else if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return this.formatDate(date);
        }
    },

    isToday(date) {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    },

    isYesterday(date) {
        if (!date) return false;
        const d = new Date(date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return d.toDateString() === yesterday.toDateString();
    }
};

// Array utilities
const ArrayUtils = {
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const aVal = typeof key === 'function' ? key(a) : a[key];
            const bVal = typeof key === 'function' ? key(b) : b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    unique(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = typeof key === 'function' ? key(item) : item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// Storage utilities
const StorageUtils = {
    // Local storage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    },

    // Session storage
    setSession(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to sessionStorage:', error);
            return false;
        }
    },

    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from sessionStorage:', error);
            return defaultValue;
        }
    }
};

// URL utilities
const UrlUtils = {
    getParams() {
        return new URLSearchParams(window.location.search);
    },

    getParam(name, defaultValue = null) {
        const params = this.getParams();
        return params.get(name) || defaultValue;
    },

    setParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    removeParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
};

// Validation utilities
const ValidationUtils = {
    isEmpty(value) {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    },

    isEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    minLength(value, length) {
        return typeof value === 'string' && value.length >= length;
    },

    maxLength(value, length) {
        return typeof value === 'string' && value.length <= length;
    },

    isNumber(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },

    isInteger(value) {
        return Number.isInteger(Number(value));
    },

    inRange(value, min, max) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

// Event utilities
const EventUtils = {
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    once(func) {
        let called = false;
        return function executedFunction(...args) {
            if (!called) {
                called = true;
                return func.apply(this, args);
            }
        };
    },

    on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = DOM.$(element);
        }
        if (element) {
            element.addEventListener(event, handler, options);
        }
        return () => {
            if (element) {
                element.removeEventListener(event, handler, options);
            }
        };
    },

    off(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = DOM.$(element);
        }
        if (element) {
            element.removeEventListener(event, handler, options);
        }
    },

    emit(element, event, detail = {}) {
        if (typeof element === 'string') {
            element = DOM.$(element);
        }
        if (element) {
            const customEvent = new CustomEvent(event, { detail });
            element.dispatchEvent(customEvent);
        }
    }
};

// Performance utilities
const PerfUtils = {
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    requestIdleCallback(callback, options = {}) {
        if (window.requestIdleCallback) {
            return window.requestIdleCallback(callback, options);
        } else {
            // Fallback for browsers that don't support requestIdleCallback
            return setTimeout(callback, 1);
        }
    }
};

// Error handling utilities
const ErrorUtils = {
    safeCall(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            console.error('Safe call failed:', error);
            return fallback;
        }
    },

    async safeCallAsync(fn, fallback = null) {
        try {
            return await fn();
        } catch (error) {
            console.error('Safe async call failed:', error);
            return fallback;
        }
    },

    retry(fn, maxAttempts = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const attempt = () => {
                attempts++;
                
                Promise.resolve(fn())
                    .then(resolve)
                    .catch(error => {
                        if (attempts >= maxAttempts) {
                            reject(error);
                        } else {
                            setTimeout(attempt, delay * attempts);
                        }
                    });
            };
            
            attempt();
        });
    }
};

// Export utilities to global scope
window.DOM = DOM;
window.StringUtils = StringUtils;
window.DateUtils = DateUtils;
window.ArrayUtils = ArrayUtils;
window.StorageUtils = StorageUtils;
window.UrlUtils = UrlUtils;
window.ValidationUtils = ValidationUtils;
window.EventUtils = EventUtils;
window.PerfUtils = PerfUtils;
window.ErrorUtils = ErrorUtils;