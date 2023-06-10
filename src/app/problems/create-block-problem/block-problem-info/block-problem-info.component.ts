import { Component, OnInit } from '@angular/core';
import { AbstractControl, Form, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormProvider } from 'src/app/general/form-provider.model';

@Component({
  selector: 'app-block-problem-info',
  templateUrl: './block-problem-info.component.html',
  styleUrls: ['./block-problem-info.component.css']
})
export class BlockProblemInfoComponent implements OnInit {

  basicInfo: FormGroup;
  inputsDeleteable: boolean;
  outputsDeleteable: boolean;

  valueTypes: {type: string, value: string} []  = [{type: "Integer", value: "integer"}, {type: "Rational #", value: "double"}, {type: "String", value: "string"}, {type: "Character", value: "char"}, {type: "Boolean", value: "boolean"}];

  constructor(private formProvider: FormProvider) { }

  ngOnInit(): void {
    this.basicInfo = <FormGroup> this.formProvider.getForm().get('basic_info');
    // while((<FormArray> this.basicInfo.get('output_data')).length != 0) {
    //   (<FormArray> this.basicInfo.get('output_data')).removeAt(0);
    // }
    if((<FormArray> this.basicInfo.get('output_data')).length == 0) this.onAddOutput();
  }

  getInputNames() {
    return <FormArray> this.basicInfo.get('input_data');
  }

  getOutputNames() {
    return <FormArray> this.basicInfo.get('output_data');
  }


  // onAddInput() {
  //   this.inputsDeleteable = false;
  //   (<FormArray> this.basicInfo.get('input_data')).push(new FormControl(null, [Validators.required, this.singleWordValidator]));
  // }

  onAddInput() {
    this.inputsDeleteable = false;
    (<FormArray> this.basicInfo.get('input_data')).push(new FormGroup({
      'name': new FormControl(null, [Validators.required, this.singleWordValidator]),
      'type': new FormControl(null, Validators.required)
    }));
  }


  onDeleteInput() {
    if((<FormArray> this.basicInfo.get('input_data')).length != 0) this.inputsDeleteable = !this.inputsDeleteable;
  }

  onInputNameClicked(i: number) {
    if(this.inputsDeleteable) {
      (<FormArray> this.basicInfo.get('input_data')).removeAt(i);
      if((<FormArray> this.basicInfo.get('input_data')).length == 0) {
        this.inputsDeleteable = false;
      }
    }
  }  

  // onAddOutput() {
  //   this.outputsDeleteable = false;
  //   (<FormArray> this.basicInfo.get('output_data')).push(new FormControl(null, [Validators.required, this.singleWordValidator]));
  // }

  onAddOutput() {
    this.outputsDeleteable = false;
    (<FormArray> this.basicInfo.get('output_data')).push(new FormGroup({
      'name': new FormControl(null, [Validators.required, this.singleWordValidator]),
      'type': new FormControl(null, Validators.required)
    }));
  }

  onDeleteOutput() {
    if((<FormArray> this.basicInfo.get('output_data')).length > 1) this.outputsDeleteable = !this.outputsDeleteable;
  }

  onOutputNameClicked(i: number) {
    if(this.outputsDeleteable) {
      (<FormArray> this.basicInfo.get('output_data')).removeAt(i);
      if((<FormArray> this.basicInfo.get('output_data')).length <= 1) {
        this.outputsDeleteable = false;
      }
    }
  }

  //custom validator to validate no spaces
  singleWordValidator(control: FormControl): {[s: string]: boolean} {
    if(control.value && control.value.includes(" ")) {
      return {'notSingleWord': true};
    }
    return null;
  }

}
