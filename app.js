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


//let w = 

// runs to game loop with a set interval
let gameLoopInterval = setInterval(gameLoop, 60)

let mapArray
let scaledMapArray

crawlers = []

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

let healthBarOffset = -10
let healthBarHeight = 5

let gracePeriod = 30

factionAttributes = {
    "red":{lineDash:[5,15],laserOffset:0},
    "blue":{lineDash:[], laserOffset:10}
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


        this.theta = Math.PI/2;
        this.moveCounter = 0;
        this.previouslyInside = inside([this.x,this.y],scaledMapArray);
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
        this.inside = inside([this.x,this.y], scaledMapArray)
    }
    renderHealthBar(){
        this.healthBarLength = this.width * (this.health/this.initialHealth)
        ctx.fillStyle = "gray"
        ctx.fillRect(this.x, this.y + healthBarOffset, this.healthBarLength, healthBarHeight);
    }
}

class humanControllableCrawler extends Crawler{
    constructor(x,y,width, height, color, speed,damage,range,health){
        super(x,y,width, height, color, speed,damage,range,health)

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
        //console.log("xVector is" + xVector)

        //console.log("d is" + d)

        //console.log("x increment is " + this.x_increment)


    }

    move(){
        this.calcIncrements()

        //console.log(this.x)
        //console.log(this.y)

        this.x = this.x + this.x_increment
        this.y = this.y + this.y_increment


        //console.log(this.x)
        //console.log(this.y)



        this.moveCounter ++;
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

            console.log("hit!")

            console.log("hello")

            coordinate1 = [crawlers[target_index].x,crawlers[target_index].y]
            coordinate2 = [crawlers[i].x,crawlers[i].y]

            console.log(coordinate1)
            console.log(coordinate2)

            animateShoot(coordinate1,coordinate2,crawlers[i].color)
        }
    }

}

function removeDeadCrawlers(){
    for(i = 0; i < crawlers.length; i++){
        if(crawlers[i].health < 0){
            //console.log(crawlers)
            crawlers.splice(i,1);
            //console.log(crawlers)
            //console.log(`crawler ${i} -- he gone!`);
        }
    }

    //console.log("removeDeadCrawlers")
}


function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

}

function updateCoords(){
        for(i = 0; i<crawlers.length; i++ ){
            crawlers[i].move()
        }
        //console.log("updateCoords")
    }

function renderCrawlers(){

    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].render()
    }
    //console.log("renderCrawlers")
}


function renderHealthBars(){
    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].renderHealthBar()
    }
    //console.log("renderCrawlers")
}


function adjustTrajectories(){

    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].updateInsideStatus(scalemapArray)
        let checkIfInside = crawlers[i].inside
        let checkIfPreviouslyInside = crawlers[i].previouslyInside
        if(checkIfInside === false && checkIfPreviouslyInside === true){
            crawlers[i].theta = - crawlers[i].theta
        }
    }
    //console.log("adjustTrajectories")


}









function renderMap(vs){

    ctx.beginPath();
    ctx.setLineDash([]);
    

    let x0 = vs[0]
    let y0 = vs[0]

    //console.log([x0,y0])

    // ctx.moveTo(x0,y0)

    for(i=0;i<vs.length;i++){

        let x = vs[i][0]
        let y = vs[i][1]

        //console.log([x,y])
        ctx.lineTo(x,y)

    }

    // ctx.lineTo(x0,y0)

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();

}


mapArray = [[50,250],[350,350],[450,475],[500,50],[50,50],[10,10],[50,250]]

let scale = 2;

function assignScale(scaleInput){
    scale = scaleInput
}

function scalemapArray(pointToScale){
    scaled1 = pointToScale[0] * scale
    scaled2 = pointToScale[1] * scale

    return([scaled1,scaled2])
}

assignScale(2);
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
        //console.log(xcoord)
        //console.log(ycoord)

        if(foundAPoint){
            
            return
        } else{
            xcoord = null
            ycoord = null
        }
    }
    


    

    
}


function initializeGame(){
    ////console.log("nothing")

    let b = new humanControllableCrawler(200,200,20,20,"red",20,50,300,5000)

//    updateHealth()
//    removeDeadCrawlers()
//    updateCoords()
//    renderCrawlers()
}

function spawnNewEnemies(freq){
    if(gameCounter % freq === 0){

    createNewCoords()
   let g = new Crawler(xcoord,ycoord,20,20,"blue",10,50,150,1000)
    }
}

initializeGame();
 function gameLoop(){
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

      
      gameCounter ++
 }

//  function testGame(){
//     ////console.log("nothing")

//     let b = new humanControllableCrawler(200,200,20,20,"red",10,50)

//     updateHealth()
//     removeDeadCrawlers()
//     updateCoords()
//     renderCrawlers()
// }
// testGame();