import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormProvider } from 'src/app/general/form-provider.model';

@Component({
  selector: 'app-create-block-problem',
  templateUrl: './create-block-problem.component.html',
  styleUrls: ['./create-block-problem.component.css'],
  providers: [{ provide: FormProvider, useExisting: CreateBlockProblemComponent }]
})
export class CreateBlockProblemComponent extends FormProvider implements OnInit {

  createClassForm: FormGroup;

  constructor() {
    super();
  }

  //create form to take in name, description, sample in's, sample out's, test in's, test out's, workspace (store full workspace object somewhere)
  //on next page, create the desired workspace and ask teacher to code out solution (check if it works with everything)
  // if randomly generating test cases, must specify the range of particular inputs (number, natural numbers, between certain thing..., different varieties of strings)
  // 
  // 'output_names': new FormGroup({
  //   'type': new FormControl("integer", [Validators.required]),
  //   'name': new FormControl(null, [Validators.required])
  // })
  ngOnInit(): void {

    this.createClassForm = new FormGroup({
      'basic_info': new FormGroup({
        'name': new FormControl(null, [Validators.required]),
        'variable_data': new FormArray([]),                     //name, type, and range (int a form group)
        'input_data': new FormArray([]),                       //name, type, and range (in a form group)
        'output_data': new FormArray([]),
        'description': new FormControl(null, [Validators.required])
      }),

      'tests': new FormGroup({
        'sample_tests': new FormArray([], this.testGivenValidator),
        'hidden_tests': new FormArray([], this.testGivenValidator),
        'random_tests_count': new FormControl(0, [Validators.required, this.verifyRandomTestCountRange]),
        'ranges': new FormArray([])
      }),

      'toolbox': new FormGroup({
        'allowMath': new FormControl(false),
        'allowBoolean': new FormControl(false),
        'allowIfs': new FormControl(false),
        'allowLoops': new FormControl(false)
      })
    });

    //later add input range
    
  }

  getForm() {
    return this.createClassForm;
  }

  //custom validator to validate test length
  testGivenValidator(array: FormArray): {[s: string]: boolean} {
    if(array.length === 0) {
      return {'noTestProvided': true};
    }
    return null;
  }

    //custom validator to validate test length
    verifyRandomTestCountRange(control: FormControl): {[s: string]: boolean} {
      if(control.value < 0 || control.value > 200) {
        return {'outOfRangeError': true};
      }
      return null;
    }



}
