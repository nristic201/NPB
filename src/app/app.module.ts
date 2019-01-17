import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./Components/login/login.component";
import "hammerjs";
import { MaterialModule } from "./Modules/material/material.module";
import { HomeComponent } from "./Components/home/home.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BestRatedBooksComponent } from './Components/best-rated-books/best-rated-books.component';
import { SearchComponent } from './Components/search/search.component';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { WriterComponent } from './Components/writer/writer.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { BookComponent } from './Components/book/book.component';
import { BiblioComponent } from './Components/biblio/biblio.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

import { ToastrModule } from 'ngx-toastr';
import { NewsComponent } from './Components/news/news.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    BestRatedBooksComponent,
    SearchComponent,
    NavigationComponent,
    WriterComponent,
    ProfileComponent,
    BookComponent,
    BiblioComponent,
    NewsComponent
    
  ],
  imports: [
    ToastrModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
