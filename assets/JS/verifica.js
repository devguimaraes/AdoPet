// eslint-disable-next-line no-undef
const error = document.querySelector('[data-error]');
const informaErro = (element) => {
	error.classList = 'error--active';
	error.innerHTML = element;
};

const verifica = (elemento) => {
	if (elemento.validity.valueMissing) {
		informaErro('O campo e-mail precisa ser preenchido');
	}

	if (elemento.validity.patternMismatch) {
		informaErro('Por favor preencher com e-mail válido');
	}
};

export default verifica;
