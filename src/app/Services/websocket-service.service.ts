import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import * as Rx from "rxjs";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: "root"
})
export class WebsocketService {
  private socket;
  public socketSubject: Rx.Subject<any> = null;

  constructor(private toastr: ToastrService) {}
  initSocket(username: string) {
    if (!this.socketSubject) {
      this.socketSubject = this.connect(username);
      this.toastr.success('Dobrodosli')
    }
  }

  private connect(username: string): Rx.Subject<any> {
    this.socket = io.connect(
      environment.soc_url,
      {
        query: {
          username
        }
      }
    );
    const obs = new Observable(observer => {
      this.socket.on("stigla-knjiga", data => {
        this.toastr.success('knjiga na lageru',data)
        observer.next(data);
      });
      this.socket.on('news',data=>{
        this.toastr.success('novosti',data)
        observer.next(data)
      })
      this.socket.on('stigo-follow',data=>{
        this.toastr.success('novi sub',data)
        observer.next(data)
      })
      return () => {
        this.socket.disconnect();
      };
    });
  
    return Rx.Subject.create(null,obs);
  }

  sendEvent(eventName:string, message:any){
    this.socket.emit(eventName,message)
  }
}
