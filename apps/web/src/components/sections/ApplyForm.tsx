// "use client";

// import { useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Check } from "lucide-react";
// import Reveal from "@/components/Reveal";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import FloatingField from "@/components/ui/FloatingField";
// import Select from "@/components/ui/Select";
// import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
// import styles from "./ApplyForm.module.css";

// const ROLE_OPTIONS = [
//   { value: "founder_ceo", label: "Founder / CEO" },
//   { value: "co_founder", label: "Co-Founder" },
//   { value: "managing_director", label: "Managing Director" },
//   { value: "other", label: "Other" },
// ];

// const REVENUE_OPTIONS = [
//   { value: "3_4cr", label: "₹3–4 Cr / year" },
//   { value: "4_6cr", label: "₹4–6 Cr / year" },
//   { value: "6_10cr", label: "₹6–10 Cr / year" },
//   { value: "10cr_plus", label: "Above ₹10 Cr / year" },
// ];

// const WHAT_TO_EXPECT = [
//   "We map exactly what's capping your growth",
//   "You leave with a clear next step, not a pitch",
//   "100% confidential, no obligation",
// ];

// const INITIAL_FORM = {
//   name: "",
//   email: "",
//   company: "",
//   revenue: "",
//   role: "founder_ceo",
//   bottleneck: "",
// };

// export default function ApplyForm() {
//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [formError, setFormError] = useState("");
//   const reduceMotion = useSafeReducedMotion();

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (formError) setFormError("");
//   };

//   const handleSelectChange = (name: string) => (value: string) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (formError) setFormError("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name || !formData.email || !formData.company || !formData.revenue) {
//       setFormError("Please fill in all required fields to request your call.");
//       return;
//     }

//     try {
//       const response = await fetch("/api/apply", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setFormError(data.message || "Something went wrong. Please try again.");
//         return;
//       }

//       setFormSubmitted(true);
//       setFormError("");
//     } catch (error) {
//       console.error(error);
//       setFormError("Server error. Please try again.");
//     }
//   };

//   return (
//     <section id="book" className={styles.section}>
//       <div className={styles.container}>
//         <Reveal className={styles.intro}>
//           <span className="gradientAccent">LIMITED AVAILABILITY</span>
//           <h2>Ready to Build a Business That Runs Without You?</h2>
//           <p>
//             Book a 1:1 strategy call. We&apos;ll map your bottlenecks and show you what it takes to
//             scale past &#8377;3&ndash;4 Cr without depending on you.
//           </p>
//           <ul className={styles.expectList}>
//             {WHAT_TO_EXPECT.map((line) => (
//               <li key={line}>
//                 <Check size={16} aria-hidden="true" />
//                 <span>{line}</span>
//               </li>
//             ))}
//           </ul>
//         </Reveal>

//         <Reveal delay={0.15}>
//           <Card className={styles.formBox} hoverable={false}>
//             <AnimatePresence mode="wait">
//               {formSubmitted ? (
//                 <motion.div
//                   key="success"
//                   className={styles.success}
//                   initial={reduceMotion ? false : { opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.35, ease: "easeOut" }}
//                 >
//                   <div className={styles.successIcon}>
//                     <Check size={30} aria-hidden="true" />
//                   </div>
//                   <h3>Request Received</h3>
//                   <p>
//                     Thank you, <strong>{formData.name}</strong>. We&apos;ve received your strategy call
//                     request.
//                   </p>
//                   <p className={styles.successNext}>
//                     Our team will review your details and reach out within 24 hours to schedule your
//                     call via <strong>{formData.email}</strong>.
//                   </p>
//                   <Button
//                     variant="secondary"
//                     className={styles.resetBtn}
//                     onClick={() => {
//                       setFormSubmitted(false);
//                       setFormData(INITIAL_FORM);
//                     }}
//                   >
//                     Submit another request
//                   </Button>
//                 </motion.div>
//               ) : (
//                 <motion.form
//                   key="form"
//                   onSubmit={handleSubmit}
//                   className={styles.form}
//                   initial={reduceMotion ? false : { opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {formError && (
//                     <div className={styles.errorAlert} role="alert">
//                       {formError}
//                     </div>
//                   )}

//                   <FloatingField
//                     label="Full Name *"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     placeholder="e.g. Adhithya Kumar"
//                     required
//                     error={!!formError && !formData.name}
//                   />

//                   <FloatingField
//                     label="Work Email *"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     placeholder="e.g. adhi@yourcompany.com"
//                     required
//                     error={!!formError && !formData.email}
//                   />

//                   <div className={styles.grid2}>
//                     <FloatingField
//                       label="Company Name *"
//                       name="company"
//                       value={formData.company}
//                       onChange={handleInputChange}
//                       placeholder="e.g. Apex Digital"
//                       required
//                       error={!!formError && !formData.company}
//                     />
//                     <Select
//                       label="Primary Role *"
//                       name="role"
//                       value={formData.role}
//                       onValueChange={handleSelectChange("role")}
//                       options={ROLE_OPTIONS}
//                       required
//                     />
//                   </div>

//                   <Select
//                     label="Current Annual Revenue *"
//                     name="revenue"
//                     value={formData.revenue}
//                     onValueChange={handleSelectChange("revenue")}
//                     options={REVENUE_OPTIONS}
//                     placeholder="Select range..."
//                     required
//                     error={!!formError && !formData.revenue}
//                   />

//                   <FloatingField
//                     label="What's your biggest bottleneck right now?"
//                     name="bottleneck"
//                     as="textarea"
//                     rows={3}
//                     value={formData.bottleneck}
//                     onChange={handleInputChange}
//                     placeholder="e.g. I'm still the bottleneck on every major decision..."
//                   />

//                   <Button type="submit" variant="primary" className={styles.submitBtn}>
//                     Book My Strategy Call
//                   </Button>
//                   <p className={styles.formNotice}>
//                     By application only. Limited calls accepted each month.
//                   </p>
//                 </motion.form>
//               )}
//             </AnimatePresence>
//           </Card>
//         </Reveal>
//       </div>
//     </section>
//   );
// }
