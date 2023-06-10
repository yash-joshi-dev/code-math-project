import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as Blockly from 'blockly';
import { BlocklyOptions } from 'blockly';
import { FormProvider } from 'src/app/general/form-provider.model';
import {toolboxOptions} from '../create-block-solution/toolbox';

@Component({
  selector: 'app-create-workspace',
  templateUrl: './create-workspace.component.html',
  styleUrls: ['./create-workspace.component.css']
})
export class CreateWorkspaceComponent implements OnInit {

  solution: JSON;
  allowNext: boolean = false;
  workspace;

  constructor(private formProvider: FormProvider, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {

    if(this.formProvider.getForm().get('tests').invalid) {
      this.router.navigate(['../tests'], {relativeTo: this.route});
    }

    const blocklyDiv = document.getElementById('blocklyDiv');

    // this.workspace = Blockly.inject(blocklyDiv, {
    //   readOnly: false,
    //   trashcan: true,
    //   grid:
    //   {spacing: 20,
    //    length: 3,
    //    colour: '#ccc',
    //    snap: true},
    //   move: {
    //     scrollbars: {horizontal: false, vertical: true},
    //     drag: true,
    //     wheel: true
    //   },
    //   toolbox: toolbox
    // } as BlocklyOptions);

    this.workspace.addChangeListener();

  }

  onWorkspaceChange() {
    
  }

}
