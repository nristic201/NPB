import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileService } from './services/profile.service';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    ProfileRoutingModule
  ],
  providers:[
    ProfileService
  ]
})
export class ProfileModule { }
