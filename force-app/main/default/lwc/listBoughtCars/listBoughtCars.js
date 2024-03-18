import { LightningElement } from 'lwc';

const columns = [
    { label: 'Label', fieldName: 'name' },
    { label: 'Website', fieldName: 'website', type: 'url' },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Balance', fieldName: 'amount', type: 'currency' },
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date' },
];

export default class ListBoughtCars extends LightningElement {
    data = [
        {
            label: 'dada'
        }
    ];
    columns = columns;
}