import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as Blockly from 'blockly';
import { BlocklyOptions } from 'blockly';
import { Subscription } from 'rxjs';
import { FormProvider } from 'src/app/general/form-provider.model';
import {toolboxOptions} from './toolbox';
import {javascriptGenerator} from 'blockly/javascript';

@Component({
  selector: 'app-create-block-solution',
  templateUrl: './create-block-solution.component.html',
  styleUrls: ['./create-block-solution.component.css']
})
export class CreateBlockSolutionComponent implements OnInit, OnDestroy {

  solution: JSON;
  allowNext: boolean = false;
  toolboxForm: UntypedFormGroup;
  workspace;
  toolboxSettingChangeSubscription: Subscription;
  code: string;

  constructor(private formProvider: FormProvider, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {

    //check if previous form alright, else redirect

    //create toolbox form
    

    if(this.formProvider.getForm().get('tests').invalid) {
      this.router.navigate(['../tests'], {relativeTo: this.route});
    }

    //create toolbox form
    this.toolboxForm = <UntypedFormGroup> this.formProvider.getForm().get('toolbox');

    this.createWorkspace();


    

  }

  createWorkspace() {
    
    const blocklyDiv = document.getElementById('blocklyDiv');

    this.workspace = Blockly.inject(blocklyDiv, {
      readOnly: false,
      trashcan: true,
      grid:
      {spacing: 20,
       length: 3,
       colour: '#ccc',
       snap: true},
      move: {
        scrollbars: {horizontal: false, vertical: true},
        drag: false,
        wheel: true
      },
      toolbox: this.createToolbox()
    } as BlocklyOptions);

    // console.log(this.workspace);

    this.workspace.addChangeListener(this.updateCode.bind(this));

    this.toolboxSettingChangeSubscription = this.toolboxForm.valueChanges.subscribe(
      change => {
        this.workspace.clear();
        this.workspace.clearUndo();
        this.workspace.updateToolbox(this.createToolbox());
      }
    )


    // Blockly.Blocks['example_variable_typed'] = {
    //   init: function() {
    //     this.appendDummyInput()
    //       .appendField('variable:')
    //       .appendField(new Blockly.FieldVariable(
    //           'X',
    //           null,
    //           ['Number', 'String'],
    //           'Number'
    //       ), 'FIELDNAME');
    //   }
    // };
  }

  doSomething() {
    return "jello"
    return "bye"
    return 3
    return 4
    return 5
  }

  updateCode(event) {
    this.code = javascriptGenerator.workspaceToCode(this.workspace);
    console.log(this.code);
  }
  onSubmit() {
    console.log(Blockly.serialization.workspaces.save(this.workspace));
  }

  createToolbox() {

    let toolbox = toolboxOptions.toolboxStarter;
    // console.log(this.toolboxForm.value);
    //FIGURE OUT WHY THIS DOESN'T WORK NORMALLY

    while(toolbox.contents.length > 3) {
      toolbox.contents.pop();
    }

    if(this.toolboxForm.value.allowMath) {
      (<Array<any>>toolbox["contents"]).push(toolboxOptions.mathCategory);
    }
    if(this.toolboxForm.value.allowBoolean) {
      (<Array<any>>toolbox["contents"]).push(toolboxOptions.booleanCategory);
    }
    if(this.toolboxForm.value.allowIfs) {
      (<Array<any>>toolbox["contents"]).push(toolboxOptions.ifCategory);
    }
    if(this.toolboxForm.value.allowLoops) {
      (<Array<any>>toolbox["contents"]).push(toolboxOptions.loopsCategory);
    }
    

    return toolbox;
  }

  onRunCode() {
    try {
      eval(this.code);
    } catch (e) {
      alert(e);
    }
  }

  ngOnDestroy(): void {
    this.toolboxSettingChangeSubscription.unsubscribe();
  }

}
