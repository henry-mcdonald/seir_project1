// Game State
// 1 Array of active crawlers including relevant attributes (per faction)
// 


const movementDisplay = document.getElementById('movement')
const canvas = document.getElementById('canvas')
/* canvas setup / game state */
const ctx = canvas.getContext('2d')
// you always set the canvas width/height
canvas.setAttribute("height", getComputedStyle(canvas)["height"])
canvas.setAttribute("width", getComputedStyle(canvas)["width"])

let scoreCounterEl = document.querySelector("#scoreCounter")
let resetButtonEl = document.querySelector("#resetButton")
let introDivEl = document.querySelector("#box")
let endDivEl = document.querySelector("#endDiv")
let endTextEl = document.querySelector("#endMessage")
//let w = 

// runs to game loop with a set interval
let gameLoopInterval = setInterval(gameLoop, 80)

let mapArray
let scaledMapArray

let crawlers = []

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }


let wDown
let aDown
let sDown
let dDown

let xVector
let yVector

let gameCounter = 0

let enemyCounter


let healthBarOffset = -10
let healthBarHeight = 5

let outsidePenalty = 50

let gracePeriod = 30

let humanLocationX
let humanLocationY
let humanAlive
let scoreCount
let gameActive
let humanCrawler

let victoryThreshold = 100

let commonWidth = 20
let commonHeight = 20

factionAttributes = {
    "red":{lineDash:[5,15],laserOffset:0},
    "blue":{lineDash:[], laserOffset:10}
}

let crawlerObject = {
    all: [],
    'blue': [],
    'red': []
}



function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};


function crawlerInside(crawler, vs){
    let point1 = [crawler.x,crawler.y]
    let point2 = [crawler.x + crawler.width,crawler.y]
    let point3 = [crawler.x, crawler.y + crawler.height]
    let point4 = [crawler.x + crawler.width, crawler.y + crawler.height]

    let inside1 = inside(point1,vs)
    let inside2 = inside(point2,vs)
    let inside3 = inside(point3,vs)
    let inside4 = inside(point4,vs)

    return(inside1 && inside2 && inside3 && inside4)
}

function teleportPlayer(event){
    console.log(event)
}

class Crawler {
    constructor(x,y,width, height, color, speed,damage,range,health){
        this.x = x;
        this.y = y;
        this.width = width
        this.height = height
        this.color = color
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.health = health;
        this.initialHealth = health;


        this.theta = Math.random() * 2*Math.PI
        this.moveCounter = 0;
        this.previouslyInside = crawlerInside(this, scaledMapArray)
        crawlers.push(this)
    }
    render() {
        if(this.moveCounter > gracePeriod || this.moveCounter % 2 === 0){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      }
    calcIncrements(){
        this.x_increment = this.speed * Math.cos(this.theta)
        this.y_increment = this.speed * Math.sin(this.theta) 
    }
    move(){
        this.calcIncrements()
        this.x = this.x + this.x_increment
        this.y = this.y + this.y_increment
        this.moveCounter ++;
    }
    rotateClockwise(deltaTheta){
        this.theta += deltaTheta
    }
    updateInsideStatus(){
        this.previouslyInside = this.inside
        this.inside = crawlerInside(this, scaledMapArray)

        if(this.previouslyInside === false && this.inside === false){
            this.health -= outsidePenalty
        }
    }
    renderHealthBar(){
        this.healthBarLength = this.width * (this.health/this.initialHealth)
        ctx.fillStyle = "gray"
        ctx.fillRect(this.x, this.y + healthBarOffset, this.healthBarLength, healthBarHeight);
    }
}

function deleteCrawler(){

}

class seekerCrawler extends Crawler{
    constructor(x,y,width, height, color, speed,damage,range,health){
        super(x,y,width, height, color, speed,damage,range,health)
        this.adjustmentPeriod = 30
    }
    calcIncrements(){

            this.x_vector = humanLocationX - this.x
            this.y_vector = humanLocationY - this.y

            let d = Math.sqrt(Math.pow(this.x_vector,2) + Math.pow(this.y_vector,2))

            this.x_increment = this.x_vector * (this.speed/d)
            this.y_increment = this.y_vector * (this.speed/d)



    }

    move(){
        if(this.moveCounter % this.adjustmentPeriod === 0){
        this.calcIncrements()
        
        
        }

        this.x = this.x + this.x_increment
        this.y = this.y + this.y_increment
        this.moveCounter ++;
    }
}

class humanControllableCrawler extends Crawler{
    constructor(x,y,width, height, color, speed,damage,range,health){
        super(x,y,width, height, color, speed,damage,range,health)
        this.regen = 0.2
    }

    calcIncrements(){

        wDown = pressedKeys["w"]
        aDown = pressedKeys["a"]
        sDown = pressedKeys["s"]
        dDown = pressedKeys["d"]

        xVector = 0
        yVector = 0

        if(dDown){
            xVector += 1
        }
        if(aDown){
            xVector -= 1
        }
        if(sDown){
            yVector += 1
        }
        if(wDown){
            yVector -= 1
        }

        
        let d_squared = Math.pow(xVector, 2) + Math.pow(yVector, 2)
        let d = Math.sqrt(d_squared)

        if(d>0){
        this.x_increment = (xVector / d) * this.speed
        this.y_increment = (yVector / d) * this.speed
        } else{
            this.x_increment = 0
            this.y_increment = 0
        }


    }

    move(){
        this.calcIncrements()


        this.x = this.x + this.x_increment
        this.y = this.y + this.y_increment

        humanLocationX = this.x
        humanLocationY = this.y




        this.moveCounter ++;

        humanAlive = this.health > 0

        this.health += this.regen
    }
    

}



//class laserShot()


function animateShoot(coordinate1,coordinate2,color){
    ctx.strokeStyle = color
    ctx.setLineDash(factionAttributes[color].lineDash);
    ctx.lineWidth = 3;


    ctx.beginPath();
    ctx.moveTo(coordinate1[0],coordinate1[1] + factionAttributes[color].laserOffset);
    ctx.lineTo(coordinate2[0],coordinate2[1]);

    ctx.stroke();


}

const coordinates = []
// the first loop is the shooting crawler! The 2nd loop is the one being shot.
function updateHealth(){
    for(i = 0; i<crawlers.length; i++){
        let count_in_range = 0;
        let min_distance = Number.POSITIVE_INFINITY
        target_index = false;

        for(j = 0; j<crawlers.length; j++){


            
            if(crawlers[i].color != crawlers[j].color){

            first_x = crawlers[i].x
            first_y = crawlers[i].y

            second_x = crawlers[j].x
            second_y = crawlers[j].y

            var a = first_x - second_x;
            var b = first_y - second_y;
            
            var d = Math.sqrt( a*a + b*b );

            range = crawlers[i].range

            if(d<range) {

                if(d<min_distance){
                    min_distance = d
                    target_index = j

                    


                }
            
            
                count_in_range ++
            }

            }
        }

        if(target_index !== false && crawlers[i].moveCounter>gracePeriod){ //ie there IS a target in range

            //code to animate shot

            ctx.beginPath();
            ctx.setLineDash([5, 15]);

            ctx.moveTo(crawlers[target_index].x,crawlers[target_index].y);

            

        
            ctx.lineTo(first_x,first_y);

            


            ctx.stroke();



            // code to update crawler health


            crawlers[target_index].health -= crawlers[i].damage


            coordinate1 = [crawlers[target_index].x,crawlers[target_index].y]
            coordinate2 = [crawlers[i].x,crawlers[i].y]



            animateShoot(coordinate1,coordinate2,crawlers[i].color)
        }
    }

}



function removeDeadCrawlers(){
    for(i = 0; i < crawlers.length; i++){
        if(crawlers[i].health < 0){
            crawlers.splice(i,1);
            scoreCount ++ 
            scoreCounterEl.innerText = "Current Score is " + scoreCount




        }
    }

}


function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

}

function updateCoords(){
        for(i = 0; i<crawlers.length; i++ ){
            crawlers[i].move()
        }
    }

function renderCrawlers(){

    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].render()
    }
}


function renderHealthBars(){
    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].renderHealthBar()
    }
}


function adjustTrajectories(){

    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].updateInsideStatus(scalemapArray)
        let checkIfInside = crawlers[i].inside
        let checkIfPreviouslyInside = crawlers[i].previouslyInside
        if(checkIfInside === false && checkIfPreviouslyInside === true){
            crawlers[i].theta = crawlers[i].theta + Math.PI
        }
    }


}






let fudgeFactor = 1.1


function renderMap(vs){

    ctx.beginPath();
    ctx.setLineDash([]);
    

    let x0 = vs[0]
    let y0 = vs[0]


    // ctx.moveTo(x0,y0)

    for(i=0;i<vs.length;i++){

        let x = vs[i][0] 
        let y = vs[i][1]

        ctx.lineTo(x,y)

    }

    // ctx.lineTo(x0,y0)

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();

}


//mapArray = [[50,250],[350,350],[450,475],[500,50],[50,50],[10,10],[50,250]]
mapArray = [[0,0],[1,0],[1,5],[3,5],[3,3],[2,3],[2,1],[6,1],[6,3],[5,3],[5,5],[7,5],[7,7],[9,7],[9,9],[7,9],[7,11],[5,11],[5,13],[3,13],[3,11],
[4,11],[4,10],[3,10],[3,9],[2,9],[2,8],[0,8],[0,0]]

let scale = 60;
let xOffset = 150
let yOffset = 50

function assignScale(scaleInput){
    scale = scaleInput
}

function scalemapArray(pointToScale){
    scaled1 = pointToScale[0] * scale + xOffset
    scaled2 = pointToScale[1] * scale + yOffset

    return([scaled1,scaled2])
}

assignScale(scale);
scaledMapArray = mapArray.map(scalemapArray)
renderMap(scaledMapArray)

let xcoord
let ycoord
function createNewCoords(){
    let foundAPoint = false;

    for(i = 0; i< 100; i++){

        xcoord = Math.floor(Math.random()*1000)
        ycoord = Math.floor(Math.random()*1000)

        foundAPoint = inside([xcoord,ycoord],scaledMapArray) //if point is inside polygon


        if(foundAPoint){
            
            return
        } else{
            xcoord = null
            ycoord = null
        }
    }
    


    

    
}


function initializeGame(){
    enemyCounter = 0
    canvas.style.display = 'initial'
    scoreCounterEl.innerText = 'Current Score is 0'
    crawlers = [];
    humanCrawler = new humanControllableCrawler(170,200,20,20,"red",20,50,300,5000)
    scoreCount = 0
    gameActive = true
    introDivEl.style.display = 'none'
    resetButtonEl.style.display = 'none'
    endDivEl.style.display = 'none'

    

    console.log("INITIALIZED")
//    updateHealth()
//    removeDeadCrawlers()
//    updateCoords()
//    renderCrawlers()
}

function spawnNewEnemies(freq){
    if(gameCounter % freq === 0){

    createNewCoords()
   let g = new Crawler(xcoord,ycoord,12,12,"blue",7,50,150,1000)

   createNewCoords()
   let h = new seekerCrawler(xcoord,ycoord,15,15,"blue",5,50,100,1000)
    }
}

function displayEndScreen(outcome){
    endTextEl.innerText = outcome
    canvas.style.display = 'none'
    resetButtonEl.style.display = 'initial'
    resetButtonEl.innerText = 'Reset Game'
    endDivEl.style.display = 'initial'
}

function checkForEnd(){
    if(humanCrawler.health < 0){
        displayEndScreen("Defeat")
        gameActive = false
    }
    else if(scoreCount > victoryThreshold){
        displayEndScreen("Victory")
        gameActive = false
    }

}

 function gameLoop(){

    if(gameActive){
     clearCanvas()  
    updateHealth()
      removeDeadCrawlers()
      updateCoords()
      renderCrawlers()
      renderHealthBars()
      //renderLasers()
      renderMap(scaledMapArray)
      adjustTrajectories()
      spawnNewEnemies(30)
      checkForEnd()
    }
      
      gameCounter ++
 }

//  function testGame(){

//     let b = new humanControllableCrawler(200,200,20,20,"red",10,50)

//     updateHealth()
//     removeDeadCrawlers()
//     updateCoords()
//     renderCrawlers()
// }
// testGame();



resetButtonEl.addEventListener("click",initializeGame)

canvas.addEventListener("click",teleportPlayer)