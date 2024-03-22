import { LightningElement, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class AjaxCalling extends LightningElement {
    ajaxLoading = false;
    ajaxError = null;
    data = null;

    // Page reference
    @wire(CurrentPageReference) pageRef;

    /**
     *
     * @param {Function} methodToCall - Apex or other method to call
     * @param {String} errorMessage - Error message to show if the callback is not successfull
     * @param {Object} events - Possible events to fire when the AJAX is complete
     */
    static async call(methodToCall, errorMessage, events = {}) {
        this.ajaxLoading = true;
        this.ajaxError = null;

        try {
            const response = await methodToCall();
            
            if(typeof(response) === 'string' && response.slice(0, 6) === 'ERROR:') {
                errorMessage = null;
                throw new Error(response.slice(6));
            }

            // If events is not an empty object
            if(events && Object.keys(events).length > 0) {
                for(let event in events) {
                    fireEvent(
                        this.pageRef,
                        event,
                        events[event] ? events[event] : null
                    );
                }
            }

            this.data = response;
        } catch(error) {
            this.ajaxError = errorMessage || error.message;
        } finally {
            this.ajaxLoading = false;
        }

        return {
            ajaxLoading: this.ajaxLoading,
            ajaxError: this.ajaxError,
            data: this.data
        }
    }
}