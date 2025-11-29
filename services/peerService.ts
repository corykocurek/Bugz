import Peer, { DataConnection } from 'peerjs';
import { NetworkMessage } from '../types';

export class PeerService {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private onMessageCallback: ((msg: NetworkMessage) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;

  constructor() {
    //
  }

  public initialize(onOpen: (id: string) => void) {
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      onOpen(id);
    });

    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error(err);
    });
  }

  public connect(peerId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(peerId);
    this.handleConnection(conn);
  }

  private handleConnection(conn: DataConnection) {
    this.conn = conn;
    
    this.conn.on('open', () => {
      console.log('Connected to peer');
      if (this.onConnectCallback) this.onConnectCallback();
    });

    this.conn.on('data', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data as NetworkMessage);
      }
    });

    this.conn.on('close', () => {
      console.log('Connection closed');
      // Handle disconnect
    });
  }

  public sendMessage(msg: NetworkMessage) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    }
  }

  public setOnMessage(cb: (msg: NetworkMessage) => void) {
    this.onMessageCallback = cb;
  }

  public setOnConnect(cb: () => void) {
    this.onConnectCallback = cb;
  }
  
  public getId() {
    return this.peer?.id;
  }
}

export const peerService = new PeerService();
