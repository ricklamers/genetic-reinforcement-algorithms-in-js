function sigmoid(x){
  return 1/(1+Math.exp(-x));
}

function relu(x){
  return Math.max(0, x);
}

function distance(pos0, pos1){
  var a = pos0[0] - pos1[0];
  var b = pos0[1] - pos1[1];
  return Math.sqrt( a*a + b*b );
}

function currentDateString(){
  var d = new Date();
  return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    d.getFullYear() + "-" + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2)+"-" + ("0" + d.getSeconds()).slice(-2);
}

function maxIndex(arr){
  if(arr.length <= 1){
    return 0;
  }

  var maxIndex = 0;
  var maxValue = arr[0];
  
  for(var x = 1; x < arr.length; x++){
    if(arr[x] > maxValue){
      maxIndex = x;
      maxValue = arr[x];
    }
  }

  return maxIndex;
}

function saveFile(filename, text){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", 'save.php', true);

  var data = new FormData();
  data.append('filename', filename);
  data.append('text', text);

  xhr.send(data);
}

function writeExperimentStats(experimentStats, exprimentFileName){
  var csvString = '';

  // write headers
  var headers = [];
  for(var column in experimentStats){
    if(experimentStats.hasOwnProperty(column)){
      if(headers.length == 0){
        csvString += column;
      }else{
        csvString += "," + column;
      }
      headers.push(column);
    }
  }
  csvString += "\n";

  // row count
  var rowCount = experimentStats[headers[0]].length;

  // write rows
  for(var x = 0; x < rowCount; x++){
    for(var c = 0; c < headers.length; c++){
      if(c == 0){
        csvString += experimentStats[headers[c]][x];
      }else{
        csvString += "," + experimentStats[headers[c]][x];
      }
    }
    if(x != rowCount -1){
      csvString += "\n";
    }
  }

  saveFile(exprimentFileName, csvString);
}

function arrayCopy(arr){
  var len = arr.length, 
  copy = new Array(len);
  for (var i=0; i<len; ++i){
    copy[i] = arr[i].slice(0);
  }
  return copy;
}

function gaussianRand() {
  var rand = 0;
  var count = 6;
  for (var i = 0; i < count; i += 1) {
    rand += Math.random();
  }

  return (rand / count - 1/2) * 6;
}

function sortedIndices(arr){
  var len = arr.length;
  var indices = new Array(len);
  for (var i = 0; i < len; ++i) indices[i] = i;
  indices.sort(function (a, b) { return arr[a] > arr[b] ? -1 : arr[a] < arr[b] ? 1 : 0; });
  return indices;
}