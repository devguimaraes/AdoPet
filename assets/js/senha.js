/**
 * Módulo de validação de senhas
 * Gerencia validação de força de senha e confirmação
 */

// Constantes para validação de senha
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const PASSWORD_MESSAGES = {
  tooShort: `A senha deve ter pelo menos ${PASSWORD_RULES.minLength} caracteres`,
  tooLong: `A senha deve ter no máximo ${PASSWORD_RULES.maxLength} caracteres`,
  noUppercase: 'A senha deve conter pelo menos uma letra maiúscula',
  noLowercase: 'A senha deve conter pelo menos uma letra minúscula',
  noNumbers: 'A senha deve conter pelo menos um número',
  noSpecialChars: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)',
  mismatch: 'As senhas não coincidem',
  weak: 'Senha muito fraca',
  fair: 'Senha fraca',
  good: 'Senha boa',
  strong: 'Senha forte',
  excellent: 'Senha excelente'
};

/**
 * Classe para validação de senhas
 */
class PasswordValidator {
  constructor() {
    this.strengthIndicators = new Map();
  }

  /**
   * Valida força da senha
   * @param {string} password - Senha a ser validada
   * @returns {Object} Resultado da validação
   */
  validatePassword(password) {
    const errors = [];
    let score = 0;

    // Verificar comprimento
    if (password.length < PASSWORD_RULES.minLength) {
      errors.push(PASSWORD_MESSAGES.tooShort);
    } else if (password.length >= PASSWORD_RULES.minLength) {
      score += 1;
    }

    if (password.length > PASSWORD_RULES.maxLength) {
      errors.push(PASSWORD_MESSAGES.tooLong);
    }

    // Verificar maiúsculas
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push(PASSWORD_MESSAGES.noUppercase);
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Verificar minúsculas
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
      errors.push(PASSWORD_MESSAGES.noLowercase);
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Verificar números
    if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
      errors.push(PASSWORD_MESSAGES.noNumbers);
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Verificar caracteres especiais
    const specialCharsRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (PASSWORD_RULES.requireSpecialChars && !specialCharsRegex.test(password)) {
      errors.push(PASSWORD_MESSAGES.noSpecialChars);
    } else if (specialCharsRegex.test(password)) {
      score += 1;
    }

    // Bonificações por complexidade
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[A-Z].*[A-Z]/.test(password)) score += 0.5; // Múltiplas maiúsculas
    if (/\d.*\d/.test(password)) score += 0.5; // Múltiplos números
    if ((password.match(specialCharsRegex) || []).length >= 2) score += 0.5; // Múltiplos especiais

    // Penalidades por padrões comuns
    if (/(.)\1{2,}/.test(password)) score -= 1; // Caracteres repetidos
    if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 1; // Sequências comuns
    if (/password|123456|qwerty|admin/i.test(password)) score -= 2; // Senhas comuns

    // Determinar nível de força
    let strength = 'weak';
    let strengthMessage = PASSWORD_MESSAGES.weak;

    if (score >= 7) {
      strength = 'excellent';
      strengthMessage = PASSWORD_MESSAGES.excellent;
    } else if (score >= 5.5) {
      strength = 'strong';
      strengthMessage = PASSWORD_MESSAGES.strong;
    } else if (score >= 4) {
      strength = 'good';
      strengthMessage = PASSWORD_MESSAGES.good;
    } else if (score >= 2.5) {
      strength = 'fair';
      strengthMessage = PASSWORD_MESSAGES.fair;
    }

    return {
      isValid: errors.length === 0 && score >= 2.5,
      errors,
      score,
      strength,
      strengthMessage,
      percentage: Math.min(100, Math.max(0, (score / 7) * 100))
    };
  }

  /**
   * Valida confirmação de senha
   * @param {string} password - Senha original
   * @param {string} confirmPassword - Confirmação da senha
   * @returns {Object} Resultado da validação
   */
  validatePasswordConfirmation(password, confirmPassword) {
    const isValid = password === confirmPassword && password.length > 0;
    
    return {
      isValid,
      error: !isValid && confirmPassword.length > 0 ? PASSWORD_MESSAGES.mismatch : null
    };
  }

  /**
   * Cria indicador visual de força da senha
   * @param {HTMLElement} passwordField - Campo de senha
   * @param {Object} options - Opções de configuração
   */
  createStrengthIndicator(passwordField, options = {}) {
    const {
      showText = true,
      showBar = true,
      showRequirements = true,
      container = null
    } = options;

    const fieldId = passwordField.id || `password-${Date.now()}`;
    const indicatorId = `${fieldId}-strength`;

    // Remover indicador existente
    this.removeStrengthIndicator(fieldId);

    // Criar container do indicador
    const indicator = document.createElement('div');
    indicator.id = indicatorId;
    indicator.className = 'password-strength-indicator';
    indicator.setAttribute('aria-live', 'polite');

    // Barra de força
    if (showBar) {
      const strengthBar = document.createElement('div');
      strengthBar.className = 'password-strength-bar';
      strengthBar.innerHTML = `
        <div class="password-strength-bar__fill" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      `;
      indicator.appendChild(strengthBar);
    }

    // Texto de força
    if (showText) {
      const strengthText = document.createElement('div');
      strengthText.className = 'password-strength-text';
      strengthText.setAttribute('aria-label', 'Força da senha');
      indicator.appendChild(strengthText);
    }

    // Lista de requisitos
    if (showRequirements) {
      const requirements = document.createElement('ul');
      requirements.className = 'password-requirements';
      requirements.innerHTML = `
        <li class="password-requirement" data-rule="length">
          <span class="requirement-icon">✗</span>
          Pelo menos ${PASSWORD_RULES.minLength} caracteres
        </li>
        <li class="password-requirement" data-rule="uppercase">
          <span class="requirement-icon">✗</span>
          Uma letra maiúscula
        </li>
        <li class="password-requirement" data-rule="lowercase">
          <span class="requirement-icon">✗</span>
          Uma letra minúscula
        </li>
        <li class="password-requirement" data-rule="number">
          <span class="requirement-icon">✗</span>
          Um número
        </li>
        <li class="password-requirement" data-rule="special">
          <span class="requirement-icon">✗</span>
          Um caractere especial
        </li>
      `;
      indicator.appendChild(requirements);
    }

    // Inserir no DOM
    const targetContainer = container || passwordField.parentNode;
    targetContainer.insertBefore(indicator, passwordField.nextSibling);

    // Armazenar referência
    this.strengthIndicators.set(fieldId, {
      element: indicator,
      passwordField,
      options
    });

    return indicator;
  }

  /**
   * Atualiza indicador de força da senha
   * @param {string} fieldId - ID do campo de senha
   * @param {string} password - Senha atual
   */
  updateStrengthIndicator(fieldId, password) {
    const indicator = this.strengthIndicators.get(fieldId);
    if (!indicator) return;

    const validation = this.validatePassword(password);
    const { element, options } = indicator;

    // Atualizar barra de força
    if (options.showBar !== false) {
      const bar = element.querySelector('.password-strength-bar__fill');
      if (bar) {
        bar.style.width = `${validation.percentage}%`;
        bar.setAttribute('aria-valuenow', validation.percentage);
        bar.className = `password-strength-bar__fill password-strength-bar__fill--${validation.strength}`;
      }
    }

    // Atualizar texto de força
    if (options.showText !== false) {
      const text = element.querySelector('.password-strength-text');
      if (text) {
        text.textContent = password ? validation.strengthMessage : '';
        text.className = `password-strength-text password-strength-text--${validation.strength}`;
      }
    }

    // Atualizar requisitos
    if (options.showRequirements !== false) {
      this.updateRequirements(element, password);
    }
  }

  /**
   * Atualiza lista de requisitos
   * @param {HTMLElement} indicator - Elemento indicador
   * @param {string} password - Senha atual
   */
  updateRequirements(indicator, password) {
    const requirements = indicator.querySelectorAll('.password-requirement');
    
    requirements.forEach(req => {
      const rule = req.dataset.rule;
      const icon = req.querySelector('.requirement-icon');
      let isMet = false;

      switch (rule) {
        case 'length':
          isMet = password.length >= PASSWORD_RULES.minLength;
          break;
        case 'uppercase':
          isMet = /[A-Z]/.test(password);
          break;
        case 'lowercase':
          isMet = /[a-z]/.test(password);
          break;
        case 'number':
          isMet = /\d/.test(password);
          break;
        case 'special':
          const specialRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
          isMet = specialRegex.test(password);
          break;
      }

      if (isMet) {
        req.classList.add('password-requirement--met');
        icon.textContent = '✓';
        icon.setAttribute('aria-label', 'Requisito atendido');
      } else {
        req.classList.remove('password-requirement--met');
        icon.textContent = '✗';
        icon.setAttribute('aria-label', 'Requisito não atendido');
      }
    });
  }

  /**
   * Remove indicador de força da senha
   * @param {string} fieldId - ID do campo de senha
   */
  removeStrengthIndicator(fieldId) {
    const indicator = this.strengthIndicators.get(fieldId);
    if (indicator && indicator.element.parentNode) {
      indicator.element.parentNode.removeChild(indicator.element);
      this.strengthIndicators.delete(fieldId);
    }
  }

  /**
   * Configura validação automática de senha
   * @param {HTMLElement} passwordField - Campo de senha
   * @param {Object} options - Opções de configuração
   */
  setupPasswordValidation(passwordField, options = {}) {
    const {
      confirmPasswordField = null,
      showStrengthIndicator = true,
      realTimeValidation = true,
      debounceTime = 300
    } = options;

    const fieldId = passwordField.id || `password-${Date.now()}`;
    
    // Criar indicador de força
    if (showStrengthIndicator) {
      this.createStrengthIndicator(passwordField, options);
    }

    // Configurar validação em tempo real
    if (realTimeValidation) {
      let debounceTimer;

      passwordField.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const password = passwordField.value;
          
          // Atualizar indicador de força
          if (showStrengthIndicator) {
            this.updateStrengthIndicator(fieldId, password);
          }

          // Validar confirmação se campo fornecido
          if (confirmPasswordField) {
            this.validateAndShowConfirmation(passwordField, confirmPasswordField);
          }
        }, debounceTime);
      });
    }

    // Configurar validação de confirmação
    if (confirmPasswordField) {
      confirmPasswordField.addEventListener('input', () => {
        this.validateAndShowConfirmation(passwordField, confirmPasswordField);
      });
    }
  }

  /**
   * Valida e exibe resultado da confirmação de senha
   * @param {HTMLElement} passwordField - Campo de senha
   * @param {HTMLElement} confirmField - Campo de confirmação
   */
  validateAndShowConfirmation(passwordField, confirmField) {
    const validation = this.validatePasswordConfirmation(
      passwordField.value,
      confirmField.value
    );

    // Remover mensagens anteriores
    const existingError = confirmField.parentNode.querySelector('.password-confirmation-error');
    if (existingError) {
      existingError.remove();
    }

    // Mostrar erro se houver
    if (validation.error) {
      const errorElement = document.createElement('div');
      errorElement.className = 'password-confirmation-error field-error active';
      errorElement.textContent = validation.error;
      errorElement.setAttribute('role', 'alert');
      
      confirmField.parentNode.insertBefore(errorElement, confirmField.nextSibling);
      confirmField.setAttribute('aria-invalid', 'true');
    } else {
      confirmField.setAttribute('aria-invalid', 'false');
    }

    return validation.isValid;
  }
}

// Função legacy para compatibilidade
const verificaSenha = () => {
  const passwordValidator = new PasswordValidator();
  const senhaField = document.querySelector('#senha');
  const confirmField = document.querySelector('#senhaConfirm');

  if (!senhaField || !confirmField) {
    console.warn('Campos de senha não encontrados');
    return false;
  }

  const passwordValidation = passwordValidator.validatePassword(senhaField.value);
  const confirmValidation = passwordValidator.validatePasswordConfirmation(
    senhaField.value,
    confirmField.value
  );

  // Mostrar erros se houver
  if (!passwordValidation.isValid) {
    console.error('Senha inválida:', passwordValidation.errors);
    return false;
  }

  if (!confirmValidation.isValid) {
    console.error('Confirmação de senha inválida');
    return false;
  }

  return true;
};

// Exportações
export default verificaSenha;
export { PasswordValidator, PASSWORD_RULES, PASSWORD_MESSAGES };
