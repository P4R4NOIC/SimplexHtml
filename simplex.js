// let BVS = ["z", "s3", "s4", "s5"];
let BVS;
let sumaAZeta;
// let variables = ["x1","x2", "s3", "s4", "s5"];
let variables;
let varOriginal;
let nSol;
let matriz;
console.log(matriz);
let filaZ;
let row;
let col;
//let M = 1000;
let solve;
let M;
// let FoG = 0;
let FoG;
let resumenIteracion;


function checkNextFase(){
  if(filaZ){
    if (resumenIteracion.length == 0){
      console.log("check 0");
      return 0;
    }
    for (let i = 0 ; i < varOriginal.length; i++){
      if ((matriz[0][i]) < 0){
        console.log("check 1");
        return 0;
      }
    }
    if (matriz[0][matriz[0].length-1] != 0){
      return -1;
    }
  }else{
    for(let i = 0; i < varOriginal.length; i++){
      if(varOriginal[i][0] == "a"){
        let count= 0;
        for (let j = 0; j < BVS.length; j++) {
          if (matriz[j][i] != 0){
            count++;
          }
        }
        if (count == 1){
          return 0;
        }
      }
    }

  }
  return 1;
}

function inicio(flag){
  BVS = JSON.parse(localStorage.getItem('arregloVariablesBasicas'));
  sumaAZeta = +localStorage.getItem('sumaAZeta');
  // let variables = ["x1","x2", "s3", "s4", "s5"];
  variables = JSON.parse(localStorage.getItem('arregloVariables'));
  varOriginal = JSON.parse(localStorage.getItem('varOriginal'));
  nSol = +localStorage.getItem('cantidadSoluciones');
  matriz = JSON.parse(localStorage.getItem('matriz'));
  filaZ = +localStorage.getItem('filaZ');
  
  //let M = 1000;
  solve = +localStorage.getItem('bandera');
  M = +localStorage.getItem('BIGNUMBER');
  // let FoG = 0;
  FoG = +localStorage.getItem('metodoSolucionFinal');
  resumenIteracion = JSON.parse(localStorage.getItem('resumenIteracion'));
  if (resumenIteracion.length == 0){
    addIteracionResume();
  }  

  if (flag){
    simplex();
    location.reload();
  }else{
    if (!solve){
      simplex();
      inicio(0);
    }
  }
}

function simplex(){
  if (FoG){ // dos fases o gran M
    if (FoG == 3){ // si ya pre proceso
      let cnf = checkNextFase();
      //console.log("cnf",cnf);
      if(cnf == 1){// para modificar matriz
        processToNextFase();
      }else{
        if (cnf == 0){
          simplexIteracionBase();  
        }else{
          darRespuesta(5);//infactible
        }
      }
    }else{ // si no preprocese y asigne 3
      simplexPreFaseGranM();
      addIteracionResume();
    }
  }else{ // si no iteracion normal
    simplexIteracionBase();  
  }
  //addIteracionResume();
  
  localStorage.setItem('arregloVariablesBasicas', JSON.stringify(BVS));
  localStorage.setItem('matriz', JSON.stringify(matriz));
  //simplexPreFaseGranM();
  //simplexIteracionBase();
  console.log(BVS);
  console.log(matriz);
  console.log("resumenIteracion: ", resumenIteracion);
  
}

function opRow(row1, row2, n){
  let mTemp = matriz[row1].slice();
  for (let i = 0; i < mTemp.length;i++){
    mTemp[i] *= n;
  }


  if (row2 == null){
    matriz[row1] = mTemp;
    return;
  }else{
    let mTemp2 = matriz[row2].slice(); 
    for (let i = 0; i < matriz[row1].length; i++){
      mTemp2[i] += mTemp[i];
    }
    matriz[row2] = mTemp2;
  }
  return; 
}

function escogeEntraMulSol(){
  for (let i= 0; i < matriz[0].length;i++){
    let keepGoing = 0;
    for (let j= 0; j < BVS.length;j++){
      if(variables[i] == BVS[j]){
        keepGoing = 1;
        break;
      }
    }
    if (keepGoing){
      continue;
    }
    if (matriz[0][i] == 0){
      return i;
    }
  }
  return -1;
}


function escogeEntra(){
  let min = 1000;
  let columna = -1;

  for (let i = 0; i < matriz[0].length-1; i++) {
    if (matriz[0][i] < min) {
      min = matriz[0][i];
      columna = i;
    }
  }  
  if(min<0){ 
    return columna;
  }
  if (matriz[0][matriz[0].length-1]<0&& BVS[filaZ]=="z"){
    return -2;
  }  
  return -1;
}

function empateSale(varS){
  let sortedVars = Object.fromEntries(
    Object.entries(varS).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );
  return Object.values(sortedVars)[0];
}

function escogeSale(){
  //fase 1:a, s, x
  let min = 10000;
  let varS = {};
  
  for (let i = filaZ+1; i < matriz.length; i++) {
    if(matriz[i][col]!=0){
      let radio = matriz[i][matriz[0].length-1]/matriz[i][col];
      if ((radio >= 0 && !(matriz[i][matriz[0].length-1] == 0 && matriz[i][col]<0)) && radio < min ) {
        min = radio;
        varS = {};
        varS[BVS[i]] = i;
      }else if (radio == min){
        varS[BVS[i]] = i;
      }  
      
    }
  }
  
  if (Object.values(varS).length == 0){
    return -1;
  }
  if (Object.values(varS).length > 1){
    console.log("empate\n");
    return empateSale(varS);
  }
  return Object.values(varS)[0];
}

function simplexPreFaseGranM(){
  if(FoG == 1){
    for (let i = filaZ; i < BVS.length;i++){
      if (BVS[i][0] == "a"){
        opRow(i, 0, -1); 
        FoG = 3;
      }
    }
  }else{
    for (let i = filaZ; i < BVS.length;i++){
      if (BVS[i][0] == "a"){
        opRow(i, 0, -M); 
        FoG = 3;
      }
    }
  }
  localStorage.setItem('metodoSolucionFinal', FoG);
}

function addIteracionResume(){
  
  let iteracion = [];
  for (let i = 0; i < varOriginal.length; i++) {
    iteracion.push(0);
  }
  for(let j = filaZ+1; j < BVS.length; j++){
    for (let i = 0; i < varOriginal.length; i++) {
      if (varOriginal[i] == BVS[j]){
        iteracion[i]= matriz[j][matriz[0].length-1];
        break;
      }
    }
  }
  iteracion.push(matriz[filaZ][matriz[0].length-1]);
  for(let i = 0; i < varOriginal.length; i++){
    let count= 0;
    for (let j = 0; j < BVS.length; j++) {
      if (matriz[j][i] != 0){
        count++;
      }
    }
    if (count != 1){
      iteracion[i] = 0;
    }
  }
  resumenIteracion.push(iteracion);
  localStorage.setItem('resumenIteracion', JSON.stringify(resumenIteracion));
  
}

function desplegarSoluciones(){
  let sombra = [];
  let preciosSombra = JSON.parse(localStorage.getItem('preciosSombra'));
  let arrLimitFlag =  JSON.parse(localStorage.getItem('arregloLimites'));
  let arrLimit = JSON.parse(localStorage.getItem('arregloValorLimites'));
  let solutions = [];
  let minOmax = +localStorage.getItem('objetivoFuncion');
  if (minOmax){
   solutions.push(resumenIteracion[resumenIteracion.length-1][varOriginal.length]+sumaAZeta+"");
  }else{
    solutions.push((-1*resumenIteracion[resumenIteracion.length-1][varOriginal.length])+sumaAZeta+"");
  }
   //console.log("z:", resumenIteracion[resumenIteracion.length-1][varOriginal.length]);
  for(let i = 0; i < varOriginal.length; i++){
    if (varOriginal[i][0] == "s"){
      sombra.push(matriz[0][i]);
    }
    let keepGoing = 0;
    for (let j = filaZ+1; j < BVS.length; j++) {
      if (varOriginal[i]== BVS[j]){
        if (i < arrLimitFlag.length){
          if (arrLimitFlag[i]){
            solutions.push(resumenIteracion[resumenIteracion.length-1][i]+arrLimit[i]+"*");
          }else{
            solutions.push(resumenIteracion[resumenIteracion.length-1][i]-resumenIteracion[resumenIteracion.length-1][i+1]+"*");
            i++;
          }
        }else{
          solutions.push(resumenIteracion[resumenIteracion.length-1][i]+"*");
        }
        //console.log(resumenIteracion[resumenIteracion.length-1][i]+"*");
        keepGoing = 1;
        break;
      }
    }
    if (keepGoing){
      keepGoing = 0;
      continue;
    }
    if (i < arrLimitFlag.length){
      if (arrLimitFlag[i]){
        solutions.push(resumenIteracion[resumenIteracion.length-1][i]+arrLimit[i]+"");
      }else{
        solutions.push(resumenIteracion[resumenIteracion.length-1][i]-resumenIteracion[resumenIteracion.length-1][i+1]+"");
        i++;
      }
    }else{
      solutions.push(resumenIteracion[resumenIteracion.length-1][i]+"");
    }
    //console.log(varOriginal[i], ": ",resumenIteracion[resumenIteracion.length-1][i]);
  }
  preciosSombra.push(sombra);
  localStorage.setItem('preciosSombra', JSON.stringify(preciosSombra));
  localStorage.setItem('solutions', JSON.stringify(solutions));
  console.log("solutions: ", solutions);
}

function darRespuesta(r){
  if (r == 1){
    localStorage.setItem("bandera", 1);
    console.log("no se pueden dar mas soluciones\n");
  }
  if (r == 2){
    console.log("ya se dieron todas las iteraciones solicitadas\n");
    localStorage.setItem("bandera", 1);
  }
  if (r == 3){
    //console.log("no hay variables negativas para escoger");
    localStorage.setItem("mensajeError", "No hay variables negativas para escoger");
    localStorage.setItem("bandera", 1);
    localStorage.setItem("banderaError", 2);
  }
  if (r == 4){
    //console.log("Problema no acotado\n");
    localStorage.setItem("mensajeError", "Problema no acotado");
    localStorage.setItem("bandera", 1);
    localStorage.setItem("banderaError", 2);
  }
  if (r == 5){
    //console.log("Problema infactible RHS negativo al final de la primera Fase");
    localStorage.setItem("mensajeError", "Problema infactible RHS negativo al final de la primera Fase");
    localStorage.setItem("bandera", 1);
    localStorage.setItem("banderaError", 2);
  }
  if (r == 6){
    //console.log("La Solucion es \n");
    desplegarSoluciones();
    localStorage.setItem("mensajeError", "Solucion encontrada");
    localStorage.setItem("banderaError", 1);
    
    console.log(resumenIteracion);
  }
}


function simplexIteracionBase(){
  if (solve){
    if (nSol > 0){
      col = escogeEntraMulSol();
      if (col == -1){
        darRespuesta(1); //no se pueden dar mas soluciones
        nSol = 0;
        localStorage.setItem('cantidadSoluciones', nSol);
        return;
      }
      nSol--;
      localStorage.setItem('cantidadSoluciones', nSol);
    }else{
      darRespuesta(2); // ya se dieron todas las iteraciones solicitadas
      return;
    }
  }else{
    col = escogeEntra();
  }
  if (col == -2){
    darRespuesta(3);
    console.log("error variable entrante\n");
    return; //no hay variables negativas para escoger
  }
  if (col == -1){
    solve = 1;
    localStorage.setItem('bandera', solve);
    darRespuesta(6);
    console.log("solucion encontrada\n");
    return; //existe una solucion
  }
  row = escogeSale();
  if (row == -1){
    darRespuesta(4); //no es acotado 
    return;
  }
  BVS[row] = variables[col];
  opRow(row, null, 1/matriz[row][col]);
  for (let i = 0; i< matriz.length;i++){
    if (i!=row){
      opRow(row, i, -(matriz[i][col]));
    }
  }  
  addIteracionResume();
  

}
function processToNextFase(){
  let mTemp = [];
  let bvsTemp = [];
  let varTemp = [];
  let flag = 1;
  for (let i = filaZ; i < matriz.length; i++){
    let fTemp = [];
    for (let j = 0; j < matriz[0].length-1; j++){
      if (varOriginal[j][0] != "a"){
        fTemp.push(matriz[i][j]);
        if (flag){
          console.log("varOriginal[j]:", varOriginal[j]);
          varTemp.push(varOriginal[j]);
        }
      }
    }
    flag = 0;
    fTemp.push(matriz[i][matriz[0].length-1]);
    mTemp.push(fTemp);
    bvsTemp.push(BVS[i]);
  }
  BVS = bvsTemp;
  if (filaZ){
    filaZ--;
  }
  variables = varTemp;
  matriz = mTemp;
  FoG = 0;
  localStorage.setItem('arregloVariables', JSON.stringify(variables));
  localStorage.setItem('filaZ', filaZ);
  localStorage.setItem('metodoSolucionFinal', FoG);
}



