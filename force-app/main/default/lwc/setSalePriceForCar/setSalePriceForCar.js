import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { getRecord } from "lightning/uiRecordApi";

import addSalePrice from '@salesforce/apex/CarsUtils.addSalePrice';
import getAllCars from '@salesforce/apex/CarsUtils.getAllCars';
import getCarById from '@salesforce/apex/CarsUtils.getCarById';
import AjaxCalling from 'c/ajaxCalling';

const FIELDS = ['Car__c.Sale_price__c'];

export default class SetSalePriceForCar extends LightningElement {
    cars = [];
    value = '';
    pickedValue = false;

    @api objectApiName = 'Car__c';
    @wire(getRecord, {recordId: '$value', fields: FIELDS}) car;
    @wire(CurrentPageReference) pageRef;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    //
    // Getters/setters
    //

    _price = null;
    get price() {
        return this._price;
    }
    set price(val) {
        this._price = val;
    }

    // Connected callback
    connectedCallback() {
        registerListener('modifiedCars', this.handleRepopulateSelect, this);

        this.ajaxLoading = true;
        this.ajaxError = null;
        getAllCars({
            onSale: false,
            sellerId: ''
        })
            .then(res => {
                this.cars = [
                    {
                        label: 'Choose a car',
                        value: ''
                    },
                    ...res.map(el => ({
                        label: el.Name,
                        value: el.Id
                    }))
                ];
            })
            .catch(err => {
                this.ajaxError = 'Error while getting the cars! Try again!';
            })
            .finally(() => {
                this.ajaxLoading = false;
            })
    }

    // Disconnected callback
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    // Handle pick a value from the select list
    async handleChange(e) {
        this.value = e.target.value;
        if(!this.pickedValue) {
            this.pickedValue = true;
        }

        this.ajaxLoading = true;
        this.ajaxError = null;

        let result = [];
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: result } =
            await AjaxCalling.call(
                getCarById.bind(null, {
                    id: this.value
                }),
               `Coudln't show the car! Try again!`
        ));

        const theCar = result[0];
        this.price = theCar.Sale_price__c || 0;
    }

    // Update sale price value
    handleUpdatePrice(e) {
        if(e.detail.value[0] === '0') {
            this.price = e.target.value.substring(1);
        } else {
            this.price = e.target.value;
        }
    }

    // Add sale price
    async handleChangeSalePrice(e) {
        this.ajaxLoading = true;
        this.ajaxError = null;

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError } =
            await AjaxCalling.call(
                addSalePrice.bind(null, {
                    carId: this.value,
                    price: this.price
                }), 
               `Coudln't add/update sale price! Try again or reload the browser!`
        ));

        if(!this.ajaxError) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Sale price added/updated',
                    variant: 'success',
                })
            );
        }
    }

    // TODO
    handleRepopulateSelect({ids = null}) {
        // getAllCars()
        //     .then(res => {
        //         if(ids && Array.isArray(ids)) {
        //             let findCar = ids.find(el => el === this.value);
        //             if(findCar) {
        //                 this.price = 0;
        //             }
        //         }

        //         this.cars = [
        //             {
        //                 label: 'Choose a car',
        //                 value: ''
        //             },
        //             ...res.map(el => ({
        //                 label: el.Name,
        //                 value: el.Id
        //             }))
        //         ];
        //     })
        //     .catch(err => {
        //         console.log(err.message, 'repopulate');
        //     })
    }
}