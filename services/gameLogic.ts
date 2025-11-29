import { FactionType, GameState } from '../types';

// Helper to check if a space is owned by a player
export const isSpaceOwned = (x: number, y: number, pylons: number[][], playerId: string, gameState: GameState): boolean => {
  // A space is owned if all 4 corners have pylons > 0 for host or < 0 for client
  
  // Corners: (x,y), (x+1,y), (x,y+1), (x+1,y+1)
  const c1 = pylons[x][y];
  const c2 = pylons[x+1][y];
  const c3 = pylons[x][y+1];
  const c4 = pylons[x+1][y+1];

  const isHost = gameState.players[0].id === playerId;
  
  if (isHost) {
    return c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0;
  } else {
    return c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0;
  }
};

export const getPylonHealth = (val: number) => Math.abs(val);

export const getPylonOwner = (val: number, players: any[]): string | null => {
  if (val > 0) return players[0].id;
  if (val < 0) return players[1].id;
  return null;
}

export const calculateResources = (state: GameState, playerId: string): number => {
  let count = 0;
  // Board is 7x7 spaces. Pylons are 8x8.
  for (let x = 0; x < 7; x++) {
    for (let y = 0; y < 7; y++) {
      if (isSpaceOwned(x, y, state.pylons, playerId, state)) {
        count++;
      }
    }
  }
  return count;
};

// BFS for pathfinding
// Returns array of {x, y} coordinates for the path
export const findPath = (
  startX: number, 
  startY: number, 
  targetX: number, 
  targetY: number, 
  pylons: number[][], 
  maxMove: number,
  _faction: FactionType,
  ownerId: string,
  players: any[]
): {x: number, y: number}[] | null => {
  
  // Simplification: We just want the next best step, or full path?
  // We need full path to check length.
  
  const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [];
  const visited = new Set<string>();
  
  queue.push({x: startX, y: startY, path: []});
  visited.add(`${startX},${startY}`);
  
  while (queue.length > 0) {
    const {x, y, path} = queue.shift()!;
    
    if (x === targetX && y === targetY) {
      return path;
    }
    
    if (path.length >= maxMove) continue;

    const neighbors = [
      {nx: x+1, ny: y},
      {nx: x-1, ny: y},
      {nx: x, ny: y+1},
      {nx: x, ny: y-1}
    ];

    for (const {nx, ny} of neighbors) {
      if (nx >= 0 && nx < 7 && ny >= 0 && ny < 7 && !visited.has(`${nx},${ny}`)) {
        // Check pylon blocking
        // Moving from (x,y) to (nx,ny)
        // Horizontal move (y same): Check shared vertical edge.
        // Vertical move (x same): Check shared horizontal edge.
        
        let blocked = false;
        
        // Pylon indices for corners of cell (x,y)
        // TL: x,y | TR: x+1,y | BL: x,y+1 | BR: x+1,y+1
        
        const isEnemyPylon = (val: number) => {
            if (val === 0) return false;
            const owner = getPylonOwner(val, players);
            return owner !== ownerId;
        };

        if (nx > x) { // Right
           // Check edge between (x,y) and (x+1,y). Shared corners: TR of current (x+1, y) and BR of current (x+1, y+1)
           // Actually, moving Right enters cell (x+1, y).
           // The shared edge is the Right edge of (x,y) and Left edge of (x+1, y).
           // Corners: (x+1, y) and (x+1, y+1).
           if (isEnemyPylon(pylons[x+1][y]) && isEnemyPylon(pylons[x+1][y+1])) blocked = true;
        } else if (nx < x) { // Left
           // Shared edge: Left of (x,y). Corners (x, y) and (x, y+1).
           if (isEnemyPylon(pylons[x][y]) && isEnemyPylon(pylons[x][y+1])) blocked = true;
        } else if (ny > y) { // Down
           // Shared edge: Bottom of (x,y). Corners (x, y+1) and (x+1, y+1).
           if (isEnemyPylon(pylons[x][y+1]) && isEnemyPylon(pylons[x+1][y+1])) blocked = true;
        } else if (ny < y) { // Up
           // Shared edge: Top of (x,y). Corners (x, y) and (x+1, y).
           if (isEnemyPylon(pylons[x][y]) && isEnemyPylon(pylons[x+1][y])) blocked = true;
        }
        
        // Beez Special: Can move double through enemy territory?
        // Actually blocking is absolute in rules: "Pylons block enemy units from passing between."
        // Beez "move through enemy territory" refers to space ownership, not pylon walls.
        
        if (!blocked) {
          visited.add(`${nx},${ny}`);
          queue.push({x: nx, y: ny, path: [...path, {x: nx, y: ny}]});
        }
      }
    }
  }
  
  return null;
};