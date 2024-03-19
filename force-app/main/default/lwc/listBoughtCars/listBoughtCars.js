import showBoughtCars from '@salesforce/apex/CarsUtils.showBoughtCars';
import { LightningElement } from 'lwc';

const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Price', fieldName: 'price' },
    { label: 'Seller', fieldName: 'seller' }
];

export default class ListBoughtCars extends LightningElement {
    data = [];
    columns = columns;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    toShowReportChart = true;

    get buttonLabel() {
        if(this.toShowReportChart) return 'Show report chart';
        return 'Hide report chart';
    }

    connectedCallback() {
        this.ajaxLoading = true;
        this.ajaxError = null;

        showBoughtCars()
            .then(results => {
                let items = [];
                for(let res of results) {
                    items.push({
                        id: res.Id,
                        name: res.Name,
                        price: res.Sold_Car_Price__c,
                        seller: res.Seller__r.Name
                    })
                }

                this.data = items;
            })
            .catch(err => {
                this.ajaxError = 'Error showing bought cars! Try reloading the browser!';
            })
            .finally(() => this.ajaxLoading = false);
    }

    // Open report chart or hide it
    handleButtonClick() {
        this.toShowReportChart = !this.toShowReportChart;
    }
}