import { Directive, HostBinding, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appInputTypeDirective]'
})
export class InputTypeDirectiveDirective implements OnInit {

  @Input('appInputTypeDirective') variableType: string = "string";
  @HostBinding('type') type: string = "text";
  @HostBinding('pattern') pattern: string = "";

  constructor() { }
   
  ngOnInit(): void {
    

    switch(this.variableType) {
      case "string": this.type = 'text';
                    break;
      case "integer": this.type = 'number';
                      break;
      case "double": this.type = 'number';
                      break;
      case "char": this.type = 'text';
                    break;
      case "boolean": this.type = 'checkbox';
                      break;
                      
    }


  }

}
