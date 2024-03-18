import { LightningElement, api, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';

export default class SingleSeller extends LightningElement {
    @api seller = null;
    @wire(CurrentPageReference) pageRef;

    // Handle delete seller
    async handleClickDeleteIcon() {
        try {
            this.dispatchEvent(
                new CustomEvent('startdeletion', {
                    detail: true
                })
            );
            
            fireEvent(
                this.pageRef,
                'startDeletingSeller'
            );

            await deleteRecord(this.seller.Id);

            fireEvent(
                this.pageRef,
                'endDeletingSeller',
                {
                    detail: true
                }
            );
        } catch(err) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error while deleting',
                    variant: 'error'
                })
            );
        }
    }

    // Handle change seller | Output different cars based on the seller selected
    handleChangeSeller(e) {
        e.preventDefault();
        fireEvent(this.pageRef, 'loadedSellers', {
            id: this.seller.Id,
            name: this.seller.Name
        });
    }
}