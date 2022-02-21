export namespace BussinessLogic {
  export class Search {
    id: number;
    regionalWarehouseName: string;
    openDays: number;
    responsible: string;
    status: number;
    repairerName: string;
    documentType: number;
    documentNumber: string;
    documentDate: Date;
  }
  
  export class BussinessLogic {
    id: number;
    regionalWarehouseName: string;
    openDays: number;
    responsible: string;
    status: number;
    repairerName: string;
    documentType: number;
    documentNumber: string;
    documentDate: Date;
    failuresId: number[] = [];
  }
  
  export namespace PendingCollection {
    export class Result {
      movimentReturnId: number;
      clientName: string;
      projectName: string;
      invoiceNumber: string;
      ufDestiny: string;
      cpnjDestiny: string;
      responsibleName: string;
      responsibleNokiaId: string;
      statusId?: number;
    }
    
    export class Search {
      repairmanId: number;
      userNameId:any;
      onlyMyUser: boolean;
      pageNumber: number;
    }
    
    export namespace InnerBussiness {
      export class Example {
        movimentReturnId: number;
        clientName: string;
        projectName: string;
        invoiceNumber: string;
        ufDestiny: string;
        cpnjDestiny: string;
        responsibleName: string;
        responsibleNokiaId: string;
        statusId?: number;
      }
      
    }
    
  }
  
}
