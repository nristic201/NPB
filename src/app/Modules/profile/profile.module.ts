import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from '../../Components/profile/profile.component';
import { ProfileService } from '../../Services/profile/profile.service';


@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule
  ],
  providers:[
    ProfileService
  ]
})
export class ProfileModule { }
