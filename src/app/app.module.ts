import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { TuiTableModule } from '@taiga-ui/addon-table';
import { TuiSvgModule } from '@taiga-ui/core';


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
// import { ClassComponent } from './classes/class/class.component';
// import { ClassListComponent } from './classes/class/class-list/class-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ErrorInterceptor } from './error/error-interceptor';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ErrorComponent } from './error/error.component';
// import { ClassesComponent, JoinClassFormComponent, JoinConfirmationComponent, NewClassFormComponent } from './classes/classes.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
// import { ClassHeaderComponent } from './classes/class/class-header/class-header.component';
import { NewProblemSetFormComponent, ProblemSetsComponent } from './zproblem-sets/problem-sets.component';
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
import { ClassesComponent } from './class-components/classes/classes.component';
import { ClassComponent } from './class-components/class/class.component';
import { ConfirmationModalComponent } from './general/confirmation-modal/confirmation-modal.component';
import { EditClassModalComponent } from './class-components/classes/edit-class-modal/edit-class-modal.component';
import { ShareClassModalComponent } from './class-components/classes/share-class-modal/share-class-modal.component';
import { ClassHeaderComponent } from './class-components/class-header/class-header.component';
import { ClassCardComponent } from './class-components/classes/class-card/class-card.component';
import { DeleteClassModalComponent } from './class-components/classes/delete-class-modal/delete-class-modal.component';
import { AssignmentsComponent } from "./class-components/assignments/assignments.component";
import { UnitComponent } from './unit-components/unit/unit.component';
import { EditShareMenuComponent } from './general/edit-share-menu/edit-share-menu.component';
import { CreateUnitModalComponent } from './unit-components/create-unit-modal/create-unit-modal.component';
import { EditUnitModalComponent } from './unit-components/edit-unit-modal/edit-unit-modal.component';
import { ShareUnitModalComponent } from './unit-components/share-unit-modal/share-unit-modal.component';
import { DeleteUnitModalComponent } from './unit-components/delete-unit-modal/delete-unit-modal.component';
import { CreateLessonModalComponent } from './content-components/create-lesson-modal/create-lesson-modal.component';
import {EditorModule} from '@tinymce/tinymce-angular';
import { ContentComponent } from './content-components/content/content.component';
import { DeleteContentModalComponent } from './content-components/delete-content-modal/delete-content-modal.component';
import { LessonComponent } from './content-components/lesson/lesson.component';
import { StudentsComponent } from './class-components/students/students.component';



@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent,
        LoginComponent,
        SignUpComponent,
        PageNotFoundComponent,
        ErrorComponent,
        AssignmentsComponent,
        ProblemSetsComponent,
        NewProblemSetFormComponent,
        EditMenuComponent,
        CreateBlockProblemComponent,
        CreateWorkspaceComponent,
        CreateTestsComponent,
        CreateBlockSolutionComponent,
        BlockProblemInfoComponent,
        InputTypeDirectiveDirective,
        ClassesComponent,
        ClassComponent,
        ConfirmationModalComponent,
        EditClassModalComponent,
        ShareClassModalComponent,
        ClassHeaderComponent,
        ClassCardComponent,
        DeleteClassModalComponent,
        UnitComponent,
        EditShareMenuComponent,
        CreateUnitModalComponent,
        EditUnitModalComponent,
        ShareUnitModalComponent,
        DeleteUnitModalComponent,
        CreateLessonModalComponent,
        ContentComponent,
        DeleteContentModalComponent,
        LessonComponent,
        StudentsComponent,
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
        RichTextEditorAllModule,
        MatListModule,
        TuiRootModule,
        TuiDialogModule,
        TuiAlertModule,
        TuiTableModule,
        TuiSvgModule,
        EditorModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { hasBackdrop: true },
        },
        { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
