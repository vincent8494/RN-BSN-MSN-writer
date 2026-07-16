// Default site content used to seed the database on first run. After that the
// database is the source of truth and the admin panel edits it live. Keep the
// testimonials list in sync with the client fallback in src/data.js.

export const DEFAULT_SETTINGS = {
  heroTagline: "Nursing FlexPath Writers — Your Trusted Partner in Academic Excellence",
  heroTitle1: "Nursing & Healthcare",
  heroTitle2: "Assignment Help That Delivers Distinguished Grades",
  heroDescription:
    "Expert RN-to-BSN, BSN-to-MSN, MSN-to-DNP and Social Work help for WGU, Capella, Post University, SNHU, GCU & more. 100% human-written, no plagiarism, 100% privacy, 24-hour turnaround.",
  contactLocation: "Available 24/7 — Online Support Worldwide",
  recipientEmail: "rnbsnmsnwriter@gmail.com",
};

// One unified testimonials list drives both the home carousel and the /reviews
// page. `role` holds the program/school shown as the subtitle in both places.
export const TESTIMONIALS = [
  { id: "t1", name: "Chelsea K.", role: "RN-to-MSN — Capella University", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", feedback: "They guided me through the accelerated FlexPath program at Capella and helped me finish in record time. Every assessment came back distinguished. I call them my virtual tutors — you won't get it wrong placing an order here!", rating: 5 },
  { id: "t2", name: "Sarah M.", role: "RN-to-BSN — WGU", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", feedback: "As a working nurse and single mom, balancing the WGU D-courses was impossible until I found this team. Timely, original, and always on-rubric. They helped me keep a 4.0 through the whole RN-to-BSN track.", rating: 5 },
  { id: "t3", name: "James O.", role: "BSN-to-MSN — Post University", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", feedback: "I was about to give up on my Post University practicum courses. They came through with expertly written, plagiarism-free work delivered before every deadline. Highly recommended!", rating: 5 },
  { id: "t4", name: "Emily W.", role: "MSW — Grand Canyon University", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80", feedback: "The support on my GCU social-work field-instruction papers and capstone was exceptional. Original, well-researched, and delivered exactly to the rubric. Worth every dollar.", rating: 5 },
  { id: "t5", name: "Jeff C.", role: "Lincoln University", avatar: "", feedback: "I just had the pleasure of using this team for a nursing project, and the quality and scope of their work left me speechless. The entire procedure was simple and efficient from start to finish, and their support team responded to every question promptly — I felt valued as a client the whole way through.", rating: 5 },
  { id: "t6", name: "Odiyobo A.", role: "Newcastle University", avatar: "", feedback: "I have been sourcing all my assignments and coursework help here and would particularly recommend their nursing writing service to students at every level. You're guaranteed a high-quality paper within a considerable turnaround time, and their rates are affordable.", rating: 5 },
  { id: "t7", name: "Maya S.", role: "Athabasca University", avatar: "", feedback: "The statistical and thematic analysis task was beyond what I expected from the writer. Thank you so much — this made completing my nursing thesis paper so much easier.", rating: 5 },
  { id: "t8", name: "Ademi Adeboye", role: "Grand Canyon University", avatar: "", feedback: "The team helped run my FNP classes at both Grand Canyon University and Wilkes University. As a single mother balancing school, work and family, their highly experienced team of medical professionals chipped in to assist with full programs — I maintained a GPA of 4.0.", rating: 5 },
  { id: "t9", name: "Jesse Pierre", role: "SNHU · Maryville University", avatar: "", feedback: "Highly responsible, professional writers with a medical background. I worked with them across my course period taking two classes at a time and attained an A of 90. They even guided me on using Kaltura to record my PowerPoint presentation and script. Currently taking my MSN — they are yet to disappoint.", rating: 5 },
  { id: "t10", name: "Marie Min Hung", role: "GWU", avatar: "", feedback: "I want to applaud the team for their help with my nursing Ph.D. dissertation as well as my sister-in-law's DNP journey. Through brainstorming and research my topic was accepted, every chapter came back with minimal revisions, and I presented my Ph.D. on time — they walked me through the whole process up to the defense panel.", rating: 5 },
];

export const FAQ = [
  { id: "faq1", question: "Which schools and programs do you cover?", answer: "We help students at WGU, Capella, Post University, SNHU, Grand Canyon University (GCU), Walden, South University, Herzing, Purdue and Sophia Learning — across RN-to-BSN, BSN-to-MSN, RN-to-MSN, MSN-to-DNP, plus BHA, MHA, MBA, DBA, PMHNP, FNP and BSW/MSW social work.", order: 1 },
  { id: "faq2", question: "Is the work plagiarism-free and AI-free?", answer: "Yes. Every assignment is 100% human-created and written from scratch — we never use AI generators. Your work is original, Turnitin-ready, and we can provide a plagiarism report on request.", order: 2 },
  { id: "faq3", question: "How much does it cost?", answer: "Pricing depends on the school and program. As a guide: Post University BSN is $250 per class (or $12/page), Capella BSN/MSN is $300 per class, Capella DNP is $15/page, and Sophia Learning is $200 per class. Message us for an instant quote on any other school.", order: 3 },
  { id: "faq4", question: "Can you handle a full class or just single assignments?", answer: "Both. We take individual assessments, discussions and capstones, or manage your entire class from start to finish — including practicum (PE) hour courses and the full NURS-FPX / D-course sequences.", order: 4 },
  { id: "faq5", question: "Can you meet urgent deadlines?", answer: "Absolutely. We offer legit 24-hour turnaround for urgent orders while maintaining quality. For very tight deadlines, message us on WhatsApp and we'll confirm feasibility right away.", order: 5 },
  { id: "faq6", question: "How do I get started?", answer: "Message us on WhatsApp at +1 (309) 286-4134 or email rnbsnmsnwriter@gmail.com with your school, course and deadline. You can also fill out the order form on this site and we'll follow up with a quote.", order: 6 },
  { id: "faq7", question: "Is my information kept private?", answer: "100%. Your identity and account details are confidential and never shared with third parties. All communications are deleted after your order is complete.", order: 7 },
  { id: "faq8", question: "What if I need revisions?", answer: "We offer unlimited free revisions until you are satisfied. Just send your feedback and your writer will make the changes promptly, at no extra cost on eligible orders.", order: 8 },
];

export const SAMPLES = [
  { id: "s1", title: "Capella NURS-FPX 4005: Nursing Leadership Assessment", category: "Leadership & Management", description: "Interprofessional collaboration and leadership analysis prepared for a Capella FlexPath MSN assessment.", subject: "Nursing", pages: 8, level: "MSN", school: "Capella University" },
  { id: "s2", title: "WGU D219: Scholarship in Nursing Practice — EBP Paper", category: "Evidence-Based Practice", description: "Evidence-based practice paper appraising current literature and translating findings into nursing practice.", subject: "Nursing", pages: 10, level: "BSN", school: "WGU" },
  { id: "s3", title: "WGU D226: BSN Capstone — Fall-Prevention Project", category: "Capstone", description: "Full BSN capstone implementing an evidence-based fall-prevention program in an acute-care setting.", subject: "Nursing", pages: 22, level: "BSN", school: "WGU" },
  { id: "s4", title: "Post University 508PE: Clinical & Administrative Systems", category: "Informatics", description: "Practicum-based analysis of clinical and administrative information systems and quality outcomes.", subject: "Nursing", pages: 12, level: "MSN", school: "Post University" },
  { id: "s5", title: "Capella NURS-FPX 4055: Optimizing Population Health", category: "Population Health", description: "Community practice project optimizing population health outcomes through evidence-based interventions.", subject: "Nursing", pages: 9, level: "BSN", school: "Capella University" },
  { id: "s6", title: "GCU SWK-690: Social Work Capstone Project", category: "Social Work", description: "MSW capstone integrating advanced practice skills, research methods and field-instruction reflection.", subject: "Social Work", pages: 18, level: "MSW", school: "GCU" },
];

// Field whitelist per content kind — admin input is stored as JSON but only
// these keys are persisted, so the shape stays predictable.
export const CONTENT_FIELDS = {
  testimonials: ["name", "role", "avatar", "feedback", "rating"],
  faq: ["question", "answer", "order"],
  samples: ["title", "category", "description", "subject", "pages", "level", "school"],
};

export const CONTENT_SEED = { testimonials: TESTIMONIALS, faq: FAQ, samples: SAMPLES };

// ---------------------------------------------------------------------------
// Pricing — the single source of truth for what customers are charged. The
// server recomputes every order total from this config (client totals are
// never trusted), and the same config drives the order-form calculator and the
// Pricing page so displayed and charged prices always match. Admin-editable so
// rates can change seasonally.
// ---------------------------------------------------------------------------
export const PRICE_LEVELS = ["High School", "College", "BSN", "MSN", "DNP", "Social Work"];
export const DEADLINE_KEYS = ["days14", "days7", "days5", "days3", "days2", "days1", "hours8"];
export const SERVICE_KEYS = ["writing", "editing", "proofreading"];

export const DEFAULT_PRICING = {
  perPage: {
    "High School": { days14: 10, days7: 11, days5: 12, days3: 14, days2: 15, days1: 16, hours8: 18 },
    "College":     { days14: 11, days7: 12, days5: 13, days3: 15, days2: 16, days1: 18, hours8: 20 },
    "BSN":         { days14: 12, days7: 13, days5: 15, days3: 16, days2: 18, days1: 20, hours8: 22 },
    "MSN":         { days14: 14, days7: 15, days5: 17, days3: 18, days2: 20, days1: 22, hours8: 25 },
    "DNP":         { days14: 15, days7: 16, days5: 18, days3: 20, days2: 22, days1: 25, hours8: 28 },
    "Social Work": { days14: 12, days7: 13, days5: 15, days3: 16, days2: 18, days1: 20, hours8: 22 },
  },
  serviceMultipliers: { writing: 1.0, editing: 0.7, proofreading: 0.5 },
  pricePerSlide: 5,
  // Coupons are disabled (no code) — the coupon UI was removed site-wide.
  coupon: { code: "", percent: 0 },
  classRates: [
    { id: "post-bsn", school: "Post University", program: "RN-to-BSN", rate: "$250", unit: "per class", alt: "or $12 / page", features: ["All BSN courses", "Practicum (PE) hours covered", "Discussions & capstone", "24-hour turnaround"], popular: false },
    { id: "capella-bsnmsn", school: "Capella University", program: "BSN & MSN", rate: "$300", unit: "per class", alt: "FlexPath & GuidedPath", features: ["Full NURS-FPX support", "Assessments & capstones", "Distinguished grades", "Unlimited revisions"], popular: true },
    { id: "capella-dnp", school: "Capella University", program: "DNP", rate: "$15", unit: "per page", alt: "NHS-8002 → NURS-8024", features: ["Full DNP program", "Project & practicum help", "PhD-prepared writers", "Confidential & original"], popular: false },
    { id: "sophia", school: "Sophia Learning", program: "Transfer Courses", rate: "$200", unit: "per class", alt: "Fast completion", features: ["Gen-ed & science courses", "Quizzes & milestones", "Fast turnaround", "Ace-and-transfer ready"], popular: false },
  ],
  classNote:
    "Rates vary by school, program level and deadline. WGU, SNHU, GCU, Walden, Herzing, South & Penn Foster are quoted on request. Message us on WhatsApp for an instant, no-obligation quote.",
};

// Service display labels are content, not price inputs — kept static.
export const SERVICE_LABELS = { writing: "Writing from scratch", editing: "Editing & rewriting", proofreading: "Proofreading" };
