/* eslint-disable no-undef */
// eslint-disable-next-line import/extensions
import salvarDados from './dadosUsuario.js';
// TODO tirar o regex do pattern html e trazer para o JS
const verificaSenha = () => {
	const senhaNova = document.querySelector('#senha');
	const confirmarSenha = document.querySelector('#senhaConfirm');
	const erroVazio = document.querySelector(`[data-senhaIncorreta]`);

	if (senhaNova.value !== confirmarSenha.value) {
		erroVazio.classList.add('erroAtivo');
		erroVazio.innerHTML = 'As senhas não conferem';
		return;
	}
	erroVazio.classList.remove('erroAtivo');
	erroVazio.innerHTML = '';
	// Autenticacao dos inputs e senha feita antes de chamar funcao salvaDados
	salvarDados();
	// eslint-disable-next-line no-alert
	alert('Cadastro Realizado com sucesso');
	window.location.replace('../../home.html');
};

export default verificaSenha;
