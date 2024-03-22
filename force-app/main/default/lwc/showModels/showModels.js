import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';
import { deleteRecord } from 'lightning/uiRecordApi';

import showModels from '@salesforce/apex/ModelsUtils.showModels';
import addModel from 'c/addModel';
import editModel from 'c/editModel';
import AjaxCalling from 'c/ajaxCalling';

export default class ShowModels extends LightningElement {
    models = [];
    ajaxLoading = false;
    ajaxError = null;

    //
    // Getters
    //
    get showIfThereAreModels() {
        if(this.models && this.models.length > 0) return true;
        return false;
    } 

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        this.handleFetchModels();
    }

    // Fetch models
    async handleFetchModels() {
        this.ajaxLoading = true;
        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: this.models } =
            await AjaxCalling.call(
                showModels,
               `Error while getting models! Try reloading the browser!`
        ));
        
        fireEvent(this.pageRef, 'fetchedModels', {
            models: this.models
        })
    }

    // Add model
    async handleAddedModel() {
        await addModel.open({
            size: 'small',
            onaddedmodel: async e => {
                e.stopPropagation();

                await this.handleFetchModels();
            }
        });
    }

    // Delete a model
    async handleClickDeleteIcon(e) {
        const id = e.target.closest('li').dataset.id;
        this.ajaxLoading = true;

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError } =
            await AjaxCalling.call(
                deleteRecord.bind(null, id),
               `Couldn't delete the model! Try again!`
        ));

        if(!this.ajaxError) {
            this.models = this.models.filter(el => el.Id != id);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Deleted',
                    message: 'The model was successfully deleted!',
                    variant: 'success',
                })
            );
            fireEvent(this.pageRef, 'fetchedModels', {
                models: this.models
            })
        }
    }

    // Open Edit Model Modal
    async handleOpenEditModal(e) {
        try {
            await editModel.open({
                recordId: e.target.value,
                size: 'large',
                onsubmitted: e => {
                    fireEvent(
                        this.pageRef,
                        'editedModel',
                        e.detail
                    );
                }
            });

            await this.handleFetchModels();
        } catch(err) {
            this.ajaxError = `Couldn't open the modal! Try again!`
        }
    }
}