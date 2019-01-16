import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import * as Rx from "rxjs";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root"
})
export class WebsocketService {
  private socket;
  public observer;
  constructor() {}

  getMessages(): Observable<any> {
    this.socket = io(environment.soc_url);
    this.socket.on('alo', res => {
      this.observer.next(res.data);
    });
    return new Observable(obs => {
      this.observer = obs;
    });
  }
}
