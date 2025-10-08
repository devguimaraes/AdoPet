/**
 * Módulo de otimizações de performance
 * Contém utilitários para melhorar a performance da aplicação
 */

/**
 * Debounce function para otimizar eventos frequentes
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Executar imediatamente
 * @returns {Function} Função debounced
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function para limitar execução de eventos
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função throttled
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy loading para imagens
 */
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options
    };
    
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
      this.observeImages();
    } else {
      // Fallback para navegadores sem suporte
      this.loadAllImages();
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.add('loaded');
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  }

  observeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.observer.observe(img));
  }

  loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img));
  }
}

/**
 * Preload de recursos críticos
 */
export class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
  }

  /**
   * Preload de CSS
   * @param {string} href - URL do arquivo CSS
   * @param {string} media - Media query (opcional)
   */
  preloadCSS(href, media = 'all') {
    if (this.preloadedResources.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.media = media;
    
    link.onload = () => {
      link.rel = 'stylesheet';
      link.media = media;
    };
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  /**
   * Preload de JavaScript
   * @param {string} src - URL do arquivo JS
   */
  preloadJS(src) {
    if (this.preloadedResources.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    
    document.head.appendChild(link);
    this.preloadedResources.add(src);
  }

  /**
   * Preload de imagens
   * @param {string} src - URL da imagem
   */
  preloadImage(src) {
    if (this.preloadedResources.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    document.head.appendChild(link);
    this.preloadedResources.add(src);
  }

  /**
   * Preload de fontes
   * @param {string} src - URL da fonte
   * @param {string} type - Tipo da fonte
   */
  preloadFont(src, type = 'font/woff2') {
    if (this.preloadedResources.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = src;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    this.preloadedResources.add(src);
  }
}

/**
 * Otimizador de eventos de scroll
 */
export class ScrollOptimizer {
  constructor() {
    this.isScrolling = false;
    this.scrollCallbacks = new Set();
    this.init();
  }

  init() {
    const optimizedScroll = this.throttle(() => {
      this.scrollCallbacks.forEach(callback => callback());
    }, 16); // ~60fps

    window.addEventListener('scroll', optimizedScroll, { passive: true });
  }

  addScrollCallback(callback) {
    this.scrollCallbacks.add(callback);
  }

  removeScrollCallback(callback) {
    this.scrollCallbacks.delete(callback);
  }

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

/**
 * Gerenciador de memória para prevenir vazamentos
 */
export class MemoryManager {
  constructor() {
    this.eventListeners = new Map();
    this.intervals = new Set();
    this.timeouts = new Set();
  }

  /**
   * Adiciona event listener com cleanup automático
   * @param {Element} element - Elemento
   * @param {string} event - Tipo do evento
   * @param {Function} handler - Handler do evento
   * @param {Object} options - Opções do evento
   */
  addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    
    this.eventListeners.get(element).push({ event, handler, options });
  }

  /**
   * Remove todos os event listeners de um elemento
   * @param {Element} element - Elemento
   */
  removeEventListeners(element) {
    const listeners = this.eventListeners.get(element);
    if (listeners) {
      listeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners.delete(element);
    }
  }

  /**
   * Cria interval com cleanup automático
   * @param {Function} callback - Função a ser executada
   * @param {number} delay - Delay em ms
   * @returns {number} ID do interval
   */
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  /**
   * Cria timeout com cleanup automático
   * @param {Function} callback - Função a ser executada
   * @param {number} delay - Delay em ms
   * @returns {number} ID do timeout
   */
  setTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  /**
   * Limpa todos os recursos
   */
  cleanup() {
    // Limpar event listeners
    this.eventListeners.forEach((listeners, element) => {
      this.removeEventListeners(element);
    });

    // Limpar intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Limpar timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
  }
}

/**
 * Otimizador de DOM
 */
export class DOMOptimizer {
  /**
   * Batch de operações DOM para evitar reflows
   * @param {Function} operations - Função com operações DOM
   */
  static batchDOMOperations(operations) {
    requestAnimationFrame(() => {
      operations();
    });
  }

  /**
   * Mede performance de operações DOM
   * @param {string} name - Nome da operação
   * @param {Function} operation - Operação a ser medida
   */
  static measureDOMOperation(name, operation) {
    performance.mark(`${name}-start`);
    operation();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  /**
   * Otimiza queries DOM com cache
   */
  static createDOMCache() {
    const cache = new Map();
    
    return {
      querySelector(selector) {
        if (!cache.has(selector)) {
          cache.set(selector, document.querySelector(selector));
        }
        return cache.get(selector);
      },
      
      querySelectorAll(selector) {
        if (!cache.has(selector)) {
          cache.set(selector, document.querySelectorAll(selector));
        }
        return cache.get(selector);
      },
      
      clear() {
        cache.clear();
      }
    };
  }
}

/**
 * Monitor de performance
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.init();
  }

  init() {
    // Observer para Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
      this.observeResourceTiming();
    }
  }

  observeWebVitals() {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.set('FID', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.set('CLS', clsValue);
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  observeResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.initiatorType === 'img') {
          this.metrics.set(`image-${entry.name}`, entry.duration);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  logMetrics() {
    console.table(this.getMetrics());
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Inicialização das otimizações de performance
 */
export function initPerformanceOptimizations() {
  // Lazy loading de imagens
  new LazyImageLoader();
  
  // Preloader de recursos
  const preloader = new ResourcePreloader();
  
  // Preload de recursos críticos
  preloader.preloadCSS('./assets/css/index.css');
  preloader.preloadImage('./assets/img/Logo-768.png');
  
  // Otimizador de scroll
  new ScrollOptimizer();
  
  // Monitor de performance (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    const monitor = new PerformanceMonitor();
    
    // Log das métricas após 5 segundos
    setTimeout(() => {
      monitor.logMetrics();
    }, 5000);
  }
}

// Instâncias globais
export const memoryManager = new MemoryManager();
export const domCache = DOMOptimizer.createDOMCache();

// Cleanup automático quando a página é descarregada
window.addEventListener('beforeunload', () => {
  memoryManager.cleanup();
  domCache.clear();
});

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
  initPerformanceOptimizations();
}