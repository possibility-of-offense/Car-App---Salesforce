import { LightningElement, api, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';

import addToFavorites from '@salesforce/apex/FavoriteSellerUtils.addToFavorites';
import AjaxCalling from 'c/ajaxCalling';

export default class SingleSeller extends LightningElement {
    @api seller = null;
    @wire(CurrentPageReference) pageRef;
    ajaxLoading = false;
    ajaxError = null;

    _optimisticLikeState = null;

    // 
    // Getters
    //

    get showVariantBaseOnFavorite() {
        console.log(JSON.stringify(this.seller));
        if(this.seller.Favorite__c || this._optimisticLikeState) {
            return 'brand';
        } else if(!this.seller.Favorite__c || this._optimisticLikeState === null) {
            return 'brand-outline';
        }
    }
    get showText() {
        if(this.seller.Favorite__c || this._optimisticLikeState) {
            return 'Remove seller from favorites';
        } else if(!this.seller.Favorite__c && this._optimisticLikeState === null) {
            return 'Add seller to favorites';
        }
    }

    // Handle delete seller
    async handleClickDeleteIcon() {
        try {
            this.dispatchEvent(
                new CustomEvent('startdeletion', {
                    detail: true
                })
            );
            
            fireEvent(
                this.pageRef,
                'startDeletingSeller'
            );

            await deleteRecord(this.seller.Id);

            fireEvent(
                this.pageRef,
                'endDeletingSeller',
                {
                    detail: true
                }
            );
        } catch(err) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error while deleting',
                    variant: 'error'
                })
            );
        }
    }

    // Handle change seller | Output different cars based on the seller selected
    handleChangeSeller(e) {
        e.preventDefault();
        fireEvent(this.pageRef, 'loadedSellers', {
            id: this.seller.Id,
            name: this.seller.Name
        });
    }

    // Click on add to favorite button
    async handleClickFavoriteButton() {
        let response;

        if(this.seller.Favorite__c || this._optimisticLikeState === true) {
            this._optimisticLikeState = false;
        } else if(!this.seller.Favorite__c || this._optimisticLikeState === false) {
            this._optimisticLikeState = true;
        }

        ({ ajaxLoading: this.ajaxLoading, ajaxError: this.ajaxError, data: response } =
            await AjaxCalling.call(
                addToFavorites.bind(null, {
                    sellerId: this.seller.Id
                }),
               `Error while getting models! Try reloading the browser!`
        ));

        if(this.ajaxError) {
            this._optimisticLikeState = false;
        }
    }
}