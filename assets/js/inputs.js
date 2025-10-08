/**
 * Módulo de utilitários para inputs e validação de formulários
 * Fornece funções para validação, formatação e manipulação de campos de entrada
 */

// Constantes para tipos de validação
const VALIDATION_TYPES = {
  REQUIRED: 'valueMissing',
  PATTERN: 'patternMismatch',
  MIN_LENGTH: 'tooShort',
  MAX_LENGTH: 'tooLong',
  MIN: 'rangeUnderflow',
  MAX: 'rangeOverflow',
  STEP: 'stepMismatch',
  TYPE: 'typeMismatch'
};

// Mensagens de erro padrão
const DEFAULT_ERROR_MESSAGES = {
  [VALIDATION_TYPES.REQUIRED]: 'Este campo é obrigatório',
  [VALIDATION_TYPES.PATTERN]: 'Formato inválido',
  [VALIDATION_TYPES.MIN_LENGTH]: 'Muito curto',
  [VALIDATION_TYPES.MAX_LENGTH]: 'Muito longo',
  [VALIDATION_TYPES.MIN]: 'Valor muito baixo',
  [VALIDATION_TYPES.MAX]: 'Valor muito alto',
  [VALIDATION_TYPES.STEP]: 'Valor inválido',
  [VALIDATION_TYPES.TYPE]: 'Tipo inválido'
};

// Mensagens específicas por tipo de campo
const FIELD_SPECIFIC_MESSAGES = {
  email: {
    [VALIDATION_TYPES.PATTERN]: 'Por favor, digite um e-mail no formato válido',
    [VALIDATION_TYPES.TYPE]: 'Por favor, digite um e-mail válido'
  },
  password: {
    [VALIDATION_TYPES.MIN_LENGTH]: 'A senha deve ter pelo menos 8 caracteres',
    [VALIDATION_TYPES.PATTERN]: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
  },
  tel: {
    [VALIDATION_TYPES.PATTERN]: 'Por favor, digite um telefone no formato válido',
    [VALIDATION_TYPES.MIN_LENGTH]: 'Telefone deve ter pelo menos 10 dígitos'
  },
  text: {
    [VALIDATION_TYPES.MIN_LENGTH]: 'Deve ter pelo menos {minlength} caracteres',
    [VALIDATION_TYPES.MAX_LENGTH]: 'Deve ter no máximo {maxlength} caracteres'
  },
  number: {
    [VALIDATION_TYPES.MIN]: 'Valor deve ser pelo menos {min}',
    [VALIDATION_TYPES.MAX]: 'Valor deve ser no máximo {max}'
  }
};

/**
 * Classe para gerenciar inputs e validação
 */
class InputManager {
  constructor() {
    this.activeInputs = new Map();
    this.validators = new Map();
    this.formatters = new Map();
    
    this.setupDefaultFormatters();
  }

  /**
   * Configura formatadores padrão
   */
  setupDefaultFormatters() {
    // Formatador de telefone
    this.addFormatter('tel', (value) => {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    });

    // Formatador de CPF
    this.addFormatter('cpf', (value) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    });

    // Formatador de CEP
    this.addFormatter('cep', (value) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    });
  }

  /**
   * Adiciona um formatador personalizado
   * @param {string} type - Tipo do campo
   * @param {Function} formatter - Função formatadora
   */
  addFormatter(type, formatter) {
    this.formatters.set(type, formatter);
  }

  /**
   * Adiciona um validador personalizado
   * @param {string} name - Nome do validador
   * @param {Function} validator - Função validadora
   */
  addValidator(name, validator) {
    this.validators.set(name, validator);
  }

  /**
   * Obtém a mensagem de erro apropriada
   * @param {HTMLElement} element - Elemento do input
   * @param {string} validationType - Tipo de validação
   * @returns {string} Mensagem de erro
   */
  getErrorMessage(element, validationType) {
    const fieldType = element.type || 'text';
    const fieldName = element.name || element.id || 'campo';
    
    // Verificar mensagem personalizada no atributo data
    const customMessage = element.dataset[`error${validationType.charAt(0).toUpperCase() + validationType.slice(1)}`];
    if (customMessage) {
      return customMessage;
    }

    // Verificar mensagens específicas do tipo de campo
    const fieldMessages = FIELD_SPECIFIC_MESSAGES[fieldType];
    if (fieldMessages && fieldMessages[validationType]) {
      let message = fieldMessages[validationType];
      
      // Substituir placeholders
      message = message.replace('{minlength}', element.minLength);
      message = message.replace('{maxlength}', element.maxLength);
      message = message.replace('{min}', element.min);
      message = message.replace('{max}', element.max);
      
      return message;
    }

    // Usar mensagem padrão
    return DEFAULT_ERROR_MESSAGES[validationType] || 'Campo inválido';
  }

  /**
   * Encontra ou cria elemento de erro
   * @param {HTMLElement} element - Elemento do input
   * @param {string} dataAttribute - Atributo data para encontrar o erro
   * @returns {HTMLElement} Elemento de erro
   */
  getErrorElement(element, dataAttribute) {
    // Tentar encontrar por atributo data
    let errorElement = document.querySelector(`[${dataAttribute}]`);
    
    if (!errorElement) {
      // Tentar encontrar por ID padrão
      const errorId = `${element.id || element.name}-error`;
      errorElement = document.getElementById(errorId);
    }

    if (!errorElement) {
      // Criar elemento de erro
      errorElement = document.createElement('span');
      errorElement.className = 'input-error';
      errorElement.id = `${element.id || element.name}-error`;
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      
      // Inserir após o input
      element.parentNode.insertBefore(errorElement, element.nextSibling);
    }

    return errorElement;
  }

  /**
   * Exibe erro no input
   * @param {HTMLElement} element - Elemento do input
   * @param {string} dataAttribute - Atributo data para encontrar o erro
   * @param {string} message - Mensagem de erro (opcional)
   */
  showError(element, dataAttribute, message = null) {
    const errorElement = this.getErrorElement(element, dataAttribute);
    
    if (!message) {
      // Determinar tipo de erro
      const validity = element.validity;
      let validationType = null;
      
      for (const [type, key] of Object.entries(VALIDATION_TYPES)) {
        if (validity[key]) {
          validationType = key;
          break;
        }
      }
      
      if (validationType) {
        message = this.getErrorMessage(element, validationType);
      } else {
        message = 'Campo inválido';
      }
    }

    // Exibir erro
    errorElement.textContent = message;
    errorElement.classList.add('erroAtivo');
    
    // Adicionar classe de erro no input
    element.classList.add('input-error-state');
    element.setAttribute('aria-invalid', 'true');
    element.setAttribute('aria-describedby', errorElement.id);
  }

  /**
   * Limpa erro do input
   * @param {HTMLElement} element - Elemento do input
   * @param {string} dataAttribute - Atributo data para encontrar o erro
   */
  clearError(element, dataAttribute) {
    const errorElement = this.getErrorElement(element, dataAttribute);
    
    // Limpar erro
    errorElement.textContent = '';
    errorElement.classList.remove('erroAtivo');
    
    // Remover classe de erro do input
    element.classList.remove('input-error-state');
    element.setAttribute('aria-invalid', 'false');
    element.removeAttribute('aria-describedby');
  }

  /**
   * Valida um input específico
   * @param {HTMLElement} element - Elemento do input
   * @param {string} dataAttribute - Atributo data para encontrar o erro
   * @returns {boolean} True se válido
   */
  validateInput(element, dataAttribute) {
    if (!element) return false;

    // Executar validadores personalizados
    const customValidator = element.dataset.validator;
    if (customValidator && this.validators.has(customValidator)) {
      const validator = this.validators.get(customValidator);
      const result = validator(element.value, element);
      
      if (!result.valid) {
        this.showError(element, dataAttribute, result.message);
        return false;
      }
    }

    // Validação HTML5
    if (!element.validity.valid) {
      this.showError(element, dataAttribute);
      return false;
    }

    // Limpar erro se válido
    this.clearError(element, dataAttribute);
    return true;
  }

  /**
   * Aplica formatação ao valor do input
   * @param {HTMLElement} element - Elemento do input
   */
  formatInput(element) {
    const formatType = element.dataset.format || element.type;
    const formatter = this.formatters.get(formatType);
    
    if (formatter && element.value) {
      const cursorPosition = element.selectionStart;
      const oldValue = element.value;
      const newValue = formatter(element.value);
      
      if (newValue !== oldValue) {
        element.value = newValue;
        
        // Ajustar posição do cursor
        const diff = newValue.length - oldValue.length;
        element.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
      }
    }
  }

  /**
   * Configura um input para validação automática
   * @param {HTMLElement} element - Elemento do input
   * @param {Object} options - Opções de configuração
   */
  setupInput(element, options = {}) {
    const {
      validateOnBlur = true,
      validateOnInput = false,
      clearOnFocus = true,
      formatOnInput = true,
      debounceTime = 300
    } = options;

    const dataAttribute = element.dataset.inputsCadastro || 
                         element.dataset.tipo || 
                         `data-${element.name || element.id}-error`;

    // Armazenar configuração
    this.activeInputs.set(element, { dataAttribute, options });

    // Event listeners
    if (validateOnBlur) {
      element.addEventListener('blur', () => {
        this.validateInput(element, dataAttribute);
      });
    }

    if (clearOnFocus) {
      element.addEventListener('focus', () => {
        this.clearError(element, dataAttribute);
      });
    }

    if (validateOnInput) {
      let debounceTimer;
      element.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.validateInput(element, dataAttribute);
        }, debounceTime);
      });
    }

    if (formatOnInput) {
      element.addEventListener('input', () => {
        this.formatInput(element);
      });
    }
  }

  /**
   * Configura todos os inputs de um formulário
   * @param {HTMLElement} form - Elemento do formulário
   * @param {Object} options - Opções de configuração
   */
  setupForm(form, options = {}) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Pular inputs que não precisam de validação
      if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden') {
        return;
      }
      
      this.setupInput(input, options);
    });
  }

  /**
   * Valida todos os inputs de um formulário
   * @param {HTMLElement} form - Elemento do formulário
   * @returns {boolean} True se todos são válidos
   */
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    let firstInvalidInput = null;

    inputs.forEach(input => {
      if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden') {
        return;
      }

      const inputConfig = this.activeInputs.get(input);
      if (inputConfig) {
        const valid = this.validateInput(input, inputConfig.dataAttribute);
        if (!valid && !firstInvalidInput) {
          firstInvalidInput = input;
        }
        isValid = isValid && valid;
      }
    });

    // Focar no primeiro campo inválido
    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }

    return isValid;
  }

  /**
   * Limpa todos os erros de um formulário
   * @param {HTMLElement} form - Elemento do formulário
   */
  clearFormErrors(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const inputConfig = this.activeInputs.get(input);
      if (inputConfig) {
        this.clearError(input, inputConfig.dataAttribute);
      }
    });
  }

  /**
   * Remove configuração de um input
   * @param {HTMLElement} element - Elemento do input
   */
  removeInput(element) {
    this.activeInputs.delete(element);
  }

  /**
   * Limpa todas as configurações
   */
  clear() {
    this.activeInputs.clear();
  }
}

// Funções legacy para compatibilidade
const inputVazio = (elemento, datainput) => {
  const inputManager = new InputManager();
  inputManager.showError(elemento, datainput);
};

const limparInputs = (elemento, datainput) => {
  const inputManager = new InputManager();
  inputManager.clearError(elemento, datainput);
};

// Instância global
const inputManager = new InputManager();

// Exportações
export { 
  InputManager, 
  inputManager, 
  inputVazio, 
  limparInputs,
  VALIDATION_TYPES,
  DEFAULT_ERROR_MESSAGES,
  FIELD_SPECIFIC_MESSAGES
};
