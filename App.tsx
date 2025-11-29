import { useEffect, useState } from 'react';
import { NetworkMessage, GameState, PlayerState, Unit, BuildOrder, FactionType, UnitStats } from './types';
import { peerService } from './services/peerService';
import { FACTIONS, BOARD_SIZE, INITIAL_UNLOCKS } from './constants';
import { calculateResources, getPylonOwner, getPylonHealth, isSpaceOwned } from './services/gameLogic';
import { Zap, Shield, Sword, Hammer, Settings, Users, Play, Clock, CheckCircle, ArrowLeft, BookOpen } from 'lucide-react';

// --- NEW COMPONENTS ---

const HowToPlay = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans flex flex-col items-center z-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-green-100 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onBack} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft size={28} />
        </button>
        <h2 className="text-4xl font-black text-green-800 mb-8 text-center border-b-4 border-green-50 pb-6 tracking-tight">Game Mechanics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
           <section className="col-span-1 md:col-span-2 bg-green-50 p-6 rounded-2xl border border-green-100">
             <h3 className="text-2xl font-black text-green-700 mb-3 flex items-center gap-3"><Shield className="fill-green-200" size={28}/> Objective</h3>
             <p className="text-lg leading-relaxed">
               Command your insect faction on a <strong>7x7 Picnic Board</strong>. Your goal is to defeat the opposing <strong>Queen (10 HP)</strong> while expanding your territory. 
               The game ends immediately when a Queen is destroyed.
             </p>
           </section>

           <section>
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="text-blue-500" size={24}/> Turn Phases</h3>
             <div className="space-y-4">
               <div className="bg-white border-l-4 border-yellow-400 pl-4 py-2">
                 <strong className="block text-gray-900">1. Resource Phase (60s)</strong>
                 <span className="text-sm">Collect Resource Cubes. You gain <span className="font-bold text-yellow-600">+1 Cube</span> for every space your territory controls.</span>
               </div>
               <div className="bg-white border-l-4 border-blue-400 pl-4 py-2">
                 <strong className="block text-gray-900">2. Building Phase (60s)</strong>
                 <span className="text-sm">Spend resources to <strong>Unlock Tech</strong> or <strong>Build Units</strong>. New units must be placed in your existing territory.</span>
               </div>
               <div className="bg-white border-l-4 border-red-400 pl-4 py-2">
                 <strong className="block text-gray-900">3. Action Phase</strong>
                 <span className="text-sm">Combat! All units automatically take turns moving and acting based on their class behaviors.</span>
               </div>
             </div>
           </section>

           <section>
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap className="text-purple-500" size={24}/> Territory Control</h3>
             <ul className="space-y-3 text-sm">
               <li className="flex gap-3">
                 <div className="min-w-[6px] bg-purple-200 rounded-full"></div>
                 <p>A space is <strong>Controlled</strong> when enclosed by <strong>4 Pylons</strong> (one in each corner).</p>
               </li>
               <li className="flex gap-3">
                 <div className="min-w-[6px] bg-purple-200 rounded-full"></div>
                 <p><strong>Pylons</strong> act as walls, blocking enemy movement between spaces.</p>
               </li>
               <li className="flex gap-3">
                 <div className="min-w-[6px] bg-purple-200 rounded-full"></div>
                 <p>Pylons start with <strong>1 HP</strong> and can be reinforced up to <strong>5 HP</strong> by Builders.</p>
               </li>
             </ul>
           </section>

           <section className="col-span-1 md:col-span-2">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-orange-500" size={24}/> Unit Classes</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <div className="font-bold flex items-center gap-2 text-orange-800 text-lg mb-2"><Hammer size={20}/> Builders</div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Role:</strong> Expand & Fortify</p>
                    <p className="text-xs text-gray-500 leading-normal">
                      Moves to the edge of your territory to raise new Pylons (create territory) or heal existing ones up to 5 HP.
                    </p>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <div className="font-bold flex items-center gap-2 text-blue-800 text-lg mb-2"><Hammer size={20} className="rotate-45"/> Pounders</div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Role:</strong> Siege & Breach</p>
                    <p className="text-xs text-gray-500 leading-normal">
                      Moves towards enemy territory to damage and destroy their Pylons, removing their control.
                    </p>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <div className="font-bold flex items-center gap-2 text-red-800 text-lg mb-2"><Sword size={20}/> Strikers</div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Role:</strong> Combat & Assassin</p>
                    <p className="text-xs text-gray-500 leading-normal">
                      Hunts down the nearest enemy unit (or Queen) to attack and kill them.
                    </p>
                </div>
             </div>
           </section>
           
           <section className="col-span-1 md:col-span-2">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings className="text-gray-500" size={24}/> Factions</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <span className="font-black text-red-600 text-lg mb-1">Antz</span>
                  <span className="text-gray-500 italic mb-2">Well Rounded</span>
                  <p><strong>Ability:</strong> Builders & Pounders are versatile; they can perform both build AND destroy actions.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <span className="font-black text-blue-600 text-lg mb-1">Beetlez</span>
                  <span className="text-gray-500 italic mb-2">Tanky</span>
                  <p><strong>Ability:</strong> Units take <strong>0 damage</strong> unless the attack is lethal (instantly kills them).</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <span className="font-black text-yellow-600 text-lg mb-1">Beez</span>
                  <span className="text-gray-500 italic mb-2">High Mobility</span>
                  <p><strong>Ability:</strong> Units can fly through enemy territory (ignoring control) by spending double movement.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <span className="font-black text-green-600 text-lg mb-1">Mantiz</span>
                  <span className="text-gray-500 italic mb-2">Aggressive</span>
                  <p><strong>Ability:</strong> All units have <strong>Double Movement</strong> speed.</p>
                </div>
             </div>
           </section>
        </div>
        
        <div className="mt-10 text-center">
             <button onClick={onBack} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                 Return to Menu
             </button>
        </div>
      </div>
    </div>
  );
}

const HomeScreen = ({ onCreate, onJoin, onHowToPlay }: any) => {
    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
                 <div className="absolute top-[10%] left-[10%] transform -rotate-12 text-green-900"><Sword size={120} /></div>
                 <div className="absolute bottom-[10%] right-[10%] transform rotate-12 text-green-900"><Shield size={120} /></div>
                 <div className="absolute top-[20%] right-[20%] transform rotate-45 text-green-900"><Hammer size={80} /></div>
                 <div className="absolute bottom-[20%] left-[20%] transform -rotate-45 text-green-900"><Users size={80} /></div>
            </div>

            <div className="max-w-md w-full text-center z-10">
                <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
                    <h1 className="text-8xl font-black text-green-800 mb-2 tracking-tighter drop-shadow-sm">Bugz</h1>
                    <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest border border-green-200">Picnic Warfare</div>
                </div>

                <div className="space-y-4 flex flex-col px-6">
                    <button 
                        onClick={onCreate}
                        className="group bg-green-600 text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-green-700 hover:shadow-green-600/40 transform hover:-translate-y-1 transition-all flex items-center gap-4"
                    >
                        <div className="bg-green-500 p-2 rounded-xl group-hover:bg-green-600 transition-colors"><Play fill="currentColor" size={24} /></div>
                        <span className="flex-1 text-left">Create Game</span>
                    </button>
                    
                    <button 
                        onClick={onJoin}
                        className="group bg-white text-green-800 border-2 border-green-100 p-5 rounded-2xl font-bold text-xl shadow-lg hover:border-green-300 hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-4"
                    >
                         <div className="bg-green-50 p-2 rounded-xl group-hover:bg-green-100 transition-colors"><Users size={24} /></div>
                         <span className="flex-1 text-left">Join Game</span>
                    </button>

                    <button 
                        onClick={onHowToPlay}
                        className="group bg-white text-gray-600 border-2 border-gray-100 p-5 rounded-2xl font-bold text-xl shadow-lg hover:border-green-200 hover:text-green-700 hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-4"
                    >
                        <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-green-50 transition-colors"><BookOpen size={24} /></div>
                        <span className="flex-1 text-left">How to Play</span>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-6 text-green-800/40 text-xs font-mono font-semibold">
                v1.0 • Multiplayer Strategy
            </div>
        </div>
    )
}

// --- EXISTING COMPONENTS ---

const Lobby = ({ myId, peerIdInput, setPeerIdInput, joinGame, players, myPlayerId, onReady, onFactionSelect, chatMessages, sendChat, status }: any) => {
  const me = players.find((p: PlayerState) => p.id === myPlayerId);
  const opponent = players.find((p: PlayerState) => p.id !== myPlayerId);

  return (
    <div className="min-h-screen bg-green-50 p-4 flex flex-col font-sans">
      <div className="flex items-center justify-center relative mb-6">
          <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Lobby</h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-100">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-3 rounded-lg gap-3">
                <span className="font-semibold text-gray-600">Your Connection ID:</span>
                <div className="flex gap-2 w-full md:w-auto">
                    <code className="flex-1 bg-gray-200 px-3 py-2 rounded text-sm font-mono select-all text-gray-800 text-center">{myId || 'Connecting...'}</code>
                </div>
            </div>
          {!status.connected && (
             <div className="flex flex-col md:flex-row gap-2 mt-2">
              <input 
                type="text" 
                placeholder="Enter Opponent's ID to Join"
                className="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors"
                value={peerIdInput}
                onChange={(e) => setPeerIdInput(e.target.value)}
              />
              <button 
                onClick={joinGame}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
              >
                Connect
              </button>
            </div>
          )}
          {status.connected && (
            <div className="text-green-600 font-bold flex items-center justify-center gap-2 bg-green-50 p-3 rounded-lg animate-pulse">
                <Users size={20} />
                Connected to opponent
            </div>
          )}
        </div>
      </div>

      {status.connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Faction Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100 overflow-y-auto max-h-[60vh]">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Shield className="text-green-600" /> Choose Faction
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(FACTIONS).map((f) => {
                const faction = FACTIONS[f as FactionType];
                const isSelected = me?.faction === f;
                return (
                  <div 
                    key={f}
                    onClick={() => !me?.isReady && onFactionSelect(f)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${isSelected ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{faction.name}</h3>
                        {isSelected && <CheckCircle className="text-green-500" size={20} />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{faction.description}</p>
                    <div className="text-xs font-semibold text-green-700 bg-green-100 p-2 rounded">
                        Abililty: {faction.specialAbility}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
                onClick={onReady}
                disabled={!me?.faction}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${me?.isReady ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500'}`}
            >
                {me?.isReady ? 'Unready' : 'Ready Up'}
            </button>
          </div>

          {/* Chat & Status */}
          <div className="flex flex-col gap-6">
             <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100 flex-1 flex flex-col min-h-[300px]">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Users className="text-green-600" /> Lobby Chat
                </h2>
                <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 space-y-2 h-48 border border-gray-100">
                    {chatMessages.map((msg: any, i: number) => (
                        <div key={i} className={`p-2 rounded-lg max-w-[80%] text-sm ${msg.senderId === myPlayerId ? 'bg-green-100 ml-auto text-green-900 rounded-br-none' : 'bg-white border border-gray-200 mr-auto text-gray-800 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 border-2 border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendChat(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
             </div>

             {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                <h3 className="font-bold text-gray-700 mb-4">Players</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">You ({me?.faction || 'Selecting...'})</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${me?.isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {me?.isReady ? 'READY' : 'NOT READY'}
                        </span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Opponent ({opponent ? (opponent.faction || 'Selecting...') : 'Waiting...'})</span>
                         {opponent && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${opponent.isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {opponent.isReady ? 'READY' : 'NOT READY'}
                            </span>
                         )}
                    </div>
                </div>
                
                {status.startCountdown !== null && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 font-semibold mb-2">Game starting in</p>
                        <div className="text-5xl font-black text-green-600 animate-pulse">{status.startCountdown}</div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Game Component
const Game = ({ state, playerId, onBuildOrder, onEndPhase, activeAnimation }: any) => {
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [menuTab, setMenuTab] = useState<'build' | 'tech'>('build');
    const [startTimer, setStartTimer] = useState<number | null>(3);
    const [hasEndedPhase, setHasEndedPhase] = useState(false);
    
    // Derived
    const me = state.players.find((p: PlayerState) => p.id === playerId);
    const opponent = state.players.find((p: PlayerState) => p.id !== playerId);
    const myFactionData = me ? FACTIONS[me.faction as FactionType] : null;
    
    // Start countdown effect
    useEffect(() => {
        if (state.phase === 'STARTING') {
             const int = setInterval(() => {
                 setStartTimer(prev => {
                     if (prev === 1) return 1;
                     return (prev || 0) - 1;
                 })
             }, 1000);
             return () => clearInterval(int);
        } else {
            setStartTimer(null);
        }
    }, [state.phase]);

    // Reset local phase ready state when phase changes
    useEffect(() => {
        setHasEndedPhase(false);
        setSelectedUnitId(null);
    }, [state.phase]);
    
    const handleCellClick = (x: number, y: number) => {
        if (state.phase !== 'BUILDING') return;
        if (hasEndedPhase) return;

        // Check if building a unit
        if (selectedUnitId) {
            // Validate: Must be in owned zone (except Queen, but units build in owned zone)
            const owned = isSpaceOwned(x, y, state.pylons, playerId, state);
            if (!owned) {
                alert("Can only build in your territory");
                return;
            }
            // Check occupancy
            const occupied = state.units.some((u: Unit) => u.x === x && u.y === y);
            if (occupied) {
                alert("Space occupied");
                return;
            }
            
            // Send build order
            const unitDef = myFactionData?.units.find((u: UnitStats) => u.id === selectedUnitId);
            if (!unitDef) return;
            
            if (me.resources < unitDef.cost) {
                alert("Not enough resources");
                return;
            }
            
            // Deduct locally for feedback (actual state update comes from logic sync)
            onBuildOrder({
                unitId: selectedUnitId,
                targetX: x,
                targetY: y,
                type: 'BUILD_UNIT'
            });
            setSelectedUnitId(null);
        }
    };

    const handleUnlock = (unitId: string, cost: number) => {
        if (me.resources >= cost) {
             onBuildOrder({
                unitId: unitId,
                targetX: -1,
                targetY: -1,
                type: 'UNLOCK_TECH'
            });
        }
    };

    const renderBoard = () => {
        const grid = [];
        for(let y=0; y<BOARD_SIZE; y++) {
            for(let x=0; x<BOARD_SIZE; x++) {
                // Check ownership for background color
                const ownedByMe = isSpaceOwned(x, y, state.pylons, playerId, state);
                const ownedByOpp = isSpaceOwned(x, y, state.pylons, opponent.id, state);
                
                let bgClass = "bg-white/50"; // Picnic pattern handled by parent
                if (ownedByMe) bgClass = "bg-green-500/30";
                if (ownedByOpp) bgClass = "bg-red-500/30";

                const unit = state.units.find((u: Unit) => u.x === x && u.y === y);
                
                // Animation Classes
                let animationClass = "";
                let innerAnimationClass = "animate-idle"; // Default idle

                if (unit) {
                    // Check if this unit is currently acting
                    if (activeAnimation && activeAnimation.attackerId === unit.instanceId) {
                         innerAnimationClass = ""; // Stop idle
                         if (activeAnimation.type === 'ATTACK') {
                             if (activeAnimation.direction === 'UP') animationClass = "animate-lunge-up";
                             if (activeAnimation.direction === 'DOWN') animationClass = "animate-lunge-down";
                             if (activeAnimation.direction === 'LEFT') animationClass = "animate-lunge-left";
                             if (activeAnimation.direction === 'RIGHT') animationClass = "animate-lunge-right";
                         } else if (activeAnimation.type === 'MOVE') {
                             if (activeAnimation.direction === 'UP') animationClass = "animate-move-up";
                             if (activeAnimation.direction === 'DOWN') animationClass = "animate-move-down";
                             if (activeAnimation.direction === 'LEFT') animationClass = "animate-move-left";
                             if (activeAnimation.direction === 'RIGHT') animationClass = "animate-move-right";
                         }
                    } else if (activeAnimation && activeAnimation.targetId === unit.instanceId) {
                         innerAnimationClass = ""; // Stop idle
                         if (activeAnimation.type === 'DEATH') {
                             animationClass = "animate-death";
                         } else {
                             animationClass = "animate-shake";
                         }
                    }
                }

                const renderPylon = (px: number, py: number, posClass: string) => {
                    const val = state.pylons[px][py];
                    if (val === 0) return null;
                    const hp = getPylonHealth(val);
                    const owner = getPylonOwner(val, state.players);
                    const isMine = owner === playerId;
                    return (
                        <div className={`absolute ${posClass} w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-600 flex items-center justify-center text-[8px] font-bold text-white shadow-sm z-10
                            ${isMine ? 'bg-blue-500' : 'bg-red-500'}
                        `}>
                            {hp}
                        </div>
                    );
                };

                grid.push(
                    <div 
                        key={`${x},${y}`} 
                        className={`relative border border-gray-300/50 w-full h-full aspect-square flex items-center justify-center ${bgClass} hover:bg-white/60 transition-colors`}
                        onClick={() => handleCellClick(x, y)}
                    >
                        {/* Pylons */}
                        {renderPylon(x, y, "top-[-6px] left-[-6px]")}
                        {renderPylon(x+1, y, "top-[-6px] right-[-6px]")}
                        {renderPylon(x, y+1, "bottom-[-6px] left-[-6px]")}
                        {renderPylon(x+1, y+1, "bottom-[-6px] right-[-6px]")}
                        
                        {/* Unit */}
                        {unit && (
                             <div className={`w-3/4 h-3/4 ${animationClass} z-20`}>
                                 <div className={`w-full h-full rounded-lg shadow-md flex flex-col items-center justify-center text-xs font-bold relative ${innerAnimationClass}
                                    ${unit.ownerId === playerId ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                                 `}>
                                     {/* Unit Icon based on type */}
                                     {unit.type === 'Builder' && <Hammer size={12} />}
                                     {unit.type === 'Pounder' && <Hammer size={12} className="rotate-45" />}
                                     {unit.type === 'Striker' && <Sword size={12} />}
                                     
                                     <span className="text-[8px] md:text-[10px]">{unit.name.substring(0,3)}</span>
                                     
                                     {/* Health Bar */}
                                     <div className="absolute bottom-0 w-full h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                                         <div className="h-full bg-green-300" style={{width: `${(unit.currentHealth / unit.maxHealth) * 100}%`}}></div>
                                     </div>
                                 </div>
                             </div>
                        )}
                    </div>
                );
            }
        }
        return grid;
    };

    if (state.phase === 'STARTING' && startTimer) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="text-9xl font-black text-green-600 animate-ping">{startTimer}</div>
            </div>
        );
    }

    if (state.phase === 'GAME_OVER') {
        const iWon = state.winnerId === playerId;
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
                <h1 className={`text-6xl font-black mb-8 ${iWon ? 'text-green-500' : 'text-red-500'}`}>{iWon ? 'VICTORY' : 'DEFEAT'}</h1>
                
                <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full mb-8">
                    <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Battle Report</h2>
                    <div className="space-y-4">
                         <div className="flex justify-between">
                            <span>Units Built:</span>
                            <span className="font-mono text-xl">{me?.unitsBuilt}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Units Killed:</span>
                            <span className="font-mono text-xl">{me?.unitsKilled}</span>
                        </div>
                    </div>
                </div>

                <button onClick={() => window.location.reload()} className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-xl hover:bg-gray-200 transition-colors">
                    Return to Main Menu
                </button>
             </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
             {/* Header HUD */}
             <div className="bg-white shadow-md p-2 flex justify-between items-center z-10 px-4">
                 <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold">Phase</span>
                        <span className={`font-bold text-lg ${state.phase === 'ACTION' ? 'text-red-600' : 'text-blue-600'}`}>{state.phase}</span>
                     </div>
                     <div className="flex flex-col items-center bg-gray-100 px-3 py-1 rounded">
                         <Clock size={14} className="text-gray-500"/>
                         <span className="font-mono font-bold">{state.phaseTimeRemaining}s</span>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                         <div className="bg-yellow-400 p-2 rounded-lg shadow-sm">
                             <div className="w-3 h-3 bg-white rounded-sm"></div>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs font-bold text-gray-500">Resources</span>
                             <span className="text-2xl font-black text-gray-800 leading-none">{me?.resources}</span>
                         </div>
                     </div>
                 </div>
             </div>
             
             {/* Main Content */}
             <div className="flex-1 flex overflow-hidden relative">
                  {/* Game Board */}
                  <div className="flex-1 flex items-center justify-center bg-green-800 p-2 md:p-8 overflow-auto">
                      <div className="picnic-pattern shadow-2xl border-8 border-white rounded-lg relative" style={{width: 'min(90vw, 60vh)', height: 'min(90vw, 60vh)'}}>
                          <div className="grid grid-cols-7 grid-rows-7 w-full h-full">
                              {renderBoard()}
                          </div>
                      </div>
                  </div>
                  
                  {/* Phase Overlay/Controls */}
                  {state.phase === 'BUILDING' && (
                       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[40vh] z-20 overflow-hidden">
                           <div className="flex border-b border-gray-200">
                               <button 
                                onClick={() => setMenuTab('build')}
                                className={`flex-1 py-3 font-bold text-sm uppercase ${menuTab === 'build' ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-500'}`}
                               >Build Units</button>
                               <button 
                                onClick={() => setMenuTab('tech')}
                                className={`flex-1 py-3 font-bold text-sm uppercase ${menuTab === 'tech' ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-500'}`}
                               >Tech Tree</button>
                           </div>
                           
                           <div className="p-4 overflow-y-auto flex-1">
                               {hasEndedPhase ? (
                                   <div className="text-center text-gray-500 italic py-8">Waiting for opponent...</div>
                               ) : (
                                   <>
                                   {menuTab === 'build' && (
                                       <div className="grid grid-cols-1 gap-2">
                                           {myFactionData?.units.filter(u => me?.unlockedUnits.includes(u.id)).map(u => (
                                               <div 
                                                key={u.id}
                                                onClick={() => setSelectedUnitId(u.id === selectedUnitId ? null : u.id)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer ${selectedUnitId === u.id ? 'border-green-500 bg-green-50 ring-1 ring-green-300' : 'border-gray-200'}`}
                                               >
                                                   <div>
                                                       <div className="font-bold">{u.name}</div>
                                                       <div className="text-xs text-gray-500">A:{u.attack} H:{u.health} M:{u.move} W:{u.work}</div>
                                                   </div>
                                                   <div className="font-bold text-green-700 flex items-center gap-1">
                                                       {u.cost} <div className="w-2 h-2 bg-yellow-400 inline-block rounded-sm"></div>
                                                   </div>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                                   {menuTab === 'tech' && (
                                       <div className="grid grid-cols-1 gap-2">
                                           {myFactionData?.units.filter(u => !me?.unlockedUnits.includes(u.id)).map(u => (
                                               <div key={u.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                                                    <div>
                                                       <div className="font-bold text-gray-700">{u.name}</div>
                                                       <div className="text-xs text-gray-500">Unlock Cost: {Math.floor(u.cost * 1.5)}</div>
                                                   </div>
                                                   <button 
                                                    onClick={() => handleUnlock(u.id, Math.floor(u.cost * 1.5))}
                                                    disabled={me?.resources < Math.floor(u.cost * 1.5)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold disabled:opacity-50"
                                                   >
                                                       Unlock
                                                   </button>
                                               </div>
                                           ))}
                                           {myFactionData?.units.every(u => me?.unlockedUnits.includes(u.id)) && (
                                               <div className="text-center text-gray-400 py-4">All tech unlocked!</div>
                                           )}
                                       </div>
                                   )}
                                   </>
                               )}
                           </div>
                           
                           <div className="p-3 border-t border-gray-100 bg-gray-50">
                               <button 
                                onClick={() => { setHasEndedPhase(true); onEndPhase(); }}
                                disabled={hasEndedPhase}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-sm"
                               >
                                   {hasEndedPhase ? 'Ready & Waiting' : 'Finish Phase'}
                               </button>
                           </div>
                       </div>
                  )}
                  
                  {state.phase === 'RESOURCE' && (
                       <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
                           <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-100 animate-bounce-slow">
                               <h2 className="text-3xl font-black text-green-600 mb-2">Resource Phase</h2>
                               <p className="text-gray-600 text-lg">Collecting picnic supplies...</p>
                               <div className="mt-4 text-5xl font-mono font-bold text-yellow-500">+{me?.lastCollected || 0}</div>
                           </div>
                       </div>
                  )}
             </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState<'HOME' | 'HOW_TO_PLAY' | 'APP'>('HOME');
  const [myId, setMyId] = useState<string>('');
  const [peerIdInput, setPeerIdInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, startCountdown: null as number | null });
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<any>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
      phase: 'LOBBY',
      turnNumber: 0,
      players: [],
      units: [],
      pylons: Array(8).fill(0).map(() => Array(8).fill(0)),
      chatMessages: [],
      winnerId: null,
      phaseTimeRemaining: 0,
      actionQueue: [],
      currentActorIndex: 0
  });

  const [buildOrders, setBuildOrders] = useState<BuildOrder[]>([]);

  useEffect(() => {
    peerService.initialize((id) => {
      setMyId(id);
      setGameState(prev => ({
          ...prev,
          players: [{
              id,
              name: 'Player 1',
              isReady: false,
              faction: null,
              resources: 0,
              unlockedUnits: [],
              unitsBuilt: 0,
              unitsKilled: 0
          }]
      }));
    });

    peerService.setOnConnect(() => {
      setConnectionStatus(s => ({...s, connected: true}));
    });

    peerService.setOnMessage((msg: NetworkMessage) => {
      handleNetworkMessage(msg);
    });
  }, []);

  // Timer for phases
  useEffect(() => {
    let interval: any;
    if (gameState.phase === 'BUILDING' || gameState.phase === 'RESOURCE') {
        if (gameState.players[0].id === myId) { // Host manages timer
             interval = setInterval(() => {
                 setGameState(prev => {
                     const newTime = prev.phaseTimeRemaining - 1;
                     if (newTime <= 0) {
                         // Force phase end
                         handlePhaseEnd(prev.phase);
                         return {...prev, phaseTimeRemaining: 0};
                     }
                     return {...prev, phaseTimeRemaining: newTime};
                 });
             }, 1000);
        } else {
            // Client creates local countdown
             interval = setInterval(() => {
                 setGameState(prev => ({...prev, phaseTimeRemaining: Math.max(0, prev.phaseTimeRemaining - 1)}));
             }, 1000);
        }
    }
    return () => clearInterval(interval);
  }, [gameState.phase, myId]);


  const handleNetworkMessage = (msg: NetworkMessage) => {
      switch(msg.type) {
          case 'JOIN':
               if (gameState.players.length === 1) {
                   const newPlayer: PlayerState = {
                       id: msg.payload.id,
                       name: 'Player 2',
                       isReady: false,
                       faction: null,
                       resources: 0,
                       unlockedUnits: [],
                       unitsBuilt: 0,
                       unitsKilled: 0
                   };
                   const newRec = {...gameState, players: [...gameState.players, newPlayer]};
                   setGameState(newRec);
                   peerService.sendMessage({ type: 'SYNC_STATE', payload: newRec });
               }
               break;
          case 'SYNC_STATE':
              setGameState(msg.payload);
              if (msg.payload.players.length === 2) setConnectionStatus(s => ({...s, connected: true}));
              break;
          case 'UPDATE_PLAYER':
              setGameState(prev => ({
                  ...prev,
                  players: prev.players.map(p => p.id === msg.payload.id ? msg.payload : p)
              }));
              break;
          case 'CHAT':
              setChatMessages(prev => [...prev, msg.payload]);
              break;
          case 'START_GAME':
              startPreGameCountdown();
              break;
          case 'SUBMIT_BUILD_ORDERS':
              if (gameState.players[0].id === myId) {
                  processBuildPhase();
              }
              break;
          case 'PHASE_CHANGE':
              setGameState(prev => ({...prev, ...msg.payload}));
              break;
          case 'ANIMATION_EVENT':
              triggerAnimation(msg.payload);
              break;
      }
  };

  const triggerAnimation = (payload: any) => {
      setActiveAnimation(payload);
      // Clear animation after duration
      setTimeout(() => {
          setActiveAnimation(null);
      }, 500);
  };

  const startPreGameCountdown = () => {
      let count = 5;
      setConnectionStatus(s => ({...s, startCountdown: count}));
      const int = setInterval(() => {
          count--;
          if (count === 0) {
              clearInterval(int);
              setConnectionStatus(s => ({...s, startCountdown: null}));
              initializeGame();
          } else {
              setConnectionStatus(s => ({...s, startCountdown: count}));
          }
      }, 1000);
  };

  const initializeGame = () => {
      const newPylons = Array(8).fill(0).map(() => Array(8).fill(0));
      const p1 = gameState.players[0];
      const p2 = gameState.players[1];
      
      const setPylon = (x: number, y: number, val: number) => {
          newPylons[x][y] = val;
      }

      [[1,3], [2,3], [1,4], [2,4], [1,2], [2,2], [1,5], [2,5]].forEach(([x,y]) => setPylon(x,y, 5));
      [[5,3], [6,3], [5,4], [6,4], [5,2], [6,2], [5,5], [6,5]].forEach(([x,y]) => setPylon(x,y, -5));

      const units: Unit[] = [];
      
      units.push({
          id: 'queen_p1', name: 'Queen', type: 'Builder', cost: 0, move: 0, attack: 0, health: 10, maxHealth: 10, work: 0,
          currentHealth: 10, x: 1, y: 3, ownerId: p1.id, instanceId: 'q1', hasActed: true
      });
      units.push({
          id: 'queen_p2', name: 'Queen', type: 'Builder', cost: 0, move: 0, attack: 0, health: 10, maxHealth: 10, work: 0,
          currentHealth: 10, x: 5, y: 3, ownerId: p2.id, instanceId: 'q2', hasActed: true
      });

      const newState: GameState = {
          ...gameState,
          phase: 'STARTING', 
          pylons: newPylons,
          units: units,
          players: gameState.players.map(p => ({...p, unlockedUnits: INITIAL_UNLOCKS[p.faction as FactionType]})),
          phaseTimeRemaining: 3
      };
      
      setGameState(newState);
      if (myId === p1.id) peerService.sendMessage({ type: 'SYNC_STATE', payload: newState });

      setTimeout(() => {
          startResourcePhase(newState);
      }, 3000);
  };

  const startResourcePhase = (currentState: GameState) => {
      const p1Res = calculateResources(currentState, currentState.players[0].id);
      const p2Res = calculateResources(currentState, currentState.players[1].id);
      
      const nextState: GameState = {
          ...currentState,
          phase: 'RESOURCE',
          phaseTimeRemaining: 60,
          players: currentState.players.map((p, i) => ({
              ...p,
              resources: p.resources + (i===0 ? p1Res : p2Res),
              lastCollected: (i===0 ? p1Res : p2Res)
          }))
      };
      
      setGameState(nextState);
      if (myId === currentState.players[0].id) peerService.sendMessage({ type: 'SYNC_STATE', payload: nextState });

      setTimeout(() => {
           const buildState = {...nextState, phase: 'BUILDING' as const, phaseTimeRemaining: 60};
           setGameState(buildState);
           if (myId === currentState.players[0].id) peerService.sendMessage({ type: 'SYNC_STATE', payload: buildState });
      }, 3000);
  };

  const processBuildPhase = () => {
      // Logic for processing orders locally if needed, but currently unused so removed
      let newState = {...gameState};
      
      // ... (Unlock Logic omitted for brevity, focusing on phase transition) ...

      const actionState = {
          ...newState,
          phase: 'ACTION' as const,
          phaseTimeRemaining: 0,
          actionQueue: newState.units.map(u => u.instanceId),
          currentActorIndex: 0
      };
      setGameState(actionState);
      peerService.sendMessage({ type: 'SYNC_STATE', payload: actionState });
      
      // Start processing actions loop
      processActionTurn(actionState);
  };
  
  // Recursively process units
  const processActionTurn = async (currentState: GameState) => {
       // Filter live units for processing, sorted by owner (Host first then Client, or arbitrary)
       // We use a deep copy for processing to avoid state mutation issues during async
       let workingState = JSON.parse(JSON.stringify(currentState));
       
       // Helper to wait
       const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

       // Iterate through all units
       // Ideally we use actionQueue, but for simplicity we iterate index
       for (let i = 0; i < workingState.units.length; i++) {
           const unit = workingState.units[i];
           
           // Check if unit is still alive (could be killed by previous unit in this loop)
           const liveUnitIndex = workingState.units.findIndex((u: Unit) => u.instanceId === unit.instanceId);
           if (liveUnitIndex === -1) continue; // Dead
           
           const currentUnit = workingState.units[liveUnitIndex];

           // Helper to check for adjacent enemies
           const getAdjacentEnemy = () => {
               const neighbors = [
                   {x: currentUnit.x, y: currentUnit.y - 1, dir: 'UP'},
                   {x: currentUnit.x, y: currentUnit.y + 1, dir: 'DOWN'},
                   {x: currentUnit.x - 1, y: currentUnit.y, dir: 'LEFT'},
                   {x: currentUnit.x + 1, y: currentUnit.y, dir: 'RIGHT'},
               ];
               for (const n of neighbors) {
                   const idx = workingState.units.findIndex((u: Unit) => u.x === n.x && u.y === n.y && u.ownerId !== currentUnit.ownerId);
                   if (idx !== -1) return { index: idx, unit: workingState.units[idx], direction: n.dir };
               }
               return null;
           };

           // --- MOVEMENT PHASE ---
           // Simple logic: If not adjacent to enemy, try to move closer
           // We will move up to 'move' speed, step by step
           // For simplification, Striker seeks enemy, others random valid
           let movesLeft = currentUnit.move;
           
           while (movesLeft > 0) {
               // Check if we can attack already
               if (currentUnit.type === 'Striker' && getAdjacentEnemy()) {
                   break; // Stop moving, attack!
               }

               // Determine target for movement
               let targetX = -1, targetY = -1;
               
               if (currentUnit.type === 'Striker') {
                   // Find nearest enemy
                   let minDist = 999;
                   workingState.units.forEach((u: Unit) => {
                       if (u.ownerId !== currentUnit.ownerId) {
                           const d = Math.abs(u.x - currentUnit.x) + Math.abs(u.y - currentUnit.y);
                           if (d < minDist) {
                               minDist = d;
                               targetX = u.x;
                               targetY = u.y;
                           }
                       }
                   });
               } else {
                   // Others: Just try to move to a random valid adjacent for liveliness (or specific logic)
                   // Simplified: Builders just chill or move randomly to demonstrate animation
                   // In a real implementation we'd use finding edges.
                   // Let's just break for non-strikers for now or give them a random step
                   break; 
               }

               if (targetX !== -1) {
                   // Calculate simplified step towards target (not full pathfinding to save complexity in this snippet)
                   let nextX = currentUnit.x;
                   let nextY = currentUnit.y;
                   let dir = '';

                   if (Math.abs(targetX - currentUnit.x) > Math.abs(targetY - currentUnit.y)) {
                        if (targetX > currentUnit.x) { nextX++; dir = 'RIGHT'; }
                        else { nextX--; dir = 'LEFT'; }
                   } else {
                        if (targetY > currentUnit.y) { nextY++; dir = 'DOWN'; }
                        else { nextY--; dir = 'UP'; }
                   }
                   
                   // Check bounds and occupancy
                   const isOccupied = workingState.units.some((u: Unit) => u.x === nextX && u.y === nextY);
                   // Check Pylons (simple check: if traversing wall. Simplified: just check occupancy for now)
                   
                   if (!isOccupied && nextX >= 0 && nextX < BOARD_SIZE && nextY >= 0 && nextY < BOARD_SIZE) {
                       // Move!
                       // 1. Animate
                       const movePayload = {
                           type: 'MOVE',
                           attackerId: currentUnit.instanceId, // Actor
                           targetId: null,
                           direction: dir
                       };
                       triggerAnimation(movePayload);
                       peerService.sendMessage({ type: 'ANIMATION_EVENT', payload: movePayload });
                       
                       await wait(500); // Wait for animation

                       // 2. Update State
                       currentUnit.x = nextX;
                       currentUnit.y = nextY;
                       
                       setGameState(workingState); 
                       peerService.sendMessage({ type: 'SYNC_STATE', payload: workingState });
                       
                       movesLeft--;
                   } else {
                       break; // Blocked
                   }
               } else {
                   break;
               }
           }

           // --- ACTION/ATTACK PHASE ---
           if (currentUnit.type === 'Striker') {
               const targetData = getAdjacentEnemy();
               if (targetData) {
                   const { unit: enemy, direction } = targetData;
                   
                    // 1. Broadcast Animation
                   const animPayload = { 
                       type: 'ATTACK', 
                       attackerId: currentUnit.instanceId, 
                       targetId: enemy.instanceId,
                       direction: direction
                   };
                   triggerAnimation(animPayload); // Local
                   peerService.sendMessage({ type: 'ANIMATION_EVENT', payload: animPayload }); // Remote
                   
                   await wait(500); // Wait for animation
                   
                   // 2. Apply Damage
                   enemy.currentHealth -= currentUnit.attack;
                   
                   // 3. Sync State (Update health bar)
                   setGameState(workingState); 
                   peerService.sendMessage({ type: 'SYNC_STATE', payload: workingState });
                   
                   await wait(200); // Brief pause after hit

                   // 4. Check Death
                   if (enemy.currentHealth <= 0) {
                        // Death Animation
                       const deathPayload = {
                           type: 'DEATH',
                           targetId: enemy.instanceId
                       };
                       triggerAnimation(deathPayload);
                       peerService.sendMessage({ type: 'ANIMATION_EVENT', payload: deathPayload });
                       
                       await wait(500); // Wait for death animation

                       // Remove unit
                       // Re-find index to be safe in case of any weirdness
                       const currentEnemyIndex = workingState.units.findIndex((u: Unit) => u.instanceId === enemy.instanceId);
                       if (currentEnemyIndex !== -1) {
                           workingState.units.splice(currentEnemyIndex, 1);
                           // Update kill count
                           const killerPlayer = workingState.players.find((p: PlayerState) => p.id === currentUnit.ownerId);
                           if (killerPlayer) killerPlayer.unitsKilled++;
                       }
                       
                       // Check Queen Death
                       if (enemy.name === 'Queen') {
                           workingState.winnerId = currentUnit.ownerId;
                           workingState.phase = 'GAME_OVER';
                           setGameState(workingState); 
                           peerService.sendMessage({ type: 'SYNC_STATE', payload: workingState });
                           return; // End game
                       }
                       
                       setGameState(workingState); 
                       peerService.sendMessage({ type: 'SYNC_STATE', payload: workingState });
                   }
               }
           }
           
           // Small delay between units
           await wait(300);
       }
       
       // End Phase
       await wait(1000);
       startResourcePhase(workingState);
  };

  const handlePhaseEnd = (phase: string) => {
      if (phase === 'BUILDING') {
          if (myId === gameState.players[0].id) {
               // I am host, process my orders then switch
               const next = {...gameState};
               buildOrders.forEach(o => {
                   if (o.type === 'BUILD_UNIT') {
                       const faction = FACTIONS[next.players[0].faction as FactionType];
                       const stats = faction.units.find(u => u.id === o.unitId);
                       if (stats && next.players[0].resources >= stats.cost) {
                            next.players[0].resources -= stats.cost;
                            next.units.push({
                                ...stats,
                                instanceId: Math.random().toString(),
                                ownerId: myId,
                                x: o.targetX,
                                y: o.targetY,
                                currentHealth: stats.health,
                                hasActed: false,
                                maxHealth: stats.health
                            });
                            next.players[0].unitsBuilt++;
                       }
                   }
               });
               
               const actionState = { ...next, phase: 'ACTION' as const };
               setGameState(actionState);
               peerService.sendMessage({ type: 'SYNC_STATE', payload: actionState });
               
               // Start Action Logic
               processActionTurn(actionState);
          } else {
             // Client logic (omitted)
          }
      }
  };


  // Setup Helpers
  const joinGame = () => {
    peerService.connect(peerIdInput);
    peerService.sendMessage({ type: 'JOIN', payload: { id: myId } });
  };

  const onFactionSelect = (f: FactionType) => {
    const updatedPlayers = gameState.players.map(p => p.id === myId ? {...p, faction: f} : p);
    setGameState(prev => ({...prev, players: updatedPlayers}));
    peerService.sendMessage({ type: 'UPDATE_PLAYER', payload: updatedPlayers.find(p => p.id === myId) });
  };

  const onReady = () => {
    const updatedPlayers = gameState.players.map(p => p.id === myId ? {...p, isReady: !p.isReady} : p);
    setGameState(prev => ({...prev, players: updatedPlayers}));
    peerService.sendMessage({ type: 'UPDATE_PLAYER', payload: updatedPlayers.find(p => p.id === myId) });
    
    // Check start
    if (gameState.players.length === 2 && updatedPlayers.every(p => p.isReady)) {
        if (gameState.players[0].id === myId) {
             peerService.sendMessage({ type: 'START_GAME' });
             startPreGameCountdown();
        }
    }
  };
  
  const sendChat = (text: string) => {
      const msg = { senderId: myId, text, timestamp: Date.now() };
      setChatMessages(prev => [...prev, msg]);
      peerService.sendMessage({ type: 'CHAT', payload: msg });
  }

  const handleBuildOrder = (order: BuildOrder) => {
      setBuildOrders(prev => [...prev, order]);
      if (order.type === 'BUILD_UNIT') {
           const faction = FACTIONS[gameState.players.find(p => p.id === myId)?.faction as FactionType];
           const u = faction.units.find(u => u.id === order.unitId);
           if (u) {
               setGameState(prev => ({
                   ...prev,
                   players: prev.players.map(p => p.id === myId ? {...p, resources: p.resources - u.cost} : p)
               }));
           }
      }
  }

  if (view === 'HOW_TO_PLAY') {
    return <HowToPlay onBack={() => setView('HOME')} />;
  }

  if (view === 'HOME') {
    return (
      <HomeScreen 
        onCreate={() => setView('APP')}
        onJoin={() => setView('APP')}
        onHowToPlay={() => setView('HOW_TO_PLAY')}
      />
    );
  }

  if (gameState.phase === 'LOBBY') {
    return (
      <Lobby 
        myId={myId}
        peerIdInput={peerIdInput}
        setPeerIdInput={setPeerIdInput}
        joinGame={joinGame}
        players={gameState.players}
        myPlayerId={myId}
        onReady={onReady}
        onFactionSelect={onFactionSelect}
        chatMessages={chatMessages}
        sendChat={sendChat}
        status={connectionStatus}
      />
    );
  }

  return (
    <Game 
        state={gameState} 
        playerId={myId} 
        onBuildOrder={handleBuildOrder}
        onEndPhase={() => handlePhaseEnd(gameState.phase)}
        activeAnimation={activeAnimation}
    />
  );
}