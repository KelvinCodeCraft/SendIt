CREATE PROCEDURE createParcel (
    @sender VARCHAR(200),
    @senderLocation VARCHAR(200), 
    @parcelWeight INT,
    @price INT,
    @parcelDescription VARCHAR(200),
    @receiverLocation VARCHAR(200),
    @receiverPhone INT,
    @receiverEmail VARCHAR(200),
    @deliveryDate VARCHAR(200)
)
AS
BEGIN
    INSERT INTO dbo.PARCELS (
        sender,
        senderLocation, 
        parcelWeight,
        price,
        parcelDescription,
        receiverLocation,
        receiverPhone,
        receiverEmail,
        deliveryDate
    )
    VALUES (
        @sender,
        @senderLocation, 
        @parcelWeight,
        @price,
        @parcelDescription,
        @receiverLocation,
        @receiverPhone,
        @receiverEmail,
        @deliveryDate
    )
END