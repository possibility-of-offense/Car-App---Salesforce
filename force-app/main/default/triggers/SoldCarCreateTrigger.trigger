trigger SoldCarCreateTrigger on Sold_Car__c (before insert) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            System.debug('TRIGGER');
            System.debug(Trigger.new);
            Id id;

            for(Sold_Car__c car : Trigger.new) {
                id = car.Seller__c;
                break;
            }

            System.debug('VENTSI ID ');
            System.debug(id);

            List<Seller__c> seller = [SELECT Id, Sold_Cars__c FROM Seller__c WHERE Id = :id];
            if(seller.size() > 0) {
                Seller__c theSeller = seller[0];
                if(theSeller.Sold_Cars__c != null) {
                    theSeller.Sold_Cars__c = theSeller.Sold_Cars__c + 1;
                } else {
                    theSeller.Sold_Cars__c = 1;
                }
            }

            update seller;
        }
    }
}