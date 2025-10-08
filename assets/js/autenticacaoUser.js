/**
 * Módulo de autenticação de usuários
 * Gerencia login, logout e verificação de sessão
 */

// Constantes
const STORAGE_KEYS = {
  USERS: 'DadosUsuario',
  CURRENT_USER: 'UsuarioLogado',
  SESSION: 'SessaoAtiva'
};

const ROUTES = {
  HOME: '../../home.html',
  CADASTRO: '../../cadastro.html',
  LOGIN: '../../login.html'
};

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em millisegundos

/**
 * Classe para gerenciar autenticação de usuários
 */
class AuthenticationManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.setupSessionCheck();
  }

  /**
   * Carrega usuários do localStorage
   * @returns {Array} Lista de usuários
   */
  loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }

  /**
   * Carrega usuário atual do localStorage
   * @returns {Object|null} Usuário atual ou null
   */
  loadCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar usuário atual:', error);
      return null;
    }
  }

  /**
   * Salva usuário atual no localStorage
   * @param {Object} user - Dados do usuário
   */
  saveCurrentUser(user) {
    try {
      const userData = {
        ...user,
        loginTime: Date.now(),
        sessionExpiry: Date.now() + SESSION_DURATION
      };
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      this.currentUser = userData;
    } catch (error) {
      console.error('Erro ao salvar usuário atual:', error);
    }
  }

  /**
   * Verifica se a sessão está válida
   * @returns {boolean} True se sessão válida
   */
  isSessionValid() {
    if (!this.currentUser || !this.currentUser.sessionExpiry) {
      return false;
    }
    
    return Date.now() < this.currentUser.sessionExpiry;
  }

  /**
   * Configura verificação automática de sessão
   */
  setupSessionCheck() {
    // Verificar sessão a cada 5 minutos
    setInterval(() => {
      if (this.currentUser && !this.isSessionValid()) {
        this.logout('Sessão expirada. Faça login novamente.');
      }
    }, 5 * 60 * 1000);

    // Verificar quando a página ganha foco
    window.addEventListener('focus', () => {
      if (this.currentUser && !this.isSessionValid()) {
        this.logout('Sessão expirada. Faça login novamente.');
      }
    });
  }

  /**
   * Normaliza email para comparação
   * @param {string} email - Email a ser normalizado
   * @returns {string} Email normalizado
   */
  normalizeEmail(email) {
    return email.toLowerCase().trim();
  }

  /**
   * Valida formato do email
   * @param {string} email - Email a validar
   * @returns {boolean} True se válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Encontra usuário por email
   * @param {string} email - Email do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  findUserByEmail(email) {
    const normalizedEmail = this.normalizeEmail(email);
    return this.users.find(user => 
      this.normalizeEmail(user.email) === normalizedEmail
    );
  }

  /**
   * Autentica usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Resultado da autenticação
   */
  async authenticate(email, password) {
    try {
      // Validações básicas
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      // Simular delay de rede (opcional)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se existem usuários cadastrados
      if (this.users.length === 0) {
        throw new Error('Nenhum usuário cadastrado. Faça seu cadastro primeiro.');
      }

      // Buscar usuário
      const user = this.findUserByEmail(email);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar senha
      if (user.senha !== password) {
        throw new Error('Senha incorreta');
      }

      // Autenticação bem-sucedida
      this.saveCurrentUser(user);
      
      return {
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone
        },
        message: `${user.nome}, seja bem-vindo(a)!`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    }
  }

  /**
   * Realiza logout do usuário
   * @param {string} message - Mensagem opcional
   */
  logout(message = 'Logout realizado com sucesso') {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      this.currentUser = null;
      
      // Mostrar mensagem se fornecida
      if (message) {
        this.showNotification(message, 'info');
      }
      
      // Redirecionar para login após um breve delay
      setTimeout(() => {
        window.location.replace(ROUTES.LOGIN);
      }, 1500);
      
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  }

  /**
   * Verifica se usuário está logado
   * @returns {boolean} True se logado
   */
  isLoggedIn() {
    return this.currentUser !== null && this.isSessionValid();
  }

  /**
   * Obtém dados do usuário atual
   * @returns {Object|null} Dados do usuário ou null
   */
  getCurrentUser() {
    if (this.isLoggedIn()) {
      return {
        id: this.currentUser.id,
        nome: this.currentUser.nome,
        email: this.currentUser.email,
        telefone: this.currentUser.telefone
      };
    }
    return null;
  }

  /**
   * Exibe notificação para o usuário
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, info, warning)
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
    notification.className = `auth-notification auth-notification--${type}`;
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

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Redireciona usuário após autenticação
   * @param {Object} result - Resultado da autenticação
   */
  handleAuthenticationResult(result) {
    if (result.success) {
      this.showNotification(result.message, 'success');
      
      // Redirecionar após breve delay para mostrar a mensagem
      setTimeout(() => {
        window.location.replace(ROUTES.HOME);
      }, 1500);
    } else {
      this.showNotification(result.message, 'error');
      
      // Se não há usuários, redirecionar para cadastro
      if (result.message.includes('cadastro')) {
        setTimeout(() => {
          window.location.replace(ROUTES.CADASTRO);
        }, 2000);
      }
    }
  }

  /**
   * Atualiza lista de usuários (para sincronização)
   */
  refreshUsers() {
    this.users = this.loadUsers();
  }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthenticationManager();

/**
 * Função principal de autenticação (compatibilidade com código existente)
 * @param {Event} event - Evento de submit do formulário
 */
export const autenticaUsuario = async (event) => {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const email = formData.get('email') || form.elements.email?.value;
  const senha = formData.get('senha') || form.elements.senha?.value;
  
  if (!email || !senha) {
    authManager.showNotification('Por favor, preencha email e senha', 'error');
    return;
  }
  
  // Atualizar lista de usuários antes da autenticação
  authManager.refreshUsers();
  
  // Realizar autenticação
  const result = await authManager.authenticate(email, senha);
  
  // Tratar resultado
  authManager.handleAuthenticationResult(result);
};

/**
 * Gerenciador de autenticação (nova API)
 */
export const AuthManager = authManager;

/**
 * Função para logout
 * @param {string} message - Mensagem opcional
 */
export const logout = (message) => {
  authManager.logout(message);
};

/**
 * Função para verificar se está logado
 * @returns {boolean} True se logado
 */
export const isLoggedIn = () => {
  return authManager.isLoggedIn();
};

/**
 * Função para obter usuário atual
 * @returns {Object|null} Dados do usuário
 */
export const getCurrentUser = () => {
  return authManager.getCurrentUser();
};

/**
 * Função para verificar sessão
 * @returns {boolean} True se sessão válida
 */
export const isSessionValid = () => {
  return authManager.isSessionValid();
};

// Exportação padrão para compatibilidade
export default autenticaUsuario;
