function MazeGame(){
  this.state = {};
  this.state.gridSize = 7;

  this.numActions = 5;
  
  this.init = function(){
    this.reset();
  }

  this.render = function(ctx, width, height){
    ctx.clearRect(0, 0, width, height);

    var gridElSize = width / this.state.gridSize;

    // draw player
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.rect(this.state.playerPosition[0] * gridElSize, this.state.playerPosition[1] * gridElSize, gridElSize, gridElSize);
    ctx.closePath();
    ctx.fill();

    // draw enemy
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.rect(this.state.enemyPosition[0] * gridElSize, this.state.enemyPosition[1] * gridElSize, gridElSize, gridElSize);
    ctx.closePath();
    ctx.fill();

    // draw cookies 
    for (var i = 0; i < this.state.cookies.length; i++) {
      if(this.state.cookies[i]){
        var position = [Math.floor(i/this.state.gridSize), i - Math.floor(i/this.state.gridSize) * this.state.gridSize];

        // draw enemy
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.rect(position[0] * gridElSize + gridElSize/4, position[1] * gridElSize + gridElSize/4, gridElSize/2, gridElSize/2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  this.reset = function(){
    this.state.enemyPosition = [0, 0];
    this.state.playerPosition = [0, this.state.gridSize-1];
    this.state.enemyDirection = 0;
    this.state.enemyTock = 0;
    this.state.gameOver = false;
    this.state.cookies = new Array(this.state.gridSize*this.state.gridSize);
    this.state.cookieCount = 0;
    this.state.score = 0;
  }

  this.inputSize = 4;

  this.getFeatureVector = function(){
    var vector = [];

    // // player (zero centered - normalized)
    vector[0] = (this.state.playerPosition[0] - this.state.gridSize/2)/this.state.gridSize/2;
    vector[1] = (this.state.playerPosition[1] - this.state.gridSize/2)/this.state.gridSize/2;

    // enemy
    vector[2] = (this.state.enemyPosition[0] - this.state.gridSize/2)/this.state.gridSize/2;
    vector[3] = (this.state.enemyPosition[1] - this.state.gridSize/2)/this.state.gridSize/2;

    // distance
    // vector[4] = Math.abs(this.state.playerPosition[0] - this.state.enemyPosition[0])/this.state.gridSize;
    // vector[5] = Math.abs(this.state.playerPosition[1] - this.state.enemyPosition[1])/this.state.gridSize;
    
    // player (unnormalized)
    // vector[0] = this.state.playerPosition[0];
    // vector[1] = this.state.playerPosition[1];

    // enemy
    // vector[2] = this.state.enemyPosition[1];
    // vector[3] = this.state.enemyPosition[1];

    return vector;
  }

  this.boundCheck = function(position){
    if(position[0] > this.state.gridSize - 1){
      position[0] = this.state.gridSize - 1;
    }
    if(position[1] > this.state.gridSize - 1){
      position[1] = this.state.gridSize - 1;
    }
    if(position[0] < 0){
      position[0] = 0;
    }
    if(position[1] < 0){
      position[1] = 0;
    }
    return position;
  }

  this.step = function(action){

    if(this.state.gameOver == false){
      // player step

      // action = 0 do nothing
      if(action == 1){
        this.state.playerPosition[0] -= 1;
      }
      else if(action == 2){
        this.state.playerPosition[1] -= 1;
      }
      else if(action == 3){
        this.state.playerPosition[0] += 1;
      }
      else if(action == 4){
        this.state.playerPosition[1] += 1;
      }
      this.state.playerPosition = this.boundCheck(this.state.playerPosition);

      // enemy step
      var randEnemyAction = Math.floor(Math.random()*4) + 1;

      // move enemy in direction of player
      // if(Math.random() > 0.5){

      //   randEnemyAction = 1;
      //   if(this.state.enemyPosition[0] < this.state.playerPosition[0]){
      //     randEnemyAction = 3;
      //   }else if (this.state.enemyPosition[1] < this.state.playerPosition[1]){
      //     randEnemyAction = 4;
      //   }else if (this.state.enemyPosition[1] > this.state.playerPosition[1]){
      //     randEnemyAction = 2;
      //   }

      // }

      if(randEnemyAction == 1){
        this.state.enemyPosition[0] -= 1;
      }
      else if(randEnemyAction == 2){
        this.state.enemyPosition[1] -= 1;
      }
      else if(randEnemyAction == 3){
        this.state.enemyPosition[0] += 1;
      }
      else if(randEnemyAction == 4){
        this.state.enemyPosition[1] += 1;
      }

      this.state.enemyPosition = this.boundCheck(this.state.enemyPosition);

      if(this.state.enemyPosition[0] == this.state.playerPosition[0] && this.state.enemyPosition[1] == this.state.playerPosition[1]){
        this.state.gameOver = true;
      }
      if(this.state.cookieCount == this.state.gridSize*this.state.gridSize){
        this.state.gameOver = true;
        this.state.score += this.state.gridSize*this.state.gridSize/2;
      }

      // player check cookie
      var cookieKey = this.state.playerPosition[0]*this.state.gridSize + this.state.playerPosition[1];
      if(!this.state.cookies[cookieKey]){
        this.state.cookieCount += 1;
        this.state.score += 1;

        // (this.state.cookieCount / (this.state.gridSize*this.state.gridSize))

        this.state.cookies[cookieKey] = true;
      }else{
        this.state.score -= 0.0001;
      }

      // punish distance to enemy
      // x0, x1, y0, y1

      // var distancePunishment = Math.pow(Math.min(1, 1/distance(this.state.playerPosition,this.state.enemyPosition)),2);
      // if(Math.random() < 0.001){
      //   console.log(distancePunishment);
      // }
      // this.state.score -= distancePunishment;

    }
    return [this.state.gameOver, this.state.score];
  }

}