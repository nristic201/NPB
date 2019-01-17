import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WebsocketService } from "src/app/Services/websocket-service.service";
import { AuthService } from "src/app/Services/auth/auth.service";
@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrls: ["./news.component.css"]
})
export class NewsComponent implements OnInit {
  public messages = [];

  constructor(public auth: AuthService, private webS: WebsocketService) {}

  ngOnInit() {
    this.webS.initSocket(this.auth.user.username);
    this.initObservable();
  }
  initObservable() {
    this.webS.socketSubject.subscribe(res => {
      this.messages.push(res);
    });
  }
}
