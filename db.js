import mongoose from "mongoose";

export const dbConnector = () => {
  mongoose.connect(
    "mongodb+srv://usman:aaa123+++@cluster0.w9dqk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    () => {
      console.log("Data base conneced Successfully");
    }
  );
};
