import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { api_url } from 'src/assets/constants';
import * as io from 'socket.io-client'

import { environment } from 'src/environments/environment';
import { SendIsbnService } from 'src/app/Services/send-isbn.service';
@Component({
  selector: 'app-biblio',
  templateUrl: './biblio.component.html',
  styleUrls: ['./biblio.component.css']
})
export class BiblioComponent implements OnInit {

  public news:any[]=[]
  public socket;


  

  public biblio_data: any;
  public snapshot:any;
  constructor(
    private router:Router,
    private http:HttpClient,
    private route: ActivatedRoute,
    private auth:AuthService,
    private sendISBN:SendIsbnService
    ) {
    this.snapshot=route.snapshot;
    
    this.socket=io.connect(environment.soc_url)
    this.socket.on('biblioteka',(msg:any)=>{
      this.news.push(msg);
      console.log(this.news)
    })
  }

  ngOnInit() {
    this.biblio_data= this.snapshot.data['0'];
    console.log('ovde',this.biblio_data)
  }
  iznajmiKnjigu(isbn){
    if(this.auth.isLogged){
      this.http.post(api_url+'biblioteka/iznajmi',{
        isbn:isbn,
        username:this.auth.user.username
      }).subscribe(res=>{
        console.log('ovde',res)
        if(res['isbn'])
          this.sendISBN.updateDataSelection(res['isbn']);
      })
    }
    else{
      alert('Ulogujte se !')
    }
  }

}
