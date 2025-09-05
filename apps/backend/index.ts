import express from "express";
import cors from "cors";
import prismaClient from "db/client"
import { authMiddleware } from "./middleware";
import {signUpSchema} from "common/inputs";
import jwt from "jsonwebtoken"

const app = express();
app.use(cors());
app.use(express.json());

app.post("/signin", async (req, res) => {
    const {success, data} = signUpSchema.safeParse(req.body);

    if(!success){
        res.status(403).json({
            message: "Incorrect credentials"
        })
        return;
    }

    const email = data?.email;
    const password = data?.password;

    const user = await prismaClient.user.findFirst({
        where: {
            email
        }
    });

    if(!user){
        res.status(403).json({
            message: "User not found"
        })
        return;
    }

    // TODO: Add password hashing
    if (user.password !== password){
        res.status(403).json({
            message: "Incorrect credentials"
        })
        return;
    }

    const token = jwt.sign({
        userId: user.id,
    }, process.env.JWT_SECRET!);

    res.json({
        token
    })
})

app.get("/calendar/:courseId", authMiddleware, async (req, res) => {
    const courseId = req.params.courseId;

    const course = await prismaClient.course.findFirst({
        where: {
            id: courseId
        }
    })

    const purchase = await prismaClient.purchase.findFirst({
        where: {
            userId: req.userId as string,
            courseId: courseId
        }
    })

    if(!purchase){
        res.status(411).json({
            message: "You don't have access to the course"
        })
        return;
    }

    if(!course) {
        res.status(411).json({
            message: "Course with id not found"
        })
        return;
    }

    res.json({
        id: courseId,
        calendarId: course.calendarNotionId
    })
})

app.listen(process.env.PORT || 3000);

export default app;