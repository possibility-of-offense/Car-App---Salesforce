import { LightningElement, api, wire } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

import chartjs from "@salesforce/resourceUrl/Chart";
import getSellersWithCars from "@salesforce/apex/SellersUtils.getSellersWithCars";

export default class ReportChart extends LightningElement {
    @api sellers = [];
    error = null;
    chart;

    @wire(CurrentPageReference) pageRef;

    renderedCallback() {
        if(!this.error) {
            this.handleFetchSellers();
        }
    }

    handleFetchSellers() {
        if(this.chart) {
            this.chart.destroy();
        }

        return Promise.all([
            loadScript(this, chartjs),
            // getSellersWithCars()
        ]).then((res) => {
            let ctx = this.template.querySelector('canvas.chart');
            const labels = this.sellers.map(el => el.Name);
            
            this.chart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Sold cars by sellers',
                        data: this.sellers.map(el => el.Sold_Cars__c),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

       }).catch(err => {
           this.error = 'Error showing the report chart! Try again, reloading the browser!';
       })   
    }

    connectedCallback() {
        registerListener(
            'addedSeller',
            this.handleRefetchSellers,
            this
        );
        registerListener(
            'endDeletingSeller',
            this.handleRefetchSellers,
            this
        );
        registerListener(
            'boughtCar',
            this.handleRefetchSellers,
            this
        )
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleRefetchSellers() {
        this.handleFetchSellers();
    }
}