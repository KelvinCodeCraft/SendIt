CREATE TABLE PARCEL 
       (
		sender VARCHAR(200),
		senderLocation VARCHAR(200), 
		parcelWeight INT,
		price INT,
		parcelDescription VARCHAR(200),
		receiverLocation VARCHAR(200),
		receiverPhone VARCHAR(200),
		receiverEmail VARCHAR(200),
		deliveryDate VARCHAR(200),
		status VARCHAR(200) DEFAULT 'In Transit',
		isArrived VARCHAR(200) DEFAULT 'no',
		isDelivered VARCHAR(200) DEFAULT 'no',
		isDeleted BIT DEFAULT 0
		)