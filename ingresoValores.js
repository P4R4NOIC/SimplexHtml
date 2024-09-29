function crearMatriz(columnas,filas){
    let matriz = [];
    for (let i = 1; i <= filas; i++) {
        let hilera = [];
        for (let j = 1; j <= columnas; j++) {
            hilera.push(0);
        }
        matriz.push(hilera);
    }
    return matriz;
}

function rellenarMatriz(realVarSize, sizeHolgura, restricciones, cantidadRestricciones, cantidadVariables, arregloVariablesBasicas, arregloVariables, arrObj, arregloW, BIGNUMBER, metodoSolucion){
    // Obtener los valores de las restricciones
    let iteradorHolgura = -1;
    let iteradorArtificial = -1;
    for (let j = 1; j <= cantidadRestricciones; j++) {
        for (let k = 1; k <= +cantidadVariables; k++) {
            let valor = +document.getElementsByName('r' + j + '_' + k)[0].value;
            restricciones[j-1][k-1] = valor;
        }
        let comparador = +document.getElementsByName('d' + j)[0].value;
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
        
        // Agregar el valor de la constante
        let constante = +document.getElementsByName('y' + j)[0].value;
        restricciones[j-1][realVarSize-1] = constante;
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

function sumaNumeroAConstantes(variable, numero, cantidadRestricciones){
    for (let j = 1; j <= cantidadRestricciones; j++) {
        let valor = +document.getElementsByName('r' + j + '_' + variable)[0].value;
        valor = valor * numero * -1;
        let constante = +document.getElementsByName('y' + j)[0].value;
        constante = constante + valor;
        document.getElementsByName('y' + j)[0].value = constante;
    }
    
}

function cambiarVariablesP(arregloVariables, arregloP){
    for (let i = 0; i < arregloP.length; i++) {
        if(arregloP[i]!==""){
            arregloVariables[i] = arregloP[i];
        }
    }
}

function guardarValores(){
    // Arreglo para almacenar los coeficientes de la función objetivo
    let arrObj = [];
    // Arreglo para almacenar las restricciones
    let restricciones = [];
    let arregloVariables = [];
    let arregloVariablesBasicas = [];

    // Creador de -w
    // Checar si es metodo de GranM o dos fases
    // 0 = Dos fases
    // 1 = Gran M
    let arregloW = [];

    let objetivoFuncion = +document.getElementsByName('funObj')[0].value;

    let sizeHolgura = 0;
    let sizeArtif = 0; 

    let cantidadVariables = localStorage.getItem('cantidadVariables');
    let cantidadRestricciones = localStorage.getItem('cantidadRestricciones');
    let metodoSolucion = localStorage.getItem('metodoSolucion');

    let arregloP = [];
    let sumaAZeta = 0;

    // Chequeo de limites negativos
    for (let i = 1; i <= +cantidadVariables; i++) {
        // neg = 1: Tiene limite negativo
        // neg = 0: Sin limite
        let neg = +document.getElementsByName('n'+i)[0].value;
        let value = "";
        if(neg == 1){
            let numero = +document.getElementsByName('z'+i)[0].value;
            if (numero!=0){
                value = "x"+i+"p";
                let xTemporal = +document.getElementsByName('x'+i)[0].value;
                sumaAZeta = sumaAZeta + xTemporal * numero;
                sumaNumeroAConstantes(i, numero, cantidadRestricciones);
            }
        }
        arregloP.push(value);
    }

    // Cambiar RHS negativos
    for (let j = 1; j <= cantidadRestricciones; j++) {
        let constante = +document.getElementsByName('y' + j)[0].value;
        if(constante<0){
            document.getElementsByName('y' + j)[0].value = -constante;
            let comparador = +document.getElementsByName('d' + j)[0].value;
            document.getElementsByName('d' + j)[0].value = -comparador; 

            for (let k = 1; k <= +cantidadVariables; k++) {
                let valor = +document.getElementsByName('r' + j + '_' + k)[0].value;
                valor = -valor; 
                document.getElementsByName('r' + j + '_' + k)[0].value = valor; 
            }
        }
    }

    // Contador de variables reales
    for (let i = 1; i <= cantidadRestricciones; i++) {
        let comparador = document.getElementsByName('d' + i)[0].value;
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
            valor = +document.getElementsByName('x' + i)[0].value;
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
    localStorage.setItem('BIGNUMBER', BIGNUMBER);

    restricciones = crearMatriz(realVarSize, +cantidadRestricciones);
    restricciones = rellenarMatriz(realVarSize, sizeHolgura, restricciones, cantidadRestricciones, cantidadVariables, arregloVariablesBasicas, arregloVariables, arrObj, arregloW, BIGNUMBER, metodoSolucion);

    restricciones.unshift(arrObj);
    if(metodoSolucion==0 && sizeArtif!= 0){
        restricciones.unshift(arregloW);
    }
    
    
    // Chequeo de variables sin limite
    let contador = 0;
    for (let i = 1; i <= +cantidadVariables; i++) {
        // neg = 1: Tiene limite negativo
        // neg = 0: Sin limite
        let neg = +document.getElementsByName('n'+i)[0].value;
        let xp = "";
        let xpp = "";
        if(neg == 0){
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
    localStorage.setItem('arregloVariablesBasicas', JSON.stringify(arregloVariablesBasicas));
    localStorage.setItem('matriz', JSON.stringify(restricciones));
    
    window.location.href = "resultado.html";
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
    guardarValores();
}