import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";


export async function POST(request: Request) {
  const {  level, provider, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare practice questions for a cloud certification quiz.
        The cloud provider is ${provider}.
        The certification level is ${level}.
        The tech stack used in the quiz is: cloud computing concepts and services specific to ${provider}.
        The focus should be on technical questions related to the certification.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use forward slash or asterisk or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you!
      `,
    });

    

    const interview = {
      provider: provider, // e.g., AWS, Azure, GCP
      level: level, // e.g., associate, professional
      techstack: ["cloud computing", provider.toLowerCase()], // Specific to cloud provider
      questions: JSON.parse(questions), // Questions generated by Gemini
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(), // Adapted to quiz context
      createdAt: new Date().toISOString(),
    };

   
    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
