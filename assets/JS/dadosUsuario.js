// eslint-disable-next-line no-undef
const formulario = document.querySelector('#formulario-cadastro');
const updateDataLocalStorage = [];

const salvarDados = () => {
	const { nome } = formulario;
	const { email } = formulario;
	const { senha } = formulario;

	const cadastroUsuario = {
		nome: nome.value.trim(),
		email: email.value.trim(),
		senha: senha.value.trim(),
	};

	updateDataLocalStorage.push(cadastroUsuario);
	localStorage.setItem('DadosUsuario', JSON.stringify(updateDataLocalStorage));
	console.log(updateDataLocalStorage);
};
// Autenticacao dos inputs e senha feita antes de chamar funcao salvaDados
export default salvarDados;
