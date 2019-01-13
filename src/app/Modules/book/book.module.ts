import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookRoutingModule } from './book-routing.module';
import { BookComponent } from 'src/app/Components/book/book.component';
import { BooksService } from 'src/app/Services/books/books.service';

@NgModule({
  declarations: [BookComponent],
  imports: [
    CommonModule,
    BookRoutingModule
  ],
  providers:[
    BooksService
  ]
})
export class BookModule { }
