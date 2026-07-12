// ---------------------------------------------------------------------------
// Central content model. All copy was reorganized from the client's WhatsApp
// notes into clean, structured data. Everything here is editable from /admin.
// ---------------------------------------------------------------------------

export const BRAND = {
  name: "RN-BSN & MSN Writers",
  short: "RN-BSN Writers",
  tagline: "Your Trusted Partner in Academic Excellence",
};

// Public site origin used for canonical URLs, Open Graph and structured data.
// Set VITE_SITE_URL in .env when the real domain is known.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://rnbsnwriters.com").replace(/\/$/, "");

export const CONTACT = {
  whatsappLink: "https://wa.me/message/LK3H5OSOAGDTG1",
  whatsappNumberLink: "https://wa.me/13092864134",
  whatsappAltLink: "https://wa.me/nursingwriter",
  phoneDisplay: "+1 (309) 286-4134",
  email: "rnbsnmsnwriter@gmail.com",
  tiktok: "https://www.tiktok.com/@albert.george557",
  tiktokHandle: "@albert.george557",
  location: "Available 24/7 — Online Support Worldwide",
};

export function waMessage(text) {
  return `${CONTACT.whatsappNumberLink}?text=${encodeURIComponent(text)}`;
}

// Header navigation (kept short — secondary pages live in the footer quick links)
export const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Programs", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Samples", path: "/samples" },
];

// Footer "Explore" quick links (full site map)
export const FOOTER_LINKS = [
  { label: "Home", path: "/" },
  { label: "Programs", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Samples", path: "/samples" },
  { label: "Reviews", path: "/reviews" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
  { label: "Order Now", path: "/order-now" },
];

// Degree paths / specialties the service covers
export const PROGRAMS_SUPPORTED = [
  "RN-to-BSN",
  "BSN-to-MSN",
  "RN-to-MSN",
  "MSN-to-DNP",
  "BHA",
  "MHA",
  "MBA",
  "DBA",
  "PMHNP",
  "FNP",
  "AGACNP / AGPCNP",
  "BSW / MSW (Social Work)",
];

// Types of work delivered
export const SERVICES_OFFERED = [
  { name: "Essays, Reports & Papers", iconName: "FileText" },
  { name: "iHuman Case Studies", iconName: "Stethoscope" },
  { name: "Discussions & Peer Responses", iconName: "MessageSquare" },
  { name: "Capstone & DNP Projects", iconName: "GraduationCap" },
  { name: "Concept Maps & Care Plans", iconName: "HeartPulse" },
  { name: "Pathophysiology & Pharmacology", iconName: "Search" },
  { name: "SOAP Notes", iconName: "ClipboardList" },
  { name: "Literature Reviews", iconName: "BookMarked" },
  { name: "PowerPoints & Study Guides", iconName: "BookOpen" },
  { name: "Quizzes, Tests & Full Classes", iconName: "Backpack" },
  { name: "Research & Evidence-Based Practice", iconName: "Award" },
  { name: "APA Formatting & Citations", iconName: "FileEdit" },
];

// ---------------------------------------------------------------------------
// Universities & their programs (the "Services / Programs" catalog)
// ---------------------------------------------------------------------------
export const UNIVERSITIES = [
  {
    id: "wgu",
    name: "WGU — Western Governors University",
    short: "WGU RN-to-BSN & MSN",
    logo: "/images/logo-wgu.jpg",
    flyer: "/images/flyer-wgu.jpg",
    iconName: "GraduationCap",
    programs: ["RN-to-BSN", "BSN-to-MSN", "MSN-to-DNP"],
    description:
      "Full RN-to-BSN program help plus BSN-to-MSN and MSN-to-DNP support. We cover the complete D-course sequence including the BSN capstone.",
    priceNote: "Per-class & per-page options available",
    courses: [
      "D253 — Interprofessional Communication & Leadership in Healthcare",
      "D218 — Intraprofessional Leadership & Professional Growth",
      "D219 — Scholarship in Nursing Practice",
      "D221 — Organizational Systems & Healthcare Transformation",
      "D220 — Information Technology in Nursing Practice",
      "D222 — Comprehensive Health Assessment",
      "D223 — Healthcare Policy & Economics",
      "D224 — Global & Population Health",
      "D225 — Emerging Professional Practice",
      "D226 — BSN Capstone",
    ],
  },
  {
    id: "capella",
    name: "Capella University",
    short: "Capella BSN · MSN · DNP",
    logo: "/images/logo-capella.jpg",
    flyer: "/images/flyer-capella.jpg",
    iconName: "BookOpen",
    programs: ["RN-to-BSN", "RN-to-MSN", "BSN-to-MSN", "MSN", "DNP", "BHA", "MHA", "MBA", "PMHNP", "FNP", "DBA"],
    description:
      "FlexPath & GuidedPath assistance across BSN, MSN and DNP. From individual assessments to full-program support, including the complete NURS-FPX sequence.",
    priceNote: "BSN/MSN $300 per class · DNP $15 per page",
    courses: [
      "NHS-4000 — Developing a Health Care Perspective",
      "NURS-4005 — Nursing Leadership",
      "NURS-4015 — Pathophysiology, Pharmacology & Physical Assessment",
      "NURS-4025 — Research and Evidence-Based Decisions",
      "NURS-4035 — Enhancing Patient Safety and Quality Care",
      "NURS-4045 — Nursing Informatics: Managing Health Information & Technology",
      "NURS-4055 — Optimizing Population Health through Community Practice",
      "NURS-4065 — Patient-Centered Care Coordination",
      "NURS-4905 — Capstone Project for Nursing",
      "MSN Full Program — NHS-5004 through NURS-6085",
      "DNP Full Program — NHS-8002 through NURS-8024",
    ],
  },
  {
    id: "post",
    name: "Post University",
    short: "Post University RN-to-BSN & MSN",
    logo: "/images/logo-post.jpg",
    flyer: "/images/flyer-post.jpg",
    iconName: "Award",
    programs: ["RN-to-BSN", "BSN-to-MSN"],
    description:
      "RN-to-BSN and BSN-to-MSN support, including all practicum (PE) hour courses across both MSN terms and the American Sentinel SIM course sequence.",
    priceNote: "BSN $250 per class · $12 per page",
    courses: [
      "1st Term",
      "501PE — Role Development",
      "503 — Policy, Advocacy & Healthcare Ethics",
      "505 — Theoretical Foundations",
      "515 — Research Design",
      "514 — Integrated Advanced Pathopharmacology",
      "524PE — Advanced Health Assessment (30 PE hrs)",
      "2nd Term",
      "530PE — Leadership in Healthcare Organizations (80 PE hrs)",
      "525 — Human Resources Management",
      "508PE — Clinical & Administrative Systems (80 PE hrs)",
      "540 — Healthcare Finance and Economics",
      "545PE — Healthcare Strategic Management & Planning (80 PE hrs)",
      "555 — Capstone (130 PE hrs)",
    ],
  },
  {
    id: "gcu",
    name: "GCU — Grand Canyon University (Social Work)",
    short: "GCU BSW / MSW Social Work",
    logo: "/images/logo-gcu.jpg",
    flyer: "/images/flyer-gcu-msw.jpg",
    iconName: "HeartPulse",
    programs: ["BSW", "MSW"],
    description:
      "Expert help for GCU's Bachelor (BSW) and Master of Social Work (MSW): assessments, discussion posts, field instruction papers, and capstone projects.",
    priceNote: "Per-class support available",
    courses: [
      "Core Courses",
      "UNV-510 — Introduction to Graduate Studies in Social Work",
      "SWK-516 — Human Behavior in the Social Environment I",
      "SWK-520 — Social Welfare Policy and Services",
      "SWK-525 — Generalist Social Work Practice I",
      "SWK-530 — Diversity and Social Justice in Social Work",
      "SWK-535 — Field Instruction I",
      "SWK-541 — Human Behavior in the Social Environment II",
      "SWK-545 — Generalist Social Work Practice II (Groups, Communities & Organizations)",
      "SWK-550 — Field Instruction II",
      "SWK-555 — Methods of Research in Social Work I",
      "SWK-600 — Psychopathology and the Role of the Social Worker",
      "SWK-601 — Social Work Advocacy",
      "Advanced Courses",
      "SWK-610 — Advanced Social Work Practice Skills I (Individuals & Families)",
      "SWK-620 — Field Instruction III",
      "SWK-625 — Evidence-Based Practice in Social Work",
      "SWK-635 — Field Instruction IV",
      "SWK-640 — Advanced Social Work Practice Skills II (Groups)",
      "SWK-641 — Advanced Social Work Practice Skills III (Organizations & Communities)",
      "SWK-645 — Methods of Research in Social Work II",
      "SWK-690 — Social Work Capstone",
    ],
  },
  {
    id: "snhu",
    name: "SNHU — Southern New Hampshire University",
    short: "SNHU RN-to-BSN & MSN",
    logo: "/images/logo-snhu.jpg",
    flyer: "/images/flyer-snhu.jpg",
    iconName: "BookMarked",
    programs: ["RN-to-BSN", "BSN-to-MSN"],
    description:
      "Complete RN-to-BSN and MSN assignment help for SNHU — discussions, milestones, projects and final capstones handled with quality grades in mind.",
    priceNote: "Per-class & per-page options available",
    courses: [
      "NUR-varies — Nursing Leadership & Management",
      "Pathophysiology, Pharmacology & Physical Assessment",
      "Research & Evidence-Based Practice",
      "Population & Community Health",
      "Nursing Informatics",
      "Care Coordination",
      "RN-to-BSN & MSN Capstone Projects",
    ],
  },
  {
    id: "sophia",
    name: "Sophia Learning",
    short: "Sophia Transfer Courses",
    logo: "/images/logo-sophia.jpg",
    flyer: "/images/flyer-sophia.jpg",
    iconName: "MessageSquare",
    programs: ["Transfer Courses"],
    description:
      "Fast, affordable, quality-focused help to ace your Sophia transfer courses so you can move on to your degree with ease.",
    priceNote: "$200 per class",
    courses: [
      "Anatomy & Physiology I & II",
      "Microbiology",
      "Chemistry & Introduction to Chemistry Lab",
      "Introduction to Nutrition",
      "The Essentials of Managing Conflict",
      "Ancient Greek Philosophers",
      "Approaches to Studying Religions",
      "English Composition I & II",
      "Workplace Communication",
      "…and many more",
    ],
  },
];

// Additional supported schools (logo wall)
export const SCHOOLS = [
  { name: "WGU", logo: "/images/logo-wgu.jpg" },
  { name: "Capella University", logo: "/images/logo-capella.jpg" },
  { name: "Post University", logo: "/images/logo-post-full.jpg" },
  { name: "SNHU", logo: "/images/logo-snhu-shield.jpg" },
  { name: "Grand Canyon University", logo: "/images/logo-gcu.jpg" },
  { name: "Walden University", logo: "/images/logo-walden.jpg" },
  { name: "South University", logo: "/images/logo-south.jpg" },
  { name: "Herzing University", logo: "/images/logo-herzing.jpg" },
  { name: "Purdue University", logo: "/images/logo-purdue.jpg" },
  { name: "Sophia Learning", logo: "/images/logo-sophia.jpg" },
];

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
export const PRICING = [
  {
    id: "post-bsn",
    school: "Post University",
    program: "RN-to-BSN",
    rate: "$250",
    unit: "per class",
    alt: "or $12 / page",
    features: ["All BSN courses", "Practicum (PE) hours covered", "Discussions & capstone", "24-hour turnaround"],
    popular: false,
  },
  {
    id: "capella-bsnmsn",
    school: "Capella University",
    program: "BSN & MSN",
    rate: "$300",
    unit: "per class",
    alt: "FlexPath & GuidedPath",
    features: ["Full NURS-FPX support", "Assessments & capstones", "Distinguished grades", "Unlimited revisions"],
    popular: true,
  },
  {
    id: "capella-dnp",
    school: "Capella University",
    program: "DNP",
    rate: "$15",
    unit: "per page",
    alt: "NHS-8002 → NURS-8024",
    features: ["Full DNP program", "Project & practicum help", "PhD-prepared writers", "Confidential & original"],
    popular: false,
  },
  {
    id: "sophia",
    school: "Sophia Learning",
    program: "Transfer Courses",
    rate: "$200",
    unit: "per class",
    alt: "Fast completion",
    features: ["Gen-ed & science courses", "Quizzes & milestones", "Fast turnaround", "Ace-and-transfer ready"],
    popular: false,
  },
];

export const PRICING_NOTE =
  "Rates vary by school, program level and deadline. WGU, SNHU, GCU, Walden, Herzing, South & Penn Foster are quoted on request. Message us on WhatsApp for an instant, no-obligation quote.";

// ---------------------------------------------------------------------------
// Why choose us
// ---------------------------------------------------------------------------
export const WHY_CHOOSE = [
  {
    id: "w1",
    title: "Distinguished Grades Guaranteed",
    description:
      "Our experienced nursing and healthcare writers consistently deliver distinguished, quality grades across BSN, MSN and DNP programs.",
    iconName: "Award",
  },
  {
    id: "w2",
    title: "No Plagiarism · No AI",
    description:
      "Every submission is 100% human-created, written from scratch, and original. We never use AI generators — your work passes Turnitin with confidence.",
    iconName: "ShieldCheck",
  },
  {
    id: "w3",
    title: "100% Privacy",
    description:
      "Your identity and account details stay completely confidential. We never share your information and delete communications after completion.",
    iconName: "Lock",
  },
  {
    id: "w4",
    title: "24-Hour Legit Services",
    description:
      "Real, reliable support around the clock. Tight deadline? We handle urgent orders with a fast, dependable 24-hour turnaround.",
    iconName: "Clock",
  },
  {
    id: "w5",
    title: "Affordable Flat Rates",
    description:
      "Clear per-class and per-page pricing with no hidden fees. Quality academic help that fits a student budget, with bulk discounts available.",
    iconName: "Gem",
  },
  {
    id: "w6",
    title: "Unlimited Free Revisions",
    description:
      "We refine your work until it meets your exact requirements. Payment only after you are completely satisfied on eligible orders.",
    iconName: "RefreshCw",
  },
];

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------
export const STEPS = [
  {
    number: "01",
    iconName: "MessageSquare",
    title: "Message Us on WhatsApp",
    shortDesc: "Send your course & requirements",
    detail:
      "Reach out on WhatsApp or email with your school, program, course code and deadline. Share your assignment guidelines, rubric and any materials your writer will need. The more detail you provide, the better we match your expectations.",
    highlights: ["WGU, Capella, Post, SNHU, GCU & more", "Share rubric & instructions", "Full class or single assessment", "Instant, no-obligation quote"],
  },
  {
    number: "02",
    iconName: "CreditCard",
    title: "Get a Quote & Pay",
    shortDesc: "Transparent per-class / per-page rates",
    detail:
      "We confirm a clear flat rate for your class or per-page price for DNP work. Once you approve, make a secure payment to begin. No hidden fees — you always know the price up front, and payment-after-completion is available on eligible orders.",
    highlights: ["Per-class & per-page options", "No hidden fees", "Secure payment", "Pay-after-completion (eligible orders)"],
  },
  {
    number: "03",
    iconName: "Search",
    title: "We Complete Your Work",
    shortDesc: "Human-written, original, on time",
    detail:
      "A qualified nursing/healthcare writer completes your assignment from scratch — no AI, no plagiarism. Everything is aligned to your rubric, referenced in correct APA, and quality-checked before it reaches you.",
    highlights: ["100% human-created", "APA formatting", "Rubric-aligned", "Turnitin-ready originality"],
  },
  {
    number: "04",
    iconName: "Download",
    title: "Receive & Review",
    shortDesc: "Distinguished grades, free revisions",
    detail:
      "Get your completed work before the deadline, review it, and request unlimited free revisions if anything needs adjusting. Our goal is your distinguished grade and complete satisfaction.",
    highlights: ["Early delivery", "Unlimited free revisions", "Distinguished grades", "24/7 support"],
  },
];

// ---------------------------------------------------------------------------
// Sample work (titles reflect the programs the service covers)
// ---------------------------------------------------------------------------
export const CATEGORIES_SEED = [
  "Evidence-Based Practice",
  "Leadership & Management",
  "Population Health",
  "Capstone",
  "Informatics",
  "Social Work",
];

export const SAMPLES = [
  {
    id: "s1",
    title: "Capella NURS-FPX 4005: Nursing Leadership Assessment",
    category: "Leadership & Management",
    description: "Interprofessional collaboration and leadership analysis prepared for a Capella FlexPath MSN assessment.",
    subject: "Nursing",
    pages: 8,
    level: "MSN",
    school: "Capella University",
  },
  {
    id: "s2",
    title: "WGU D219: Scholarship in Nursing Practice — EBP Paper",
    category: "Evidence-Based Practice",
    description: "Evidence-based practice paper appraising current literature and translating findings into nursing practice.",
    subject: "Nursing",
    pages: 10,
    level: "BSN",
    school: "WGU",
  },
  {
    id: "s3",
    title: "WGU D226: BSN Capstone — Fall-Prevention Project",
    category: "Capstone",
    description: "Full BSN capstone implementing an evidence-based fall-prevention program in an acute-care setting.",
    subject: "Nursing",
    pages: 22,
    level: "BSN",
    school: "WGU",
  },
  {
    id: "s4",
    title: "Post University 508PE: Clinical & Administrative Systems",
    category: "Informatics",
    description: "Practicum-based analysis of clinical and administrative information systems and quality outcomes.",
    subject: "Nursing",
    pages: 12,
    level: "MSN",
    school: "Post University",
  },
  {
    id: "s5",
    title: "Capella NURS-FPX 4055: Optimizing Population Health",
    category: "Population Health",
    description: "Community practice project optimizing population health outcomes through evidence-based interventions.",
    subject: "Nursing",
    pages: 9,
    level: "BSN",
    school: "Capella University",
  },
  {
    id: "s6",
    title: "GCU SWK-690: Social Work Capstone Project",
    category: "Social Work",
    description: "MSW capstone integrating advanced practice skills, research methods and field-instruction reflection.",
    subject: "Social Work",
    pages: 18,
    level: "MSW",
    school: "GCU",
  },
];

// ---------------------------------------------------------------------------
// Site stats (animated counters on Home & Reviews)
// ---------------------------------------------------------------------------
export const STATS = [
  { value: 100, suffix: "%", label: "Human-written · no AI" },
  { value: 20, suffix: "%", label: "First-order discount (NEW20)" },
  { value: 10, suffix: "+", label: "Universities covered" },
  { value: 24, suffix: "/7", label: "Support availability" },
];

// ---------------------------------------------------------------------------
// Full reviews page content
// ---------------------------------------------------------------------------
export const REVIEWS = [
  {
    id: "r1",
    name: "Jeff C.",
    school: "Lincoln University",
    rating: 5,
    text: "I just had the pleasure of using this team for a nursing project, and the quality and scope of their work left me speechless. The entire procedure was simple and efficient from start to finish, and their support team responded to every question promptly — I felt valued as a client the whole way through.",
  },
  {
    id: "r2",
    name: "Odiyobo A.",
    school: "Newcastle University",
    rating: 5,
    text: "I have been sourcing all my assignments and coursework help here and would particularly recommend their nursing writing service to students at every level. You're guaranteed a high-quality paper within a considerable turnaround time, and their rates are affordable.",
  },
  {
    id: "r3",
    name: "Maya S.",
    school: "Athabasca University",
    rating: 5,
    text: "The statistical and thematic analysis task was beyond what I expected from the writer. Thank you so much — this made completing my nursing thesis paper so much easier.",
  },
  {
    id: "r4",
    name: "Chelsea King",
    school: "United States University",
    rating: 5,
    text: "This platform has a pool of talented academic experts. They guided me through the rigorous accelerated FPX program at Capella and the WGU accelerated program, helping me finish in record time. I call them my virtual tutors — they even check my announcements and notify me in time. You won't get it wrong placing an order here.",
  },
  {
    id: "r5",
    name: "Ademi Adeboye",
    school: "Grand Canyon University",
    rating: 5,
    text: "The team helped run my FNP classes at both Grand Canyon University and Wilkes University. As a single mother balancing school, work and family, their highly experienced team of medical professionals chipped in to assist with full programs — I maintained a GPA of 4.0.",
  },
  {
    id: "r6",
    name: "Jesse Pierre",
    school: "SNHU · Maryville University",
    rating: 5,
    text: "Highly responsible, professional writers with a medical background. I worked with them across my course period taking two classes at a time and attained an A of 90. They even guided me on using Kaltura to record my PowerPoint presentation and script. Currently taking my MSN — they are yet to disappoint.",
  },
  {
    id: "r7",
    name: "Marie Min Hung",
    school: "GWU",
    rating: 5,
    text: "I want to applaud the team for their help with my nursing Ph.D. dissertation as well as my sister-in-law's DNP journey. Through brainstorming and research my topic was accepted, every chapter came back with minimal revisions, and I presented my Ph.D. on time — they walked me through the whole process up to the defense panel.",
  },
  {
    id: "r8",
    name: "Sarah M.",
    school: "WGU",
    rating: 5,
    text: "As a working nurse and single mom, balancing the WGU D-courses was impossible until I found this team. Timely, original, and always on-rubric. They helped me keep a 4.0 through the whole RN-to-BSN track.",
  },
  {
    id: "r9",
    name: "James O.",
    school: "Post University",
    rating: 5,
    text: "I was about to give up on my Post University practicum courses. They came through with expertly written, plagiarism-free work delivered before every deadline. Highly recommended!",
  },
  {
    id: "r10",
    name: "Emily W.",
    school: "Grand Canyon University",
    rating: 5,
    text: "The support on my GCU social-work field-instruction papers and capstone was exceptional. Original, well-researched, and delivered exactly to the rubric. Worth every dollar.",
  },
];

// ---------------------------------------------------------------------------
// Order form extras (service types & add-ons for the price calculator)
// ---------------------------------------------------------------------------
export const SERVICE_TYPES = [
  { key: "writing", label: "Writing from scratch", multiplier: 1.0 },
  { key: "editing", label: "Editing & rewriting", multiplier: 0.7 },
  { key: "proofreading", label: "Proofreading", multiplier: 0.5 },
];

export const WORDS_PER_PAGE = 275;
export const PRICE_PER_SLIDE = 5;

// ---------------------------------------------------------------------------
// Testimonials (placeholder reviews — editable from /admin)
// ---------------------------------------------------------------------------
export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Chelsea K.",
    role: "RN-to-MSN — Capella University",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    feedback:
      "They guided me through the accelerated FlexPath program at Capella and helped me finish in record time. Every assessment came back distinguished. I call them my virtual tutors — you won't get it wrong placing an order here!",
    rating: 5,
  },
  {
    id: "t2",
    name: "Sarah M.",
    role: "RN-to-BSN — WGU",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    feedback:
      "As a working nurse and single mom, balancing the WGU D-courses was impossible until I found this team. Timely, original, and always on-rubric. They helped me keep a 4.0 through the whole RN-to-BSN track.",
    rating: 5,
  },
  {
    id: "t3",
    name: "James O.",
    role: "BSN-to-MSN — Post University",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    feedback:
      "I was about to give up on my Post University practicum courses. They came through with expertly written, plagiarism-free work delivered before every deadline. Highly recommended!",
    rating: 5,
  },
  {
    id: "t4",
    name: "Emily W.",
    role: "MSW — Grand Canyon University",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    feedback:
      "The support on my GCU social-work field-instruction papers and capstone was exceptional. Original, well-researched, and delivered exactly to the rubric. Worth every dollar.",
    rating: 5,
  },
];

// ---------------------------------------------------------------------------
// Team / writers
// ---------------------------------------------------------------------------
export const TEAM = [
  {
    id: "tm1",
    name: "Lead Nursing Writer",
    role: "DNP, RN — Capstone & DNP Projects",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300&q=80",
    description: "Doctor of Nursing Practice with 15+ years of clinical and academic experience across BSN, MSN and DNP programs.",
    order: 1,
  },
  {
    id: "tm2",
    name: "Senior Academic Writer",
    role: "PhD, MSN — Leadership & EBP",
    image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?auto=format&fit=crop&w=300&h=300&q=80",
    description: "PhD in Nursing Education specializing in evidence-based practice, leadership and WGU/Capella assessments.",
    order: 2,
  },
  {
    id: "tm3",
    name: "Healthcare Research Specialist",
    role: "MD, MPH — Pathophysiology & Pharmacology",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&h=300&q=80",
    description: "Medical doctor with a Master of Public Health focused on healthcare research and complex case studies.",
    order: 3,
  },
  {
    id: "tm4",
    name: "Informatics & Social Work Writer",
    role: "PhD, RN-BC / MSW — Informatics & SWK",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
    description: "Nursing informatics and social-work specialist covering GCU BSW/MSW and quality-improvement projects.",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export const FAQ = [
  {
    id: "faq1",
    question: "Which schools and programs do you cover?",
    answer:
      "We help students at WGU, Capella, Post University, SNHU, Grand Canyon University (GCU), Walden, South University, Herzing, Purdue and Sophia Learning — across RN-to-BSN, BSN-to-MSN, RN-to-MSN, MSN-to-DNP, plus BHA, MHA, MBA, DBA, PMHNP, FNP and BSW/MSW social work.",
    order: 1,
  },
  {
    id: "faq2",
    question: "Is the work plagiarism-free and AI-free?",
    answer:
      "Yes. Every assignment is 100% human-created and written from scratch — we never use AI generators. Your work is original, Turnitin-ready, and we can provide a plagiarism report on request.",
    order: 2,
  },
  {
    id: "faq3",
    question: "How much does it cost?",
    answer:
      "Pricing depends on the school and program. As a guide: Post University BSN is $250 per class (or $12/page), Capella BSN/MSN is $300 per class, Capella DNP is $15/page, and Sophia Learning is $200 per class. Message us for an instant quote on any other school.",
    order: 3,
  },
  {
    id: "faq4",
    question: "Can you handle a full class or just single assignments?",
    answer:
      "Both. We take individual assessments, discussions and capstones, or manage your entire class from start to finish — including practicum (PE) hour courses and the full NURS-FPX / D-course sequences.",
    order: 4,
  },
  {
    id: "faq5",
    question: "Can you meet urgent deadlines?",
    answer:
      "Absolutely. We offer legit 24-hour turnaround for urgent orders while maintaining quality. For very tight deadlines, message us on WhatsApp and we'll confirm feasibility right away.",
    order: 5,
  },
  {
    id: "faq6",
    question: "How do I get started?",
    answer:
      "Message us on WhatsApp at +1 (309) 286-4134 or email rnbsnmsnwriter@gmail.com with your school, course and deadline. You can also fill out the order form on this site and we'll follow up with a quote.",
    order: 6,
  },
  {
    id: "faq7",
    question: "Is my information kept private?",
    answer:
      "100%. Your identity and account details are confidential and never shared with third parties. All communications are deleted after your order is complete.",
    order: 7,
  },
  {
    id: "faq8",
    question: "What if I need revisions?",
    answer:
      "We offer unlimited free revisions until you are satisfied. Just send your feedback and your writer will make the changes promptly, at no extra cost on eligible orders.",
    order: 8,
  },
];

export const ACADEMIC_LEVELS = ["High School", "College", "BSN", "MSN", "DNP", "Social Work"];

// Simple per-page estimate engine for the order form (USD per page).
// Base $12/page (Post University rate) scaling up with program level & urgency.
export const PRICE_TABLE = [
  { level: "High School", days14: 10, days7: 11, days5: 12, days3: 14, days2: 15, days1: 16, hours8: 18 },
  { level: "College", days14: 11, days7: 12, days5: 13, days3: 15, days2: 16, days1: 18, hours8: 20 },
  { level: "BSN", days14: 12, days7: 13, days5: 15, days3: 16, days2: 18, days1: 20, hours8: 22 },
  { level: "MSN", days14: 14, days7: 15, days5: 17, days3: 18, days2: 20, days1: 22, hours8: 25 },
  { level: "DNP", days14: 15, days7: 16, days5: 18, days3: 20, days2: 22, days1: 25, hours8: 28 },
  { level: "Social Work", days14: 12, days7: 13, days5: 15, days3: 16, days2: 18, days1: 20, hours8: 22 },
];

export const DEADLINES = [
  { key: "days14", label: "14+ Days" },
  { key: "days7", label: "7 Days" },
  { key: "days5", label: "5 Days" },
  { key: "days3", label: "3 Days" },
  { key: "days2", label: "48 Hrs" },
  { key: "days1", label: "24 Hrs" },
  { key: "hours8", label: "8 Hrs" },
];

export function pricePerPage(level, deadlineKey) {
  const row = PRICE_TABLE.find((r) => r.level === level);
  if (!row) return 12;
  const v = row[deadlineKey];
  return typeof v === "number" ? v : 12;
}
