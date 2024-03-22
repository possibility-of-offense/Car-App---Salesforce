import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

import showSellers from "@salesforce/apex/SellersUtils.getSellers";
import addSeller from "@salesforce/apex/SellersUtils.addSeller";

import AjaxCalling from 'c/ajaxCalling';

export default class ModelWrapper extends LightningElement {
    // AJAX state
    ajaxLoading = false;
    ajaxError = null;
    // Sellers
    sellers = null;

    // Inputs
    name = 'dadadada';
    location = 'dadadada';
    ceo = 'dadadadadada';
    phone = '4444/444444';
    numberOfCars = 4;

    // Page reference
    @wire(CurrentPageReference) pageRef;

    //
    // Getters
    //
    get sellerObject() {
        return {
            name: this.name,
            ceo: this.ceo,
            phone: this.phone,
            numberOfCars: this.numberOfCars,
            location: '[44, 44]'
        }
    }
    get ifSellers() {
        if(this.sellers && Array.isArray(this.sellers) && this.sellers.length > 0) {
            const findSellerWithCars = this.sellers.find(sel => sel.Number_of_cars__c);
            if(findSellerWithCars) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    // Connected callback
    connectedCallback() {
        registerListener(
            'startDeletingSeller',
            this.showLoadingSpinner,
            this
        );
        registerListener(
            'endDeletingSeller',
            this.handleShowSellers,
            this
        );
        registerListener(
            'modifiedCars',
            this.handleShowSellers,
            this
        );
    }

    // Disconnected callback
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    //
    // Methods
    //

    showLoadingSpinner(val) {
        this.ajaxLoading = val;
    }

    // Handle change inputs
    handleChangeInput = (e) => {
        const nameAttr = e.target.name;
        this[nameAttr] = e.target.value;
    }
    
    // Handle fetch sellers
    async handleShowSellers(e) {
        if(e && e.hasOwnProperty('detail')) {
            fireEvent(
                this.pageRef,
                'userWasDeleted'
            );

            this.template.querySelector('c-show-all-sellers').handleResetDeletionStarted();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Seller deleted',
                    variant: 'success'
                })
            );
        }
        this.sellers = null;
        
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: this.sellers } =
             await AjaxCalling.call(
                showSellers, 
                'Error while getting the sellers! Try again!'
        ));

        fireEvent(this.pageRef, 'loadedSellers', {
            id: this.sellers && Array.isArray(this.sellers) && this.sellers.length > 0 ? this.sellers[0].Id : null,
            name: this.sellers && Array.isArray(this.sellers) && this.sellers.length > 0 ? this.sellers[0].Name : null
        }); 
    }

    // Handle event when seller is added
    handleAddedSeller(onSuccess = true) {
        const evt = new ShowToastEvent({
            title: onSuccess ? 'Seller created' : 'Error',
            message: onSuccess ? 'Seller with a name of ' + this.name + ' was created!' : this.ajaxError,
            variant: onSuccess ? 'success' : 'error',
        });
        this.dispatchEvent(evt);

        this.name = '';
        this.location = '';
        this.ceo = '';
        this.phone = '';
        this.numberOfCars = '';

        fireEvent(
            this.pageRef,
            'addedSeller'
        );
    }

    // Add seller through imperative callback
    async handleAddSeller() {
        
        if(this.name === '' || this.locaiton === '' || this.ceo === '' || this.phone === '' || this.numberOfCars === '') {
            this.ajaxError = 'Fill the required inputs!';
            this.handleAddedSeller(false);
            return;
        }
        this.ajaxLoading = true;
        this.ajaxError = null;

        try {
            const seller = await addSeller({sellerObject: this.sellerObject});
            fireEvent(this.pageRef, 'addedSeller', {
                id: seller.Id,
                name: seller.Name
            });
        } catch(err) {
            this.ajaxError = 'Error happened, while adding seller! Try again!';
        } finally {
            this.handleAddedSeller(this.ajaxError === null);
            this.ajaxLoading = false;
        }
    }

    // Alternative invocation through Lightning Data Service
    handleAddSellerLDS() {
        createRecord({
            apiName: 'Seller__c',
            fields: this.sellerObject
        }).then(res => {
            console.log('Success ' + res);
        }).catch(err => {
            console.log('Error ' + err);
        })
    }

    // TODO
    // Handle notify show cars on sale component
    handleNotifyComponent() {
        fireEvent(
            this.pageRef,
            'refetchSaleCars'
        )
    }

}