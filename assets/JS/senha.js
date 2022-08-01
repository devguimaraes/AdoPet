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
	// TODO recomecar aqui, fazar arquivo que ficará no local Storage com os dados passados no formularios
	salvarDados();
	alert('Cadastro Realizado com sucesso');
};

export default verificaSenha;
