/**
 * Módulo de gerenciamento de dados de usuário
 * Gerencia operações de CRUD para dados de usuários no localStorage
 */

// Constantes
const STORAGE_KEYS = {
  USERS: 'DadosUsuario',
  CURRENT_USER: 'UsuarioAtual',
  USER_PREFERENCES: 'PreferenciasUsuario',
  USER_SESSIONS: 'SessoesUsuario'
};

const USER_DEFAULTS = {
  ativo: true,
  dataCadastro: null,
  ultimoLogin: null,
  tentativasLogin: 0,
  bloqueado: false,
  preferencias: {
    tema: 'light',
    notificacoes: true,
    idioma: 'pt-BR'
  }
};

/**
 * Classe para gerenciar dados de usuários
 */
class UserDataManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
  }

  /**
   * Carrega usuários do localStorage
   * @returns {Array} Lista de usuários
   */
  loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = data ? JSON.parse(data) : [];
      
      // Migrar dados antigos se necessário
      return this.migrateUserData(users);
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
      // Validar dados antes de salvar
      const validUsers = users.filter(user => this.validateUserData(user));
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(validUsers));
      this.users = validUsers;
      
      console.log(`${validUsers.length} usuários salvos no localStorage`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw new Error('Falha ao salvar dados do usuário');
    }
  }

  /**
   * Carrega usuário atual do localStorage
   * @returns {Object|null} Dados do usuário atual
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
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      this.currentUser = user;
    } catch (error) {
      console.error('Erro ao salvar usuário atual:', error);
      throw new Error('Falha ao salvar sessão do usuário');
    }
  }

  /**
   * Valida dados do usuário
   * @param {Object} user - Dados do usuário
   * @returns {boolean} True se válido
   */
  validateUserData(user) {
    if (!user || typeof user !== 'object') {
      return false;
    }

    // Campos obrigatórios
    const requiredFields = ['nome', 'email', 'senha'];
    for (const field of requiredFields) {
      if (!user[field] || typeof user[field] !== 'string' || user[field].trim() === '') {
        console.warn(`Campo obrigatório ausente ou inválido: ${field}`);
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      console.warn('Email inválido:', user.email);
      return false;
    }

    return true;
  }

  /**
   * Migra dados antigos para nova estrutura
   * @param {Array} users - Lista de usuários
   * @returns {Array} Usuários migrados
   */
  migrateUserData(users) {
    return users.map(user => {
      // Se já tem a estrutura nova, retornar como está
      if (user.id && user.dataCadastro) {
        return user;
      }

      // Migrar para nova estrutura
      return {
        id: user.id || this.generateUserId(),
        nome: user.nome || '',
        email: user.email || '',
        senha: user.senha || '',
        telefone: user.telefone || '',
        dataCadastro: user.dataCadastro || new Date().toISOString(),
        ultimoLogin: user.ultimoLogin || null,
        ...USER_DEFAULTS,
        ...user // Preservar dados existentes
      };
    });
  }

  /**
   * Gera ID único para usuário
   * @returns {string} ID único
   */
  generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Adiciona novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  addUser(userData) {
    // Validar dados
    if (!this.validateUserData(userData)) {
      throw new Error('Dados do usuário inválidos');
    }

    // Verificar se email já existe
    if (this.findUserByEmail(userData.email)) {
      throw new Error('Email já cadastrado');
    }

    // Criar usuário completo
    const newUser = {
      id: this.generateUserId(),
      nome: userData.nome.trim(),
      email: userData.email.toLowerCase().trim(),
      senha: userData.senha,
      telefone: userData.telefone || '',
      dataCadastro: new Date().toISOString(),
      ultimoLogin: null,
      ...USER_DEFAULTS
    };

    // Adicionar à lista
    this.users.push(newUser);
    this.saveUsers(this.users);

    console.log('Usuário adicionado:', newUser.email);
    return { ...newUser, senha: undefined }; // Retornar sem senha
  }

  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Object|null} Usuário encontrado
   */
  findUserByEmail(email) {
    if (!email) return null;
    
    return this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase().trim()
    ) || null;
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Object|null} Usuário encontrado
   */
  findUserById(id) {
    if (!id) return null;
    
    return this.users.find(user => user.id === id) || null;
  }

  /**
   * Atualiza dados do usuário
   * @param {string} id - ID do usuário
   * @param {Object} updates - Dados para atualizar
   * @returns {Object} Usuário atualizado
   */
  updateUser(id, updates) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Preparar dados de atualização
    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      id, // Preservar ID
      dataAtualizacao: new Date().toISOString()
    };

    // Validar dados atualizados
    if (!this.validateUserData(updatedUser)) {
      throw new Error('Dados de atualização inválidos');
    }

    // Verificar email único (se alterado)
    if (updates.email && updates.email !== this.users[userIndex].email) {
      const existingUser = this.findUserByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email já está em uso');
      }
    }

    // Atualizar
    this.users[userIndex] = updatedUser;
    this.saveUsers(this.users);

    // Atualizar usuário atual se for o mesmo
    if (this.currentUser && this.currentUser.id === id) {
      this.saveCurrentUser(updatedUser);
    }

    console.log('Usuário atualizado:', updatedUser.email);
    return { ...updatedUser, senha: undefined }; // Retornar sem senha
  }

  /**
   * Remove usuário
   * @param {string} id - ID do usuário
   * @returns {boolean} True se removido
   */
  removeUser(id) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return false;
    }

    const removedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    this.saveUsers(this.users);

    // Limpar usuário atual se for o mesmo
    if (this.currentUser && this.currentUser.id === id) {
      this.saveCurrentUser(null);
    }

    console.log('Usuário removido:', removedUser.email);
    return true;
  }

  /**
   * Lista todos os usuários (sem senhas)
   * @returns {Array} Lista de usuários
   */
  getAllUsers() {
    return this.users.map(user => ({
      ...user,
      senha: undefined
    }));
  }

  /**
   * Busca usuários por critério
   * @param {Object} criteria - Critérios de busca
   * @returns {Array} Usuários encontrados
   */
  searchUsers(criteria) {
    return this.users.filter(user => {
      return Object.keys(criteria).every(key => {
        if (!user[key]) return false;
        
        const userValue = user[key].toString().toLowerCase();
        const searchValue = criteria[key].toString().toLowerCase();
        
        return userValue.includes(searchValue);
      });
    }).map(user => ({
      ...user,
      senha: undefined
    }));
  }

  /**
   * Atualiza último login do usuário
   * @param {string} id - ID do usuário
   */
  updateLastLogin(id) {
    try {
      const user = this.findUserById(id);
      if (user) {
        this.updateUser(id, {
          ultimoLogin: new Date().toISOString(),
          tentativasLogin: 0
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  /**
   * Incrementa tentativas de login
   * @param {string} email - Email do usuário
   */
  incrementLoginAttempts(email) {
    try {
      const user = this.findUserByEmail(email);
      if (user) {
        const attempts = (user.tentativasLogin || 0) + 1;
        const shouldBlock = attempts >= 5;
        
        this.updateUser(user.id, {
          tentativasLogin: attempts,
          bloqueado: shouldBlock,
          ...(shouldBlock && { dataBloqueio: new Date().toISOString() })
        });

        return { attempts, blocked: shouldBlock };
      }
    } catch (error) {
      console.error('Erro ao incrementar tentativas de login:', error);
    }
    
    return { attempts: 0, blocked: false };
  }

  /**
   * Limpa dados do localStorage
   */
  clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      this.users = [];
      this.currentUser = null;
      
      console.log('Todos os dados foram limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  /**
   * Exporta dados para backup
   * @returns {Object} Dados para backup
   */
  exportData() {
    return {
      users: this.getAllUsers(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Importa dados de backup
   * @param {Object} backupData - Dados de backup
   */
  importData(backupData) {
    try {
      if (!backupData.users || !Array.isArray(backupData.users)) {
        throw new Error('Formato de backup inválido');
      }

      // Validar todos os usuários
      const validUsers = backupData.users.filter(user => this.validateUserData(user));
      
      if (validUsers.length !== backupData.users.length) {
        console.warn(`${backupData.users.length - validUsers.length} usuários inválidos foram ignorados`);
      }

      this.users = validUsers;
      this.saveUsers(this.users);
      
      console.log(`${validUsers.length} usuários importados com sucesso`);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw new Error('Falha ao importar backup');
    }
  }
}

// Função legacy para compatibilidade
const salvarDados = () => {
  try {
    const formulario = document.querySelector('#formulario-cadastro');
    if (!formulario) {
      throw new Error('Formulário de cadastro não encontrado');
    }

    const userManager = new UserDataManager();
    
    const userData = {
      nome: formulario.nome?.value?.trim() || '',
      email: formulario.email?.value?.trim() || '',
      senha: formulario.senha?.value || '',
      telefone: formulario.telefone?.value?.trim() || ''
    };

    const newUser = userManager.addUser(userData);
    console.log('Usuário salvo com sucesso:', newUser);
    
    return newUser;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw error;
  }
};

// Instância global para uso em outros módulos
const userDataManager = new UserDataManager();

// Exportações
export default salvarDados;
export { 
  UserDataManager, 
  userDataManager, 
  STORAGE_KEYS, 
  USER_DEFAULTS 
};
