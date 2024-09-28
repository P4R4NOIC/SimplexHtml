
//----------------------------------------------------------------------
let BVS = ["z", "s3", "s4", "s5"];
let variables = ["x1","x2", "s3", "s4", "s5"];
let matriz = [[-15, -10, 0, 0, 0, 0], 
        [1, 0, 1, 0, 0, 2], 
        [0, 1, 0, 1, 0, 3],
        [1, 1, 0, 0, 1, 4]];
let filaZ = 0;
let row;
let col;
let M = 1000;
let FoG = 0;
resumenIteracion =[];
simplexIteracionBase();
console.log(BVS);
console.log(matriz);
addIteracionResume();
console.log(resumenIteracion);

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
/*
function escogeSaleMulSol(){
  for (int i= 0; i < matriz[0].length;i++){
    let keepGoing = 0;
    for (int j= 0; j < BVS.length;j++){
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
*/

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
      if (radio >= 0 && radio < min) {
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
        FoG = 0;
      }
    }
  }else{
    for (let i = filaZ; i < BVS.length;i++){
      if (BVS[i][0] == "a"){
        opRow(i, 0, -M); 
        FoG = 0;
      }
    }
  }
}

function addIteracionResume(){
  let iteracion = [];
  for (let i = 0; i < variables.length; i++) {
    iteracion.push(0);
  }
  for(let j = filaZ+1; j < BVS.length; j++){
    for (let i = 0; i < variables.length; i++) {
      if (variables[i]== BVS[j]){
        iteracion[i]= matriz[j][matriz[0].length-1];
        break;
      }
    }
  }
  iteracion.push(matriz[filaZ][matriz[0].length-1]);
  resumenIteracion.push(iteracion);
}



/*
function simplexDosFases(){
  simplexPreFaseGranM(); // una vez antes de cualquier metodo

  simplexIteracionBase(); // se hacen iteraciones normales
  if (matriz[0][matriz[0].length] && DosFases){
    siguienteFase(); // se da en caso de que ya la w sea 0 
                      //este metodo debe armar de nuevo la matriz pero 
                      //sin las columnas de a ni la fila de w
                      //se setea filaZ
  }


}
*/

function desplegarSoluciones(){
  console.log(resumenIteracion[resumenIteracion.length-1]);
  for(let i = 0; i < variables.length; i++){
    let keepGoing = 0;
    for (let j = filaZ+1; j < BVS.length; j++) {
      if (variables[i]== BVS[j]){
        console.log("basica");
        console.log(resumenIteracion[i]);
        keepGoing = 1;
        break;
      }
    }
    if (keepGoing){
      keepGoing = 0;
      break;
    }
    console.log(resumenIteracion[i]);
  }
}

function darRespuesta(r){
  if (r == 1){
    console.log("no se pueden dar mas soluciones\n");
  }
  if (r == 2){
    console.log("ya se dieron todas las iteraciones solicitadas\n");
  }
  if (r == 3){
    console.log("no hay variables negativas para escoger\n");
  }
  if (r == 4){
    console.log("problema no acotado\n");
  }
  if (r == 5){
    console.log("5\n");
  }
  if (r == 6){
    console.log("La Solucion es \n");
    console.log(resumenIteracion);
  }
}


function simplexIteracionBase(){
  if (solve){
    if (nSol != 0){
      col = escogeSaleMulSol();
      if (col == -1){
        darRespuesta(1); //no se pueden dar mas soluciones
      }
    }else{
      darRespuesta(2); // ya se dieron todas las iteraciones solicitadas
    }
  }else{
    col = escogeEntra();
  }
  if (col == -1){
    darRespuesta(3);
    console.log("error variable entrante\n");
    return; //no hay variables negativas para escoger
  }
  row = escogeSale();
  if (row == -1){
    darRespuesta(4); //no es acotado 
    console.log("no es acotado");
    return;
  }
  BVS[row-filaZ] = variables[col];
  opRow(row, null, 1/matriz[row][col]);
  for (let i = 0; i< matriz.length;i++){
    if (i!=row){
      opRow(row, i, -(matriz[i][col]));
    }
  }
  

}

function simplex(){
  if (FoG){
    simplexPreFaseGranM();
  }
  if (checkNextFase()){
    processMatrix();
  }
  simplexIteracionBase();
  addIteracionResume();

}





