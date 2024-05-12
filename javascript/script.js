$(document).ready(function () {
    const cardContainer = document.getElementById('cardContainer');
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue exitosa.');
            }
            return response.json();
        })
        .then(data => {
            data.map((x) => {
                cardContainer.innerHTML += `
                    <div class="card">
                        <img class="card-img-top imagencard" src="${x.imageUrl}" alt="${x.title}">
                        <h2 class="titulocard">${x.title}</h2>
                        <p class="textocard">${x.description}</p>
                        <h2 class="preciocard">Valor: ${x.price}</h2>
                        <div class="text-center">
                            <button class="boton" data-id="${x.id}">Agregar al carrito</button>
                        </div>
                    </div>
                `;
            });
        })
        .then(() => {
            cardContainer.addEventListener('click', function (event) {
                if (event.target && event.target.classList.contains('boton')) {
                    agregarAlCarrito(event);
                }
            });
        })
        .catch(error => {
            console.error('Hubo un problema al cargar los datos. Por favor, inténtalo de nuevo más tarde', error);
        });

    function agregarAlCarrito(evento) {
        evento.preventDefault();
        const boton = evento.target;
        const item = boton.closest('.card');
        const titulo = item.querySelector('.titulocard').textContent;
        const precioTexto = item.querySelector('.preciocard').textContent;
        const precio = parseFloat(precioTexto.replace('Valor: $', ''));
        const id = boton.getAttribute('data-id');
        const imagenSrc = item.querySelector('.imagencard').src;
        const descripcion = item.querySelector('.textocard').textContent;

        const producto = {
            id: id,
            titulo: titulo,
            precio: precio,
            imagenSrc: imagenSrc,
            descripcion: descripcion
        };

        const productosEnCarrito = document.querySelectorAll('#lista-carrito li');
        let productoExistente = null;
        productosEnCarrito.forEach(item => {
            const tituloEnCarrito = item.querySelector('.titulo').textContent;
            if (tituloEnCarrito === producto.titulo) {
                productoExistente = item;
            }
        });

        if (productoExistente) {
            const cantidadExistente = parseInt(productoExistente.querySelector('.cantidad').textContent);
            const nuevaCantidad = cantidadExistente + 1;
            const nuevoTotal = producto.precio * nuevaCantidad;
            productoExistente.querySelector('.cantidad').textContent = nuevaCantidad;
            productoExistente.querySelector('.total').textContent = `$${nuevoTotal.toFixed(2)}`;
        } else {
            agregarProductoAlCarrito(producto);
        }

        mostrarPopUp(producto);
        calcularTotal();
    }

    $('.boton').click(agregarAlCarrito);
    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'simularPedido') {
            event.preventDefault();
            simularPedido();
        }
    });

    const confirmarPedidoBtn = document.getElementById('confirmarPedido');
    if (confirmarPedidoBtn) {
        confirmarPedidoBtn.addEventListener('click', function (event) {
            event.preventDefault();
            confirmarPedido();
        });
    }

    cargarProductosDelLocalStorage();

    function agregarProductoAlCarrito(producto) {
        const elementoLista = document.createElement('li');
        elementoLista.innerHTML = `
            <span class="eliminar-producto">&times;</span>
            <span class="titulo">${producto.titulo}</span> - 
            <span class="cantidad">1</span> x 
            $<span class="precio">${producto.precio.toFixed(2)}</span> = 
            <span class="total">$${producto.precio.toFixed(2)}</span>
        `;
        document.getElementById('lista-carrito').appendChild(elementoLista);

        document.getElementById('simularPedido').style.display = 'inline-block';

        guardarProductosEnLocalStorage();
    }

    function calcularTotal() {
        let total = 0;
        const totales = document.querySelectorAll('#lista-carrito .total');
        totales.forEach(totalElemento => {
            total += parseFloat(totalElemento.textContent.replace('$', ''));
        });
        document.getElementById('total-carrito').textContent = `$${total.toFixed(2)}`;
    }

    function mostrarPopUp(producto) {
        const popUp = document.createElement('div');
        popUp.classList.add('pop-up');
        popUp.innerHTML = `
            <div class="pop-up-content">
                <span class="close-button">&times;</span>
                <img src="${producto.imagenSrc}" alt="${producto.titulo}">
                <h2>${producto.titulo}</h2>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio.toFixed(2)}</p>
            </div>
        `;
        document.body.appendChild(popUp);

        setTimeout(() => {
            document.body.removeChild(popUp);
        }, 500);

        const closeButton = popUp.querySelector('.close-button');
        closeButton.addEventListener('click', function () {
            document.body.removeChild(popUp);
        });
    }

    function simularPedido() {
        const productosEnCarrito = document.querySelectorAll('#lista-carrito li');
        if (productosEnCarrito.length > 0) {
            document.getElementById('formularioPedido').style.display = 'block';
        } else {
            alert('El carrito está vacío. Agregue productos antes de simular un pedido.');
        }
    }

    function confirmarPedido() {

        document.getElementById('formularioPedido').style.display = 'none';
        document.getElementById('lista-carrito').innerHTML = '';
        document.getElementById('total-carrito').textContent = '$0.00';
        localStorage.removeItem('productosCarrito');
        document.getElementById('simularPedido').style.display = 'none';
        document.getElementById('formularioPedido').style.display = 'none';
        document.getElementById('formularioPago').style.display = 'block';

    }

    function mostrarMensajeConfirmacion() {
        const popUpConfirmacion = document.createElement('div');
        popUpConfirmacion.classList.add('pop-up');
        popUpConfirmacion.innerHTML = `
            <div class="pop-up-content">
                <span class="close-button">&times;</span>
                <h2>¡Pedido pagado con éxito!</h2>
                <p>Llegará en 2 días hábiles.</p>
            </div>
        `;
        document.body.appendChild(popUpConfirmacion);

        const closeButton = popUpConfirmacion.querySelector('.close-button');
        closeButton.addEventListener('click', function () {
            document.body.removeChild(popUpConfirmacion);
        });
    }

    document.getElementById('realizarPago').addEventListener('click', function (event) {
        event.preventDefault();
        mostrarMensajeConfirmacion();
        document.getElementById('lista-carrito').innerHTML = '';
        document.getElementById('total-carrito').textContent = '$0.00';
        localStorage.removeItem('productosCarrito');
    });

    function guardarProductosEnLocalStorage() {
        const productosEnCarrito = [];
        const productos = document.querySelectorAll('#lista-carrito li');
        productos.forEach(producto => {
            const titulo = producto.querySelector('.titulo').textContent;
            const cantidad = parseInt(producto.querySelector('.cantidad').textContent);
            const precio = parseFloat(producto.querySelector('.precio').textContent);
            productosEnCarrito.push({ titulo, cantidad, precio });
        });
        localStorage.setItem('productosCarrito', JSON.stringify(productosEnCarrito));
    }

    function cargarProductosDelLocalStorage() {
        const productosEnCarrito = JSON.parse(localStorage.getItem('productosCarrito'));
        if (productosEnCarrito) {
            productosEnCarrito.forEach(producto => {
                const productoHTML = `
                    <li>
                        <span class="eliminar-producto">&times;</span>
                        <span class="titulo">${producto.titulo}</span> - 
                        <span class="cantidad">${producto.cantidad}</span> x 
                        $<span class="precio">${producto.precio.toFixed(2)}</span> = 
                        <span class="total">$${producto.cantidad * producto.precio}</span>
                    </li>
                `;
                document.getElementById('lista-carrito').insertAdjacentHTML('beforeend', productoHTML);
            });
            calcularTotal();
            document.getElementById('simularPedido').style.display = 'inline-block';
        }
    }

    document.getElementById('lista-carrito').addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('eliminar-producto')) {
            const productoAEliminar = event.target.parentElement;
            productoAEliminar.remove();
            calcularTotal();
            guardarProductosEnLocalStorage(); 
        }
    });
});
