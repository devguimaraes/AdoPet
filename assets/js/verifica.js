/**
 * Módulo de validação de formulários
 * Fornece funções para validar campos e exibir mensagens de erro
 */

// Constantes para tipos de validação
const VALIDATION_TYPES = {
  EMAIL: 'email',
  PASSWORD: 'password',
  TEXT: 'text',
  PHONE: 'phone',
  REQUIRED: 'required'
};

// Mensagens de erro padrão
const ERROR_MESSAGES = {
  valueMissing: {
    email: 'O campo e-mail é obrigatório',
    password: 'O campo senha é obrigatório',
    text: 'Este campo é obrigatório',
    phone: 'O campo telefone é obrigatório',
    default: 'Este campo é obrigatório'
  },
  patternMismatch: {
    email: 'Por favor, insira um e-mail válido',
    password: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números',
    phone: 'Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX',
    default: 'Formato inválido'
  },
  tooShort: {
    password: 'A senha deve ter pelo menos 8 caracteres',
    text: 'Este campo deve ter pelo menos {minLength} caracteres',
    default: 'Muito curto'
  },
  tooLong: {
    default: 'Muito longo'
  },
  typeMismatch: {
    email: 'Por favor, insira um e-mail válido',
    default: 'Tipo inválido'
  }
};

/**
 * Classe para gerenciar validação de formulários
 */
class FormValidator {
  constructor() {
    this.errorSelectors = [
      '[data-error]',
      '.error-message',
      '.field-error'
    ];
  }

  /**
   * Obtém o tipo do campo baseado em seus atributos
   * @param {HTMLElement} element - Elemento a ser analisado
   * @returns {string} Tipo do campo
   */
  getFieldType(element) {
    if (element.type === 'email') return VALIDATION_TYPES.EMAIL;
    if (element.type === 'password') return VALIDATION_TYPES.PASSWORD;
    if (element.type === 'tel' || element.name === 'telefone') return VALIDATION_TYPES.PHONE;
    return VALIDATION_TYPES.TEXT;
  }

  /**
   * Obtém a mensagem de erro apropriada
   * @param {HTMLElement} element - Elemento com erro
   * @param {string} validityType - Tipo de erro de validação
   * @returns {string} Mensagem de erro
   */
  getErrorMessage(element, validityType) {
    const fieldType = this.getFieldType(element);
    const messages = ERROR_MESSAGES[validityType];
    
    if (!messages) return 'Campo inválido';
    
    let message = messages[fieldType] || messages.default;
    
    // Substituir placeholders
    if (validityType === 'tooShort' && element.minLength) {
      message = message.replace('{minLength}', element.minLength);
    }
    
    return message;
  }

  /**
   * Encontra o elemento de erro associado ao campo
   * @param {HTMLElement} element - Campo de entrada
   * @returns {HTMLElement|null} Elemento de erro
   */
  findErrorElement(element) {
    const container = element.closest('.input-container, .form-group, .field-container');
    
    if (container) {
      // Procurar dentro do container
      for (const selector of this.errorSelectors) {
        const errorElement = container.querySelector(selector);
        if (errorElement) return errorElement;
      }
    }
    
    // Procurar por ID específico
    const errorById = document.querySelector(`#${element.id}-error`);
    if (errorById) return errorById;
    
    // Procurar por data-error global (fallback)
    return document.querySelector('[data-error]');
  }

  /**
   * Cria um elemento de erro se não existir
   * @param {HTMLElement} element - Campo de entrada
   * @returns {HTMLElement} Elemento de erro
   */
  createErrorElement(element) {
    const container = element.closest('.input-container, .form-group, .field-container') || element.parentElement;
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message field-error';
    errorElement.id = `${element.id}-error`;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    
    container.appendChild(errorElement);
    
    // Associar com o campo para acessibilidade
    element.setAttribute('aria-describedby', errorElement.id);
    
    return errorElement;
  }

  /**
   * Exibe mensagem de erro
   * @param {HTMLElement} element - Campo com erro
   * @param {string} message - Mensagem de erro
   */
  showError(element, message) {
    let errorElement = this.findErrorElement(element);
    
    if (!errorElement) {
      errorElement = this.createErrorElement(element);
    }
    
    // Atualizar classes do container
    const container = element.closest('.input-container, .form-group, .field-container');
    if (container) {
      container.classList.add('input-container--erro', 'error', 'has-error');
    }
    
    // Atualizar elemento de erro
    errorElement.classList.add('error--active', 'active');
    errorElement.textContent = message;
    
    // Atualizar atributos de acessibilidade
    element.setAttribute('aria-invalid', 'true');
    
    // Adicionar classe de erro ao próprio campo
    element.classList.add('input--error', 'error');
  }

  /**
   * Remove mensagem de erro
   * @param {HTMLElement} element - Campo a limpar
   */
  clearError(element) {
    const errorElement = this.findErrorElement(element);
    
    if (errorElement) {
      errorElement.classList.remove('error--active', 'active');
      errorElement.textContent = '';
    }
    
    // Remover classes do container
    const container = element.closest('.input-container, .form-group, .field-container');
    if (container) {
      container.classList.remove('input-container--erro', 'error', 'has-error');
    }
    
    // Atualizar atributos de acessibilidade
    element.setAttribute('aria-invalid', 'false');
    
    // Remover classe de erro do campo
    element.classList.remove('input--error', 'error');
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} element - Campo a ser validado
   * @returns {boolean} True se válido, false se inválido
   */
  validateField(element) {
    if (!element || !element.validity) {
      console.warn('Elemento inválido para validação:', element);
      return true;
    }

    // Limpar erros anteriores
    this.clearError(element);

    // Verificar se o campo é válido
    if (element.validity.valid) {
      return true;
    }

    // Determinar tipo de erro e exibir mensagem apropriada
    const validity = element.validity;
    let errorType = '';
    
    if (validity.valueMissing) errorType = 'valueMissing';
    else if (validity.patternMismatch) errorType = 'patternMismatch';
    else if (validity.tooShort) errorType = 'tooShort';
    else if (validity.tooLong) errorType = 'tooLong';
    else if (validity.typeMismatch) errorType = 'typeMismatch';
    else errorType = 'default';

    const message = this.getErrorMessage(element, errorType);
    this.showError(element, message);
    
    return false;
  }

  /**
   * Valida múltiplos campos
   * @param {NodeList|Array} elements - Lista de elementos a validar
   * @returns {boolean} True se todos válidos
   */
  validateFields(elements) {
    let allValid = true;
    
    elements.forEach(element => {
      if (!this.validateField(element)) {
        allValid = false;
      }
    });
    
    return allValid;
  }

  /**
   * Configura validação automática para um formulário
   * @param {HTMLFormElement} form - Formulário
   * @param {Object} options - Opções de configuração
   */
  setupFormValidation(form, options = {}) {
    const {
      validateOnBlur = true,
      validateOnInput = false,
      clearOnFocus = true,
      debounceTime = 300
    } = options;

    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (validateOnBlur) {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      }
      
      if (validateOnInput) {
        input.addEventListener('input', () => {
          clearTimeout(input.validationTimeout);
          input.validationTimeout = setTimeout(() => {
            if (input.value.trim()) {
              this.validateField(input);
            }
          }, debounceTime);
        });
      }
      
      if (clearOnFocus) {
        input.addEventListener('focus', () => {
          this.clearError(input);
        });
      }
    });
  }
}

// Instância global do validador
const validator = new FormValidator();

/**
 * Função de validação (compatibilidade com código existente)
 * @param {HTMLElement} elemento - Campo a ser validado
 * @returns {boolean} True se válido
 */
export const verifica = (elemento) => {
  return validator.validateField(elemento);
};

/**
 * Função para limpar erros (compatibilidade com código existente)
 * @param {HTMLElement} elemento - Campo a limpar
 */
export const limparInput = (elemento) => {
  validator.clearError(elemento);
};

/**
 * Função para exibir erro customizado
 * @param {HTMLElement} elemento - Campo
 * @param {string} mensagem - Mensagem de erro
 */
export const informaErro = (elemento, mensagem) => {
  if (typeof elemento === 'string') {
    // Compatibilidade com código antigo que passava apenas a mensagem
    const errorElement = document.querySelector('[data-error]');
    if (errorElement) {
      errorElement.classList.add('error--active');
      errorElement.textContent = elemento; // elemento é a mensagem neste caso
    }
  } else {
    validator.showError(elemento, mensagem);
  }
};

/**
 * Validador de formulários (nova API)
 */
export const FormValidator = validator;

/**
 * Função para configurar validação automática
 * @param {HTMLFormElement} form - Formulário
 * @param {Object} options - Opções
 */
export const setupValidation = (form, options) => {
  return validator.setupFormValidation(form, options);
};

/**
 * Função para validar múltiplos campos
 * @param {NodeList|Array} elements - Elementos
 * @returns {boolean} True se todos válidos
 */
export const validateAll = (elements) => {
  return validator.validateFields(elements);
};

// Exportação padrão para compatibilidade
export default {
  verifica,
  limparInput,
  informaErro,
  FormValidator: validator,
  setupValidation,
  validateAll
};
