import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

import addCar from 'c/addCar';
import AjaxCalling from 'c/ajaxCalling';

import getAllCars from '@salesforce/apex/CarsUtils.getAllCars';
import deleteAllCars from '@salesforce/apex/CarsUtils.deleteAllCars';
import refetchCarsBySeller from '@salesforce/apex/CarsUtils.refetchCarsBySeller';
import getFilteredCars from '@salesforce/apex/CarsUtils.getFilteredCars';

export default class ShowCarsBySeller extends LightningElement {
    @track cars = null;
    numberOfCars = 0;
    @wire(CurrentPageReference) pageRef;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;
    
    sellerId;
    sellerName = '';
    minPriceSliderRange = 0;
    maxPriceSliderRange = 0;

    sellersAdded = true;

    //
    // Getters
    //

    get title() {
        if(this.sellersAdded) {
            return 'Cars by ' + this.sellerName
        } else {
            return 'Cars to be shown!';
        }
    }
    get deleteAllCarsBy() {
        return 'Delete all cars of ' + this.sellerName
    }
    get showDeleteButtonIfThereAreCars() {
        if(this.numberOfCars > 0) return true;
        return false;
    }
    get showSliderIfMoreThanOneCar() {
        if(this.numberOfCars > 1) return true;
        return false;
    }
    get howManyCars() {
        if(this.cars) {
            if(this.cars.length === 1) {
                return '1 Car';
            } else if(this.cars.length !== 0) {
                return this.cars.length  + ' Cars';
            }
        }
    }
    // Handle change slider value
    _range = '';
    get rangeValue() {
        return this._range;
    }
    set rangeValue(val) {
        this._range = val;
    }
    get showMessageWhenAjaxIsFinished() {
        if(!this.ajaxLoading && (!this.cars || this.cars.length === 0)) {
            return 'No cars by ' + this.sellerName
        } else {
            return false;
        }
    }

    connectedCallback() {
        this.ajaxLoading = true;
        this.cars = null;

        registerListener('loadedSellers', this.handleLoadingCars, this);
        // registerListener('editedModel', this.handleEditedModel, this);
    }
    
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    // Show cars
    async handleLoadingCars({id, name}) {
        if(!id && !name) {
            this.sellersAdded = false;
            this.ajaxLoading = false;
            return;
        }

        this.ajaxLoading = true;
        this.sellerId = id;
        if(name) {
            this.sellerName = name;
        }

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: this.cars } =
            await AjaxCalling.call(
                getAllCars.bind(null, {
                    onSale: false,
                    sellerId: id
                }),
                `Error while getting the cars! Try reloading the browser!`
        ));
        if(!this.ajaxError && Array.isArray(this.cars)) {
            this.setMinAndMaxValues(this.cars);
            this.numberOfCars = this.cars.length;
        }
    }

    // Set min and max slider range values
    setMinAndMaxValues(items) {
        if(items.length === 1) {
            return;
        }
        const prices = items.map(el => el.Model_price__c);
        this.minPriceSliderRange = Math.min(...prices);
        this.maxPriceSliderRange = Math.max(...prices);

        this.rangeValue = String(Math.floor(this.maxPriceSliderRange / 2));
    }

    // Delete all cars
    async handleDeleteAllCars() {
        this.ajaxLoading = true;

        let response;
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: response } =
            await AjaxCalling.call(
                deleteAllCars.bind(null, {
                    sellerId: this.sellerId
                }),
               `Error while deleting all cars! Try reloading the browser!`
        ));

        if(!this.ajaxError && response) {
            const evt = new ShowToastEvent({
                title: 'Success',
                message: `Car${this.cars.length === 1 ? '' : 's'} deleted`,
                variant: 'success',
            });
            this.dispatchEvent(evt);
            this.maxPriceSliderRange = 0;
            this.minPriceSliderRange = 0;
            this.cars = null;
        } else {
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Error while deleting cars!',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    // Handle edit model
    handleEditedModel({ modelId, newPrice }) {
        if(newPrice) {
            this.cars = this.cars.map(el => {
                if(el.Model__c === modelId) {
                    el.Model_price__c = newPrice;
                } 

                return el;
            })
        }
    }

    // Show add car modal
    async handleAddCarClick() {
        const result = await addCar.open({
            size: 'small'
        });

        if(result === true) {
            fireEvent(this.pageRef, 'modifiedCars');

            try {
                const cars = await refetchCarsBySeller({
                    sellerId: this.sellerId
                });
                this.cars = cars;
                this.setMinAndMaxValues(this.cars);
            } catch (error) {
                this.ajaxError = 'Error occured! Try reloading the browser!';
            }
        }
    }

    // Update slider range value
    handleChangeSliderValue(e) {
        this.rangeValue = e.detail.value;
    }
    
    // When the mouse is being released, make the AJAX call to fetch filtered cars
    async handleReleaseMouse(e) {
        this.ajaxLoading = true;

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: this.cars } =
            await AjaxCalling.call(
                getFilteredCars.bind(null, {
                    sellerId: this.sellerId,
                    price: +this.rangeValue
                }),
               `Error while filtering the cars! Try reloading the browser!`
        ));
    }

    // Handle deleted car 
    async handleDeletedCar(e) {
        this.cars = this.cars.filter(el => el.Id !== e.detail.id);
        if(this.cars.length === 0) {
            await this.handleLoadingCars({
                id: this.sellerId
            });
        }
    }


    async fetchCars(id) {
        this.ajaxLoading = true;
        return getAllCars({
            onSale: false,
            sellerId: id
        })
        .then(res => {
            this.cars = Array.isArray(res) && res.length > 0 ? res : null;
            this.setMinAndMaxValues(this.cars);
        })
        .catch(err => err)
        .finally(() => this.ajaxLoading = false);
    }

}