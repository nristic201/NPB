import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Router, CanActivate } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class LogGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    return this.checkLogin();
  }

  checkLogin(): boolean {
    if (this.authService.isLogged) {
      return true;
    }

    this.router.navigate(["/home"]);
    return false;
  }
}
