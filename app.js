// import express from 'express';
// import { google } from 'googleapis';
// import dotenv from 'dotenv';

// dotenv.config();
// const app = express();
// app.use(express.json()); // To parse JSON request bodies

// // Initialize Google OAuth2 client
// const authClient = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_SECRET_ID,
//     "http://localhost:5000/oauth2callback"
// );

// const SCOPES = [        
//     "https://www.googleapis.com/auth/classroom.courses"  ,   
// ];

// let accessToken = null;


// app.get('/auth', (req, res) => {
//     const authUrl = authClient.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES,
//     });
//     res.redirect(authUrl);
// });


// app.get('/oauth2callback', async (req, res) => {
//     const { code } = req.query;
//     try {
//         const { tokens } = await authClient.getToken(code);
//         accessToken = tokens.access_token;
//         authClient.setCredentials(tokens); // Ensure tokens include access_token and refresh_token
//         console.log("Access Token:", accessToken);
//         res.redirect('/courses'); 
//     } catch (error) {
//         console.error("Error during OAuth2 callback:", error);
//         res.status(500).send("Authentication failed.");
//     }
// });



// app.get('/courses', async (req, res) => {
//     try {
      
//         authClient.setCredentials({ access_token: accessToken });


//         const classroom = google.classroom({ version: 'v1', auth: authClient });

//         const response = await classroom.courses.list();

       
//         res.status(200).json(response.data.courses || []);
//     } catch (error) {
//         console.error("Error fetching courses:", error);
//         res.status(500).json({ message: "Failed to fetch courses", error });
//     }
// });


// app.post('/courses', async (req, res) => {

//     try {
//         // Ensure the auth client is authenticated
//         authClient.setCredentials({ access_token: accessToken });

//         // Initialize the Classroom API client
//         const classroom = google.classroom({ version: 'v1', auth: authClient });

//         // Get course data from the request body
//         const { name, section, descriptionHeading, description, room, courseState } = req.body;

//         // Define the course object
//         const course = {
//             name: name || "Untitled Course",
//             section: section || "Default Section",
//             descriptionHeading: descriptionHeading || "Course Overview",
//             description: description || "This course was created via API.",
//             room: room || "Room 101",
//             ownerId: "me",  // Sets the authenticated user as the course owner
//             courseState: courseState || "PROVISIONED", // Change state to PROVISIONED
//         };
        

//         // Call the API to create the course
//         const response = await classroom.courses.create({ requestBody: course });

//         // Respond with the created course data
//         res.status(201).json(response.data);
//     } catch (error) {
//         console.error("Error creating course:", error);
//         res.status(500).json({ message: "Failed to create course", error });
//     }
// });

// // Start the server
// app.listen(5000, () => {
//     console.log("Server running at http://localhost:5000");
// });
