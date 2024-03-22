public with sharing class ArchiveUtils {
    @AuraEnabled
    public static Boolean setToArchive() {
        try {
            List<Sold_Car__c> soldCars = [SELECT Name, Sold_Car_Price__c, Seller__r.Name, Seller__r.Id FROM Sold_Car__c];
            List<Archive_Sale__c> archives = new List<Archive_Sale__c>();

            Integer ind = 0;
            for(Sold_Car__c car : soldCars) {
                ind += 1;
                archives.add(
                    new Archive_Sale__c(
                        Name='Archive Number ' + ind,
                        Car_Name__c=car.Name,
                        Car_Price__c=car.Sold_Car_Price__c,
                        Seller_Name__c=car.Seller__r.Name
                    )
                );
            }

            insert archives;

            delete soldCars;

            return true;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return false;
        }
    }
}