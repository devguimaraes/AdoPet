/**
 * Módulo de mensagens de contato
 * Gerencia o formulário de contato para adoção de animais
 */

// Constantes
const SELECTORS = {
  FORM: '[data-formulario-mensagem]',
  INPUTS: 'input, textarea, select',
  SUBMIT_BUTTON: '[type="submit"]'
};

const STORAGE_KEYS = {
  USER_DATA: 'DadosUsuario',
  MESSAGES: 'MensagensEnviadas'
};

const VALIDATION_RULES = {
  nome: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
    message: 'Nome deve conter apenas letras e ter pelo menos 2 caracteres'
  },
  telefone: {
    required: true,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
  },
  animal: {
    required: true,
    minLength: 2,
    message: 'Nome do animal é obrigatório'
  },
  mensagem: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Mensagem deve ter entre 10 e 500 caracteres'
  }
};

/**
 * Classe para gerenciar o formulário de mensagens
 */
class MessageForm {
  constructor() {
    this.form = document.querySelector(SELECTORS.FORM);
    this.inputs = this.form?.querySelectorAll(SELECTORS.INPUTS);
    this.submitButton = this.form?.querySelector(SELECTORS.SUBMIT_BUTTON);
    this.userData = this.getUserData();
    
    if (!this.form) {
      console.warn('Formulário de mensagem não encontrado');
      return;
    }
    
    this.init();
  }

  /**
   * Inicializa o formulário
   */
  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupPhoneMask();
    this.preloadUserData();
    this.setupAccessibility();
  }

  /**
   * Obtém dados do usuário do localStorage
   * @returns {Object} Dados do usuário
   */
  getUserData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA)) || {};
    } catch (error) {
      console.warn('Erro ao carregar dados do usuário:', error);
      return {};
    }
  }

  /**
   * Pré-carrega dados do usuário no formulário
   */
  preloadUserData() {
    if (this.userData.nome) {
      const nomeInput = this.form.querySelector('[name="nome"]');
      if (nomeInput && !nomeInput.value) {
        nomeInput.value = this.userData.nome;
      }
    }

    if (this.userData.telefone) {
      const telefoneInput = this.form.querySelector('[name="telefone"]');
      if (telefoneInput && !telefoneInput.value) {
        telefoneInput.value = this.userData.telefone;
      }
    }
  }

  /**
   * Configura validação dos campos
   */
  setupFormValidation() {
    this.inputs.forEach(input => {
      // Validação em tempo real
      input.addEventListener('input', () => {
        this.clearFieldError(input);
        
        // Debounce para validação
        clearTimeout(input.validationTimeout);
        input.validationTimeout = setTimeout(() => {
          this.validateField(input);
          this.updateSubmitButtonState();
        }, 300);
      });

      // Validação ao sair do campo
      input.addEventListener('blur', () => {
        this.validateField(input);
        this.updateSubmitButtonState();
      });

      // Limpar erros ao focar
      input.addEventListener('focus', () => {
        this.clearFieldError(input);
      });
    });
  }

  /**
   * Configura máscara para telefone
   */
  setupPhoneMask() {
    const telefoneInput = this.form.querySelector('[name="telefone"]');
    if (telefoneInput) {
      telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
          if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          }
          e.target.value = value;
        }
      });
    }
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} field - Campo a ser validado
   * @returns {boolean} True se válido
   */
  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = VALIDATION_RULES[fieldName];

    if (!rules) return true;

    // Campo obrigatório
    if (rules.required && !value) {
      this.showFieldError(field, `${this.getFieldLabel(field)} é obrigatório`);
      return false;
    }

    // Comprimento mínimo
    if (rules.minLength && value.length < rules.minLength) {
      this.showFieldError(field, rules.message);
      return false;
    }

    // Comprimento máximo
    if (rules.maxLength && value.length > rules.maxLength) {
      this.showFieldError(field, rules.message);
      return false;
    }

    // Padrão regex
    if (rules.pattern && value && !rules.pattern.test(value)) {
      this.showFieldError(field, rules.message);
      return false;
    }

    this.clearFieldError(field);
    return true;
  }

  /**
   * Obtém o label do campo
   * @param {HTMLElement} field - Campo
   * @returns {string} Label do campo
   */
  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
  }

  /**
   * Exibe erro no campo
   * @param {HTMLElement} field - Campo
   * @param {string} message - Mensagem de erro
   */
  showFieldError(field, message) {
    const container = field.closest('.input-container') || field.parentElement;
    container.classList.add('input-container--erro', 'error');
    
    // Remover mensagem anterior
    const existingError = container.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Adicionar nova mensagem
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    
    container.appendChild(errorElement);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', `${field.id}-error`);
    errorElement.id = `${field.id}-error`;
  }

  /**
   * Remove erro do campo
   * @param {HTMLElement} field - Campo
   */
  clearFieldError(field) {
    const container = field.closest('.input-container') || field.parentElement;
    container.classList.remove('input-container--erro', 'error');
    
    const errorElement = container.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }

    field.setAttribute('aria-invalid', 'false');
    field.removeAttribute('aria-describedby');
  }

  /**
   * Atualiza estado do botão de envio
   */
  updateSubmitButtonState() {
    if (!this.submitButton) return;

    const allFieldsValid = Array.from(this.inputs).every(input => {
      return this.validateField(input) && input.value.trim();
    });

    this.submitButton.disabled = !allFieldsValid;
    this.submitButton.setAttribute('aria-disabled', !allFieldsValid);
  }

  /**
   * Configura acessibilidade
   */
  setupAccessibility() {
    // Adicionar ARIA labels
    this.inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = this.form.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || `${input.id}-label`);
        }
      }
    });

    this.form.setAttribute('novalidate', 'true');
  }

  /**
   * Configura envio do formulário
   */
  setupFormSubmission() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit(event);
    });
  }

  /**
   * Manipula envio do formulário
   * @param {Event} event - Evento de submit
   */
  async handleSubmit(event) {
    // Validar todos os campos
    const isValid = this.validateAllFields();
    
    if (!isValid) {
      this.focusFirstInvalidField();
      return;
    }

    try {
      // Desabilitar botão durante envio
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Enviando...';
        this.submitButton.setAttribute('aria-busy', 'true');
      }

      const formData = this.getFormData(event.target);
      await this.sendMessage(formData);
      
      this.showSuccessMessage();
      this.saveMessageToHistory(formData);
      this.resetForm();
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      this.showErrorMessage('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      // Reabilitar botão
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'ENVIAR MENSAGEM';
        this.submitButton.setAttribute('aria-busy', 'false');
      }
    }
  }

  /**
   * Valida todos os campos
   * @returns {boolean} True se todos válidos
   */
  validateAllFields() {
    let isValid = true;
    
    this.inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Foca no primeiro campo inválido
   */
  focusFirstInvalidField() {
    const firstInvalidField = this.form.querySelector('.input-container--erro input, .input-container--erro textarea');
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
  }

  /**
   * Obtém dados do formulário
   * @param {HTMLFormElement} form - Formulário
   * @returns {Object} Dados do formulário
   */
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value.trim();
    }
    
    data.timestamp = new Date().toISOString();
    data.id = Date.now().toString();
    
    return data;
  }

  /**
   * Simula envio da mensagem
   * @param {Object} data - Dados da mensagem
   */
  async sendMessage(data) {
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aqui seria feita a integração com API real
    console.log('Mensagem enviada:', data);
  }

  /**
   * Salva mensagem no histórico
   * @param {Object} data - Dados da mensagem
   */
  saveMessageToHistory(data) {
    try {
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
      messages.push(data);
      
      // Manter apenas as últimas 50 mensagens
      if (messages.length > 50) {
        messages.splice(0, messages.length - 50);
      }
      
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.warn('Erro ao salvar mensagem no histórico:', error);
    }
  }

  /**
   * Exibe mensagem de sucesso
   */
  showSuccessMessage() {
    this.showNotification(
      'Mensagem enviada com sucesso! Em breve entraremos em contato.',
      'success'
    );
  }

  /**
   * Exibe mensagem de erro
   * @param {string} message - Mensagem de erro
   */
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Exibe notificação
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error)
   */
  showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Reseta o formulário
   */
  resetForm() {
    this.form.reset();
    
    // Limpar erros
    this.inputs.forEach(input => {
      this.clearFieldError(input);
    });
    
    // Recarregar dados do usuário
    setTimeout(() => {
      this.preloadUserData();
    }, 100);
  }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new MessageForm();
});

// Exportar para testes
export default MessageForm;
