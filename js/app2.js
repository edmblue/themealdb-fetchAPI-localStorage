(function () {
  const categoriasSelect = document.querySelector('#categorias');
  const resultado = document.querySelector('#resultado');
  const modal = new bootstrap.Modal('#modal');
  const modalDiv = document.querySelector('.modal');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalFooter = document.querySelector('.modal-footer');

  document.addEventListener('DOMContentLoaded', startApp);

  function startApp() {
    if (categoriasSelect) {
      categoriasSelect.addEventListener('change', mostrarRecetasHTML);
      rellenarCategorias();

      return;
    }

    mostrarFavoritos();
  }

  function mostrarRecetasHTML(e) {
    const categoriaNombre = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoriaNombre}`;

    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetas(resultado.meals));
  }

  function mostrarRecetas(recetas) {
    limpiarHTML(resultado);

    recetas.forEach((receta) => {
      const { strMeal, strMealThumb, idMeal } = receta;
      const recetasContenedor = document.createElement('DIV');
      recetasContenedor.classList.add('col-md-4');
      const recetaCard = document.createElement('DIV');
      recetaCard.classList.add('card', 'mb-4');
      const recetaImagen = document.createElement('IMG');
      recetaImagen.classList.add('card-img-top');
      recetaImagen.alt = `Imagen de la receta ${strMeal}`;
      recetaImagen.src = strMealThumb ?? receta.img;
      const recetaCardBody = document.createElement('DIV');
      recetaCardBody.classList.add('card-body');
      const recetaCardTitle = document.createElement('H3');
      recetaCardTitle.classList.add('card-title');
      recetaCardTitle.textContent = strMeal ?? receta.nombre;
      const recetaBtn = document.createElement('BUTTON');
      recetaBtn.classList.add('btn', 'btn-danger', 'w-100');
      recetaBtn.textContent = 'Ver Receta';
      recetaBtn.onclick = function () {
        abrirVerReceta(idMeal ?? receta.id);
      };

      recetaCardBody.appendChild(recetaCardTitle);
      recetaCardBody.appendChild(recetaBtn);
      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);

      recetasContenedor.appendChild(recetaCard);

      resultado.appendChild(recetasContenedor);
    });
  }

  function abrirVerReceta(id) {
    modal.show();

    url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((detalles) => mostrarDetallesModal(detalles.meals));
  }

  function mostrarDetallesModal(detalles) {
    const { strMeal, strMealThumb, strInstructions, idMeal } = detalles[0];

    modalTitle.textContent = strMeal;

    modalBody.innerHTML = `
  
  <img alt="Imagen de la receta ${strMeal}" src="${strMealThumb}" class="img-fluid"> 
  <p class="my-3 px-2">${strInstructions}</p>
  <h3 class="my-3">Ingredientes y Cantidades</h3>
  `;

    const lista = document.createElement('UL');
    lista.classList.add('list-group');

    for (let i = 0; i <= 20; i++) {
      if (detalles[0][`strIngredient${i}`]) {
        const li = document.createElement('LI');
        li.classList.add('list-group-item');
        li.textContent = `${detalles[0][`strIngredient${i}`]} - ${
          detalles[0][`strMeasure${i}`]
        }`;
        lista.appendChild(li);
      }
    }

    modalBody.appendChild(lista);

    limpiarHTML(modalFooter);

    const btnFavorito = document.createElement('BUTTON');
    btnFavorito.classList.add('btn', 'btn-danger', 'col');
    btnFavorito.textContent = existeStorage(idMeal)
      ? 'Eliminar Favorito'
      : 'Guardar Favorito';
    btnFavorito.onclick = function () {
      gestionarFavorito({
        id: idMeal,
        nombre: strMeal,
        img: strMealThumb,
      });
    };

    modalFooter.appendChild(btnFavorito);

    function gestionarFavorito(favObj) {
      if (existeStorage(favObj.id)) {
        eliminarStorage(favObj.id);
        mostrarToast('Eliminado Correctamente');

        btnFavorito.textContent = 'Guardar Favorito';

        if (!categoriasSelect) {
          mostrarFavoritos();
        }

        return;
      }

      btnFavorito.textContent = 'Eliminar Favorito';
      favoritosLista = [...favoritosLista, favObj];
      mostrarToast('Agregado Correctamente');

      localStorage.setItem('favoritos', JSON.stringify(favoritosLista));
    }
  }

  function mostrarToast(mensaje) {
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = mensaje;
    toast.show();
  }

  function mostrarFavoritos() {
    favoritosLista = JSON.parse(localStorage.getItem('favoritos')) ?? [];

    if (favoritosLista.length) {
      mostrarRecetas(favoritosLista);
      return;
    }

    limpiarHTML(resultado);
    const noFav = document.createElement('P');
    noFav.textContent = 'No hay favoritos';
    noFav.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

    resultado.appendChild(noFav);
  }

  function eliminarStorage(id) {
    favoritosLista = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    favoritosLista = favoritosLista.filter((favorito) => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(favoritosLista));
  }

  function existeStorage(id) {
    favoritosLista = JSON.parse(localStorage.getItem('favoritos')) ?? [];

    return favoritosLista.some((favorito) => favorito.id == id);
  }

  function limpiarHTML(elemento) {
    while (elemento.firstChild) {
      elemento.removeChild(elemento.firstChild);
    }
  }

  function rellenarCategorias() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarCategoriasSelect(resultado.categories));
  }

  function mostrarCategoriasSelect(categorias) {
    categorias.forEach((categoria) => {
      const { strCategory } = categoria;
      const option = document.createElement('OPTION');
      option.value = strCategory;
      option.textContent = strCategory;
      categoriasSelect.appendChild(option);
    });
  }
})();
