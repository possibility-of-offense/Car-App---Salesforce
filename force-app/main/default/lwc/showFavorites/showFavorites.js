import LightningModal from 'lightning/modal';
import { api } from 'lwc';

export default class ShowFavorites extends LightningModal {
    @api favorites = [];

    get areThereFavorites() {
        return this.favorites.length > 0
    }
}