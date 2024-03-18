import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningModal from 'lightning/modal';

import addModel from '@salesforce/apex/ModelsUtils.addModel';
import AjaxCalling from 'c/ajaxCalling';

export default class AddModel extends LightningModal {
    name = '';
    ecoFriendly = false;
    price;

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;
    addingModel = false;

    // Change input / update value
    handleChangeInput = (e) => {
        const nameAttr = e.target.name;
        this[nameAttr] = e.target.value;
    }

    async handleOkay() {
        this.addingModel = true;

        if(!this.name && !this.price) {
            this.error = 'Name and price are required!';
            this.addingModel = false;
            return;
        }

        this.ajaxLoading = true;
        this.ajaxError = null;

        let responseMessage = '';
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: responseMessage } =
            await AjaxCalling.call(
                addModel.bind(null, {
                    name: this.name,
                    ecoFriendly: this.ecoFriendly,
                    price: this.price
                }),
               `Error while getting models! Try reloading the browser!`
        ));

        if(responseMessage === 'MODEL-EXISTS') {
            this.name = '';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Duplicate found',
                    message: 'A model with the same name was found!',
                    variant: 'warning',
                })
            );
        }

        // If there is an error
        if(!this.ajaxError) {
            this.dispatchEvent(
                new CustomEvent('addedmodel')
            );
            this.close();
        }
    }
}