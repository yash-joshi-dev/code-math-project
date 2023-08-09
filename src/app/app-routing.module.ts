import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./authorization/login/login.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { SignUpComponent } from "./authorization/sign-up/sign-up.component";
import { AuthGuard } from "./authorization/auth.guard";
import { TeacherGuard } from "./authorization/teacher.guard";
import { ProblemSetsComponent } from "./zproblem-sets/problem-sets.component";
import { CreateBlockProblemComponent } from "./problems/create-block-problem/create-block-problem.component";
import { BlockProblemInfoComponent } from "./problems/create-block-problem/block-problem-info/block-problem-info.component";
import { CreateTestsComponent } from "./problems/create-block-problem/create-tests/create-tests.component";
import { CreateWorkspaceComponent } from "./problems/create-block-problem/create-workspace/create-workspace.component";
import { CreateBlockSolutionComponent } from "./problems/create-block-problem/create-block-solution/create-block-solution.component";
import { ClassesComponent } from "./class-components/classes/classes.component";
import { ClassComponent } from "./class-components/class/class.component";
import { AssignmentsComponent } from "./class-components/assignments/assignments.component";
import { ClassGuard } from "./class-components/class.guard";
import { LessonComponent } from "./content-components/lesson/lesson.component";
import { StudentsComponent } from "./class-components/students/students.component";

const appRoutes: Routes = [
    {path: "", component: HomeComponent},
    {path: "login", component: LoginComponent},
    {path: "sign-up/:userType", component: SignUpComponent},
    {path: "classes", component: ClassesComponent, canActivate: [AuthGuard]},
    {path: "class/:classId", component: ClassComponent, canActivate: [AuthGuard, ClassGuard], children: [
        {path: "", component: AssignmentsComponent},
        {path: "students", component: StudentsComponent},
        {path: "progress", component: AssignmentsComponent},
        {path: "lesson/:lessonId", component: LessonComponent}
    ]},
    // {path: "class/:code/:class_id", component: ClassComponent, canActivate: [AuthGuard], children: [
    //     {path: "class-list", component: ClassListComponent, canActivate: [TeacherGuard]},
    //     {path: "create-block-problem", component: CreateBlockProblemComponent, canActivate: [TeacherGuard], children: [
    //         {path: "basic-info", component: BlockProblemInfoComponent},
    //         {path: "tests", component: CreateTestsComponent},
    //         {path: "solution", component: CreateBlockSolutionComponent}
    //     ]},
    //     {path: "assignments", component: ProblemSetsComponent}
    // ]},
    {path: "**", component: PageNotFoundComponent}

]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {paramsInheritanceStrategy: 'always'})],
    exports: [RouterModule],
    providers: [AuthGuard, TeacherGuard, ClassGuard]

})
export class AppRoutingModule {

}