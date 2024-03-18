public with sharing class FileUtils {
    @AuraEnabled
    public static String createFile(
        String base64,
        String filename,
        String recordId
    ) {
        try {
            ContentVersion content = new ContentVersion();
            content.VersionData = EncodingUtil.base64Decode(base64);
            content.Title = filename;
            content.PathOnClient = filename;
            insert content;

            content = [
                SELECT ContentDocumentId
                FROM ContentVersion
                WHERE Id = :content.Id
            ];

            ContentDocumentLink contentLink = new ContentDocumentLink();
            contentLink.ContentDocumentId = content.ContentDocumentId;
            contentLink.LinkedEntityId = recordId;
            contentLink.ShareType = 'V';
            insert contentLink;

            Car__c car = [SELECT Picture__c FROM Car__c WHERE Id =:recordId];
            car.Picture__c = '/sfc/servlet.shepherd/version/download/' + content.Id;
            update car;

            return content.Id;

        } catch(Exception e) {
            return e.getMessage();
        }
    }
}