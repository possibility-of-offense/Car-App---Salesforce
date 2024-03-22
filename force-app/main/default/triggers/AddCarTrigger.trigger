trigger AddCarTrigger on Car__c (before insert, before delete) {
    CarInsertionMnpl manipulator = new CarInsertionMnpl();

    if(Trigger.isInsert) {
        List<Car__c> cars = Trigger.new;
        List<ID> sellerIds = manipulator.gatherSellerIds(cars);
    
        manipulator.fetchSellers('SELECT Number_of_cars__c FROM Seller__c WHERE Id IN :sellerIds');
        manipulator.manipulate('incrementCars');
        
    } else if(Trigger.isDelete) {
        List<Car__c> cars = Trigger.old;
        List<ID> sellerIds = manipulator.gatherSellerIds(cars);

        manipulator.fetchSellers('SELECT Number_of_cars__c FROM Seller__c WHERE Id IN :sellerIds');
        manipulator.manipulate('decrementCars');
    }
}