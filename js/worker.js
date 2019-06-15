(function(){

  importScripts('lib/numeric.js', 'utils.js', 'pong.js', 'individual.js');

  // env
  var env = new PongGame();
  env.init();

  var GAMECOUNT = 0;
  var TIMEOUTGAMES = 0;

  self.onmessage = function (msg) {

    GAMECOUNT = 0;
    TIMEOUTGAMES = 0;

    var data = msg.data;

    var individualScores = [];
    for(var x = 0; x < data.individualStates.length; x++){

      var individual = new Individual();
      individual.state = data.individualStates[x];

      individualScores[x] = envFitness(individual, env, data.fitnessRepeat, data.maxSteps);
    }

    self.postMessage({workerIndex: data.workerIndex, individualScores: individualScores, GAMECOUNT: GAMECOUNT, TIMEOUTGAMES: TIMEOUTGAMES});
  }

  // set up listener
  function envFitness(individual, env, fitnessRepeat, maxSteps){

    // mean score
    var scoreSum = 0;

    for(var i = 0; i < fitnessRepeat; i++){
      env.reset();
      GAMECOUNT++;
      TIMEOUTGAMES++;

      for(var x = 0; x < maxSteps; x++){
  
        var envFeatureVector = env.getFeatureVector();

        // BASELINE: random feature vector
        // var envFeatureVector = [Math.random(), Math.random(), Math.random(), Math.random()];
        var action = individual.getAction(envFeatureVector);

        // BASELINE: random action
        // var action = Math.floor(Math.random()*5);
        
        var status = env.step(action);
  
        if(status[0] == true){
          TIMEOUTGAMES--;
          break;
        }
      }
  
      scoreSum += status[1];
    }
    return scoreSum / fitnessRepeat;
  }

})()