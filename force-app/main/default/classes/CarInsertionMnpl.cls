public class CarInsertionMnpl {
    private List<Seller__c> sellers;

    public void manipulate(String type) {
        switch on type {
            when 'incrementCars' {
                SellerUpdageMnpl.incrementNumberOfCars(this.sellers);
            }
            when 'decrementCars' {
                SellerUpdageMnpl.decrementNumberOfCars(this.sellers);
            }
            when else {
                
            }
        }
    }

    public void fetchSellers(String sqlStatement) {
        this.sellers = Database.query(sqlStatement);
    }

    public List<ID> gatherSellerIds(List<Car__c> cars) {
        List<ID> sellerIds = new List<ID>();

        for(Car__c car : cars) {
            sellerIds.add(
                car.Seller_custom__c
            );
        }

        return sellerIds;
    }

}