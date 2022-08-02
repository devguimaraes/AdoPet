/* eslint-disable no-alert */
/* eslint-disable no-undef */
const getLocalStorage = JSON.parse(localStorage.getItem('DadosUsuario' || []));

const autenticaUsuario = (el) => {
	let verificador = true;
	const { email } = el.target.elements;
	const { senha } = el.target.elements;

	email.value.toLowerCase();

	getLocalStorage.filter((elements) => {
		if (elements.email === email.value && elements.senha === senha.value) {
			verificador = false;
			const usuarioLogado = elements;
			alert(`${usuarioLogado.nome} Seja bem vindo!`);
			window.location.replace('../../home.html');
			// TODO acertar erro que diz que usuário ou senha está incorreto na hora do login, mesmo os dados estando ok.
		}
	});

	if (verificador) {
		getLocalStorage.reduce((elements) => {
			if (elements.email !== email.value || elements.senha !== senha.value) {
				alert(`Usuário ou senha incorretos`);
			}
		}, 0);
	}
};
export default autenticaUsuario;
