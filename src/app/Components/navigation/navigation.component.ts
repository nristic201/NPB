import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(public router: Router,
    private authService:AuthService) { }

  ngOnInit() {
  }

  loadProfile(){
    this.router.navigate(['/profile/',this.authService.user.username]);
  }
}
