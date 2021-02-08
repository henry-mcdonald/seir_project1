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



// runs to game loop with a set interval
let gameLoopInterval = setInterval(gameLoop, 60)

let mapArray
let scaledMapArray

crawlers = []



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
    constructor(x,y,width, height, color, speed,damage,range,faction,shields,health,laserColor){
        this.x = x;
        this.y = y;
        this.width = width
        this.height = height
        this.color = color
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.faction = faction;
        this.shields = shields;
        this.health = health;
        this.laserColor = laserColor


        this.theta = Math.PI/2;
        this.moveCounter = 0;
        this.previouslyInside = inside([this.x,this.y],scaledMapArray);
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }

    takeDamage(){

    }

    giveDamage(){

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
}





function animateShoot(){

}

const coordinates = []
// the first loop is the shooting crawler! The 2nd loop is the one being shot.
function updateHealth(){
    for(i = 0; i<crawlers.length; i++){
        for(j = 0; j<crawlers.length; j++){

            const count_in_range = 0;
            let min_distance = Number.POSITIVE_INFINITY
            target_index = false;
            
            if(crawlers[i].faction != crawlers[j].faction){

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
            
            if(target_index !== false){ //ie there IS a target in range

                ctx.setLineDash([5, 15]);
                ctx.beginPath();
                ctx.moveTo(crawlers[target_index].x,crawlers[target_index].y);
                ctx.lineTo(first_x,first_y);
                ctx.stroke();


                crawlers[j].health -= crawlers[i].damage
            }
                count_in_range ++
            }

            }
        }
    }

}

function removeDeadCrawlers(){
    for(i = 0; i < crawlers.length; i++){
        if(crawlers[i].health < 0){
            crawlers.splice(i);
            console.log(`crawler ${i} -- he gone!`);
        }
    }

    console.log("removeDeadCrawlers")
}




function updateCoords(){
        for(i = 0; i<crawlers.length; i++ ){
            crawlers[i].move()
        }
        console.log("updateCoords")
    }

function renderCrawlers(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(i = 0; i<crawlers.length; i++ ){
        crawlers[i].render()
    }
    console.log("renderCrawlers")
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
    console.log("adjustTrajectories")


}




function initializeGame(){
    //console.log("nothing")

    let a = new Crawler(0,0,20,20,"white",10)
    let b = new Crawler(200,200,20,20,"red",10)

    crawlers.push(a)
    crawlers.push(b)

    updateHealth()
    removeDeadCrawlers()
    updateCoords()
    renderCrawlers()
}






function renderMap(vs){

    ctx.beginPath();
    

    let x0 = vs[0]
    let y0 = vs[0]

    console.log([x0,y0])

    // ctx.moveTo(x0,y0)

    for(i=0;i<vs.length;i++){

        let x = vs[i][0]
        let y = vs[i][1]

        console.log([x,y])
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

initializeGame();
function gameLoop(){
    updateHealth()
    removeDeadCrawlers()
    updateCoords()
    renderCrawlers()
    renderMap(scaledMapArray)
    adjustTrajectories()
}