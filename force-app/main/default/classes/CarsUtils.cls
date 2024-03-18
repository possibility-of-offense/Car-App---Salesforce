public with sharing class CarsUtils {
    @AuraEnabled
    public static List<Car__c> getAllCars(Boolean onSale, String sellerId) {
        // If not on sale
        try {
            if(!onSale) {
                // 1 - If sellerId is not empty
                // 2 - If it is empty and it is on sale
                if(sellerId == '') {
                    return [SELECT Name FROM Car__c WITH SECURITY_ENFORCED ORDER BY CreatedDate];
                } else {
                    return [SELECT Id, Name, Model_price__c, Color__c, Number_of_doors__c, Picture__c, Model__c, Car_Availability__c FROM Car__c WHERE Seller_custom__c = :sellerId WITH SECURITY_ENFORCED ORDER BY CreatedDate];
                }
            } else {
                // 1 - If sellerId is not empty
                // 2 - If it is empty and it is on sale
                if(sellerId != '') {
                    return [SELECT Id, Name, Model_price__c, Color__c, Number_of_doors__c, Picture__c, Model__c, Car_Availability__c FROM Car__c WHERE Seller_custom__c = :sellerId WITH SECURITY_ENFORCED ORDER BY CreatedDate];
                } else {
                    // If on sale
                    return [SELECT Id, Name, Color__c, Number_of_doors__c, Sale_price__c, Seller_custom__r.Name FROM Car__c WHERE Sale_price__c != null WITH SECURITY_ENFORCED ORDER BY CreatedDate];
                }
            }
        } catch(Exception e) {
            System.debug(e.getMessage());
            return null;
        } 
    }

    // Add sale price to car
    @AuraEnabled
    public static void addSalePrice(String carId, Integer price) {
        try {
            List<Car__c> car = [SELECT Sale_price__c FROM Car__c WHERE Id = :carId WITH SECURITY_ENFORCED];
            if(car.size() > 0) {
                Car__c theCar = car[0];
                theCar.Sale_price__c = price;
                update theCar;
            }
            
        } catch(Exception e) {
            System.debug(e.getMessage() + ' addSalePrice');
        }
    }

    // Remove sale price on cars
    @AuraEnabled
    public static List<String> removeSaleForCars(List<String> ids) {
        try {
            List<String> filteredCars = new List<String>();
            List<Car__c> cars = [SELECT Id, Sale_price__c FROM Car__c WHERE Id IN :ids WITH SECURITY_ENFORCED];
            for(Car__c car : cars) {
                car.Sale_price__c = null;
                filteredCars.add(car.Id);
            }
            update cars;

            return filteredCars;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    // Delete all cars
    @AuraEnabled
    public static Boolean deleteAllCars(String sellerId) {
        try {
            List<Car__c> cars = [SELECT Id, Picture__c FROM Car__c WHERE Seller_custom__c =:sellerId];
            Set<Id> carIds = new Set<Id>();

            for(Car__c car : cars) {
                if(car.Picture__c != null) {
                    carIds.add(car.Id);
                }
            }

            List<ContentDocumentLink> docs = new List<ContentDocumentLink>();
            if(carIds.size() > 0) {
                docs = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId IN :carIds];
                
                List<String> docsIds = new List<String>();
                for(ContentDocumentLink doc : docs) {
                    docsIds.add(doc.ContentDocumentId);
                }
    
                if(docsIds.size() > 0) {
                    delete [SELECT Id FROM ContentDocument WHERE Id IN :docsIds];
                }
            }

            delete cars;

            return true;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return false;
        }
    }

    // Refetech cars
    @AuraEnabled
    public static List<Car__c> refetchCarsBySeller(String sellerId){
        try {
            return CarsUtils.getAllCars(false, sellerId);
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    // Filter cars by seller Id and price
    @AuraEnabled
    public static List<Car__c> getFilteredCars(String sellerId, Integer price) {
        try {
            return [SELECT Id, Name, Model_price__c, Color__c, Number_of_doors__c, Picture__c, Car_Availability__c FROM Car__c WHERE (Seller_custom__c = :sellerId AND Model_price__c >= :price) ORDER BY CreatedDate];
        } catch(Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    // Get car by its id
    @AuraEnabled
    public static List<Car__c> getCarById(String id) {
        try {
            return [SELECT Id, Name, Sale_price__c FROM Car__c WHERE Id =:id];
        } catch(Exception e) {
            return null;
        }
    }

    // Delete car
    @AuraEnabled
    public static Boolean deleteCarById(String id) {
        // If for some reason more than 1 car was found
        List<Car__c> car = [SELECT Id FROM Car__c WHERE Id =:id];

        try {
            delete car;
            return true;
        } catch(Exception e) {
            System.debug(e.getMessage());
            return false;
        }
    }

    // Buy car
    @AuraEnabled
    public static Boolean buyCar(String sellerId, String carId) {
        try {
            List<Car__c> car = [SELECT Name, Car_Availability__c, Model_price__c, Sale_price__c FROM Car__c WHERE Id = :carId];
            if(car.size() > 0) {
                Car__c theCar = car[0];

                if(theCar.Car_Availability__c > 0) {
                    theCar.Car_Availability__c -= 1;
                    update theCar;

                    Decimal price;

                    if(theCar.Sale_price__c != null) {
                        price = theCar.Sale_price__c;
                    } else {
                        price = theCar.Model_price__c;
                    }

                    Sold_Car__c soldCar = new Sold_Car__c(
                        Name=theCar.Name,
                        Sold_Car_Price__c=price,
                        Seller__c=sellerId
                    );
                    
                    insert soldCar;

                    return true;
                }
            }

            return false;
        } catch(Exception e) {
            return false;
        }
    }
}