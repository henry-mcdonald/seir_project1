# Overview

Game where player controls a robot with WASD and faces off against enemy robots

## Screenshot: 

![View of enemy robot within game map](https://i.imgur.com/xSX8XPX.png)


## User Stories

User controls a 'robot' which exists within a map and faces off against enemy robots. Leaving this map will incur damage. 


The user's robot is controlled with WASD -- and enemy robots will be fired by the user's laser when the enemy robot is within range of the user's laser. 

The robots also have a laser, but with shorter range. So maintaining a healthy distance away from enemy robots will be key, and avoiding getting entangled with multiple robots at one time will also be key.

Victory Condition: 101 enemy Robots are defeated (health< 0)

Loss Condition: Player's Robots are defeated (health < 0)

Enemy Robots will feed into the map -- some are able to track the player's robots, others bounce around aimlessly. 

The user's robot can 'teleport' from its current point on the map to any other point -- every several seconds. Watch the yellow status bar in the top left to see when this ability has fully recharged!

Sources:

1. https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
2. https://github.com/substack/point-in-polygon
3. https://github.com/SEI-SEA-1-25/canvas-crawler


MVP goals:

1. Player robot moves with WASD
2. Enemy Robots bounce and game boundary penalizes robots who leave

Stretch:

1. Make map with multiple polygons
2. Rudimentary 'AI'
3. Teleport option for player

Next Steps:

3. Screen that can scroll so that the map can be larger than the display
1. More complex 'AI' movement -- swarm, path following, etc. (specifics to be elaborated further)
2. Additional weapon option for player robot (chain-reaction bomb)
