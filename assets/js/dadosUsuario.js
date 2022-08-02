/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
const formulario = document.querySelector('#formulario-cadastro');
const updateDataLocalStorage =
	JSON.parse(localStorage.getItem('DadosUsuario' || [])) || [];

console.log(updateDataLocalStorage);

const salvarDados = () => {
	const { nome } = formulario;
	const { email } = formulario;
	const { senha } = formulario;

	const cadastroUsuario = {
		nome: nome.value.trim(),
		email: email.value.trim().toLowerCase(),
		senha: senha.value.trim(),
	};

	updateDataLocalStorage.push(cadastroUsuario);
	localStorage.setItem('DadosUsuario', JSON.stringify(updateDataLocalStorage));
	console.log(updateDataLocalStorage);
};

export default salvarDados;
