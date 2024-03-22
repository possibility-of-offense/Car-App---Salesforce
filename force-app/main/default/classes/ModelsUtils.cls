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

    // Delete a model (or try to delete)
    @AuraEnabled
    public static String deleteModel(String id) {
        try {
            List<Model__c> model = [SELECT Id FROM Model__c WHERE Id = :id];
            if(model.size() > 0) {
                Model__c theModel = model[0];
                delete theModel;
                
                return 'MODEL-DELETED';
            }

            return 'MODEL-NOT-FOUND';
        } catch(Exception e) {
            String msg = 'Error occurred!';
            String systemMsg = e.getMessage();

            System.debug(systemMsg);

            if(systemMsg.contains('DELETE_FAILED, Your attempt to delete') && systemMsg.contains('could not be completed because it is associated with the following cars')) {
                msg = 'ERROR: The model is being used by a seller!';
            }

            return msg;
        }
    }
}