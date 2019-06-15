function PongGame(){
  this.state = {};
  this.state.gridSize = 160;
  this.state.paddleSize = [4, 16];
  this.state.puckSize = [2, 4];
  this.state.paddleSpeed = 2;
  this.state.baseBallVelocity = 2;
  this.state.gameDuration = 21;

  this.numActions = 3;
  this.state.game = 0;
  
  this.init = function(){
    this.reset();
  }

  this.render = function(ctx, width, height){
    ctx.fillStyle = '#904710';
    ctx.fillRect(0,0, width, height);

    // draw score
    ctx.fillStyle = '#9a5c36';
    ctx.font = "21px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; 
    ctx.fillText(this.state.score, this.state.gridSize/2, this.state.gridSize/2);

    // draw puck
    ctx.fillStyle = '#ffd49d';
    ctx.fillRect(this.state.ballPosition[0]-this.state.puckSize[0]/2, this.state.ballPosition[1]-this.state.puckSize[1]/2, this.state.puckSize[0], this.state.puckSize[1]);

    // draw player
    ctx.fillStyle = '#5cbb57';
    ctx.fillRect(this.state.playerPosition[0]-this.state.paddleSize[0]/2, this.state.playerPosition[1]-this.state.paddleSize[1]/2, this.state.paddleSize[0], this.state.paddleSize[1]);

    // draw enemy
    ctx.fillStyle = '#d1844e';
    ctx.fillRect(this.state.enemyPosition[0]-this.state.paddleSize[0]/2, this.state.enemyPosition[1]-this.state.paddleSize[1]/2, this.state.paddleSize[0], this.state.paddleSize[1]);

    

  }

  this.reset = function(){
    this.state.enemyPosition = [10, this.state.gridSize/2];
    this.state.playerPosition = [this.state.gridSize-10, this.state.gridSize/2];
    this.state.ballPosition = [this.state.gridSize/2, this.state.gridSize/2];
    this.state.ballAngle = 0;
    this.state.ballVelocity = .5 * this.state.baseBallVelocity;
    this.state.gameOver = false;
    this.state.score = 0;
    this.state.game = 0;
  }

  this.inputSize = 4;

  this.getFeatureVector = function(){
    var vector = [];

    // // player (zero centered - normalized)
    vector[0] = (this.state.playerPosition[1] - this.state.gridSize/2)/this.state.gridSize/2;

    // enemy
    vector[1] = (this.state.enemyPosition[1] - this.state.gridSize/2)/this.state.gridSize/2;

    // ball
    vector[2] = (this.state.ballPosition[0] - this.state.gridSize/2)/this.state.gridSize/2;
    vector[3] = (this.state.ballPosition[1] - this.state.gridSize/2)/this.state.gridSize/2;

    return vector;
  }

  this.boundcheck = function(position){
    if(position[1] > this.state.gridSize - this.state.paddleSize[1]/2){
      position[1] = this.state.gridSize - this.state.paddleSize[1]/2;
    }
    if(position[1] < this.state.paddleSize[1]/2){
      position[1] = this.state.paddleSize[1]/2;
    }
    return position;
  }

  this.returnAngle = function(ballPosition, batPosition){
    var distanceFromMiddle = (batPosition - ballPosition)/(this.state.paddleSize[1]/2);

    this.state.ballVelocity = ((Math.abs(distanceFromMiddle) + 1) * .5) * this.state.baseBallVelocity;

    return distanceFromMiddle * Math.PI/2 + .2;
  }

  this.setAngle = function(angle){
    this.state.ballAngle = this.correctAngleRange(angle);
  }

  this.correctAngleRange = function(angle){
    while(angle < 0 || angle > Math.PI * 2){
      if(angle < 0){
        angle = angle + Math.PI * 2;
      }else{
        angle = angle - Math.PI * 2;
      }
    }
    return angle;
  }

  this.step = function(action){

    if(this.state.gameOver == false){

      // advance ball
      this.state.ballPosition[0] += this.state.ballVelocity * Math.cos(this.state.ballAngle);
      this.state.ballPosition[1] += this.state.ballVelocity * Math.sin(this.state.ballAngle);

      // move players
      if(action == 1){
        this.state.playerPosition[1] -= this.state.paddleSpeed;
      }else if(action == 2){
        this.state.playerPosition[1] += this.state.paddleSpeed;
      }
      this.state.playerPosition = this.boundcheck(this.state.playerPosition);

      // enemy random
      // var enemyAction = Math.floor(Math.random()*3);
      // puck direction
      var enemyAction = 1;
      
      if(this.state.ballPosition[1] > this.state.enemyPosition[1]){
        enemyAction = 2;
      }

      if(enemyAction == 1){
        this.state.enemyPosition[1] -= this.state.paddleSpeed/3;
      }else if(enemyAction ==2) {
        this.state.enemyPosition[1] += this.state.paddleSpeed/3;
      }
      this.state.enemyPosition = this.boundcheck(this.state.enemyPosition);

      // check bounce ceiling
      if(this.state.ballPosition[1] < 0){
        var hitAngle = this.state.ballAngle;
        this.setAngle(-hitAngle);
      }
      else if(this.state.ballPosition[1] > this.state.gridSize){
        var hitAngle = this.state.ballAngle;
        this.setAngle(-hitAngle);
      }

      // check puck position
      // player side
      if(this.state.ballPosition[0] >= this.state.gridSize - 10 - this.state.paddleSize[0]/2){

        // check if player is blocking else score is -1
        if(this.state.ballPosition[1] <= this.state.playerPosition[1] + this.state.paddleSize[1]/2 &&
          this.state.ballPosition[1] >= this.state.playerPosition[1] - this.state.paddleSize[1]/2){
            this.setAngle(Math.PI + this.returnAngle(this.state.ballPosition[1], this.state.playerPosition[1]));
        }else{
          this.state.score -= 1;
          this.state.game++;
          this.state.ballPosition[0] = this.state.gridSize/2;
          this.state.ballPosition[1] = this.state.gridSize/2;
          this.setAngle((-.5 +Math.random()) * Math.PI/4 + (Math.round(Math.random()) * Math.PI));
          this.state.enemyPosition = [10, this.state.gridSize/2];
        }
        
      }

      // check puck position enemy side
      if(this.state.ballPosition[0] <= 10 + this.state.paddleSize[0]/2){
        
        // check if player is blocking else score is -1
        if(this.state.ballPosition[1] <= this.state.enemyPosition[1] + this.state.paddleSize[1]/2 &&
          this.state.ballPosition[1] >= this.state.enemyPosition[1] - this.state.paddleSize[1]/2){
            this.setAngle(this.returnAngle(this.state.ballPosition[1], this.state.enemyPosition[1])* -1);
        }else{
          this.state.score += 1;
          this.state.game++;
          this.state.ballPosition[0] = this.state.gridSize/2;
          this.state.ballPosition[1] = this.state.gridSize/2;
          this.setAngle((-.5 +Math.random()) * Math.PI/4 + (Math.round(Math.random()) * Math.PI));
          this.state.enemyPosition = [10, this.state.gridSize/2];
        }
        
      }

      if(this.state.game == this.state.gameDuration){
        this.state.gameOver = true;
      }

    }
    return [this.state.gameOver, this.state.score];
  }

}