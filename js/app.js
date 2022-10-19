const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded',validarPresupuesto); // añadimos una escucha para el evento cuando termina de cargar el documento
    formulario.addEventListener('submit',agregarGasto); // escucha para cuando apretamos en el boton del formulario 'submit'
}


//? Clase presupuesto, esta va calcular el restante y eso 
class Presupuesto {
    constructor(presupuesto){
        //? propiedades de la clase presupuesto 
        this.presupuesto = Number(presupuesto); // lo pasamos a number por si viene en string 
        this.restante = Number(presupuesto);  
        this.gastos = []; // lo inicializamos en cero 
    }
    nuevoGasto(gasto){
        // agrega un nuevo gasto al arreglo original 
        this.gastos = [...this.gastos, gasto ] // con el spread operator hacemos copia del arreglo original y  le agregamos el nuevo gasto
        this.calcularRestante(); 
    }
    calcularRestante(){ 
        const gastado = this.gastos.reduce((total,gasto)=> total + gasto.cantidad, 0); // saco cada gasto y lo voy sumando
        this.restante = this.presupuesto - gastado; // resto lo gastado del presupuesto
    }
    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto=>gasto.id !== id);
        this.calcularRestante();
       
    }

}


//? Clase para imprimir el html
class UI {
    
    insertarPresupuesto( {presupuesto, restante} ){  // presupuesto = 'lo que ingresa en el prompt', restante = 'lo que le quedaria'
        document.querySelector('#total').textContent = presupuesto; // insertamos el presupuesto en el html
        document.querySelector('#restante').textContent = restante;
    }
    imprimirAlerta(msj, tipo){
    
        const alerta = document.createElement('div'); 
        alerta.classList.add('alerta',tipo); // se le agrega la clase de alerta y del tipo de alerta que sea
        alerta.textContent= msj; // se le agrega el msj 
        
        const body = document.querySelector('header'); // seleccionamos el header
        body.appendChild(alerta);  // insertamos la alerta
      
     
        setTimeout(() => { 
            alerta.classList.add('visible'); // se pone visible la alerta
            setTimeout(() => {
                alerta.classList.remove('visible'); // le sacamos el visible 
                setTimeout(() => {
                    alerta.remove(); // y lo removemos del html
                }, 300);
            }, 2000);
        }, 100);
    }

    agregarGastoListado({gastos}){
        this.limpiarHtml(); // BORRAMOS EL HTML PREVIO
        // recorremos el arreglo gastos
        gastos.forEach(gasto => {
            const {cantidad, nombreGasto, id} = gasto; // destructuring para ir sacando de cada gasto

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            // data-id = id 
            li.dataset.id = id;// creamos un atributo al li que va llevar el id de cada gasto
            //li.setAttribute('data-id',id); // creamos un atributo al li que va llevar el id de cada gasto
            
            //! INNER HTML ES PELIGROSO, podemos sufrir ataques xss, usar otro metodo en algun proyecto mas picante 
            li.innerHTML = ` ${nombreGasto}<span class="badge badge-primary badge-pill p-2"> $ ${cantidad} </span>`;
            // boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.textContent='Borrar'
            btnBorrar.classList.add('btn','btn-danger','borrar-gasto');
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            li.appendChild(btnBorrar); // agrego el boton al li
            gastoListado.appendChild(li); // agrego el li al ul
            //* se inserta en el html y despues tenemos que borrar el html previo por que appendchild no lo borra
        });  
    }
    limpiarHtml(){
        while( gastoListado.firstChild ) { // mientras el ul tenga algun hijo osea algun gasto que borre el hijo
            gastoListado.removeChild(gastoListado.firstChild); // se elimina el primerhijo
        }
        
    }
    actualizarRestante({restante}){
        document.querySelector('#restante').textContent = restante; // va ir actualizando el restante
    }
    comprobarPresupuesto({presupuesto,restante}){   
        /** 
            * *Este metodo segun el restante va ir cambiando de color el div 
            * * Mientras menos presupuesto quede va ir cambiando de color
        */ 

        const divRestante = document.querySelector('.restante');

        if ( (presupuesto / 4) > restante ) { // si se gasto mas del 75% cambia el color a rojo
            divRestante.classList.remove('alert-success','alert-warning');
            divRestante.classList.add('alert-danger');
        }else if ( (presupuesto / 2) > restante ) { // si gastó mas del 50% cambia el color a naranjita
            divRestante.classList.remove('alert-success','alert-danger');
            divRestante.classList.add('alert-warning');
        }else{// agrego esta condicion por si elimina algun gasto, para sacar las clases de warning o danger
            divRestante.classList.remove('alert-warning', 'alert-danger');
            divRestante.classList.add('alert-success');

        }     


    }
    mostrarGastos(){

    }
}

//? creo la variable para poder instanciarla para la clase presupuesto 
let presupuesto;

const ui = new UI();


function validarPresupuesto() {
    const presupuestoUsuario = prompt('Ingrese el presupuesto');
    if (isNaN(presupuestoUsuario) || presupuestoUsuario === "" || presupuestoUsuario === null || presupuestoUsuario <=0) {
        window.location.reload();
    }
    
    //* instanciamos el objeto presuepuesto de tipo de la clase PRESUPUESTO
    presupuesto = new Presupuesto(presupuestoUsuario); 
    ui.insertarPresupuesto(presupuesto); // le pasamos el objeto de tipo Presupuesto

    
   
}


function agregarGasto(e) {
    e.preventDefault(); 
    const nombreGasto = document.querySelector('#gasto').value; // input donde escriben el nombre del gasto
    const cantidad = document.querySelector('#cantidad').value; // input donde escriben la cantidad del gasto
  
    if( nombreGasto === "" || cantidad === "" ){
        ui.imprimirAlerta('Todos los campos son obligatorios','error'); 
        return;
    }else if( Number(cantidad) <= 0 || isNaN(Number(cantidad)) ){ // los paso a number aca por sino arriba no podira validar que este vacio el input, pq seria un numero y no un string 
        ui.imprimirAlerta('La cantidad ingresada no es válida','error')
        return;
    }
    
    //? object literal, de la forma que lo creamos
    //? es como el destructuring pero al revez
    const gasto = {nombreGasto, cantidad : Number(cantidad), id: Date.now()} // el id para identificarlo que sea con la fecha del dia 
    // agrega un nuevo gasto al arreglo de gastos
    presupuesto.nuevoGasto(gasto) // le pasamos el objeto gasto 

    ui.imprimirAlerta('Gasto agregado correctamente','exito');
    ui.agregarGastoListado(presupuesto); // le pasamos el objeto presupuesto que tiene los gastos
    ui.actualizarRestante(presupuesto); // actualiza restante
    ui.comprobarPresupuesto(presupuesto); // comprueba el presupuesto
    formulario.reset();
}


function eliminarGasto(id) {
    /**
     * *cada vez que eliminamos un gasto tenemos que volver a actualizar el listado de gastos, el restante 
     * * y tambien ir comprobando el presupuesto para poder cambiar el color del del restante segun el presupuesto gastado
     */
    const { gastos } = presupuesto;
    presupuesto.eliminarGasto(id);
    ui.agregarGastoListado(presupuesto)
    ui.actualizarRestante(presupuesto);
    ui.comprobarPresupuesto(presupuesto);

}