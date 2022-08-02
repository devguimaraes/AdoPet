const formularioContato = document.querySelector('[data-formulario-mensagem]');
const getLocalStorage = JSON.parse(localStorage.getItem('DadosUsuario' || []));

formularioContato.addEventListener('submit', (ev) => {
	ev.preventDefault();
	const { nome } = ev.target.elements;
	const { telefone } = ev.target.elements;
	const { animal } = ev.target.elements;
	const { mensagem } = ev.target.elements;

	alert('Mensagem enviada =) Em breve entraremos em contato!!');
});
