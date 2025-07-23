import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { QuestionCardComponent } from './components/question-card/question-card.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { QuestionDetailComponent } from './pages/question-detail/question-detail.component';
import { AskQuestionComponent } from './pages/ask-question/ask-question.component';
import { EditQuestionComponent } from './pages/edit-question/edit-question.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ModerationComponent } from './pages/moderation/moderation.component';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ConfirmDialogComponent,
    QuestionCardComponent,
    HomeComponent,
    QuestionDetailComponent,
    AskQuestionComponent,
    EditQuestionComponent,
    ProfileComponent,
    ModerationComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }