/**
 * Módulo de Lazy Loading otimizado para imagens
 * Implementa carregamento sob demanda para melhorar performance
 */

/**
 * Configuração padrão do lazy loading
 */
const DEFAULT_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01,
  loadingClass: 'lazy-loading',
  loadedClass: 'lazy-loaded',
  errorClass: 'lazy-error',
  placeholderSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3ECarregando...%3C/text%3E%3C/svg%3E'
};

/**
 * Classe principal para gerenciar lazy loading
 */
class LazyImageManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.observer = null;
    this.images = new Set();
    this.loadedImages = new Set();
    
    this.init();
  }

  /**
   * Inicializa o lazy loading
   */
  init() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver não suportado. Carregando todas as imagens.');
      this.loadAllImages();
      return;
    }

    this.createObserver();
    this.setupImages();
    this.setupMutationObserver();
  }

  /**
   * Cria o IntersectionObserver
   */
  createObserver() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      }
    );
  }

  /**
   * Configura as imagens existentes para lazy loading
   */
  setupImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => this.observeImage(img));
  }

  /**
   * Configura MutationObserver para imagens adicionadas dinamicamente
   */
  setupMutationObserver() {
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verifica se o próprio nó é uma imagem
            if (node.tagName === 'IMG' && (node.dataset.src || node.dataset.srcset)) {
              this.observeImage(node);
            }
            
            // Verifica imagens filhas
            const childImages = node.querySelectorAll?.('img[data-src], img[data-srcset]');
            childImages?.forEach(img => this.observeImage(img));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Adiciona uma imagem ao observer
   * @param {HTMLImageElement} img - Elemento de imagem
   */
  observeImage(img) {
    if (this.images.has(img) || this.loadedImages.has(img)) {
      return;
    }

    // Adiciona placeholder se não houver src
    if (!img.src && this.config.placeholderSrc) {
      img.src = this.config.placeholderSrc;
    }

    // Adiciona classe de loading
    img.classList.add(this.config.loadingClass);

    // Adiciona ao observer
    this.images.add(img);
    this.observer.observe(img);
  }

  /**
   * Manipula a interseção das imagens
   * @param {IntersectionObserverEntry[]} entries - Entradas do observer
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
      }
    });
  }

  /**
   * Carrega uma imagem específica
   * @param {HTMLImageElement} img - Elemento de imagem
   */
  loadImage(img) {
    if (this.loadedImages.has(img)) {
      return;
    }

    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    // Remove do observer
    this.observer.unobserve(img);
    this.images.delete(img);

    // Cria uma nova imagem para preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      this.onImageLoad(img, src, srcset);
    };
    
    imageLoader.onerror = () => {
      this.onImageError(img);
    };

    // Inicia o carregamento
    if (srcset) {
      imageLoader.srcset = srcset;
    }
    if (src) {
      imageLoader.src = src;
    }
  }

  /**
   * Manipula o sucesso no carregamento da imagem
   * @param {HTMLImageElement} img - Elemento de imagem
   * @param {string} src - URL da imagem
   * @param {string} srcset - Srcset da imagem
   */
  onImageLoad(img, src, srcset) {
    // Atualiza os atributos da imagem
    if (src) {
      img.src = src;
    }
    if (srcset) {
      img.srcset = srcset;
    }

    // Atualiza as classes
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.loadedClass);

    // Remove os data attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');

    // Adiciona à lista de carregadas
    this.loadedImages.add(img);

    // Dispara evento customizado
    img.dispatchEvent(new CustomEvent('lazyload', {
      detail: { src, srcset }
    }));
  }

  /**
   * Manipula erro no carregamento da imagem
   * @param {HTMLImageElement} img - Elemento de imagem
   */
  onImageError(img) {
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.errorClass);

    // Dispara evento de erro
    img.dispatchEvent(new CustomEvent('lazyerror', {
      detail: { 
        src: img.dataset.src,
        srcset: img.dataset.srcset
      }
    }));

    console.warn('Erro ao carregar imagem:', img.dataset.src || img.dataset.srcset);
  }

  /**
   * Carrega todas as imagens (fallback)
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
      img.classList.add(this.config.loadedClass);
    });
  }

  /**
   * Força o carregamento de uma imagem específica
   * @param {HTMLImageElement} img - Elemento de imagem
   */
  forceLoad(img) {
    if (this.images.has(img)) {
      this.loadImage(img);
    }
  }

  /**
   * Força o carregamento de todas as imagens pendentes
   */
  forceLoadAll() {
    const pendingImages = Array.from(this.images);
    pendingImages.forEach(img => this.loadImage(img));
  }

  /**
   * Destrói o lazy loader
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.images.clear();
    this.loadedImages.clear();
  }

  /**
   * Retorna estatísticas do lazy loading
   */
  getStats() {
    return {
      totalImages: this.images.size + this.loadedImages.size,
      loadedImages: this.loadedImages.size,
      pendingImages: this.images.size,
      loadedPercentage: this.loadedImages.size / (this.images.size + this.loadedImages.size) * 100
    };
  }
}

/**
 * Utilitários para conversão de imagens existentes
 */
export class ImageConverter {
  /**
   * Converte imagens existentes para lazy loading
   * @param {string} selector - Seletor das imagens
   * @param {Object} options - Opções de conversão
   */
  static convertToLazy(selector = 'img', options = {}) {
    const images = document.querySelectorAll(selector);
    const { 
      skipSmallImages = true, 
      minWidth = 100, 
      minHeight = 100,
      excludeClasses = ['no-lazy', 'eager-load']
    } = options;

    images.forEach(img => {
      // Pula imagens que já são lazy
      if (img.dataset.src || img.dataset.srcset) {
        return;
      }

      // Pula imagens com classes excluídas
      if (excludeClasses.some(cls => img.classList.contains(cls))) {
        return;
      }

      // Pula imagens pequenas se configurado
      if (skipSmallImages && (img.width < minWidth || img.height < minHeight)) {
        return;
      }

      // Converte para lazy loading
      if (img.src && img.src !== window.location.href) {
        img.dataset.src = img.src;
        img.src = DEFAULT_CONFIG.placeholderSrc;
      }

      if (img.srcset) {
        img.dataset.srcset = img.srcset;
        img.removeAttribute('srcset');
      }
    });
  }

  /**
   * Adiciona suporte a WebP com fallback
   * @param {HTMLImageElement} img - Elemento de imagem
   */
  static addWebPSupport(img) {
    if (!img.dataset.src) return;

    const originalSrc = img.dataset.src;
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Testa suporte a WebP
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = () => {
      if (webpTest.height === 2) {
        img.dataset.src = webpSrc;
      }
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }
}

// Instância global do lazy loader
let globalLazyLoader = null;

/**
 * Inicializa o lazy loading global
 * @param {Object} config - Configuração personalizada
 */
export function initLazyLoading(config = {}) {
  if (globalLazyLoader) {
    globalLazyLoader.destroy();
  }
  
  globalLazyLoader = new LazyImageManager(config);
  return globalLazyLoader;
}

/**
 * Obtém a instância global do lazy loader
 */
export function getLazyLoader() {
  return globalLazyLoader;
}

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initLazyLoading());
} else {
  initLazyLoading();
}

// Exporta as classes para uso direto
export { LazyImageManager, ImageConverter };