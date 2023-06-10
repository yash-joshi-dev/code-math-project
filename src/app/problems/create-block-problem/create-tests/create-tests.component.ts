import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Form, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormProvider } from 'src/app/general/form-provider.model';

@Component({
  selector: 'app-create-tests',
  templateUrl: './create-tests.component.html',
  styleUrls: ['./create-tests.component.css']
})
export class CreateTestsComponent implements OnInit {

  testsForm: FormGroup;
  basicInfoForm: FormGroup;
  sampleTests: FormArray;
  hiddenTests: FormArray;
  inputNames: FormArray;
  outputNames: FormArray;
  ranges: FormArray;
  doGenerateCases: boolean = false;

  samplesDeleteable: boolean;
  hiddenTestsDeleteable: boolean;

  //typeRangeOptions: {[key: string]: {option: string, value: string} []} = {"integer": [{option: }]};

  constructor(private formProvider: FormProvider, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.basicInfoForm = <FormGroup> this.formProvider.getForm().get('basic_info');
    const prevFormFinished = this.basicInfoForm.valid;

    if(!prevFormFinished) {
      this.router.navigate(['../basic-info'], {relativeTo: this.route});
    }

    this.inputNames = (<FormArray> this.basicInfoForm.get('input_data'));
    this.outputNames = (<FormArray> this.basicInfoForm.get('output_data'));

    //get all forms and arrays
    this.testsForm = <FormGroup> this.formProvider.getForm().get('tests');
    this.sampleTests = <FormArray> this.testsForm.get('sample_tests');
    this.hiddenTests = <FormArray> this.testsForm.get('hidden_tests');
    // this.ranges = <FormArray> this.testsForm.get('ranges');

    //set all values to 0 if inputs and outputs changed, and give them one (write another function to determine if inputs and oututs changed)
    if(this.sampleTests.length != 0) {
      while(this.sampleTests.length != 0) this.sampleTests.removeAt(0);
    }
    this.onAddSampleTest();

    if(this.hiddenTests.length != 0) {
      while(this.hiddenTests.length != 0) this.hiddenTests.removeAt(0);
    }
    this.onAddHiddenTest();

  }


  getPattern(inputType: string) {

    if(inputType == "integer") return "\\d*";
    else if(inputType == "char") return "."
    else return null;

  }
  // onRandTestcaseNumChange(event: Event) {
  //   const temp = 0 < Number((<HTMLInputElement> event.target).value);
  //   const changed: boolean = temp != this.doGenerateCases;
  //   if(changed) {
  //     this.doGenerateCases = temp;
  //     if(this.doGenerateCases) {
  //       for(var i = 0; i < this.inputNames.length; i++) {
  //         this.ranges.push(new FormControl(null, Validators.required))
  //       }
  //     }
  //     else {
  //       this.ranges.clear();
  //     }
  //   }
  // }

  onDeleteSampleTests() {
    if(this.sampleTests.length > 1) this.samplesDeleteable = !this.samplesDeleteable;
  }

  onAddSampleTest() {

    this.samplesDeleteable = false;

    const array = new FormArray([]);

    for(var i = 0; i < this.inputNames.length + this.outputNames.length; i++) {
      array.push(new FormControl(null, Validators.required));
    }

    this.sampleTests.push(array);
  }

  onSampleTestClicked(i: number) {

    if(this.samplesDeleteable) {
      this.sampleTests.removeAt(i);
      if(this.sampleTests.length <= 1) this.samplesDeleteable = false;
    }

  }

  onDeleteHiddenTests() {
    if(this.hiddenTests.length > 1) this.hiddenTestsDeleteable = !this.hiddenTestsDeleteable;
  }


  onAddHiddenTest() {

    this.hiddenTestsDeleteable = false;
  
    const array = new FormArray([]);

    for(var i = 0; i < this.inputNames.length + this.outputNames.length; i++) {
      array.push(new FormControl(null, Validators.required));
    }

    this.hiddenTests.push(array);
  }

  onHiddenTestClicked(i: number) {

    if(this.hiddenTestsDeleteable) {
      this.hiddenTests.removeAt(i);
      if(this.hiddenTests.length <= 1) this.hiddenTestsDeleteable = false;
    }

  }

  getSampleTestRow(i: number) {
    return (<FormArray> this.sampleTests.at(i)).controls;
  }
  

  getHiddenTestRow(i: number) {
    return (<FormArray> this.hiddenTests.at(i)).controls;
  }


}
