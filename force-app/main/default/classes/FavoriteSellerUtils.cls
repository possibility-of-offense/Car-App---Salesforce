public with sharing class FavoriteSellerUtils {
    // Add favorites
    @AuraEnabled
    public static Boolean addToFavorites(String sellerId) {
        try {
            List<Favorite_Seller__c> favSeller = [SELECT Id FROM Favorite_Seller__c WHERE Seller_custom__c = :sellerId];
            List<Seller__c> sellers = [SELECT Id, Name, Favorite__c FROM Seller__c WHERE Id = :sellerId];

            if(sellers.size() == 0) {
                return false;
            }

            Seller__c theSeller = sellers[0];
            
            if(favSeller.size() > 0) {
                Favorite_Seller__c theFavSeller = favSeller[0];
                theSeller.Favorite__c = false;

                update theSeller;
                delete theFavSeller;
            } else {
                Favorite_Seller__c fav = new Favorite_Seller__c(
                    Name='Favorite seller - ' + theSeller.Name,
                    Seller_custom__c=sellerId
                );
                theSeller.Favorite__c = true;

                insert fav;
                update theSeller;
            }

            return true;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return false;
        }
    }

    // Show all favorites
    @AuraEnabled
    public static List<Favorite_Seller__c> showAllFavorites(){
        try {
            return [SELECT Id, Seller_custom__r.Name, Seller_custom__r.Number_of_cars__c FROM Favorite_Seller__c ORDER BY CreatedDate];
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    // Helper internal functions
    // Helper internal functions
    // Helper internal functions
    public static void resetState() {
        FavoriteSellerUtils.deleteFavoriteAndResetSellers();
    }

    private static void deleteFavoriteAndResetSellers() {
        List<Favorite_Seller__c> favs = [SELECT Id FROM Favorite_Seller__c];
        delete favs;

        List<Seller__c> sellers = [SELECT Id, Favorite__c FROM Seller__c];

        for(Seller__c sel : sellers) {
            sel.Favorite__c = false;
        }

        update sellers;
    }
}