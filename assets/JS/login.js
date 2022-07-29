// TODO FAZER validacao apenas do campo e-mail com regex usando validity state
const formulario = document.querySelector('#form-login');
const error = document.querySelector("[data-error]")
const inputs = document.querySelectorAll('[data-tipo]')

const informaErro = (element) => {
	error.classList = 'error--active';
	error.innerHTML = element
}

const verifica = (elemento) => {
	if (elemento.validity.valueMissing) {
		informaErro('O campo e-mail precisa ser preenchido')
		setTimeout(() => {
			location.reload()
		}, 0500)

	}

	if (elemento.validity.patternMismatch) {
		informaErro('Por favor preencher com e-mail válido')

		setTimeout(() => {
			location.reload()
		}, 5000)
	}
}

// comecar aqui
inputs.forEach(element => {
	if (element.id === 'email') {
		element.addEventListener('blur', (el) => {
			verifica(element)
		}
		);

	}
})

