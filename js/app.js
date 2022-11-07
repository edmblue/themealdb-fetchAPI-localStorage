const categoriasSelect = document.querySelector('#categorias');
const resultado = document.querySelector('#resultado');
const modal = new bootstrap.Modal('#modal');
const modalDiv = document.querySelector('#modal');
let arrayFavoritos = [];

document.addEventListener('DOMContentLoaded', () => {
  resultado.addEventListener('click', abrirVerReceta);
  modalDiv.addEventListener('click', gestionarFavorito);

  if (categoriasSelect) {
    categoriasSelect.addEventListener('change', mostrarRecetasHTML);
    cargarApp();
    return;
  }

  cargarFavoritos();
});

function cargarFavoritos() {
  arrayFavoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

  if (arrayFavoritos.length === 0) {
    limpiarHTML();
    const noFav = document.createElement('P');
    noFav.textContent = 'No hay favoritos';
    noFav.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

    resultado.appendChild(noFav);

    return;
  }

  imprimirRecetas(arrayFavoritos);
}

function mostrarToast(mensaje) {
  const toastDiv = document.querySelector('#toast');
  const toastBody = document.querySelector('.toast-body');
  const toast = new bootstrap.Toast(toastDiv);
  toastBody.textContent = mensaje;
  toast.show();
}

function cargarApp() {
  const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => rellenarOptions(resultado.categories));
}

function rellenarOptions(categorias) {
  categorias.forEach((categoria) => {
    const { strCategory } = categoria;

    const option = document.createElement('OPTION');
    option.value = strCategory;
    option.textContent = strCategory;
    categoriasSelect.appendChild(option);
  });
}

function mostrarRecetasHTML(e) {
  const recetaSeleccionada = e.target.value;
  url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${recetaSeleccionada}`;

  fetch(url)
    .then((resultado) => resultado.json())
    .then((respuesta) => imprimirRecetas(respuesta.meals));
}

function imprimirRecetas(recetas) {
  limpiarHTML();
  recetas.forEach((receta) => {
    const { strMeal, strMealThumb, idMeal } = receta;

    resultado.innerHTML += `
        <div class="col-md-4">
            <div class="card mb-4">
                <img class="card-img-top" src="${
                  strMealThumb ?? receta.url
                }" alt="Imagen de la receta ${strMeal ?? receta.nombre}">
                <div class="card-body">
                    <h3 class="card-title">${strMeal ?? receta.nombre}</h3>
                    <button data-id="${
                      idMeal ?? receta.id
                    }" class="btn btn-danger w-100">
                        Ver Receta
                    </button>
                </div>
            </div>
        </div>
    `;
  });
}

function limpiarHTML() {
  while (resultado.firstChild) {
    resultado.removeChild(resultado.firstChild);
  }
}

function abrirVerReceta(e) {
  if (e.target.classList.contains('btn')) {
    const idReceta = e.target.dataset.id;

    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idReceta}`;

    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => abrirModal(resultado.meals[0]));
  }
}

function abrirModal(informacionReceta) {
  modal.show();

  const { strMeal, strMealThumb, strInstructions, idMeal } = informacionReceta;

  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');

  modalTitle.textContent = strMeal;

  const textoBoton = comprobarExiste(idMeal)
    ? 'Eliminar Favorito'
    : 'Guardar Favorito';

  modalBody.innerHTML = `
    <img alt="Imagen de la receta ${strMeal}" src="${strMealThumb}" class="img-fluid">
    <p class="my-3 px-2">${strInstructions}</p>
    <h3 class="my-3">Ingedientes y cantidades</h3>
    <ul class="list-group"></ul>
    <button data-id="${idMeal}" data-name="${strMeal}" data-url="${strMealThumb}" class="btn btn-fav btn-danger w-100 mt-2">
        ${textoBoton}
    </button>
  `;

  const lista = document.querySelector('.list-group');

  for (let i = 1; i <= 20; i++) {
    if (
      informacionReceta[`strIngredient${i}`] !== '' &&
      informacionReceta[`strIngredient${i}`] !== null
    ) {
      const li = document.createElement('LI');
      li.classList.add('list-group-item');
      li.textContent = `${informacionReceta[`strIngredient${i}`]} - ${
        informacionReceta[`strMeasure${i}`]
      }`;
      lista.appendChild(li);
    }
  }
}

function gestionarFavorito(e) {
  if (e.target.classList.contains('btn-fav')) {
    const recetaSeleccionada = e.target;
    const nombre = recetaSeleccionada.dataset.name;
    const id = recetaSeleccionada.dataset.id;
    const url = recetaSeleccionada.dataset.url;

    const btnFavorito = document.querySelector('.btn-fav');

    if (comprobarExiste(id)) {
      arrayFavoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
      arrayFavoritos = arrayFavoritos.filter((favorito) => favorito.id !== id);

      localStorage.setItem('favoritos', JSON.stringify(arrayFavoritos));

      favoritosRecarga();

      mostrarToast('Receta Eliminada');

      btnFavorito.textContent = 'Guardar Favorito';

      return;
    }

    btnFavorito.textContent = 'Eliminar Favorito';

    const receta = {
      nombre,
      id,
      url,
    };

    arrayFavoritos = [...arrayFavoritos, receta];

    localStorage.setItem('favoritos', JSON.stringify(arrayFavoritos));

    mostrarToast('Receta Añadida');

    favoritosRecarga();
  }
}

function favoritosRecarga() {
  if (!categoriasSelect) {
    cargarFavoritos();
  }
}

function comprobarExiste(id) {
  arrayFavoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

  return arrayFavoritos.some((favoritos) => favoritos.id == id);
}
