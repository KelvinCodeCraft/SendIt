import { Request, RequestHandler, Response } from "express";
import { v4 as uid } from "uuid";
import db from '../Databasehelper/db-connection';
import mssql from "mssql";
import { Data } from "../Interfaces/parcelInterfaces";
import { ParcelSchema, SenderSchema } from "../helpers/parcel.validate";
import { stat } from "fs";
// interface Extended extends Request {
//   info?: Data;
// }

interface ExtendedRequest extends Request {
  body: {
    senderName: string;
    receiverName: string;
    senderEmail: string;
    receiverEmail: string;
    dispatchedDate: string;
    deliveryDate: string;
    parcelWeight: string;
    price: string;
    receiverLat: string;
    receiverLng: string;
    senderLat: string;
    senderLng: string;
    deliveryStatus: string;
  };
}

export const addParcel = async (req: ExtendedRequest, res: Response): Promise<any> => {
  try {
    const {
      senderEmail,
      senderName,
      receiverName,
      receiverEmail,
      dispatchedDate,
      deliveryDate,
      parcelWeight,
      price,
      receiverLat,
      receiverLng,
      senderLat,
      senderLng,
      deliveryStatus
    } = req.body;

    // Validate request body
    const { error, value } = ParcelSchema.validate(req.body);
    if (error) {
      console.error("Validation Error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Ensure database connection is available
    if (!db || !db.exec) {
      console.error("Database connection error: db.exec is undefined");
      return res.status(500).json({ message: "Database connection error" });
    }

    // Execute stored procedure
    try {
      await db.exec("createParcel", {
        senderEmail,
        senderName,
        receiverName,
        receiverEmail,
        dispatchedDate,
        deliveryDate,
        parcelWeight,
        price,
        receiverLat,
        receiverLng,
        senderLat,
        senderLng,
        deliveryStatus
      });
      return res.status(200).json({ message: "Parcel created Successfully" });
    } catch (dbError) {
      console.error("Database Execution Error:", dbError);
      return res.status(500).json({ message: "Database execution error", error: dbError });
    }
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ message: "Unexpected server error", error });
  }
};



// export const getParcels: RequestHandler = async (req, res) => {
//   try {
//     const result = await db.exec("getAllParcels");
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(404).json({ error });
//   }
// };

export const getParcels: RequestHandler = async (
  req: ExtendedRequest, 
  res: Response): Promise<void> => {
  try {
    const { senderEmail, receiverEmail } = req.query;
    let result;

    // If either senderEmail or receiverEmail is provided, use the getParcelsByEmail stored procedure.
    if ((senderEmail && typeof senderEmail === "string") || (receiverEmail && typeof receiverEmail === "string")) {
      // Use senderEmail if available; otherwise, use receiverEmail.
      const email = senderEmail ? senderEmail : receiverEmail;
      // Remove any accidental quotes from the email string.
      const cleanEmail = typeof email === "string" ? email.replace(/['"]/g, "") : "";
      
      result = await db.exec("getParcelsByEmail", { email: cleanEmail });
    } else {
      // No email filter provided, so return all parcels.
      result = await db.exec("getAllParcels");
    }

    // Assuming your db.exec returns an object with a recordset property.
    if (!result || result.length === 0) {
      res.status(404).json({ message: "No parcels found" });
    }

    // Return the JSON results.
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// export const getParcels: RequestHandler = async (
//   req: ExtendedRequest, 
//   res: Response
// ):Promise<void>  => {
//   try {
//     const { senderEmail, receiverEmail } = req.query;

//     // Check if either senderEmail or receiverEmail is provided as a string
//     if ((senderEmail && typeof senderEmail === "string") || (receiverEmail && typeof receiverEmail === "string")) {
//       // Determine which email to use for filtering. If both are provided, senderEmail takes priority.
//       const filterEmail = senderEmail
//         ? typeof senderEmail === "string" ? senderEmail.replace(/['"]/g, "") : ""
//         : typeof receiverEmail === "string" ? receiverEmail.replace(/['"]/g, "") : "";

//       // Execute inline parameterized query to filter by email
//       const result = db.query(

//         SELECT 
//             id,
//             senderEmail,
//             senderName,
//             receiverName,
//             receiverEmail,
//             dispatchedDate,
//             deliveryDate,
//             parcelWeight,
//             price,
//             receiverLat,
//             receiverLng,
//             senderLat,
//             senderLng,
//             deliveryStatus
//          FROM dbo.PARCEL  WHERE senderEmail = @filterEmail OR receiverEmail = @filterEmail",
//         { filterEmail }
//       );
      
//       res.status(200).json(result);
//     } else {
//       // No email filter provided, so return all parcels using the stored procedure
//       const result = await db.exec("getAllParcels");
//       res.status(200).json(result);
//     }
//   } catch (error) {
//     res.status(404).json({ error });
//   }
// };




export const getParcel: RequestHandler<{ id: string }> = async (req: ExtendedRequest,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id;
    const result = await db.exec("getParcelById", { id });

    if (!result[0]) {
      return res.status(404).json({ message: "Parcel Not Found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getParcelByEmail: RequestHandler<{email: string}> = async (
  req: ExtendedRequest, 
  res: Response
):Promise<void> => {
  try {
    // Extract the email from query parameters
    const email = req.query.email as string;

    // Check if email is provided
    if (!email) {
      res.status(400).json({ message: "Email query parameter is required" });
    }

    // Execute the stored procedure 'getParcelsByEmail'
    const result = await db.exec("getParcelsByEmail", { email });

    // Check if the result returned any records
    if (!result[0]) {
      res.status(404).json({ message: "Parcel Not Found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(404).json({ error });
  }
};

export const deleteParcel: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  try {
    const id = req.params.id;
    
    // Retrieve the parcel by its id
    const result = await db.exec("getParcelById", { id });
    
    // Check if the parcel exists. Adjust according to your db.exec response structure.
    if (!result || result.length === 0) {
      res.status(404).json({ message: "Parcel Not Found" });
      return;
    }
    
    // If the parcel exists, delete it.
    await db.exec("deleteParcel", { id });
    res.status(200).json({ message: "Parcel Deleted" });
    
  } catch (error) {
    res.status(500).json({ error });
  }
};


// export const deleteParcel: RequestHandler<{ id: string }> = async (
//   req: ExtendedRequest,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const id = req.params.id;
//     const recordset = await db.exec("getParcelById", { id });
//     if (!recordset[0]) {
//       const result = await db.exec("getParcelById", { id });
//       if (!result[0]) {
//         res.status(404).json({ message: "Parcel Not Found" });
//       } else {
//         await db.exec("deleteParcel", { id });
//         res.status(200).json({ message: "Parcel Deleted" });
//       }
//     }
//   } catch (error) {
//     res.status(404).json({ error });
//   }
// };


export const updateParcel: RequestHandler<{ id: string }> = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const {
      senderEmail,
      senderName,
      receiverName,
      receiverEmail,
      dispatchedDate,
      deliveryDate,
      parcelWeight,
      price,
      receiverLat,
      receiverLng,
      senderLat,
      senderLng,
      deliveryStatus
    } = req.body as {
      senderName: string;
      receiverName: string;
      senderEmail: string;
      receiverEmail: string;
      dispatchedDate: string;
      deliveryDate: string;
      parcelWeight: string;
      price: string;
      receiverLat: string;
      receiverLng: string;
      senderLat: string;
      senderLng: string;
      deliveryStatus: string;
    };
    const { error, value } = ParcelSchema.validate(req.body);
    if (error) {
      res.json({ error: error.details[0].message });
    }
    const recordset = await db.exec("getParcelById", { id });
    if (!recordset[0]) {
      const result = await db.exec("getParcelById", { id });
      if (!result[0]) {
        res.status(404).json({ message: "Parcel Not Found" });
      } else {
        await db.exec("ProjectCreateOrUpdate", {
          id,
          senderEmail,
          senderName,
          receiverName,
          receiverEmail,
          dispatchedDate,
          deliveryDate,
          parcelWeight,
          price,
          receiverLat,
          receiverLng,
          senderLat,
          senderLng,
          deliveryStatus
        });
        res.status(200).json({ message: "Parcel Updated ..." });
      }
    }
  } catch (error) {
    res.status(404).json({ error });
  }
};

export const deliverParcel: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const id = req.params.id;
    const recordset = await db.exec("getParcel", { id });
    if (!recordset[0]) {
      const result = await db.exec("getParcel", { id });
      if (!result[0]) {
        res.status(404).json({ message: "Parcel Not Found!" });
      } else {
        await db.exec("parcelDelivered", { id });
        res.status(200).json({ message: "Parcel Delivered!" });
      }
    }
  } catch (error) {
    res.status(404).json({ error });
  }
}


export const sentParcels: RequestHandler<{ email: string }> = async (
  req,
  res
) => {
  try {
    const email = req.params.email;

    const recordset = await db.exec("getSent", { email });
    res.status(200).json(recordset);
    const result = await db.exec("getSent", { email });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};


export const receivedParcels: RequestHandler<{ email: string }> = async (
  req,
  res
) => {
  try {
    const email = req.params.email;

    const recordset = await db.exec("getReceived", { email });
    res.status(200).json(recordset);
    const result = await db.exec("getReceived", { email });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};


export const getOnTransitParcels: RequestHandler = async (req, res) => {
  try {
    const recordset = await db.exec("onTransit");
    res.status(200).json(recordset);
    const result = await db.exec("onTransit");
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};


export const getDeliveredParcels: RequestHandler = async (req, res) => {
  try {
    const recordset = await db.exec("parcelDelivered");
    res.status(200).json(recordset);
    const result = await db.exec("parcelDelivered");
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
}