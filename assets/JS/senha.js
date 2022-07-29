const verificaSenha = () => {
	const senhaNova = document.querySelector('#senha');
	const confirmarSenha = document.querySelector('#senhaConfirm');
	const erroVazio = document.querySelector(`[data-senhaIncorreta]`);

	if (senhaNova.value !== confirmarSenha.value) {
		erroVazio.classList.add('erroAtivo');
		erroVazio.innerHTML = 'As senhas não conferem';
	} else {
		// TODO recomecar aqui, fazar arquivo que ficará no local Storage com os dados passados no formularios

		console.log('Cadastro realizado com sucesso');
	}
};
export default verificaSenha;
