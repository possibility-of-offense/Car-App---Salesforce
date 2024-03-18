import { LightningElement, api } from 'lwc';

export default class Spinner extends LightningElement {
    @api showSpinner = false;
    @api spinnerSize = 'medium';
}