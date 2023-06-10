import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './authorization/login/login.component';
import { SignUpComponent } from './authorization/sign-up/sign-up.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from './authorization/auth-interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClassComponent } from './classes/class/class.component';
import { ClassListComponent } from './classes/class/class-list/class-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ErrorInterceptor } from './error/error-interceptor';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ErrorComponent } from './error/error.component';
import { ClassesComponent, JoinClassFormComponent, JoinConfirmationComponent, NewClassFormComponent } from './classes/classes.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { AssignmentsComponent } from './classes/class/assignments/assignments.component';
import { ClassHeaderComponent } from './classes/class/class-header/class-header.component';
import { NewProblemSetFormComponent, ProblemSetsComponent } from './problem-sets/problem-sets.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import { EditMenuComponent } from './general/edit-menu/edit-menu.component';
import { CreateBlockProblemComponent } from './problems/create-block-problem/create-block-problem.component';
import { CreateWorkspaceComponent } from './problems/create-block-problem/create-workspace/create-workspace.component';
import { CreateTestsComponent } from './problems/create-block-problem/create-tests/create-tests.component';
import { CreateBlockSolutionComponent } from './problems/create-block-problem/create-block-solution/create-block-solution.component';
import { BlockProblemInfoComponent } from './problems/create-block-problem/block-problem-info/block-problem-info.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import { InputTypeDirectiveDirective } from './problems/create-block-problem/input-type-directive.directive';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignUpComponent,
    PageNotFoundComponent,
    ClassComponent,
    ClassListComponent,
    ErrorComponent,
    ClassesComponent,
    NewClassFormComponent,
    JoinClassFormComponent,
    JoinConfirmationComponent,
    AssignmentsComponent,
    ClassHeaderComponent,
    ProblemSetsComponent,
    NewProblemSetFormComponent,
    EditMenuComponent,
    CreateBlockProblemComponent,
    CreateWorkspaceComponent,
    CreateTestsComponent,
    CreateBlockSolutionComponent,
    BlockProblemInfoComponent,
    InputTypeDirectiveDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatToolbarModule,
    MatSelectModule,
    RichTextEditorAllModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule { }
