import LightningModal from 'lightning/modal';
import { processImage } from 'lightning/mediaUtils';

import Name from '@salesforce/schema/Car__c.Name';
import Model from '@salesforce/schema/Car__c.Model__c';
import Seller from '@salesforce/schema/Car__c.Seller_custom__c';
import NumberOfDoors from '@salesforce/schema/Car__c.Number_of_doors__c';
import Color from '@salesforce/schema/Car__c.Color__c';
import Availability from '@salesforce/schema/Car__c.Car_Availability__c';

import createFile from '@salesforce/apex/FileUtils.createFile';
import AjaxCalling from 'c/ajaxCalling';

export default class AddCar extends LightningModal {
    objectApiName = 'Car__c';

    // Filename and basename
    filename;
    toBase64;

    // Fields
    name = Name;
    model = Model;
    seller = Seller;
    numberOfDoors = NumberOfDoors;
    color = Color;
    availability = Availability;

    imgUrl = '/sfc/servlet.shepherd/version/download/';

    // AJAX state
    ajaxLoading = false;
    ajaxError = null;

    // File selection
    async handleFileSelected(e) {
        const file = e.target.files[0];
        this.template.querySelector('[class^=image-preview]').innerHTML = '';

        const image = document.createElement('img');
        image.src = URL.createObjectURL(file);
        image.width = '200';

        this.template.querySelector('[class^=image-preview]').append(image);

        const blob = await processImage(file);
        this.toBase64 = await this.blobToBase64(blob);
        this.filename = file.name;
    }

    // Convert to base64
    async blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
        });
    }

    // Close modal
    handleOkay() {
        this.close();
    }
    
    // Handle create car
    async handleCarCreated(e) {
        this.ajaxLoading = true;
        const recordId = e.detail.id;
        
        if(this.toBase64) {
            ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError } =
                await AjaxCalling.call(
                    createFile.bind(null, {
                        base64: this.toBase64,
                        filename: this.filename,
                        recordId
                    }),
                   `Error adding new car! Try again!`
            ));
        }

        if(!this.ajaxError) this.close(true);
    }

    handleSubmit() {
        this.ajaxLoading = true;
    }
}