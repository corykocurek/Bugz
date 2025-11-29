import { useEffect, useState, useRef } from 'react';
import { NetworkMessage, GameState, PlayerState, Unit, BuildOrder, FactionType } from './types';
import { peerService } from './services/peerService';
import { FACTIONS, BOARD_SIZE, INITIAL_UNLOCKS } from './constants';
import { calculateResources, isSpaceOwned } from './services/gameLogic';
import { Zap, Shield, Sword, Hammer, Settings, Users, Play, Clock, CheckCircle, ArrowLeft, BookOpen, Copy, Check, Loader2 } from 'lucide-react';

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

const Lobby = ({ myId, isHost, peerIdInput, setPeerIdInput, joinGame, isConnecting, players, myPlayerId, onReady, onFactionSelect, chatMessages, sendChat, status, onBack }: any) => {
  const me = players.find((p: PlayerState) => p.id === myPlayerId);
  const opponent = players.find((p: PlayerState) => p.id !== myPlayerId);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
      navigator.clipboard.writeText(myId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 flex flex-col font-sans">
      <div className="flex items-center justify-between relative mb-6">
           <button onClick={onBack} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full">
               <ArrowLeft size={24} />
           </button>
          <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">{isHost ? 'Create Lobby' : 'Join Lobby'}</h1>
          <div className="w-10"></div>
      </div>
      
      {!status.connected ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
               <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100 w-full text-center">
                   {isHost ? (
                       <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Game Code</h2>
                        <div className="flex items-center gap-2 mb-6 justify-center">
                            <code className="bg-gray-100 px-6 py-4 rounded-xl text-2xl font-mono tracking-widest font-bold text-green-700 select-all border border-gray-200">
                                {myId || 'Generating...'}
                            </code>
                            <button 
                                onClick={copyToClipboard}
                                className="bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 p-4 rounded-xl transition-colors"
                                title="Copy Code"
                            >
                                {copied ? <Check size={24} /> : <Copy size={24} />}
                            </button>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Waiting for opponent to join...</p>
                        </div>
                        <div className="mt-8 text-sm text-gray-400">
                            Share this code with your friend so they can join.
                        </div>
                       </>
                   ) : (
                       <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Game Code</h2>
                        <input 
                            type="text" 
                            placeholder="Paste Host Code Here"
                            className="w-full border-2 border-gray-200 rounded-xl p-4 text-center text-xl font-mono mb-4 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all uppercase"
                            value={peerIdInput}
                            onChange={(e) => setPeerIdInput(e.target.value)}
                        />
                        <button 
                            onClick={joinGame}
                            disabled={!peerIdInput || isConnecting}
                            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isConnecting ? (
                                <><Loader2 className="animate-spin" /> Connecting...</>
                            ) : (
                                <><Play fill="currentColor" /> Join Game</>
                            )}
                        </button>
                       </>
                   )}
               </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Left Column: My Setup */}
          <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100 flex-1 flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="text-green-600" /> Select Faction
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${me?.isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {me?.isReady ? 'READY' : 'CHOOSING'}
                    </span>
                 </div>

                 <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2 scrollbar-hide flex-1">
                    {Object.keys(FACTIONS).map((f) => {
                        const faction = FACTIONS[f as FactionType];
                        const isSelected = me?.faction === f;
                        return (
                        <div 
                            key={f}
                            onClick={() => !me?.isReady && onFactionSelect(f)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'} ${me?.isReady ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-gray-900">{faction.name}</h3>
                                {isSelected && <CheckCircle className="text-green-500" size={18} />}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{faction.description}</p>
                            <div className="text-[10px] font-bold text-green-700 bg-green-100 p-1.5 rounded inline-block">
                                {faction.specialAbility}
                            </div>
                        </div>
                        );
                    })}
                </div>

                <button 
                    onClick={onReady}
                    disabled={!me?.faction}
                    className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2
                        ${me?.isReady 
                            ? 'bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100' 
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none'}
                    `}
                >
                    {me?.isReady ? 'Cancel Ready' : 'Lock In & Ready'}
                </button>
              </div>
          </div>

          {/* Middle: VS Status */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4">
               <div className="text-4xl font-black text-gray-300">VS</div>
               {status.startCountdown !== null && (
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-green-500 animate-bounce">
                        <div className="text-sm font-bold text-gray-500 text-center uppercase tracking-wider mb-1">Starting in</div>
                        <div className="text-6xl font-black text-green-600 text-center leading-none">{status.startCountdown}</div>
                    </div>
                )}
          </div>

          {/* Right Column: Opponent Status & Chat */}
          <div className="lg:col-span-5 flex flex-col gap-4">
             {/* Opponent Card */}
             <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Opponent</h3>
                 {opponent ? (
                     <div className="flex items-center justify-between">
                         <div>
                             <div className="font-bold text-xl text-gray-800">{opponent.faction ? FACTIONS[opponent.faction as FactionType].name : 'Choosing...'}</div>
                             <div className="text-sm text-gray-500">Player 2</div>
                         </div>
                         <div className={`px-4 py-2 rounded-xl font-bold text-sm ${opponent.isReady ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                             {opponent.isReady ? 'READY' : 'NOT READY'}
                         </div>
                     </div>
                 ) : (
                     <div className="text-gray-400 italic">Opponent disconnected...</div>
                 )}
             </div>

             {/* Chat */}
             <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-green-100 flex-1 flex flex-col min-h-[300px]">
                <h2 className="text-lg font-bold mb-2 text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-green-600" /> Chat
                </h2>
                <div className="flex-1 overflow-y-auto mb-3 bg-gray-50 rounded-xl p-3 space-y-2 h-0 border border-gray-100">
                    {chatMessages.map((msg: any, i: number) => (
                        <div key={i} className={`p-2 rounded-xl max-w-[85%] text-sm ${msg.senderId === myPlayerId ? 'bg-green-600 text-white ml-auto rounded-br-sm' : 'bg-white border border-gray-200 mr-auto text-gray-800 rounded-bl-sm shadow-sm'}`}>
                            {msg.text}
                        </div>
                    ))}
                    {chatMessages.length === 0 && <div className="text-center text-gray-300 text-sm mt-4 italic">Say hello!</div>}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
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
          </div>
        </div>
      )}
    </div>
  );
};

const Game = ({ state, playerId, onBuildOrder, onEndPhase, activeAnimation }: {
  state: GameState,
  playerId: string,
  onBuildOrder: (order: BuildOrder) => void,
  onEndPhase: () => void,
  activeAnimation: any
}) => {
  const me = state.players.find((p) => p.id === playerId);
  const opponent = state.players.find((p) => p.id !== playerId);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  if (!me || !opponent) return <div className="min-h-screen flex items-center justify-center text-green-800 font-bold text-xl">Loading Game State...</div>;

  const myFaction = FACTIONS[me.faction as FactionType];

  const handleCellClick = (x: number, y: number) => {
    if (state.phase === 'BUILDING' && selectedUnitId) {
       const owned = isSpaceOwned(x, y, state.pylons, playerId, state);
       const occupied = state.units.some(u => u.x === x && u.y === y);
       
       if (owned && !occupied) {
           const unitStats = myFaction.units.find(u => u.id === selectedUnitId);
           if (unitStats && me.resources >= unitStats.cost) {
               onBuildOrder({
                   unitId: selectedUnitId,
                   targetX: x,
                   targetY: y,
                   type: 'BUILD_UNIT'
               });
               // Optional: keep selected to build multiple, or deselect
               // setSelectedUnitId(null); 
           }
       }
    }
  };

  const renderBoard = () => {
      const grid = [];
      for(let y=0; y<BOARD_SIZE; y++) {
          for(let x=0; x<BOARD_SIZE; x++) {
              const ownedByMe = isSpaceOwned(x, y, state.pylons, playerId, state);
              const ownedByOpponent = isSpaceOwned(x, y, state.pylons, opponent.id, state);
              
              let bgClass = "bg-green-50";
              if (ownedByMe) bgClass = "bg-green-200"; 
              if (ownedByOpponent) bgClass = "bg-red-100";
              
              const unit = state.units.find(u => u.x === x && u.y === y);
              
              grid.push(
                  <div 
                    key={`${x}-${y}`} 
                    className={`w-12 h-12 md:w-16 md:h-16 border border-green-200 relative flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
                    onClick={() => handleCellClick(x, y)}
                  >
                      {/* Unit */}
                      {unit && (
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-md relative z-10 transition-transform duration-300
                              ${unit.ownerId === playerId ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}
                              ${activeAnimation?.targetId === unit.instanceId && activeAnimation.type === 'ATTACK' ? 'animate-bounce' : ''}
                          `}>
                              {unit.name.substring(0,2)}
                              {/* HP Bar */}
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${unit.ownerId === playerId ? 'bg-green-400' : 'bg-red-300'}`} style={{width: `${(unit.currentHealth / unit.maxHealth) * 100}%`}}></div>
                              </div>
                          </div>
                      )}
                      
                      {/* Selection Highlight */}
                      {state.phase === 'BUILDING' && selectedUnitId && ownedByMe && !unit && (
                          <div className="absolute inset-0 bg-green-500/20 hover:bg-green-500/40 transition-colors"></div>
                      )}
                  </div>
              );
          }
      }
      return grid;
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-sans overflow-hidden">
        {/* HUD */}
        <div className="bg-white p-4 shadow-sm border-b border-green-100 flex justify-between items-center z-20">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-lg font-black text-green-800 leading-none">{myFaction?.name}</h2>
                    <div className="text-xs text-green-600 font-bold uppercase tracking-wider">{me.name}</div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-bold">Resources</span>
                    <span className="text-xl font-mono font-bold text-yellow-600 leading-none">{me.resources}</span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phase</div>
                 <div className={`px-4 py-1 rounded-full text-sm font-bold border ${
                     state.phase === 'ACTION' ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' :
                     state.phase === 'BUILDING' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                     'bg-yellow-100 text-yellow-600 border-yellow-200'
                 }`}>
                     {state.phase}
                 </div>
                 {state.phaseTimeRemaining > 0 && <div className="text-xs font-mono text-gray-400 mt-1">{state.phaseTimeRemaining}s</div>}
            </div>

            <div className="text-right">
                <div className="text-sm font-bold text-red-500">Opponent</div>
                <div className="text-xs text-gray-400">Units: {opponent.unitsBuilt}</div>
            </div>
        </div>

        {/* Board Container */}
        <div className="flex-1 overflow-auto flex justify-center items-center p-4 relative">
             <div className="relative">
                {/* Winner Overlay */}
                {state.winnerId && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-green-500 text-center animate-in zoom-in duration-300">
                            <h1 className="text-5xl font-black mb-2 text-green-800">{state.winnerId === playerId ? 'VICTORY!' : 'DEFEAT'}</h1>
                            <p className="text-gray-500 mb-6">The Queen has fallen.</p>
                            <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg">
                                Return to Menu
                            </button>
                        </div>
                    </div>
                )}
                
                {/* The Grid */}
                <div 
                    className="grid gap-1 bg-green-800/10 p-2 rounded-xl border-4 border-green-800/20 shadow-xl"
                    style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
                >
                    {renderBoard()}
                </div>
             </div>
        </div>

        {/* Bottom Build Deck */}
        {state.phase === 'BUILDING' && (
            <div className="bg-white border-t border-green-100 p-2 safe-area-pb">
                <div className="flex gap-2 overflow-x-auto pb-2 px-2 snap-x">
                     {myFaction.units.map(u => {
                         const canAfford = me.resources >= u.cost;
                         return (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedUnitId(u.id === selectedUnitId ? null : u.id)}
                                disabled={!canAfford}
                                className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 min-w-[90px] transition-all snap-center
                                    ${selectedUnitId === u.id 
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                                        : 'border-gray-100 bg-white hover:border-green-200'}
                                    ${!canAfford ? 'opacity-40 grayscale' : ''}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 text-white
                                    ${u.type === 'Striker' ? 'bg-red-500' : u.type === 'Pounder' ? 'bg-blue-500' : 'bg-orange-400'}
                                `}>
                                    {u.name.substring(0,1)}
                                </div>
                                <div className="font-bold text-xs text-gray-700 truncate w-full text-center">{u.name}</div>
                                <div className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full mt-1">{u.cost}</div>
                            </button>
                         )
                     })}
                     
                     <div className="w-px bg-gray-200 mx-2 flex-shrink-0"></div>
                     
                     <button 
                        onClick={onEndPhase} 
                        className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center text-center leading-tight"
                     >
                         Finish<br/>Turn
                     </button>
                </div>
            </div>
        )}
        
        {state.phase === 'ACTION' && (
             <div className="bg-red-50 border-t border-red-100 p-4 text-center text-red-600 font-bold animate-pulse">
                 Combat Phase - Observing...
             </div>
        )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'HOME' | 'HOW_TO_PLAY' | 'APP'>('HOME');
  const [myId, setMyId] = useState<string>('');
  const [peerIdInput, setPeerIdInput] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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

  // Refs for State to avoid stale closures in listeners
  const gameStateRef = useRef(gameState);
  const myIdRef = useRef(myId);

  useEffect(() => {
      gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
      myIdRef.current = myId;
  }, [myId]);

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
               // Use Ref to check current player count safely
               if (gameStateRef.current.players.length === 1) {
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
                   // We must update based on current Ref to avoid race conditions if possible, but React state setter is best practice for updates
                   // Here we construct the new state from Ref to ensure we have the latest host player data
                   const newRec = {...gameStateRef.current, players: [...gameStateRef.current.players, newPlayer]};
                   
                   setGameState(newRec);
                   // Send the *updated* state immediately
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
              if (gameStateRef.current.players[0].id === myIdRef.current) {
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
      // Use Ref to get latest state (including players who might have readied up or chatted)
      const current = gameStateRef.current;
      
      const newPylons = Array(8).fill(0).map(() => Array(8).fill(0));
      const p1 = current.players[0];
      const p2 = current.players[1];
      
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
          ...current,
          phase: 'STARTING', 
          pylons: newPylons,
          units: units,
          players: current.players.map(p => ({...p, unlockedUnits: INITIAL_UNLOCKS[p.faction as FactionType]})),
          phaseTimeRemaining: 3
      };
      
      setGameState(newState);
      if (myIdRef.current === p1.id) peerService.sendMessage({ type: 'SYNC_STATE', payload: newState });

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
      if (myIdRef.current === currentState.players[0].id) peerService.sendMessage({ type: 'SYNC_STATE', payload: nextState });

      setTimeout(() => {
           const buildState = {...nextState, phase: 'BUILDING' as const, phaseTimeRemaining: 60};
           setGameState(buildState);
           if (myIdRef.current === currentState.players[0].id) peerService.sendMessage({ type: 'SYNC_STATE', payload: buildState });
      }, 3000);
  };

  const processBuildPhase = () => {
      // Use Ref to ensure we have latest orders/state
      let newState = {...gameStateRef.current};
      
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
    if (!peerIdInput) return;
    setIsConnecting(true);
    peerService.connect(peerIdInput, () => {
        setIsConnecting(false);
        peerService.sendMessage({ type: 'JOIN', payload: { id: myId } });
    });
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
        onCreate={() => { setIsHost(true); setView('APP'); }}
        onJoin={() => { setIsHost(false); setView('APP'); }}
        onHowToPlay={() => setView('HOW_TO_PLAY')}
      />
    );
  }

  if (gameState.phase === 'LOBBY') {
    return (
      <Lobby 
        myId={myId}
        isHost={isHost}
        peerIdInput={peerIdInput}
        setPeerIdInput={setPeerIdInput}
        joinGame={joinGame}
        isConnecting={isConnecting}
        players={gameState.players}
        myPlayerId={myId}
        onReady={onReady}
        onFactionSelect={onFactionSelect}
        chatMessages={chatMessages}
        sendChat={sendChat}
        status={connectionStatus}
        onBack={() => setView('HOME')}
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