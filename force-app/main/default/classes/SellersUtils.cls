public with sharing class SellersUtils {
    /** 
     * @description The class will set the typization of the params,
     * when using the addSeller method which accepts an object
     */
    public class SellerParams {
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String ceo { get; set; }
        @AuraEnabled
        public String phone { get; set; }
        @AuraEnabled
        public Integer numberOfCars { get; set; }
        @AuraEnabled
        public String location { get; set; }
    }

    // Show all sellers
    @AuraEnabled
    public static List<Seller__c> getSellers() {
        return [SELECT Name FROM Seller__c WITH SECURITY_ENFORCED ORDER BY CreatedDate];
    }

    // Add seller
    @AuraEnabled
    public static Seller__c addSeller(SellerParams sellerObject){
        try {
            Seller__c seller = new Seller__c(
                Name=sellerObject.name,
                CEO__c=sellerObject.ceo,
                Phone__c=sellerObject.phone,
                Number_of_cars__c=sellerObject.numberOfCars,
                Location__Latitude__s=44,
                Location__Longitude__s=44);
    
                insert seller;
                return seller;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    // Show all sellers with sold cars
    @AuraEnabled
    public static List<sObject> getSellersWithCars() {
        try {
            List<sObject> sellers = new List<sObject>();
            List<Seller__c> sels = [SELECT Id, Name, Sold_Cars__c FROM Seller__c WITH SECURITY_ENFORCED ORDER BY CreatedDate];

            for(Seller__c sel : sels) {
                Integer soldCars = [SELECT COUNT() FROM Sold_Car__c WHERE Seller__r.Id = :sel.Id];
                // sObject cloneSel = (sObject)sel;
                // cloneSel.put('sold', soldCars);

                // sellers.add(
                //     cloneSel
                // );

                sel.Sold_Cars__c = soldCars;
            }

            return sels;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }
}