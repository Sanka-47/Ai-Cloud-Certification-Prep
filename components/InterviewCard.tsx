import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 bg-gray-800 rounded-2xl shadow-lg shadow-cyan-500/20 p-6 transform transition-all hover:scale-105">
      <div className="flex flex-col gap-6 items-center text-center relative">
        {/* Type Badge */}
        <div
          className={cn(
            "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg text-sm font-semibold text-gray-900",
            badgeColor
          )}
        >
          <p>{normalizedType}</p>
        </div>

        {/* Cover Image */}
        <Image
          src={getRandomInterviewCover()}
          alt="cover-image"
          width={80}
          height={80}
          className="rounded-full object-cover size-[80px] mt-4"
        />

        {/* Interview Role */}
        <h3 className="text-xl font-bold text-cyan-400 capitalize">{role} Interview</h3>

        {/* Date & Score */}
        <div className="flex flex-row gap-6 text-gray-400">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src="/calendar.svg"
              width={18}
              height={18}
              alt="calendar"
            />
            <p className="text-sm">{formattedDate}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={18} height={18} alt="star" />
            <p className="text-sm">{feedback?.totalScore || "---"}/100</p>
          </div>
        </div>

        {/* Feedback or Placeholder Text */}
        <p className="text-gray-400 text-sm line-clamp-2 max-w-xs">
          {feedback?.finalAssessment ||
            "You haven't taken this interview yet. Take it now to improve your skills."}
        </p>

        {/* Tech Stack and Button */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-center">
            <DisplayTechIcons techStack={techstack} />
          </div>
          <div className="flex justify-center">
            <Button
              className="btn-primary bg-cyan-500 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-all"
            >
              <Link
                href={
                  feedback
                    ? `/interview/${interviewId}/feedback`
                    : `/interview/${interviewId}`
                }
              >
                {feedback ? "Check Feedback" : "View Interview"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
