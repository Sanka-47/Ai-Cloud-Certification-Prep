import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
    <section className="card-cta bg-gray-800 rounded-2xl shadow-lg shadow-cyan-500/20 p-8 transform transition-all hover:scale-105">
  <div className="flex flex-col gap-6 max-w-lg mx-auto text-center">
    <h2 className="text-3xl font-bold text-cyan-400">Get Interview-Ready with AI-Powered Practice & Feedback</h2>
    <p className="text-lg text-gray-400">
      Practice real interview questions & get instant feedback
    </p>
    <div className="flex justify-center">
      <Button asChild className="btn-primary max-sm:w-full bg-cyan-500 text-gray-900 font-semibold py-3 rounded-lg hover:bg-cyan-400 transition-all">
        <Link href="/interview">Start an Interview</Link>
      </Button>
    </div>
  </div>
</section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-bold text-cyan-400">Your Interviews</h2>

        <div className="interviews-section bg-gray-800 rounded-2xl shadow-lg shadow-cyan-500/20 p-6">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview?.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-400">You haven't taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-bold text-cyan-400">Take Interviews</h2>

        <div className="interviews-section bg-gray-800 rounded-2xl shadow-lg shadow-cyan-500/20 p-6">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview?.role}
                type={interview.type}
                techstack={interview?.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-400">There are no interviews available</p>
          )}
        </div>
      </section>
    </>
);
}

export default Home;
