import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

import removeSaleForCars from '@salesforce/apex/CarsUtils.removeSaleForCars';
import AjaxCalling from 'c/ajaxCalling';
import getAllCars from '@salesforce/apex/CarsUtils.getAllCars';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Color', fieldName: 'Color__c' },
    { label: 'Number of doors', fieldName: 'Number_of_doors__c' },
    { label: 'Sale Price', fieldName: 'Sale_price__c' },
    { label: 'Seller', fieldName: 'Seller' }
];

export default class ShowCarsOnSale extends LightningElement {
    columns = columns;
    data = [];
    carsToRemoveSales = [];
    
    // AJAX state
    ajaxLoading = false;
    ajaxError = null;
    _initialFetching = true;
    
    @api notifications;
    @api removeNotification;
    @wire(CurrentPageReference) pageRef;
    
    //
    // Getters
    //
    get showRemoveSalePriceButton() {
        return this.carsToRemoveSales.length > 0
    }

    connectedCallback() {
        // TODO
        registerListener('refetchSaleCars', this.handleRefetchSaleCars, this);

        this.handleGetCars();
        this._initialFetching = false;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    // Get cars
    async handleGetCars() {
        this.ajaxLoading = true;
        this.ajaxError = null;
        let results = [];
        
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: results } =
            await AjaxCalling.call(
                getAllCars.bind(null, {
                    onSale: true,
                    sellerId: ''
                }),
                `Coudln't show the cars on sale! Try again!`
        ));

        const items = [];
        for(let result of results) {
            let newObj = {};
            
            for(let key of Object.keys(result)) {
                if(key === 'Seller_custom__c') continue;

                if(key === 'Seller_custom__r') {
                    newObj['Seller'] = result[key]?.Name;
                } else {
                    newObj[key] = result[key];
                }
            }
            items.push(newObj);
        }
        this.data = items;
    }

    // When click on the checkbox in the header
    handleHeaderAction(e) {
        this.carsToRemoveSales = e.detail.selectedRows.map(el => el.Id);
    }

    // Remove sale price
    async handleRemoveSalePrice() {
        this.ajaxLoading = true;
        this.ajaxError = null;

        if(this.carsToRemoveSales.length > 0) {
            let filterCarsIds = [];
            ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: filterCarsIds } =
                await AjaxCalling.call(
                    removeSaleForCars.bind(null, {
                        ids: this.carsToRemoveSales
                    }),
                    `Coudln't show the cars on sale! Try again!`
            ));
    
            this.data = this.data.filter(el => !filterCarsIds.includes(el.Id));
    
            fireEvent(
                this.pageRef,
                'modifiedCars',
                {
                    ids: filterCarsIds
                }
            );
        }
    }

    // Refetch sale cars TODO
    handleRefetchSaleCars() {
        if(!this._initialFetching) {
            this.handleGetCars();
        }
    }
}