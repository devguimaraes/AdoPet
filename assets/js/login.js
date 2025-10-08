/**
 * Módulo de autenticação de login
 * Gerencia o formulário de login e validação de campos
 */

import { verifica } from './verifica.js';
import { autenticaUsuario } from './autenticacaoUser.js';
import { debounce, memoryManager, domCache } from './performance.js';

// Seletores otimizados com cache
const form = domCache.querySelector('[data-form]');
const emailInput = domCache.querySelector('[data-email]');
const senhaInput = domCache.querySelector('[data-senha]');
const submitButton = domCache.querySelector('[data-submit]');
const errorMessage = domCache.querySelector('[data-error-message]');

/**
 * Classe para gerenciar o formulário de login
 */
class LoginForm {
    constructor() {
        this.form = form;
        this.emailInput = emailInput;
        this.senhaInput = senhaInput;
        this.submitButton = submitButton;
        this.errorMessage = errorMessage;
        
        // Debounced validation functions
        this.debouncedEmailValidation = debounce(this.validateEmail.bind(this), 300);
        this.debouncedPasswordValidation = debounce(this.validatePassword.bind(this), 300);
        
        this.init();
    }

    init() {
        this.setupValidation();
        this.setupFormSubmission();
        this.setupAccessibility();
    }

    /**
     * Configura validação dos campos de entrada
     */
    setupValidation() {
        if (!this.emailInput || !this.senhaInput) {
            console.warn('Campos de login não encontrados');
            return;
        }

        // Validação otimizada com debounce
        memoryManager.addEventListener(this.emailInput, 'blur', () => {
            this.validateEmail();
            this.updateSubmitButtonState();
        });

        memoryManager.addEventListener(this.emailInput, 'input', this.debouncedEmailValidation);

        memoryManager.addEventListener(this.senhaInput, 'blur', () => {
            this.validatePassword();
            this.updateSubmitButtonState();
        });

        memoryManager.addEventListener(this.senhaInput, 'input', this.debouncedPasswordValidation);

        // Limpar erros no focus
        memoryManager.addEventListener(this.emailInput, 'focus', () => {
            this.clearFieldError(this.emailInput);
        });

        memoryManager.addEventListener(this.senhaInput, 'focus', () => {
            this.clearFieldError(this.senhaInput);
        });
    }

    /**
     * Valida o campo de email
     */
    validateEmail() {
        if (this.emailInput.value.trim()) {
            verifica(this.emailInput);
        }
        this.updateSubmitButtonState();
    }

    /**
     * Valida o campo de senha
     */
    validatePassword() {
        if (this.senhaInput.value.trim()) {
            verifica(this.senhaInput);
        }
        this.updateSubmitButtonState();
    }

    /**
     * Limpa erro de um campo específico
     */
    clearFieldError(field) {
        const errorElement = field.parentElement.querySelector('.mensagem-erro');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        field.classList.remove('input--invalido');
        field.removeAttribute('aria-describedby');
    }

  /**
   * Configura o envio do formulário
   */
  setupFormSubmission() {
    this.form.addEventListener(EVENTS.SUBMIT, (event) => {
      event.preventDefault();
      
      // Validar todos os campos antes do envio
      const isValid = this.validateAllFields();
      
      if (isValid) {
        this.handleSubmit(event);
      } else {
        this.focusFirstInvalidField();
      }
    });
  }

  /**
   * Configura melhorias de acessibilidade
   */
  setupAccessibility() {
    // Adicionar ARIA labels se não existirem
    this.inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = this.form.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || `${input.id}-label`);
        }
      }
    });

    // Melhorar feedback de erro para leitores de tela
    this.form.setAttribute('novalidate', 'true'); // Desabilitar validação nativa do browser
  }

  /**
   * Valida todos os campos do formulário
   * @returns {boolean} True se todos os campos são válidos
   */
  validateAllFields() {
    let isValid = true;
    
    this.inputs.forEach(input => {
      const fieldValid = verifica(input);
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Foca no primeiro campo inválido
   */
  focusFirstInvalidField() {
    const firstInvalidField = this.form.querySelector('.input-container--erro input, .input-container.error input');
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
  }

  /**
   * Atualiza o estado do botão de envio baseado na validação
   */
  updateSubmitButtonState() {
    if (!this.submitButton) return;

    const allFieldsValid = Array.from(this.inputs).every(input => {
      const container = input.closest('.input-container');
      return container && !container.classList.contains('input-container--erro') && 
             !container.classList.contains('error') && input.value.trim();
    });

    this.submitButton.disabled = !allFieldsValid;
    this.submitButton.setAttribute('aria-disabled', !allFieldsValid);
  }

  /**
   * Manipula o envio do formulário
   * @param {Event} event - Evento de submit
   */
  async handleSubmit(event) {
    try {
      // Desabilitar botão durante o envio
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Entrando...';
        this.submitButton.setAttribute('aria-busy', 'true');
      }

      await autenticaUsuario(event);
    } catch (error) {
      console.error('Erro no login:', error);
      this.showError('Erro ao fazer login. Tente novamente.');
    } finally {
      // Reabilitar botão
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'ENTRAR';
        this.submitButton.setAttribute('aria-busy', 'false');
      }
    }
  }

  /**
   * Exibe mensagem de erro
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    // Remover mensagens de erro anteriores
    const existingError = this.form.querySelector('.form-error-message');
    if (existingError) {
      existingError.remove();
    }

    // Criar nova mensagem de erro
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');

    // Inserir no início do formulário
    this.form.insertBefore(errorElement, this.form.firstChild);

    // Remover após 5 segundos
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 5000);
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new LoginForm();
});

// Exportar para uso em testes
export default LoginForm;
