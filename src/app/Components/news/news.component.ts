import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators'
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { WebsocketService } from 'src/app/Services/websocket-service.service';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  public messages=[];
  constructor(private ws:WebsocketService 
  ) { }

  ngOnInit() {
    this.ws.getMessages().subscribe(res=>{
      console.log('odje',res)
      // this.messages.push(res['message'])
    })
  }

}
