public with sharing class ModelsUtils {
    // Show models
    @AuraEnabled
    public static List<Model__c> showModels() {
        return [SELECT Name, Price__c FROM Model__c WITH SECURITY_ENFORCED];
    }

    // Add model
    @AuraEnabled
    public static String addModel(String name, Boolean ecoFriendly, Integer price) {
        try {
            Integer getModelsWithTheSameName = [SELECT COUNT() FROM Model__c WHERE Name = :name];
            
            if(getModelsWithTheSameName == 0) {
                Model__c model = new Model__c(
                    Name=name,
                    Eco_friendly__c=ecoFriendly,
                    Price__c=price
                );
                insert model;

                return 'ADDED-MODEL';
            } else {
                return 'MODEL-EXISTS';
            }
        } catch(Exception e) {
            System.debug(e.getMessage());
            return 'ERROR-OCCURED';
        }
    }
}