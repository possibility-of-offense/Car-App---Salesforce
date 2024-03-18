import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

import buyCar from '@salesforce/apex/CarsUtils.buyCar';
import deleteCar from '@salesforce/apex/CarsUtils.deleteCarById';
import AjaxCalling from 'c/ajaxCalling';

export default class SingleCar extends LightningElement {
    @api car = {};
    @api sellerId = null;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    //
    // Getters
    //
    get wrapperDivClasses() {
        return `single-car` + (this.ajaxLoading ? ' skeleton' : '');
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
            return `background-color: #eb687f4f`;
        }
    }
    get availabilityText() {
        if(this.car.Car_Availability__c === 1) {
            return '1 Car';
        } else {
            return this.car.Car_Availability__c + ' cars';
        }
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
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError } =
            await AjaxCalling.call(
                buyCar.bind(null, {
                    sellerId: this.sellerId,
                    carId: this.car.Id
                }),
               `Error while buying the car! Try reloading the browser!`
        ));

        if(!this.ajaxError) {
            alert('BOUGHT ME!');
        }
    }
}