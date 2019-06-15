function Individual(){
  this.state = {};

  this.init = function(inputSize, numHidden, numActions){
    // set up w0 weight matrix
    this.state.w0 = [];
    for(var r = 0; r < numHidden; r++){
      this.state.w0[r] = [];
      for(var c = 0; c < inputSize; c++){
        this.state.w0[r][c] = gaussianRand();
      }
    }

    // set up w1 weight matrix
    this.state.w1 = [];
    for(var r = 0; r < numActions; r++){
      this.state.w1[r] = [];
      for(var c = 0; c < numHidden; c++){
        this.state.w1[r][c] = gaussianRand();
      }
    }
  }

  this.forwardPass = function(input){

    // first matmul
    var x = numeric.dot(this.state.w0, input);

    // first activation
    x = numeric.map(x, relu);

    // second matmul
    x = numeric.dot(this.state.w1, x);

    // second activation (sigmoid)
    x = numeric.map(x, sigmoid);
    
    return x;
  }

  this.getAction = function(input){
    var actionValues = this.forwardPass(input, this.state.w0, this.state.w1);
    return maxIndex(actionValues);
  }
}