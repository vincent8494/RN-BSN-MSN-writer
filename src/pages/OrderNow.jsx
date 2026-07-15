import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, X, ArrowLeft, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { navigate } from "../router.jsx";
import { createOrder, uploadRequirement, useApp } from "../store.jsx";
import {
  UNIVERSITIES, SERVICES_OFFERED, ACADEMIC_LEVELS, DEADLINES,
  CONTACT, waMessage, SERVICE_TYPES, WORDS_PER_PAGE,
} from "../data.js";

const PAPER_TYPES = SERVICES_OFFERED.map((s) => s.name);
const SCHOOLS = [...UNIVERSITIES.map((u) => u.short), "Other / Not listed"];

const MAX_PAGES = 200;
const MAX_SOURCES = 50;
const MAX_SLIDES = 50;
const MAX_FILES = 10;
const MAX_FILE_MB = 4;

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Number input flanked by −/+ stepper buttons.
function Stepper({ id, value, onChange, min, max, label }) {
  return (
    <div className="flex items-stretch rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-academic-500/20 focus-within:border-academic-500 transition-all">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="px-3.5 text-lg font-bold text-slate-500 hover:bg-slate-50 hover:text-academic-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clampInt(e.target.value, min, max, min))}
        className="w-full py-3 text-center text-sm text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="px-3.5 text-lg font-bold text-slate-500 hover:bg-slate-50 hover:text-academic-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  );
}

export default function OrderNow() {
  const [paperType, setPaperType] = useState(PAPER_TYPES[0]);
  const [school, setSchool] = useState(SCHOOLS[0]);
  const [otherSchool, setOtherSchool] = useState("");
  const [service, setService] = useState("writing");
  const [level, setLevel] = useState("BSN");
  const [pages, setPages] = useState(3);
  const [slides, setSlides] = useState(0);
  const [deadline, setDeadline] = useState("days7");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sources, setSources] = useState(3);
  const [coupon, setCoupon] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // Live pricing from the server (same config the server charges against).
  const { pricing } = useApp();
  const serviceType = SERVICE_TYPES.find((s) => s.key === service) || SERVICE_TYPES[0];
  const perPage = pricing.perPage[level]?.[deadline] ?? 12;
  const serviceMult = pricing.serviceMultipliers[service] ?? 1;
  const pagesCost = perPage * pages * serviceMult;
  const slidesCost = slides * pricing.pricePerSlide;
  const subtotal = pagesCost + slidesCost;
  const couponCode = (pricing.coupon?.code || "").trim();
  const couponMatches = couponCode && coupon.trim().toLowerCase() === couponCode.toLowerCase();
  const discount = couponMatches ? subtotal * ((pricing.coupon?.percent || 0) / 100) : 0;
  const total = Math.max(0, subtotal - discount);
  const words = pages * WORDS_PER_PAGE;
  const schoolValue = school === "Other / Not listed" ? (otherSchool.trim() || "Other") : school;

  const addFiles = (fileList) => {
    // Snapshot immediately: FileList and dataTransfer are live objects that
    // empty as soon as the input is reset or the drop event ends.
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const next = [...files];
    const errors = [];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files.`);
        break;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        errors.push(`"${f.name}" exceeds ${MAX_FILE_MB} MB.`);
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    setFileError(errors.join(" "));
    setFiles(next);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const onPick = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };
  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const placeOrder = async () => {
    setPlacing(true);
    setPlaceError("");
    const res = await createOrder({
      title: topic || paperType,
      description: instructions,
      paperType,
      academicLevel: level,
      school: schoolValue,
      service: serviceType.label,
      pages,
      slides,
      deadline,
      total,
      subject: topic,
      sources,
      coupon,
    });
    if (res.error) {
      setPlacing(false);
      setPlaceError(res.error);
      return;
    }
    // Attach the customer's requirement files to the new order (best effort).
    const accessToken = res.order.accessToken;
    let failed = 0;
    for (const f of files) {
      const up = await uploadRequirement(res.order.id, f, accessToken);
      if (up.error) failed += 1;
    }
    setPlacing(false);
    const tokenQ = accessToken ? `&t=${encodeURIComponent(accessToken)}` : "";
    if (failed) {
      setPlaceError(`Order placed, but ${failed} file(s) couldn't upload. Continue to checkout and send them on WhatsApp, or go back and retry.`);
      setTimeout(() => navigate(`/checkout?order=${encodeURIComponent(res.order.id)}${tokenQ}`), 2500);
      return;
    }
    navigate(`/checkout?order=${encodeURIComponent(res.order.id)}${tokenQ}`);
  };

  const field = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-academic-500/20 focus:border-academic-500 transition-all";
  const label = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-2 text-academic-200 text-sm mb-3">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/")}>Home</span>
            <span>/</span><span className="text-white font-medium">Place Your Order</span>
          </div>
          <h1 className="section-title text-white text-4xl md:text-5xl">Place Your Order</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-academic p-6 lg:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-academic-600" /> Paper Details</h2>
              <div className="mb-4">
                <span className={label}>Service Type</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Service type">
                  {SERVICE_TYPES.map((s) => {
                    const mult = pricing.serviceMultipliers[s.key] ?? s.multiplier;
                    return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setService(s.key)}
                      aria-pressed={service === s.key}
                      className={`px-3 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        service === s.key ? "bg-academic-600 text-white border-academic-600" : "bg-white text-slate-600 border-slate-200 hover:border-academic-300"
                      }`}
                    >
                      {s.label}
                      {mult < 1 && <span className={`block text-[10px] font-medium mt-0.5 ${service === s.key ? "text-academic-100" : "text-emerald-600"}`}>save {Math.round((1 - mult) * 100)}%</span>}
                    </button>
                  );
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="ord-type" className={label}>Assignment Type</label>
                  <select id="ord-type" value={paperType} onChange={(e) => setPaperType(e.target.value)} className={field}>
                    {PAPER_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ord-school" className={label}>School / Program</label>
                  <select id="ord-school" value={school} onChange={(e) => setSchool(e.target.value)} className={field}>
                    {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {school === "Other / Not listed" && (
                <div className="mb-4">
                  <label htmlFor="ord-other-school" className={label}>Your School</label>
                  <input id="ord-other-school" value={otherSchool} onChange={(e) => setOtherSchool(e.target.value)} placeholder="Type your university or program name..." className={field} />
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="ord-level" className={label}>Academic Level</label>
                  <select id="ord-level" value={level} onChange={(e) => setLevel(e.target.value)} className={field}>
                    {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ord-pages" className={label}>Pages</label>
                  <Stepper id="ord-pages" label="pages" value={pages} onChange={setPages} min={1} max={MAX_PAGES} />
                  <p className="text-[11px] text-slate-400 mt-1">≈ {words.toLocaleString()} words</p>
                </div>
                <div>
                  <label htmlFor="ord-slides" className={label}>Slides</label>
                  <Stepper id="ord-slides" label="slides" value={slides} onChange={setSlides} min={0} max={MAX_SLIDES} />
                  <p className="text-[11px] text-slate-400 mt-1">${pricing.pricePerSlide} per slide</p>
                </div>
                <div>
                  <label htmlFor="ord-sources" className={label}>Sources</label>
                  <Stepper id="ord-sources" label="sources" value={sources} onChange={setSources} min={0} max={MAX_SOURCES} />
                </div>
              </div>
              <div>
                <label htmlFor="ord-topic" className={label}>Topic / Course Code</label>
                <input id="ord-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Capella NURS-FPX 4005, WGU D219..." className={field} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-academic p-6 lg:p-8">
              <label className={label}>Deadline</label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-6">
                {DEADLINES.map((d) => (
                  <button key={d.key} onClick={() => setDeadline(d.key)} aria-pressed={deadline === d.key}
                    className={`px-2 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      deadline === d.key ? "bg-academic-600 text-white border-academic-600" : "bg-white text-slate-600 border-slate-200 hover:border-academic-300"
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
              <label htmlFor="ord-instructions" className={label}>Instructions</label>
              <textarea id="ord-instructions" rows={5} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Describe how we can help you — paste the rubric, requirements and any details..." className={`${field} resize-none`} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-academic p-6 lg:p-8">
              <span className={label}>Attachments (optional)</span>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl transition-colors ${dragging ? "border-academic-500 bg-academic-50/50" : "border-slate-200 hover:border-academic-300"}`}
              >
                <label className="block p-8 text-center cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-slate-500 mb-3">Drag &amp; drop files here or click to browse</p>
                  <span className="inline-block px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                    Browse files
                  </span>
                  <input type="file" multiple className="sr-only" onChange={onPick} aria-label="Attach files" />
                  <p className="text-[11px] text-slate-400 mt-3">Up to {MAX_FILES} files, {MAX_FILE_MB} MB each. Attached to your order for your writer — larger files can be shared on WhatsApp.</p>
                </label>
              </div>
              {fileError && <p role="alert" className="mt-3 text-xs font-medium text-red-600">{fileError}</p>}
              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${f.size}`} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                      <span className="truncate text-slate-600">{f.name}</span>
                      <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-4 h-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-academic p-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Service</dt><dd className="font-medium text-slate-900 text-right max-w-[60%] truncate">{serviceType.label}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Assignment</dt><dd className="font-medium text-slate-900 text-right max-w-[60%] truncate">{paperType}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">School</dt><dd className="font-medium text-slate-900 text-right max-w-[60%] truncate">{schoolValue}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Level</dt><dd className="font-medium text-slate-900">{level}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Pages</dt><dd className="font-medium text-slate-900">{pages} <span className="text-slate-400 font-normal">(~{words.toLocaleString()} words)</span></dd></div>
                {slides > 0 && <div className="flex justify-between"><dt className="text-slate-500">Slides</dt><dd className="font-medium text-slate-900">{slides} (+${slidesCost.toFixed(2)})</dd></div>}
                <div className="flex justify-between"><dt className="text-slate-500">Deadline</dt><dd className="font-medium text-slate-900">{DEADLINES.find((d) => d.key === deadline)?.label}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Price / page</dt><dd className="font-medium text-slate-900">${(perPage * serviceMult).toFixed(2)}</dd></div>
              </dl>

              <div className="mt-4">
                <label htmlFor="ord-coupon" className={label}>Coupon code</label>
                <input id="ord-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={couponCode ? `Try ${couponCode}` : "Coupon code"} className={field} />
                {discount > 0 && <p className="text-xs text-emerald-600 mt-1.5 font-medium">{couponCode} applied — {pricing.coupon.percent}% off your first order (verified at checkout).</p>}
              </div>

              <div className="border-t border-slate-100 mt-5 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900">${subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="text-emerald-600">-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between items-end pt-1">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-academic-700">${total.toFixed(2)}</span>
                </div>
              </div>

              {placeError && <p role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{placeError}</p>}
              <button onClick={placeOrder} disabled={placing} className="btn-primary w-full mt-5 disabled:opacity-60">
                {placing ? (files.length ? "Placing order & uploading files..." : "Placing order...") : <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>}
              </button>
              <a href={waMessage(`Hi! I'd like to order: ${serviceType.label} · ${paperType} · ${schoolValue} · ${level} · ${pages} pages${slides ? ` · ${slides} slides` : ""} · ${DEADLINES.find((d) => d.key === deadline)?.label}. Topic: ${topic || "N/A"}`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full mt-3 text-sm">
                <MessageCircle className="w-4 h-4" /> Or order via WhatsApp
              </a>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% confidential · No plagiarism · No AI
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
