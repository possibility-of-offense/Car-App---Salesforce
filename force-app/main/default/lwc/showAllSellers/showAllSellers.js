import { LightningElement, api, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class ShowAllSellers extends LightningElement {
    @api ajaxLoading;
    @api sellers;
    deletionStarted = false;

    @wire(CurrentPageReference) pageRef;

    //
    // Getters
    //
    get sellersExist() {
        if(this.sellers.length > 0) return true;
        return false;
    }

    get loadingData() {
        if(this.sellers === null || this.ajaxLoading || this.deletionStarted) return true;
        return false;
    }

    handleStartDeletion() {
        this.deletionStarted = true;
    }

    @api
    handleResetDeletionStarted() {
        this.deletionStarted = false;
    }

    connectedCallback() {
        registerListener(
            'userWasDeleted',
            this.handleResetDeletionStarted(),
            this
        );
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }
    
}