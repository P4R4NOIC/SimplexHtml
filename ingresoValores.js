function crearMatriz(columnas,filas, matrizOriginal){
    let matriz = [];
    for (let i = 1; i <= filas; i++) {
        let hilera = [];
        for (let j = 1; j <= columnas; j++) {
            hilera.push(0);
        }
        matriz.push(hilera);
    }

    for (let i = 0; i < matrizOriginal.length; i++) {
        for (let j = 0; j < matrizOriginal[i].length - 1; j++) {
            matriz[i][j] = matrizOriginal[i][j]; 
        }
        matriz[i][matriz[i].length - 1] = matrizOriginal[i][matrizOriginal[i].length - 1];  
    }
    return matriz;
}

function rellenarMatriz(arregloComparadores, sizeHolgura, restricciones, cantidadRestricciones, cantidadVariables, arregloVariablesBasicas, arregloVariables, arrObj, arregloW, BIGNUMBER, metodoSolucion){
    // Obtener los valores de las restricciones
    let iteradorHolgura = -1;
    let iteradorArtificial = -1;
    for (let j = 1; j <= cantidadRestricciones; j++) {
        
        //let comparador = +document.getElementsByName('d' + j)[0].value;
        let comparador = arregloComparadores[j-1];
        if(comparador == -1){
            iteradorHolgura++;
            restricciones[j-1][+cantidadVariables + +iteradorHolgura] = 1;
            arregloVariablesBasicas.push(arregloVariables[+cantidadVariables + +iteradorHolgura]);
        }
        if(comparador == 1){
            iteradorHolgura++;
            restricciones[j-1][+cantidadVariables + +iteradorHolgura] = -1;
            iteradorArtificial++;
            if(metodoSolucion==0){
                arregloW[+cantidadVariables + +sizeHolgura + +iteradorArtificial] = 1;
            }else{
                arrObj[+cantidadVariables + +sizeHolgura + +iteradorArtificial] = BIGNUMBER;
            }
            restricciones[j-1][+cantidadVariables + +sizeHolgura + +iteradorArtificial] = 1;
            arregloVariablesBasicas.push(arregloVariables[+cantidadVariables + +sizeHolgura + +iteradorArtificial]);
        }
        if(comparador == 0){
            iteradorArtificial++;
            if(metodoSolucion==0){
                arregloW[+cantidadVariables + +sizeHolgura + +iteradorArtificial] = 1;
            }else{
                arrObj[+cantidadVariables + +sizeHolgura + +iteradorArtificial] = BIGNUMBER;
            }
            restricciones[j-1][+cantidadVariables + +sizeHolgura + +iteradorArtificial] = 1;
            arregloVariablesBasicas.push(arregloVariables[+cantidadVariables + +sizeHolgura + +iteradorArtificial]);
        }
        
    }
    return restricciones;
}

function crearArregloVariables(vars, holg, art){
    let arreglo = [];
    contador = 1;
    for (let i = 0; i < vars; i++) {
        arreglo.push(`x${contador}`);
        contador++;
    }
    for (let i = 0; i < holg; i++) {
        arreglo.push(`s${contador}`);
        contador++;
    }
    for (let i = 0; i < art; i++) {
        arreglo.push(`a${contador}`);
        contador++;
    }
    return arreglo;
}

function sumaNumeroAConstantes(variable, numero, cantidadRestricciones, restricciones){
    for (let j = 0; j < cantidadRestricciones; j++) {
        let valor = restricciones[j][variable] * numero * -1;
        restricciones[j][restricciones[j].length - 1] += valor;
    }
}

function cambiarVariablesP(arregloVariables, arregloP){
    for (let i = 0; i < arregloP.length; i++) {
        if(arregloP[i]!==""){
            arregloVariables[i] = arregloP[i];
        }
    }
}

function obtenerValoresPrimal(){
    // -------------------------- OBTENCION VARIABLES PRIMAL
    let cantidadVariables = +localStorage.getItem('cantidadVariables');
    let cantidadRestricciones = +localStorage.getItem('cantidadRestricciones');
    
    // MAX OR MIN
    let objetivoFuncion = +document.getElementsByName('funObj')[0].value;

    let arregloValorFuncionObjetivo = [];
    let arregloLimites = [];
    let arregloValorLimites = [];
    
    // Carga de arreglo de limites, valores de limites y la función objetivo
    for (let i = 1; i <= +cantidadVariables; i++) {
        let limite = +document.getElementsByName('n'+i)[0].value;
        let numero = +document.getElementsByName('z'+i)[0].value;
        let valorFuncionObjetivo = +document.getElementsByName('x'+i)[0].value;
        arregloLimites.push(limite);
        arregloValorLimites.push(numero);
        arregloValorFuncionObjetivo.push(valorFuncionObjetivo);
    }

    // Arreglo para almacenar las restricciones
    let restricciones = [];
    let arregloComparadores = [];
    // Carga de Matriz de valores y arreglo de comparadores
    for (let i = 1; i <= cantidadRestricciones; i++) {
        let hilera = [];
        for (let j = 1; j <= cantidadVariables; j++) {
            let valor = +document.getElementsByName('r' + i + '_' + j)[0].value;
            hilera.push(valor);
        }
        let valor = +document.getElementsByName('y' + i)[0].value;
        hilera.push(valor);
        restricciones.push(hilera);
        valor = +document.getElementsByName('d' + i)[0].value;
        arregloComparadores.push(valor);
    }
    // -------------------------- FIN OBTENCION VARIABLES PRIMAL

    localStorage.setItem('cantidadVariables', cantidadVariables);
    localStorage.setItem('cantidadRestricciones', cantidadRestricciones);
    localStorage.setItem('objetivoFuncion', objetivoFuncion);

    localStorage.setItem('arregloValorFuncionObjetivo', JSON.stringify(arregloValorFuncionObjetivo));
    localStorage.setItem('restricciones', JSON.stringify(restricciones));
    localStorage.setItem('arregloComparadores', JSON.stringify(arregloComparadores));
    localStorage.setItem('arregloLimites', JSON.stringify(arregloLimites));
    localStorage.setItem('arregloValorLimites', JSON.stringify(arregloValorLimites));
}

function guardarValores(primalODual){
    // Arreglo para almacenar los coeficientes de la función objetivo
    let arrObj = [];
    
    let arregloVariables = [];
    let arregloVariablesBasicas = [];
    let resumenIteracion = [];

    // Creador de -w
    // Checar si es metodo de GranM o dos fases
    // 0 = Dos fases
    // 1 = Gran M
    let arregloW = [];

    let sizeHolgura = 0;
    let sizeArtif = 0; 
    let metodoSolucion = +localStorage.getItem('metodoSolucion');

    // Obtener las variables numéricas
    let cantidadVariables;
    let cantidadRestricciones;
    let objetivoFuncion;

    // Obtener los arreglos 
    let arregloValorFuncionObjetivo;
    let restricciones;
    let arregloComparadores;
    let arregloLimites;
    let arregloValorLimites;
    
    if(primalODual){
        // Obtener las variables numéricas
        cantidadVariables = localStorage.getItem('cantidadVariables');
        cantidadRestricciones = localStorage.getItem('cantidadRestricciones');
        objetivoFuncion = localStorage.getItem('objetivoFuncion');

        // Obtener los arreglos 
        arregloValorFuncionObjetivo = JSON.parse(localStorage.getItem('arregloValorFuncionObjetivo'));
        restricciones = JSON.parse(localStorage.getItem('restricciones'));
        arregloComparadores = JSON.parse(localStorage.getItem('arregloComparadores'));
        arregloLimites = JSON.parse(localStorage.getItem('arregloLimites'));
        arregloValorLimites = JSON.parse(localStorage.getItem('arregloValorLimites'));
    }else{
        // Obtener las variables numéricas
        cantidadVariables = localStorage.getItem('DUAL_cantidadVariables');
        cantidadRestricciones = localStorage.getItem('DUAL_cantidadRestricciones');
        objetivoFuncion = localStorage.getItem('DUAL_objetivoFuncion');

        // Obtener los arreglos 
        arregloValorFuncionObjetivo = JSON.parse(localStorage.getItem('DUAL_arregloValorFuncionObjetivo'));
        restricciones = JSON.parse(localStorage.getItem('DUAL_restricciones'));
        arregloComparadores = JSON.parse(localStorage.getItem('DUAL_arregloComparadores'));
        arregloLimites = JSON.parse(localStorage.getItem('DUAL_arregloLimites'));
        arregloValorLimites = JSON.parse(localStorage.getItem('DUAL_arregloValorLimites'));
    }

    let arregloP = [];
    let sumaAZeta = 0;
    // Chequeo de limites negativos
    for (let i = 0; i < +cantidadVariables; i++) {
        // arregloLimites = 1: Tiene limite negativo
        // arregloLimites = 0: Sin limite
        let value = "";
        if(arregloLimites[i] == 1){
            if (arregloValorLimites[i]!=0){
                value = "x"+(i+1)+"p";
                let xTemporal = arregloValorFuncionObjetivo[i];
                sumaAZeta = sumaAZeta + xTemporal * arregloValorLimites[i];
                sumaNumeroAConstantes(i, arregloValorLimites[i], cantidadRestricciones, restricciones);
            }
        }
        arregloP.push(value);
    }

    // Cambiar RHS negativos
    for (let i = 0; i < cantidadRestricciones; i++) {

        let ultimaPosicion = restricciones[i][restricciones[i].length - 1];
        
        if (ultimaPosicion < 0) {
            restricciones[i][restricciones[i].length - 1] = -ultimaPosicion;
            arregloComparadores[i] = -arregloComparadores[i];
    
            for (let j = 0; j < cantidadVariables; j++) {
                restricciones[i][j] = -restricciones[i][j];
            }
        }
    }
    

    // Contador de variables reales
    for (let i = 0; i < cantidadRestricciones; i++) {
        let comparador = arregloComparadores[i];
        if(comparador == -1){
            sizeHolgura++;  //Holgura positiva
        }
        if(comparador == 1){
            sizeHolgura++;  //Holgura negativa
            sizeArtif++;    //Artificial positiva
        }
        if(comparador == 0){
            sizeArtif++;    // Artificial positiva
        }
    }

    let realVarSize = +cantidadVariables + +sizeHolgura + +sizeArtif + 1;

    // Crear arreglo de variables
    arregloVariables = crearArregloVariables(+cantidadVariables,sizeHolgura, sizeArtif);
    
    // Si se crearon variables xIp, se cambia el arreglo de variables
    if(sumaAZeta!=0){
        cambiarVariablesP(arregloVariables, arregloP);
    }
    // Crear arreglo de Z / -Z
    for (let i = 1; i <= realVarSize; i++) {
        let valor = 0;
        arregloW.push(valor); // Aprovecha el ciclo para rellenar -w
        if(i<=cantidadVariables){
            valor = arregloValorFuncionObjetivo[i-1];
            if(objetivoFuncion=='1'){
                valor = valor * -1;
            }
        }
        arrObj.push(valor);
    }
    
    if(metodoSolucion==0 && sizeArtif!= 0){
        arregloVariablesBasicas.push("-w");
    }
    if(objetivoFuncion=='1'){
        arregloVariablesBasicas.push("z");
    }else{
        arregloVariablesBasicas.push("-z");
    }
    let BIGNUMBER = Math.max(...restricciones.flat()) * 100;
    
    restricciones = crearMatriz(realVarSize, cantidadRestricciones, restricciones);
    
    restricciones = rellenarMatriz(arregloComparadores, sizeHolgura, restricciones, cantidadRestricciones, cantidadVariables, arregloVariablesBasicas, arregloVariables, arrObj, arregloW, BIGNUMBER, metodoSolucion);
    
    restricciones.unshift(arrObj);
    if(metodoSolucion==0 && sizeArtif!= 0){
        restricciones.unshift(arregloW);
    }
    
    
    // Chequeo de variables sin limite
    let contador = 0;
    for (let i = 1; i <= +cantidadVariables; i++) {
        // arregloLimites = 1: Tiene limite negativo
        // arregloLimites = 0: Sin limite
        let xp = "";
        let xpp = "";
        if(arregloLimites[i-1] == 0){
            xp = "x"+i+"p";
            xpp = "x"+i+"pp";
            arregloVariables.splice(i-1+contador, 1, xp, xpp);

            for (let j = 1; j <= restricciones.length; j++) {
                let valor = restricciones[j-1][i-1];
                restricciones[j-1].splice(i-1+contador,1,valor,-valor);
            }
            
            contador = contador + 2;
        }
    }

    localStorage.setItem('BIGNUMBER', BIGNUMBER);

    localStorage.setItem('metodoSolucionFinal', 0);
    if(metodoSolucion==0 && sizeArtif!= 0){
        localStorage.setItem('metodoSolucionFinal', 1);
    }
    if(metodoSolucion==1 && sizeArtif!= 0){
        localStorage.setItem('metodoSolucionFinal', 2);
    }

    // Mostrar los arreglos en consola
    console.log("Max=1 o Min=0: ", objetivoFuncion);
    console.log("Suma a Z: ", sumaAZeta);
    console.log("Arreglo P: ", arregloP);
    console.log("Arreglo variables:", arregloVariables);
    console.log("Arreglo BVS:", arregloVariablesBasicas);
    localStorage.setItem('filaZ', 0);
    if(metodoSolucion==0 && sizeArtif!= 0){
        console.log("Fila -w:", arregloW);
        localStorage.setItem('filaZ', 1);
    }
    console.log("Fila Z:", arrObj);
    console.log("Restricciones:", restricciones);

    localStorage.setItem('objetivoFuncion', objetivoFuncion);
    localStorage.setItem('sumaAZeta', sumaAZeta);
    localStorage.setItem('arregloVariables', JSON.stringify(arregloVariables));
    localStorage.setItem('varOriginal', JSON.stringify(arregloVariables));
    localStorage.setItem('arregloVariablesBasicas', JSON.stringify(arregloVariablesBasicas));
    localStorage.setItem('matriz', JSON.stringify(restricciones));
    localStorage.setItem('resumenIteracion', JSON.stringify(resumenIteracion));
    
    localStorage.setItem('cantidadVariables', cantidadVariables);
    localStorage.setItem('cantidadRestricciones', cantidadRestricciones);
    
    if(primalODual){
        window.location.href = "resultado.html";
    }
};

function validarEntrada(){
    // Obtener todos los inputs del formulario
    let inputs = document.querySelectorAll('input[type="text"]');

    // Recorrer todos los inputs para validar
    for (let i = 0; i < inputs.length; i++) {
        let valor = inputs[i].value.trim();

        // Si el campo está vacío, reemplazarlo por 0
        if (valor === '') {
            inputs[i].value = '0';
        } else if (isNaN(valor)) {
            // Si no es un número, mostrar una alerta
            alert("Por favor, asegúrate de que todos los campos contengan solo números.");
            inputs[i].focus(); // Coloca el cursor en el input incorrecto
            return false; // Detiene la validación
        }
    }

    // Si todo es correcto, continuar con el flujo
    alert("Todos los campos son válidos.");
    obtenerValoresPrimal();
    calcularDual();
    guardarValores(1);
}

function matrizTranspuesta(matriz, cantidadVariables, cantidadRestricciones, funObj, distintos, limites){

    //Relleno normal
    for (let i = 1; i <= cantidadRestricciones; i++) {
        let array = [];
        let comparador = document.getElementsByName('d' + i)[0].value;
    
        if(comparador==0){
            limites.push("Sin limite");
            comparador = -1;
        }else{
            limites.push(0);
        }

        for (let j = 1; j <= cantidadVariables; j++) {
            let valor = +document.getElementsByName('r' + i + '_' + j)[0].value;
            if(comparador != distintos && comparador != 0){valor = valor*-1}
            array.push(valor);
        }  
        matriz.push(array);

        valor = +document.getElementsByName('y'+i)[0].value;
        if(comparador != distintos && comparador != 0){valor = valor*-1}
        funObj.push(valor);
        
        
    }

    //Transpuesta
    matriz = matriz[0].map((col, i) => matriz.map(row => row[i]));
    for (let i = 1; i <= cantidadVariables; i++) {
        let valor = +document.getElementsByName('x'+i)[0].value;
        matriz[i-1].push(valor);
    }
    return matriz;
}

function calcularDual(){
    
    let cantidadVariables = +localStorage.getItem('cantidadVariables');
    let cantidadRestricciones = +localStorage.getItem('cantidadRestricciones');
    let matriz = [];
    let funObj = [];
    let limites = [];
    let objetivoFuncion = +document.getElementsByName('funObj')[0].value;
    let distintos = 1;
    if(objetivoFuncion==1){
        distintos = -1;
    }
    matriz = matrizTranspuesta(matriz, cantidadVariables, cantidadRestricciones, funObj, distintos, limites);
    
    let var2 = "";
    let arregloComparadores = [];
    let bocas = 1;
    if(distintos==1){bocas = -1}
    for (let i = 0; i < matriz.length; i++) {
        
        let bocasIgual = +document.getElementsByName('n'+(i+1))[0].value;
        
        if(bocasIgual==0){
            arregloComparadores.push(0);
        }else{
            arregloComparadores.push(bocas);
        }
        
    }
    arregloLimites = [];
    arregloValorLimites = [];
    limites.forEach(element => {
        if(element!=0){
            arregloLimites.push(0);
        }else{
            arregloLimites.push(1);
        }
        arregloValorLimites.push(0);
    });

    localStorage.setItem('DUAL_cantidadVariables', cantidadRestricciones);
    localStorage.setItem('DUAL_cantidadRestricciones', cantidadVariables);
    localStorage.setItem('DUAL_objetivoFuncion', -objetivoFuncion);

    localStorage.setItem('DUAL_arregloValorFuncionObjetivo', JSON.stringify(funObj));
    localStorage.setItem('DUAL_restricciones', JSON.stringify(matriz));
    localStorage.setItem('DUAL_arregloComparadores', JSON.stringify(arregloComparadores));
    localStorage.setItem('DUAL_arregloLimites', JSON.stringify(arregloLimites));
    localStorage.setItem('DUAL_arregloValorLimites', JSON.stringify(arregloValorLimites));
}