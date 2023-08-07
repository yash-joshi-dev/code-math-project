import { Inject, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../authorization/auth.service';
import { ProblemSet } from './problem-set.model';
import { ProblemSetsService } from './problem-sets.service';

@Component({
  selector: 'app-problem-sets',
  templateUrl: './problem-sets.component.html',
  styleUrls: ['./problem-sets.component.css']
})
export class ProblemSetsComponent implements OnInit {

  problemSets: ProblemSet [];
  isTeacher: boolean;
  classId: number;
  deleteProblemSetSubscription: Subscription;

  constructor(private dialog: MatDialog, private router: Router, private route: ActivatedRoute, private authService: AuthService, private problemSetsService: ProblemSetsService) { }

  ngOnInit(): void {

    this.isTeacher = this.authService.getIsTeacher();
    this.classId = this.route.snapshot.params['class_id'];

    this.problemSetsService.getProblemSets(this.classId).subscribe(
      result => {
        this.problemSets = result.problemSets;

      }
    )




  }

  onCreateProblem() {
    this.router.navigate(["../create-block-problem/basic-info"], {relativeTo: this.route});
  }

  onEditProblem(problemId: number) {
    this.router.navigate(["edit-problem", problemId], {relativeTo: this.route});
  }

  onDeleteProblem(problemId: number) {

  }
  
  onCreateProblemSet() {

    const dialogRef = this.dialog.open(
      NewProblemSetFormComponent, 
      {
        width: '400px', 
        data: {
          action: "Create",
          setName: "",
          released: true,
          classId: this.classId
        }
      });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result) this.problemSets.push(result.problemSetData);
      }
    )

  }

  onEditProblemSet(i: number) {

    const dialogRef = this.dialog.open(
      NewProblemSetFormComponent, 
      {
        width: '400px', 
        data: {
          action: "Edit", 
          setName: this.problemSets[i].name, 
          released: this.problemSets[i].released, 
          classId: this.problemSets[i].class_id,
          setId: this.problemSets[i].id,
          problemMap: this.problemSets[i].problem_mapping
        }
      });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result) {
          this.problemSets[i].name = result.newSetName;
          this.problemSets[i].released= result.isReleased;
        }
      }
    )

  }

  
  onDeleteProblemSet(i: number) {

    let classId = this.problemSets[i].class_id;
    let problemSetId = this.problemSets[i].id;
    this.deleteProblemSetSubscription = this.problemSetsService.deleteProblemSet(classId, problemSetId).subscribe(
      result => {
        this.problemSets.splice(i, 1);
      }
    )

  }

  ngOnDestroy(): void {
    if(this.deleteProblemSetSubscription) {this.deleteProblemSetSubscription.unsubscribe();}
  }


}


@Component({
  selector: 'new-class-form',
  templateUrl: './new-problem-set-form.component.html',
})
export class NewProblemSetFormComponent implements OnInit, OnDestroy{

  problemSetForm: FormGroup;
  problemSetSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NewProblemSetFormComponent>,
    private problemSetsService: ProblemSetsService,
    @Inject(MAT_DIALOG_DATA) public data: 
    {
      action: string, 
      setName: string, 
      released: boolean, 
      classId: number,
      setId: number,
      problemMap: number[]
    }
  ) {}

  ngOnInit(): void {

    //create a form
    this.problemSetForm = new FormGroup({
      'set_name': new FormControl(this.data.setName, [Validators.required]),
      'released': new FormControl(this.data.released, [Validators.required])
    });

  }

  onSubmit() {

    if(this.data.action === "Create") {
      this.problemSetSubscription = this.problemSetsService.createProblemSet(this.data.classId, this.problemSetForm.value.set_name, this.problemSetForm.value.released).subscribe(
        result => {
          this.dialogRef.close(result);
        }
      );
    }
    else if(this.data.action === "Edit") {
      this.problemSetSubscription = this.problemSetsService.updateProblemSet(this.data.classId, this.data.setId, this.problemSetForm.value.set_name, this.problemSetForm.value.released, this.data.problemMap).subscribe(
        result => {
          this.dialogRef.close(
            {
              newSetName: this.problemSetForm.value.set_name,
              isReleased: this.problemSetForm.value.released
            }
          );
        }
      );
    }

  }

  ngOnDestroy(): void {
    if(this.problemSetSubscription) this.problemSetSubscription.unsubscribe();
  }

}