Gameplay:

User controls a 'robot' which exists in an interesting polygonal map. As an example, find below -- one enemy robot within the polygonal map, and one player-controlled robot.

![View of enemy robot within game map](https://i.imgur.com/iJKxxGL.png?2)


The user's robot is controlled with WASD -- and enemy robots will be fired by the user's laser when the enemy robot is within range of the user's laser. 

The robots also have a laser, but with shorter range. So maintaining a healthy distance away from enemy robots will be key, and avoiding getting entangled with multiple robots at one time will also be key.

Victory Condition: Enemy Robots are defeated (health< 0)

Loss Condition: Player's Robots are defeated (health < 0)

Currently implemented:

1. Robots bounce off walls in a basic manner
2. Health, damage tracking

Next Steps:

1. WASD implemented for player-controlled robots
1. Logic for 'feeding robots into the map' -- making the game the appropriate level of difficulty
2. Laser shooting will be animated
3. Meaningful sprites to be displayed over boxes

Stretch goals:

1. Get 'bouncing off walls' physics to be correct
2. Enemy robots have some logic to the way they move rather than just bouncing around
2. Add 'helper robots' which can be given simple instructions (such as 'follow main robot'

Very stretch goals:
1. Procedural generated levels (very very stretch)
2. Create instruction set for ally robots such as: 'guard this area', 'follow enemy robots', 'suicide mission', 'follow ally robots'
