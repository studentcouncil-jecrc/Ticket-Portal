import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: `Team Renaissance <${process.env.VERIFIED_FROM_EMAIL}>`,
  to: "prashant81046@gmail.com",
  subject: "Resend Test",
  html: "<p>Hello from Resend</p>",
});

console.log("DATA:", data);
console.log("ERROR:", error);