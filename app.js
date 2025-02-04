import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());


const authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET_ID,
    "http://localhost:5000/oauth2callback"
);


const SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses",
    "https://www.googleapis.com/auth/classroom.rosters",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/classroom.profile.emails",
    'https://www.googleapis.com/auth/userinfo.profile' 
];

let accessToken = null;

app.get('/auth', (req, res) => {
    const authUrl = authClient.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(authUrl);
});


app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await authClient.getToken(code);
        accessToken = tokens.access_token;
        authClient.setCredentials(tokens);
        console.log("Access Token:", accessToken);
        res.redirect('/courses');
    } catch (error) {
        console.error("Error during OAuth2 callback:", error);
        res.status(500).send("Authentication failed.");
    }
});


app.get('/courses', async (req, res) => {
    try {
        authClient.setCredentials({ access_token: accessToken });
        const classroom = google.classroom({ version: 'v1', auth: authClient });
        const response = await classroom.courses.list();
        res.status(200).json(response.data.courses || []);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses", error });
    }
});

app.post('/courses', async (req, res) => {
    try {
        authClient.setCredentials({ access_token: accessToken });
        const classroom = google.classroom({ version: 'v1', auth: authClient });
        
        const { name, section, descriptionHeading, description, room } = req.body;

       
        const userInfo = await google.oauth2('v2').userinfo.get({ auth: authClient });
        const ownerId = userInfo.data.id; 

        const course = {
            name: name,
            section: section,
            descriptionHeading: descriptionHeading,
            description: description,
            room: room ,
            ownerId: ownerId,
           courseState: "PROVISIONED"
        };

        const response = await classroom.courses.create({ requestBody: course });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating course:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to create course", error: error.response?.data || error.message });
    }
});


app.delete('/courses/:id', async (req, res) => {
    try {
        authClient.setCredentials({ access_token: accessToken });
        const classroom = google.classroom({ version: 'v1', auth: authClient });

        const courseId = req.params.id;

        // Get course details to verify its state
        const course = await classroom.courses.get({ courseId });

        if (course.data.courseState !== 'PROVISIONED') {
            return res.status(400).json({ message: 'Only PROVISIONED courses can be deleted.' });
        }

        // Delete the course
        await classroom.courses.delete({ id: courseId });  

        res.status(200).json({ message: `Course with ID ${courseId} deleted successfully.` });

    } catch (error) {
        console.error("Error deleting course:", error.response?.data || error.message);
        res.status(500).json({
            message: "Failed to delete course",
            error: error.response?.data || error.message
        });
    }
});






// 🖥️ Start the server
app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});
