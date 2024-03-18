import LightningModal from 'lightning/modal';
import { api } from 'lwc';
import NAME from '@salesforce/schema/Model__c.Name';
import PRICE from '@salesforce/schema/Model__c.Price__c';
import ECO_FRIENDLY from '@salesforce/schema/Model__c.Eco_friendly__c';

export default class EditModel extends LightningModal {
    objectApiName = 'Model__c';
    @api recordId;

    fields = [NAME, PRICE, ECO_FRIENDLY];

    handleSubmit(e) {
        const selectEvent = new CustomEvent('submitted', {
            detail: {
                modelId: this.recordId,
                newPrice: (e.detail.fields && e.detail.fields?.Price__c) ? e.detail.fields?.Price__c : null
            }
          });
          this.dispatchEvent(selectEvent);
    }
}