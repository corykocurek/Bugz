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
    this.peer = new Peer({
      debug: 2 // Log errors and warnings
    });

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      onOpen(id);
    });

    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    // Handle signaling server disconnection (tabbing out/sleep)
    this.peer.on('disconnected', () => {
      console.log('Disconnected from signaling server, reconnecting...');
      this.peer?.reconnect();
    });

    this.peer.on('error', (err) => {
      console.error(err);
    });
  }

  public connect(peerId: string, onConnected?: () => void) {
    if (!this.peer) return;
    
    // Create connection
    const conn = this.peer.connect(peerId, {
      reliable: true
    });

    // Hook into open event specifically for the initiator
    conn.on('open', () => {
      if (onConnected) onConnected();
    });

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
    
    // Ensure we handle errors on the connection itself
    this.conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  public sendMessage(msg: NetworkMessage) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    } else {
      console.warn('Cannot send message, connection not open');
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