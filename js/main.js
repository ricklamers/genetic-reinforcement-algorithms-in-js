(function(){

  // main script for GA playground
  var canv = document.querySelector('canvas');
  canv.width = 160;
  canv.height = 160;

  canv.style.width = '320px';
  canv.style.height = '320px';

  var GAMECOUNT = 0;
  var TIMEOUTGAMES = 0;
  const SCALEFACTOR = true;
  const RANDOMINDIVIDUALS = false;
  const MUTATIONDECAY = true;
  
  var MR = 0.1;
  var MPR = 0.1;

  var ctx = canv.getContext('2d');

  // config
  var numHiddenNeurons = 32;
  var populationSize = 400;
  var eliteCount = Math.round(populationSize*0.10);

  var workerCount = 8;
  var fitnessRepeat = 1;

  var prevTime = window.performance.now();

  // one elite sticky, one random
  var eliteRandomReduction = 1;
  if(RANDOMINDIVIDUALS){
    eliteRandomReduction = 2;
  }
  var replicateCount = Math.round(populationSize/eliteCount) - eliteRandomReduction;

  // pressure is eliteCount/populationSize;
  var genCount = 25;
  var maxSteps = 14000;

  // main loop
  var game = new PongGame();
  game.init();

  var population = [];

  var experimentStats = {'populationMean': [], 'eliteMean': []};
  var exprimentFileName = "experiment-" + currentDateString()+".csv";

  exprimentFileName = 'experiment.csv';

  // test save
  // saveFile("test.csv", 'blah');

  console.log("Total number of weights: " + (game.inputSize * numHiddenNeurons + numHiddenNeurons * game.numActions));

  for(var x = 0; x < populationSize; x++){
    var individual = new Individual();
    individual.init(game.inputSize, numHiddenNeurons, game.numActions);
    population[x] = individual;
  }

  // Initialize workers
  var individualCountPerWorker =  Math.round(populationSize/workerCount);

  var workers = [];
  for(var i = 0; i < workerCount; i++){
    var worker = new Worker("js/worker.js");
    workers.push(worker);

    worker.addEventListener('message', handleWorkerMessage);

  }

  // keeping track of individualScores
  var individualScores = [];
  var individualScoresSubArrays = [];
  var threadReadyCount = 0;


  function handleWorkerMessage(msg){
    var data = msg.data;
    // console.log("Received message from worker:" + data.workerIndex);

    // add scores to subarrays
    individualScoresSubArrays[data.workerIndex] = data.individualScores;
    threadReadyCount++;
    GAMECOUNT += data.GAMECOUNT;
    TIMEOUTGAMES += data.TIMEOUTGAMES;

    if(threadReadyCount == workerCount){
      postIterateGeneration();
    }

  }

  var gen = 0;

  

  function preIterateGeneration(){

    // PHASE I: evaluate each individual

    // Single threaded
    // for(var x = 0; x < population.length; x++){
    //   individualScores[x] = envFitness(population[x], mazeGame, fitnessRepeat);
    // }

    // kick off individual
    var totalPopulationSent = 0;

    // reset global state for MT
    individualScoresSubArrays = [];
    threadReadyCount = 0;
    
    for(var i = 0; i < workerCount; i++){

      var startIndex = totalPopulationSent;
      var toSendAmount = individualCountPerWorker;

      // make sure it always sends the full population
      if(i == workerCount-1){
        toSendAmount = populationSize - totalPopulationSent;
      }

      // increment
      totalPopulationSent += toSendAmount;

      var individualStates = [];
      for(var x = startIndex; x < startIndex+toSendAmount; x++){
        individualStates.push(population[x].state);
      }

      workers[i].postMessage({workerIndex: i, fitnessRepeat: fitnessRepeat, maxSteps:maxSteps, individualStates: individualStates});

    }
  }

  function postIterateGeneration(){

    // merge individualScoresSubArrays
    individualScores = [];

    for(var i = 0; i < workerCount; i++){
      individualScores = individualScores.concat(individualScoresSubArrays[i]);
    }

    // find elites
    var individualScoresSortedIndices = sortedIndices(individualScores);

    // PHASE II: repopulation phase
    var newPopulation = [];
    var eliteMean = 0;

    for(var i = 0; i < eliteCount; i++){

      eliteMean += individualScores[individualScoresSortedIndices[i]];

      var eliteIndividual = population[individualScoresSortedIndices[i]];

      if(i == 0 && gen == genCount -1){
        window.bestIndividual = cloneIndividual(eliteIndividual);
      }

      // retain elite
      newPopulation.push(eliteIndividual);

      // random individual
      if(RANDOMINDIVIDUALS){
        var randomIndividual = new Individual();
        randomIndividual.init(game.inputSize, numHiddenNeurons, game.numActions);
        newPopulation.push(randomIndividual);
      }
      
      for(var d = 0; d < replicateCount; d++){
        var clonedIndividual = cloneIndividual(eliteIndividual);

        // apply mutation
        mutateIndividual(clonedIndividual, gen/(genCount-1), MPR, MR);

        newPopulation.push(clonedIndividual);
      }

    }
    eliteMean /= eliteCount;

    var populationMean = individualScores.reduce((x, y) => {return x + y}, 0)/individualScores.length;
    var curTime = window.performance.now();

    console.log("["+gen+"] mean elite score: " + eliteMean + " time " + (curTime - prevTime)/1000);
    // console.log("["+gen+"] mean population score: " + populationMean + " time " + (curTime - prevTime)/1000);
    
    experimentStats['eliteMean'].push(eliteMean);
    experimentStats['populationMean'].push(populationMean);

    if(gen % 10 == 0 || gen == genCount - 1){
      writeExperimentStats(experimentStats, exprimentFileName);
    }

    prevTime = curTime;
    // console.log("Max score: " + individualScores[individualScoresSortedIndices[0]]);

    population = newPopulation;

    gen++;

    // kick off
    if(gen == genCount){
      // done
      console.log("Done");

      // write CSV
      // writeExperimentStats(experimentStats, exprimentFileName);

      console.log("Total games played: " + GAMECOUNT);
      console.log("Fraction of games timed-out: " + TIMEOUTGAMES/GAMECOUNT);
    }else{
      preIterateGeneration();
    }

  }

  // kick of generation loop
  preIterateGeneration();

  function individualPlay(individual, time){
    game.reset();

    if(!time){
      time = 200;
    }

    var gameLoop = setInterval(function(){

      var action = individual.getAction(game.getFeatureVector())
      var status = game.step(action);
      game.render(ctx, canv.width, canv.height);

      if(status[0]){
        clearInterval(gameLoop);
        console.log("Game ended, score: " + status[1]);
      }
    }, time);

  }

  window.individualPlay = individualPlay;

  function mutateIndividual(individual, genFraction, probability, mr){

    if(!probability){
      probability = .1;
    }
    if(!mr){
      mr = .1;
    }

    if(MUTATIONDECAY){
      mr *= ((1 - genFraction)/(1/.95)) + 0.05; // linear scaling between 
    }

    // mutate w0
    for(var r = 0; r < individual.state.w0.length; r++){
      for(var c = 0; c < individual.state.w0[0].length; c++){

        if(Math.random() < probability){
          var scaleFactor = 1 / Math.abs(individual.state.w0[r][c]);
          if(SCALEFACTOR == false){
            scaleFactor = 1;
          }
          individual.state.w0[r][c] += gaussianRand() * mr * scaleFactor;
        }
      }
    }

    // mutate w1
    for(var r = 0; r < individual.state.w1.length; r++){
      for(var c = 0; c < individual.state.w1[0].length; c++){

        if(Math.random() < probability){
          var scaleFactor = 1 / Math.abs(individual.state.w1[r][c]);
          if(SCALEFACTOR == false){
            scaleFactor = 1;
          }
          individual.state.w1[r][c] += gaussianRand() * mr * scaleFactor;
        }
      }
    }

  }

  function cloneIndividual(individual){
    var clone = new Individual();

    clone.state.w0 = arrayCopy(individual.state.w0);
    clone.state.w1 = arrayCopy(individual.state.w1);

    return clone;
  }

})();