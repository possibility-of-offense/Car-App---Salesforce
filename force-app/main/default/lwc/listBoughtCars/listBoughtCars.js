import { LightningElement, wire } from 'lwc';

import showBoughtCars from '@salesforce/apex/CarsUtils.showBoughtCars';
import getSellersWithCars from '@salesforce/apex/SellersUtils.getSellersWithCars';

import { CurrentPageNavigation } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Price', fieldName: 'price' },
    { label: 'Seller', fieldName: 'seller' }
];

export default class ListBoughtCars extends LightningElement {
    cars = [];
    sellers = [];
    columns = columns;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    toShowReportChart = true;

    @wire(CurrentPageNavigation) pageRef;

    get buttonLabel() {
        if(this.toShowReportChart) return 'Show report chart';
        return 'Hide report chart';
    }

    get showToggleButtonIfMoreThanOneSeller() {
        return this.sellers.length > 1
    }

    connectedCallback() {
        this.ajaxLoading = true;
        this.ajaxError = null;

        // registerListener('endDeletingSeller', this.handleRedraw, this);

        Promise.all([
            this.handleShowBoughCars(),
            this.handleGetSellersWithcars()
        ])
            .then(([carsData, sellersData]) => {
                let items = [];
                for(let res of carsData) {
                    items.push({
                        id: res.Id,
                        name: res.Name,
                        price: res.Sold_Car_Price__c,
                        seller: res.Seller__r.Name
                    })
                }

                this.cars = items;
                this.sellers = sellersData;
            })
            .catch(err => {
                this.ajaxError = 'Error occured! Try reloading the browser!';
            })
            .finally(() => {
                this.ajaxLoading = false;
            })
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    // Show bought cars
    async handleShowBoughCars() {
        return showBoughtCars()
    }

    // Get sellers with cars
    async handleGetSellersWithcars() {
        return getSellersWithCars()
    }

    // Redraw the component
    handleRedraw() {
        this.ajaxError = null;
        this.ajaxLoading = true;

        handleGetSellersWithcars()
            .then(res => this.sellers = res)
            .catch(err => {
                this.ajaxError = 'Error while fetch the updated sellers data! Try reloading the browser!';
            })
            .finally(() => {
                this.ajaxLoading = false;
            })
    }

    // Open report chart or hide it
    handleButtonClick() {
        this.toShowReportChart = !this.toShowReportChart;
    }

    // Handle refresh bought cars
    handleRefresh() {
        handleShowBoughCars()
            .then(res => {
                let items = [];
                for(let res of carsData) {
                    items.push({
                        id: res.Id,
                        name: res.Name,
                        price: res.Sold_Car_Price__c,
                        seller: res.Seller__r.Name
                    })
                }

                this.cars = items;
            })
            .catch(err => {
                this.ajaxError = 'Error while refreshing the data! Try reloading the browser!';
            })
            .finally(() => {
                this.ajaxLoading = false;
            })
    }
}