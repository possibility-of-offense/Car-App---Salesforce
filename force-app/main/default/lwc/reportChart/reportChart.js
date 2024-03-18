import chartjs from "@salesforce/resourceUrl/Chart";
import chartcss from "@salesforce/resourceUrl/chartcss";
import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import getSellers from "@salesforce/apex/SellersUtils.getSellers";

export default class ReportChart extends LightningElement {
    // chart;

    sellers = [];

    connectedCallback() {
        // console.log('pre');
        // getSellers()
        //     .then(res => {
        //         console.log(res, 'reportChart');
        //         this.sellers = res;
        //     })
        //     .catch(err => {
        //         console.log(err)
        //     });
    }

    renderedCallback() {
        // console.log('post', this.sellers);
        Promise.all([
            loadScript(this, chartjs),
            getSellers()
            // loadStyle(this, chartcss)
        ]).then((res) => {
            // window.Chart.platform.disableCSSInjection = true;
            let ctx = this.template.querySelector('canvas.chart');
            // console.log(res);
            // REFACTOR
            const sellers = res[1];
            this.sellers = sellers;
            const labels = sellers.map(el => el.Name);

            // console.log('⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔');

            // console.log(JSON.stringify(labels), 'test');
            // this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));

          
            // try {
            //     console.log('CHART JS', new window.Chart);
            // } catch(err) {
            //     console.log(err.message);
            // }
            
            new window.Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    labels,
                    datasets: [{
                        label: 'Sold cars by sellers',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            // 'rgba(54, 162, 235, 0.2)',
                            // 'rgba(255, 206, 86, 0.2)',
                            // 'rgba(75, 192, 192, 0.2)',
                            // 'rgba(153, 102, 255, 0.2)',
                            // 'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            // 'rgba(54, 162, 235, 1)',
                            // 'rgba(255, 206, 86, 1)',
                            // 'rgba(75, 192, 192, 1)',
                            // 'rgba(153, 102, 255, 1)',
                            // 'rgba(255, 159, 64, 1)'
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

            // new window.Chart(ctx, {
            //     type: 'bar',
            //     data: {
            //       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            //       datasets: [{
            //         label: '# of Votes',
            //         data: [12, 19, 3, 5, 2, 3],
            //         borderWidth: 1
            //       }]
            //     },
            //     options: {
            //       scales: {
            //         y: {
            //           beginAtZero: true
            //         }
            //       }
            //     }
            //   });

       }).catch(err => {
            // console.log(err.message);
       })
    }
}