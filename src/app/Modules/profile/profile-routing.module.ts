import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from '../../Components/profile/profile.component';
import { ProfileDetailResolver } from '../../Services/profile/profile-detail-resolver.service';

const profileRoutes: Routes = [
  {
    path: ':username',
    component: ProfileComponent,
    resolve: {
      profile: ProfileDetailResolver
    }
  },
  // {
  //   path: ':id/edit',
  //   component: EditProfileComponent,
  //   canActivate: [EditGuard],
  //   resolve: {
  //     profile: ProfileDetailResolver
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(profileRoutes)],
  exports: [RouterModule],
  providers:[ProfileDetailResolver]
})
export class ProfileRoutingModule { }
