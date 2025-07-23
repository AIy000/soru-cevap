import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { QuestionDetailComponent } from './pages/question-detail/question-detail.component';
import { AskQuestionComponent } from './pages/ask-question/ask-question.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ModerationComponent } from './pages/moderation/moderation.component';
import { LoginComponent } from './pages/login/login.component';

import { AuthGuard } from './guards/auth.guard';
import { ModeratorGuard } from './guards/moderator.guard';
import { EditQuestionComponent } from './pages/edit-question/edit-question.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'question/:id', component: QuestionDetailComponent },
  { path: 'question/:id/edit', component: EditQuestionComponent, canActivate: [AuthGuard] },
  { path: 'ask', component: AskQuestionComponent, canActivate: [AuthGuard] },
  { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'moderation', component: ModerationComponent, canActivate: [AuthGuard, ModeratorGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }