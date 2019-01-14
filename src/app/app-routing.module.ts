import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./Components/login/login.component";
import { RegisterComponent } from "./Components/register/register.component";
import { HomeComponent } from "./Components/home/home.component";
import { WriterComponent } from "./Components/writer/writer.component";
import { WriterResolver } from "./Services/writer/writer-resolver.service";
import { BookComponent } from "./Components/book/book.component";
import { BookDetailResolver } from "./Services/books/book-detail-resolver.service";
import { ProfileComponent } from "./Components/profile/profile.component";
import { ProfileDetailResolver } from "./Services/profile/profile-detail-resolver.service";
import { LogGuard } from "./Services/guard/log-guard.service";
import { BiblioComponent } from './Components/biblio/biblio.component';
import { BibliotekaResolver } from './Services/biblioteka/biblioteka-resolver.service';

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "profile/:username",
    component: ProfileComponent,
    resolve: {
      profile: ProfileDetailResolver
    }
  },
  {
    path: "book/:naziv",
    component: BookComponent,
    resolve: {
      profile: BookDetailResolver
    }
  },
  {
    path: "pisac",
    component: WriterComponent,
    resolve: [WriterResolver]
  },
  {
    path: "biblioteka/:ime",
    component: BiblioComponent,
    resolve: [BibliotekaResolver]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
