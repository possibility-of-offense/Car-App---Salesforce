import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import noCarImage from "@salesforce/resourceUrl/No_car";

import buyCar from '@salesforce/apex/CarsUtils.buyCar';
import deleteCar from '@salesforce/apex/CarsUtils.deleteCarById';
import AjaxCalling from 'c/ajaxCalling';

export default class SingleCar extends LightningElement {
    @api car = {};
    @api sellerId = null;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    No_Car_Image = noCarImage;
    _carAvailability;

    //
    // Getters
    //
    get wrapperDivClasses() {
        let noImageClass = '';
        if(!this.car.Picture__c) {
            noImageClass = 'no-image';
        }

        return `single-car ${noImageClass}` + (this.ajaxLoading ? ' skeleton' : '');
    }
    get showNodesWhenCarIsNotDeleted() {
        return !this.ajaxLoading;
    }
    get recordUrl() {
        return `https://efficiency-power-7355-dev-ed.scratch.lightning.force.com/lightning/r/Car__c/` + this.car.Id + '/view';
    }
    get backgroundImageStyle() {
        if(this.car.Picture__c) {
            return `background: url(${this.car.Picture__c}) center/cover no-repeat `;
        } else {
            return `background: url(${this.No_Car_Image}) center no-repeat; background-size: 150px;`;
        }
    }
    get availabilityText() {
        if(this._carAvailability === 1) {
            return '1 Car';
        } else {
            return this._carAvailability + ' cars';
        }
    }
    get showBuyingButton() {
        if(this._carAvailability > 0) return true;
        return false;
    }
    get isThereSalePrice() {
        if(this.car.Sale_price__c && this.car.Sale_price__c < this.car.Model_price__c) return true;
        return false;
    }

    connectedCallback() {
        this._carAvailability = this.car.Car_Availability__c;
    }

    @wire(CurrentPageReference) pageRef;
    // Delete car
    async handleClickDeleteIcon() {    
        this.ajaxLoading = true;
        let carId = this.car.Id;

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: this.car } =
            await AjaxCalling.call(
                deleteCar.bind(null, {
                    id: this.car.Id
                }),
               `Error while deleting the car! Try reloading the browser!`
        ));

        if(!this.ajaxError) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Deleted',
                    message: 'The car was deleted',
                    variant: 'info'
                })
            );
            this.dispatchEvent(
                new CustomEvent('cardeleted', {
                    detail: {
                        id: carId
                    }
                })
            );
            fireEvent(this.pageRef, 'modifiedCars');
        }
    }

    // Handle buy car
    async handleBuyCar() {
        this.ajaxLoading = true;

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError } =
            await AjaxCalling.call(
                buyCar.bind(null, {
                    sellerId: this.sellerId,
                    carId: this.car.Id
                }),
               `Error while buying the car! Try reloading the browser!`
        ));

        if(!this.ajaxError) {
            this._carAvailability--;
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: !this.ajaxError ? 'Bought car' : 'Buying unsuccessfull',
                message: !this.ajaxError ? 'The car was bought' : 'The car was not bought',
                variant: !this.ajaxError ? 'success' : 'error'
            })
        );

        fireEvent(
            this.pageRef,
            'boughtCar',
            {
                detail: this.car.Id
            }
        )
    }
}