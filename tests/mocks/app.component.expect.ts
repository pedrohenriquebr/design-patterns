//@ts-nocheck
import { Component, OnInit } from "@angular/core";
import { BussinessLogic } from './../..\temp\bussiness-logic.model';
@Component({
  selector: "app-root",
  template: `
    <div class="container">
      <div class="row">
        <div class="col-md-12">APP</div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        margin-top: 20px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    const model : BussinessLogic.PendingCollection.InnerBussiness.Foo.Bar.Example;
    const result = this.doOperation(model);
  }

  public doOperation(model: BussinessLogic.PendingCollection.InnerBussiness.Foo.Bar.Example) {
    // do something
    return {
      ...model,
        id: 1234,
        regionalWarehouseName: 'abc',
        openDays: 89, 
        responsible: 'abc',
        status: 'abc',
        repairerName: 'repairerName',
        documentType: 99,
        documentNumber: 'documentNumber',
        documentDate: new Date(),
        failuresId: [
            1,3,4
        ],
    };
  }
}
