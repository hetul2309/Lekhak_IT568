import React, { useState } from "react";
import { ChevronDown, Mail, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BackButton from "@/components/BackButton";

const SUPPORT_EMAIL = import.meta.env.VITE_EMAIL_USER || "bloglekhak2629@gmail.com";

const FAQS = [
  {
    q: "What are the steps to publish a new blog?",
    a: "Simply select 'Write Blog' from the main navigation, draft your piece, assign a topic, and click Publish. Your progress is automatically saved as a draft while you are signed in.",
  },
  {
    q: "Is it possible to modify or remove an existing post?",
    a: "Yes. Navigate to 'My Blogs' in the side menu, select the specific post, and use the provided Edit or Delete options.",
  },
  {
    q: "Where can I update my account information?",
    a: "Tap on your display picture, navigate to your Profile, and access the 'Manage Account Details' section.",
  },
  {
    q: "What is the process for flagging offensive material?",
    a: `You can click the Report button available on every article, or reach out to us directly via ${SUPPORT_EMAIL}.`,
  },
  {
    q: "Which image types are supported for uploads?",
    a: "You can upload JPEG, JPG, and PNG files. Please ensure each image stays under the 5MB size limit.",
  },
  {
    q: "How do I find specific stories or authors?",
    a: "Utilize the search functionality on the dashboard to look up articles by their title, creator name, or relevant keywords.",
  },
  {
    q: "Is there a way to publish my drafts at a later date?",
    a: "Absolutely. Within the editor, you can select the scheduling option to set an exact time and date for your story to go live.",
  },
  {
    q: "How can I subscribe to a writer's updates?",
    a: "Navigate to the author's public profile and hit 'Follow'. Their future publications will then appear in your personal feed.",
  },
  {
    q: "How do I recover a lost password?",
    a: "Select the 'Forgot Password' link on the sign-in screen, provide your registered email address, and check your inbox for recovery steps.",
  },
  {
    q: "Am I able to download my written content?",
    a: "Yes, you can. Head over to 'My Blogs', open the context menu for any post, and choose the 'Export' option to save it offline.",
  },
  {
    q: "How do categories and tags work?",
    a: "During the drafting process, you can assign categories and keywords to your piece to help readers discover your work more easily.",
  },
  {
    q: "Can I hide certain articles from the public?",
    a: "Yes. You can toggle the visibility settings to keep a post private or save it as a draft, ensuring only you have access to it.",
  },
  {
    q: "How do I leave feedback on a story?",
    a: "Open the comment thread at the bottom of an article to share your thoughts. Note that you need an active account to participate in discussions.",
  },
  {
    q: "Is there a length restriction for headings?",
    a: "Titles are typically capped at around 200 characters. We recommend keeping them clear and concise for the best reader experience.",
  },
  {
    q: "Where do I view my audience metrics?",
    a: "You can track your performance by visiting your Profile or the 'My Blogs' section, which displays view counts, appreciations, and follower growth.",
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <main className="px-3 md:px-6 lg:px-8 py-6 space-y-6 max-w-6xl w-full mx-auto">
        <BackButton className="mb-4" />

        <section className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-sm text-muted-foreground">
            Find guidance, resolve issues, and learn how to make the most of Lekhak.
          </p>
        </section>

        <section className="rounded-[2rem] bg-gradient-primary text-primary-foreground shadow-glow overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] p-6 md:p-8 lg:p-10">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-primary-foreground/80">
                <Sparkles className="h-4 w-4" />
                Support Hub
              </p>
              <div className="space-y-3 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  What do you need assistance with?
                </h2>
                <p className="text-sm md:text-base text-primary-foreground/85 leading-relaxed">
                  Discover helpful tutorials, read through our most common inquiries, or reach out directly to our team for further support.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                  <BookOpen className="h-4 w-4" />
                  Extensive Guides
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Always Here
                </div>
              </div>
            </div>

            <div>
              <Card className="h-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-card backdrop-blur-md">
                <div className="p-6 md:p-7 space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.35em] text-primary-foreground/70">
                      Require immediate assistance?
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl font-semibold break-all">
                          {SUPPORT_EMAIL}
                        </p>
                        <p className="mt-2 text-sm text-primary-foreground/75">
                          We typically reply within a few hours.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full px-5"
                    onClick={() =>
                      window.open(
                        `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=I need assistance with Lekhak`,
                        "_blank"
                      )
                    }
                  >
                    Contact Us
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <Card className="border-border/60 bg-card/95 shadow-card">
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Common Queries
                </p>
                <h2 className="text-2xl font-bold">Popular Questions</h2>
                <p className="text-sm text-muted-foreground">
                  Find quick solutions to the most common issues our writers face.
                </p>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={faq.q}
                      className="overflow-hidden rounded-2xl border border-border bg-background"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-smooth hover:bg-accent/40"
                      >
                        <span className="text-base font-semibold leading-snug">{faq.q}</span>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shrink-0">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isOpen && "rotate-180",
                            )}
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}