/**
 * Módulo de cadastro de usuários
 * Gerencia o formulário de cadastro com validação robusta
 */

import { FormValidator, setupValidation } from './verifica.js';
import { PasswordValidator } from './senha.js';
import { debounce, memoryManager, domCache, DOMOptimizer } from './performance.js';

// Constantes
const STORAGE_KEY = 'DadosUsuario';
const ROUTES = {
  LOGIN: '../../login.html',
  HOME: '../../home.html'
};

/**
 * Classe para gerenciar cadastro de usuários
 */
class UserRegistration {
  constructor() {
    this.form = domCache.querySelector('#formulario-cadastro');
    this.validator = new FormValidator();
    this.passwordValidator = new PasswordValidator();
    this.users = this.loadUsers();
    
    // Debounced validation functions
    this.debouncedValidation = debounce(this.validateField.bind(this), 300);
    this.debouncedEmailCheck = debounce(this.checkEmailExists.bind(this), 500);
    
    if (this.form) {
      this.init();
    }
  }

  /**
   * Inicializa o sistema de cadastro
   */
  init() {
    this.setupFormElements();
    this.setupValidation();
    this.setupEventListeners();
    this.setupPasswordValidation();
  }

  /**
   * Configura elementos do formulário com cache otimizado
   */
  setupFormElements() {
    this.inputs = {
      nome: domCache.querySelector('#nome'),
      email: domCache.querySelector('#email'),
      senha: domCache.querySelector('#senha'),
      senhaConfirm: domCache.querySelector('#senhaConfirm'),
      telefone: domCache.querySelector('#telefone')
    };

    this.submitButton = this.form.querySelector('button[type="submit"]');
    
    // Adicionar atributos de acessibilidade
    this.form.setAttribute('novalidate', 'true');
    
    // Configurar campos obrigatórios
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.setAttribute('required', 'true');
        input.setAttribute('aria-required', 'true');
      }
    });

    // Configurar padrões de validação
    if (this.inputs.email) {
      this.inputs.email.setAttribute('type', 'email');
      this.inputs.email.setAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
    }

    if (this.inputs.telefone) {
      this.inputs.telefone.setAttribute('type', 'tel');
      this.inputs.telefone.setAttribute('pattern', '\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}');
      this.inputs.telefone.setAttribute('placeholder', '(11) 99999-9999');
    }

    if (this.inputs.senha) {
      this.inputs.senha.setAttribute('minlength', '8');
    }
  }

  /**
   * Configura validação do formulário
   */
  setupValidation() {
    setupValidation(this.form, {
      validateOnBlur: true,
      validateOnInput: true,
      clearOnFocus: true,
      debounceTime: 300
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Submit do formulário
    this.form.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });

    // Validação de email único
    if (this.inputs.email) {
      this.inputs.email.addEventListener('blur', () => {
        this.validateUniqueEmail();
      });
    }

    // Máscara de telefone
    if (this.inputs.telefone) {
      this.inputs.telefone.addEventListener('input', (event) => {
        this.applyPhoneMask(event.target);
      });
    }

    // Validação de confirmação de senha
    if (this.inputs.senhaConfirm) {
      this.inputs.senhaConfirm.addEventListener('input', () => {
        this.validatePasswordConfirmation();
      });
    }

    // Atualizar estado do botão
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.updateSubmitButtonState();
        });
      }
    });
  }

  /**
   * Configura validação de senha
   */
  setupPasswordValidation() {
    if (this.inputs.senha) {
      this.passwordValidator.setupPasswordValidation(this.inputs.senha, {
        confirmPasswordField: this.inputs.senhaConfirm,
        showStrengthIndicator: true,
        realTimeValidation: true
      });
    }
  }

  /**
   * Carrega usuários do localStorage
   * @returns {Array} Lista de usuários
   */
  loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }

  /**
   * Salva usuários no localStorage
   * @param {Array} users - Lista de usuários
   */
  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      this.users = users;
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw new Error('Erro ao salvar dados do usuário');
    }
  }

  /**
   * Aplica máscara de telefone
   * @param {HTMLInputElement} input - Campo de telefone
   */
  applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1');
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
      } else if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    }
    
    input.value = value;
  }

  /**
   * Valida se email é único
   */
  validateUniqueEmail() {
    const email = this.inputs.email.value.toLowerCase().trim();
    
    if (!email) return;

    const emailExists = this.users.some(user => 
      user.email.toLowerCase() === email
    );

    if (emailExists) {
      this.validator.showError(
        this.inputs.email, 
        'Este email já está cadastrado. Faça login ou use outro email.'
      );
      return false;
    }

    return true;
  }

  /**
   * Valida confirmação de senha
   */
  validatePasswordConfirmation() {
    const senha = this.inputs.senha.value;
    const senhaConfirm = this.inputs.senhaConfirm.value;

    if (!senhaConfirm) return;

    if (senha !== senhaConfirm) {
      this.validator.showError(
        this.inputs.senhaConfirm,
        'As senhas não coincidem'
      );
      return false;
    } else {
      this.validator.clearError(this.inputs.senhaConfirm);
      return true;
    }
  }

  /**
   * Atualiza estado do botão de submit
   */
  updateSubmitButtonState() {
    if (!this.submitButton) return;

    const allFieldsFilled = Object.values(this.inputs).every(input => 
      !input || input.value.trim() !== ''
    );

    const hasErrors = this.form.querySelectorAll('.error--active, .field-error.active').length > 0;

    if (allFieldsFilled && !hasErrors) {
      this.submitButton.disabled = false;
      this.submitButton.classList.remove('button--disabled');
    } else {
      this.submitButton.disabled = true;
      this.submitButton.classList.add('button--disabled');
    }
  }

  /**
   * Valida todos os campos do formulário
   * @returns {boolean} True se todos válidos
   */
  validateAllFields() {
    const inputs = Object.values(this.inputs).filter(input => input);
    let allValid = true;

    // Validar cada campo
    inputs.forEach(input => {
      if (!this.validator.validateField(input)) {
        allValid = false;
      }
    });

    // Validações específicas
    if (!this.validateUniqueEmail()) {
      allValid = false;
    }

    if (!this.validatePasswordConfirmation()) {
      allValid = false;
    }

    // Validar força da senha
    if (this.inputs.senha && !this.passwordValidator.validatePassword(this.inputs.senha.value)) {
      allValid = false;
    }

    return allValid;
  }

  /**
   * Gera ID único para usuário
   * @returns {string} ID único
   */
  generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Cria objeto de usuário
   * @returns {Object} Dados do usuário
   */
  createUserObject() {
    return {
      id: this.generateUserId(),
      nome: this.inputs.nome.value.trim(),
      email: this.inputs.email.value.toLowerCase().trim(),
      telefone: this.inputs.telefone.value.trim(),
      senha: this.inputs.senha.value,
      dataCadastro: new Date().toISOString(),
      ativo: true
    };
  }

  /**
   * Exibe notificação
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, info)
   */
  showNotification(message, type = 'info') {
    // Tentar usar sistema de notificação existente
    const existingNotification = document.querySelector('.notification, .alert, .toast');
    
    if (existingNotification) {
      existingNotification.textContent = message;
      existingNotification.className = `notification notification--${type}`;
      existingNotification.style.display = 'block';
      
      setTimeout(() => {
        existingNotification.style.display = 'none';
      }, 5000);
      
      return;
    }

    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = `registration-notification registration-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background-color: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Manipula submit do formulário
   * @param {Event} event - Evento de submit
   */
  async handleSubmit(event) {
    event.preventDefault();

    try {
      // Desabilitar botão durante processamento
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Cadastrando...';
      }

      // Validar todos os campos
      if (!this.validateAllFields()) {
        // Focar no primeiro campo com erro
        const firstError = this.form.querySelector('.input--error, [aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
        }
        throw new Error('Por favor, corrija os erros no formulário');
      }

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar usuário
      const newUser = this.createUserObject();
      
      // Adicionar à lista de usuários
      const updatedUsers = [...this.users, newUser];
      this.saveUsers(updatedUsers);

      // Sucesso
      this.showNotification(
        `Cadastro realizado com sucesso! Bem-vindo(a), ${newUser.nome}!`,
        'success'
      );

      // Limpar formulário
      this.form.reset();

      // Redirecionar para login após delay
      setTimeout(() => {
        window.location.replace(ROUTES.LOGIN);
      }, 2000);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      this.showNotification(error.message, 'error');
    } finally {
      // Reabilitar botão
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Cadastrar';
      }
    }
  }

  /**
   * Limpa todos os erros do formulário
   */
  clearAllErrors() {
    Object.values(this.inputs).forEach(input => {
      if (input) {
        this.validator.clearError(input);
      }
    });
  }

  /**
   * Reseta o formulário
   */
  resetForm() {
    this.form.reset();
    this.clearAllErrors();
    this.updateSubmitButtonState();
  }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new UserRegistration();
});

// Exportar para uso em outros módulos
export default UserRegistration;
