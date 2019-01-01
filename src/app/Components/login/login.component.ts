import { Component, OnInit } from '@angular/core';
import { Korisnik } from 'src/app/models/Korisnik';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user:Korisnik= new Korisnik();
  constructor(
    private authService:AuthService
  ) { }

  ngOnInit() {
  }
  loginReq(){
    this.authService.login(this.user)
  }
}
