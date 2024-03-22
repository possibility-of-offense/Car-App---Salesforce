public with sharing class SellerUpdageMnpl {
    public static void incrementNumberOfCars(List<Seller__c> sellers) {
        for(Seller__c seller : sellers) {
            seller.Number_of_cars__c += 1;
        }
        update sellers;
    }

    public static void decrementNumberOfCars(List<Seller__c> sellers) {
        for(Seller__c seller : sellers) {
            if(seller.Number_of_cars__c > 0) {
                seller.Number_of_cars__c -= 1;
            }
        }
        update sellers;
    }
}