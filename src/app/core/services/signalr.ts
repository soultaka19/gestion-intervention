import { Injectable, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Auth } from '../auth/services/auth';

export type SignalRState = 'disconnected' | 'connecting' | 'connected';

@Injectable({
  providedIn: 'root',
})
export class SignalR {
  private auth = inject(Auth);
  private connection: HubConnection | null = null;

  readonly state = signal<SignalRState>('disconnected');

  async start(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;

    this.state.set('connecting');

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
      .build();

    this.connection.onreconnecting(() => this.state.set('connecting'));
    this.connection.onreconnected(() => this.state.set('connected'));
    this.connection.onclose(() => this.state.set('disconnected'));

    try {
      await this.connection.start();
      this.state.set('connected');
    } catch (err) {
      console.error('SignalR connection failed:', err);
      this.state.set('disconnected');
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.state.set('disconnected');
    }
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.connection?.on(event, callback);
  }

  off(event: string): void {
    this.connection?.off(event);
  }

  async invoke(method: string, ...args: unknown[]): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.invoke(method, ...args);
    }
  }
}
