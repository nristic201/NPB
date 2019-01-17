import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/Services/auth/auth.service";
import { ProfileService } from "src/app/Services/profile/profile.service";
import { BibliotekaService } from "src/app/Services/biblioteka/biblioteka.service";
@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.css"]
})
export class NavigationComponent implements OnInit {

  constructor(
    public router: Router,
    public authService: AuthService,
    
    private ps: ProfileService,
    private bs: BibliotekaService
  ) {}

  ngOnInit() {
    
  }
  
  goHome() {
    this.router.navigateByUrl("/home");
  }
  loadProfile() {
    this.router.navigate(["/profile/", this.authService.user.username]);
    this.ps.getProfile(this.authService.user.username);
  }
  loadBiblio() {
    this.router.navigate(["/biblioteka"]);
    this.bs.getBiblioInfo();
  }
  logout() {
    this.authService.logout();
  }
}
