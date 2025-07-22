
// /**
//  * This file is the webhook handler for Clerk.
//  * It verifies the signature of the webhook and handles the `user.created` event.
//  */

// import { Webhook } from '@clerk/remix/api.server';
// import type { ActionFunction } from "@remix-run/node";

// export const action: ActionFunction = async ({ request }) => {
//   const headers = request.headers;
//   const svix_id = headers.get("svix-id");
//   const svix_timestamp = headers.get("svix-timestamp");
//   const svix_signature = headers.get("svix-signature");

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response("Error occured -- no svix headers", {
//       status: 400,
//     });
//   }

//   const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

//   let evt: Record<string, any>;

//   try {
//     evt = wh.verify(await request.text(), {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as Record<string, any>;
//   } catch (err) {
//     console.error("Error verifying webhook:", err);
//     return new Response("Error occured", {
//       status: 400,
//     });
//   }

//   switch (evt.type) {
//     case "user.created":
//       // TODO: Save the user to the database
//       console.log(evt.data);
//       break;
//   }

//   return new Response(null, { status: 200 });
// };
