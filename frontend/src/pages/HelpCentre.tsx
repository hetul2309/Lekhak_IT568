import { useState } from "react";
import { ChevronDown, Mail, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I create a blog?",
    a: "Click 'Write Blog' in the top-right corner, compose your content, choose a category, and hit Publish. Drafts are auto-saved if you're logged in.",
  },
  {
    q: "How can I edit or delete a blog?",
    a: "Go to 'My Blogs' from the sidebar, open the blog, and choose Edit or Delete.",
  },
  {
    q: "How do I change my profile details?",
    a: "Click your profile avatar → Profile → Edit Profile.",
  },
  {
    q: "How can I report inappropriate content?",
    a: "Use the Report icon on any blog post or email us at shabd.setu.blogsite@gmail.com.",
  },
  {
    q: "What file formats can I use for blog images?",
    a: "We support JPG, PNG, GIF, and WebP formats. Maximum file size is 5MB per image.",
  },
  {
    q: "How do I search for blogs?",
    a: "Use the search bar at the top of the homepage. You can search by keywords, author names, or blog titles.",
  },
  {
    q: "Can I schedule my blog for later publication?",
    a: "Yes, when writing a blog, click on 'Schedule' and choose your desired publication date and time.",
  },
  {
    q: "How do I follow other bloggers?",
    a: "Visit any blogger's profile and click the 'Follow' button. You'll see their posts in your feed.",
  },
  {
    q: "What should I do if I forget my password?",
    a: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to your inbox.",
  },
  {
    q: "Can I export my blogs?",
    a: "Yes, go to 'My Blogs' → select a blog → click the three dots menu → 'Export' to download as PDF or Word document.",
  },
  {
    q: "How do I add tags to my blog posts?",
    a: "While writing or editing a blog, scroll to the 'Tags' section and add relevant keywords separated by commas to improve discoverability.",
  },
  {
    q: "Can I make my blog private?",
    a: "Yes, in the blog settings, toggle 'Private' to make it visible only to you. You can change this anytime.",
  },
  {
    q: "How do I comment on other blogs?",
    a: "Scroll to the comments section at the bottom of any blog post and type your comment. You must be logged in to comment.",
  },
  {
    q: "What is the character limit for blog titles?",
    a: "Blog titles can be up to 200 characters long. Keep titles concise and descriptive for better readability.",
  },
  {
    q: "How can I see my blog statistics?",
    a: "Go to 'My Blogs' and click on any blog to view detailed analytics including views, likes, and comments.",
  },
];

const HelpCentre = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 space-y-6 max-w-6xl w-full mx-auto">
            <section className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Help Centre</h1>
              <p className="text-sm text-muted-foreground">
                Support details and quick answers, styled to match the app theme.
              </p>
            </section>

            <section className="rounded-[2rem] bg-gradient-primary text-primary-foreground shadow-glow overflow-hidden">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] p-6 md:p-8 lg:p-10">
                <div className="space-y-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-primary-foreground/80">
                    <Sparkles className="h-4 w-4" />
                    Help center
                  </p>
                  <div className="space-y-3 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                      How can we help you today?
                    </h2>
                    <p className="text-sm md:text-base text-primary-foreground/85 leading-relaxed">
                      Explore quick guides, browse frequently asked questions, or use the support button when backend handling is ready.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                      <BookOpen className="h-4 w-4" />
                      100+ articles
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                      <ShieldCheck className="h-4 w-4" />
                      24/7 moderation
                    </div>
                  </div>
                </div>

                <div>
                  <Card className="h-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-card backdrop-blur-md">
                    <div className="p-6 md:p-7 space-y-5">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-primary-foreground/70">
                          Need priority help?
                        </p>
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-lg md:text-xl font-semibold break-all">
                              shabd.setu.blogsite@gmail.com
                            </p>
                            <p className="mt-2 text-sm text-primary-foreground/75">
                              Average response time: under 4 hours.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full px-5"
                        onClick={() => undefined}
                      >
                        Contact support
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
                      FAQs
                    </p>
                    <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                    <p className="text-sm text-muted-foreground">
                      We collected the answers to the requests we encounter most.
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
      </div>
    </SidebarProvider>
  );
};

export default HelpCentre;