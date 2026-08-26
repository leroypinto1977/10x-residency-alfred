"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js/min";
import Button from "@/components/ui/Button";
import FloatingField from "@/components/ui/FloatingField";
import RadioGroup from "@/components/ui/RadioGroup";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import { trackMetaEvent, newMetaEventId } from "@/lib/meta-pixel";
import { EVENT } from "@/lib/event";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import styles from "./BookCallForm.module.css";
import { DEFAULT_PHONE_COUNTRY } from "@/lib/phoneCountries";
import PhoneField from "./ui/PhoneField";

const INDUSTRY_DURATION_OPTIONS = [
  { value: "0-3 years", label: "0-3 years" },
  { value: "3-5 years", label: "3-5 years" },
  { value: "5+ years", label: "5+ years" },
];

const INCOME_LEVEL_OPTIONS = [
  { value: "Less than 3,00,000 INR", label: "Less than 3,00,000 INR" },
  { value: "3,00,000 INR - 8,00,000 INR", label: "3,00,000 INR - 8,00,000 INR" },
  { value: "8,00,000 INR - 15,00,000 INR", label: "8,00,000 INR - 15,00,000 INR" },
  { value: "15,00,000+ INR", label: "15,00,000+ INR" },
];

const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const FOUND_US_OPTIONS = [
  { value: "GOAT Media Insta page", label: "GOAT Media Insta page" },
  { value: "Kennet Alphy's Instagram", label: "Kennet Alphy's Instagram" },
  { value: "Alfred Joshua's Instagram", label: "Alfred Joshua's Instagram" },
  { value: "Kennet Alphy's LinkedIn", label: "Kennet Alphy's LinkedIn" },
  { value: "Alfred Joshua's LinkedIn", label: "Alfred Joshua's LinkedIn" },
  { value: "Others", label: "Others" },
];

// How long the confirmation stays up before the applicant is handed to the
// ticket page.
const REDIRECT_DELAY_MS = 3000;

const INITIAL_FORM = {
  name: "",
  email: "",
  dob: "",
  phoneCountry: DEFAULT_PHONE_COUNTRY as CountryCode,
  phone: "",
  businessType: "",
  industryDuration: "",
  incomeLevel: "",
  incomeTarget: "",
  meetingTargets: "",
  websiteDetails: "",
  socialLinks: "",
  investmentReady: "",
  foundUs: [] as string[],
  foundUsOther: "",
};

const REQUIRED_TEXT_FIELDS = [
  "name",
  "email",
  "dob",
  "phone",
  "businessType",
  "industryDuration",
  "incomeLevel",
  "incomeTarget",
  "meetingTargets",
  "websiteDetails",
  "socialLinks",
  "investmentReady",
] as const;

export default function BookCallForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const reduceMotion = useSafeReducedMotion();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
    if (formError) setFormError("");
  };

  const handlePhoneCountryChange = (country: CountryCode) => {
    setFormData((prev) => ({ ...prev, phoneCountry: country }));
    if (formError) setFormError("");
  };

  const handleRadioChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleCheckboxChange = (name: "foundUs") => (values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
      // Clear the "please specify" detail once "Others" is deselected, so a
      // stale value from an earlier selection never gets submitted silently.
      ...(name === "foundUs" && !values.includes("Others") ? { foundUsOther: "" } : {}),
    }));
    if (formError) setFormError("");
  };

  // Long enough for the applicant to read what happens next, so the ticket
  // page arrives as the step just described rather than a redirect out of
  // nowhere. The Lead event has already been sent by the time this runs, so
  // the wait cannot cost us the conversion.
  //
  // The sibling Become an Authority site holds for the same three seconds; if
  // one changes, change both.
  useEffect(() => {
    if (!formSubmitted) return;
    const timer = setTimeout(() => {
      window.location.href = EVENT.ticketUrl;
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [formSubmitted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const missingText = REQUIRED_TEXT_FIELDS.some((field) => !formData[field]);
    const missingChoices = formData.foundUs.length === 0;
    const missingOtherDetail = formData.foundUs.includes("Others") && !formData.foundUsOther.trim();
    const invalidPhone = !!formData.phone && !isValidPhoneNumber(formData.phone, formData.phoneCountry);

    if (invalidPhone) {
      setFormError("Please enter a valid mobile number for the selected country.");
      return;
    }

    if (missingText || missingChoices || missingOtherDetail) {
      setFormError("Please fill in all required fields to submit your application.");
      return;
    }

    const fullPhone =
      parsePhoneNumberFromString(formData.phone, formData.phoneCountry)?.number ?? formData.phone;

    // Shared by the browser pixel and the server-side Conversions API copy of
    // this lead, so Meta recognises the two reports as one conversion.
    const metaEventId = newMetaEventId();

    try {
      const response = await fetch("/api/client-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: fullPhone, metaEventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Only a stored application counts as a lead, so this fires after the
      // response rather than on submit.
      trackMetaEvent("Lead", metaEventId, { content_name: "Founder 10X application" });

      setFormSubmitted(true);
      setFormError("");
    } catch (error) {
      console.error(error);
      setFormError("Server error. Please try again.");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {formSubmitted ? (
        <motion.div
          key="success"
          className={styles.success}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className={styles.successIcon}>
            <Check size={30} aria-hidden="true" />
          </div>
          <h3>Request Received</h3>
          <p>
            Thank you, <strong>{formData.name}</strong>. We&apos;ve received your application.
          </p>
          <p className={styles.successNext}>
            Our team will review your details and reach out via{" "}
            <strong>{formData.email}</strong>. Taking you to the booking page to block your
            seat with {EVENT.seatFeeLabel} now &mdash; {EVENT.seatFeeRefundNote}.
          </p>
          <Button href={EVENT.ticketUrl} className={styles.resetBtn} showArrow>
            Block your seat &middot; {EVENT.seatFeeLabel}
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className={styles.form}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formError && (
            <div className={styles.errorAlert} role="alert">
              {formError}
            </div>
          )}

          <FloatingField
            label="Your name *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Adhithya Kumar"
            required
            error={!!formError && !formData.name}
          />

          <FloatingField
            label="Your email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. adhi@yourcompany.com"
            required
            error={!!formError && !formData.email}
          />

          <FloatingField
            label="Your date of birth *"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            max={new Date().toISOString().slice(0, 10)}
            required
            error={!!formError && !formData.dob}
          />

          <PhoneField
            label="What is your phone number? *"
            name="phone"
            country={formData.phoneCountry}
            value={formData.phone}
            onCountryChange={handlePhoneCountryChange}
            onChange={handlePhoneChange}
            placeholder="98765 43210"
            required
            error={
              !!formError &&
              (!formData.phone || !isValidPhoneNumber(formData.phone, formData.phoneCountry))
            }
            errorMessage={
              formData.phone && !isValidPhoneNumber(formData.phone, formData.phoneCountry)
                ? "Enter a valid mobile number for the selected country."
                : undefined
            }
          />

          <FloatingField
            label="What type of business do you currently have? (Short Explanation) *"
            name="businessType"
            as="textarea"
            rows={3}
            value={formData.businessType}
            onChange={handleInputChange}
            placeholder="Tell us about your business"
            required
            error={!!formError && !formData.businessType}
          />

          <RadioGroup
            label="How long you have been in this industry? *"
            name="industryDuration"
            value={formData.industryDuration}
            onChange={handleRadioChange("industryDuration")}
            options={INDUSTRY_DURATION_OPTIONS}
            required
            error={!!formError && !formData.industryDuration}
          />

          <RadioGroup
            label="What is your current income level? *"
            name="incomeLevel"
            value={formData.incomeLevel}
            onChange={handleRadioChange("incomeLevel")}
            options={INCOME_LEVEL_OPTIONS}
            required
            error={!!formError && !formData.incomeLevel}
          />

          <FloatingField
            label="What is your annual income target? *"
            name="incomeTarget"
            value={formData.incomeTarget}
            onChange={handleInputChange}
            placeholder="e.g. 25,00,000 INR"
            required
            error={!!formError && !formData.incomeTarget}
          />

          <RadioGroup
            label="Are you meeting your monthly targets? *"
            name="meetingTargets"
            value={formData.meetingTargets}
            onChange={handleRadioChange("meetingTargets")}
            options={YES_NO_OPTIONS}
            required
            error={!!formError && !formData.meetingTargets}
          />

          <FloatingField
            label="Your Website Details *"
            name="websiteDetails"
            value={formData.websiteDetails}
            onChange={handleInputChange}
            placeholder="e.g. www.yourbusiness.com"
            required
            error={!!formError && !formData.websiteDetails}
          />

          <FloatingField
            label="Social Media Links*"
            name="socialLinks"
            value={formData.socialLinks}
            onChange={handleInputChange}
            placeholder="e.g. instagram.com/yourhandle"
            required
            error={!!formError && !formData.socialLinks}
          />

          <RadioGroup
            label="Are you ready to invest 1.5 for 1yr mentorship? *"
            name="investmentReady"
            value={formData.investmentReady}
            onChange={handleRadioChange("investmentReady")}
            options={YES_NO_OPTIONS}
            required
            error={!!formError && !formData.investmentReady}
          />

          <CheckboxGroup
            label="How did you find us? *"
            name="foundUs"
            values={formData.foundUs}
            onChange={handleCheckboxChange("foundUs")}
            options={FOUND_US_OPTIONS}
            error={!!formError && formData.foundUs.length === 0}
          />

          {formData.foundUs.includes("Others") && (
            <FloatingField
              label="How did you get this information? *"
              name="foundUsOther"
              value={formData.foundUsOther}
              onChange={handleInputChange}
              placeholder="e.g. Referred by a friend"
              required
              error={!!formError && !formData.foundUsOther.trim()}
            />
          )}

          {/* The submit button is one tap from a payment page. Stating what
              happens next here, at the point of the tap, is the difference
              between the redirect being expected and it being the reason
              someone abandons at checkout. */}
          <p className={styles.feeCallout}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              Next: <strong>{EVENT.seatFeeLabel}</strong>{" "}
              to block your seat &mdash;{" "}
              {EVENT.seatFeeRefundNote}. Nothing else is charged until we&apos;ve spoken.
            </span>
          </p>

          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Submit &amp; block your seat &middot; {EVENT.seatFeeLabel}
          </Button>
          <p className={styles.formNotice}>By application only. Limited slots accepted each month.</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}