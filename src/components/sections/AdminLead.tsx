"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AGE_CATEGORIES, type AgeCategory } from "@/lib/age";
import styles from "./AdminLead.module.css";

const POLL_INTERVAL_MS = 10_000;
const STORAGE_KEY = "admin-leads-key";

interface Lead {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  age: number | null;
  ageCategory: AgeCategory;
  phone: string;
  businessType: string;
  industryDuration: string;
  incomeLevel: string;
  incomeTarget: string;
  meetingTargets: string;
  websiteDetails: string;
  socialLinks: string;
  investmentReady: string;
  foundUs: string[];
  foundUsOther: string | null;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminLead() {
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ageFilter, setAgeFilter] = useState<AgeCategory | "All">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setAccessKey(stored);
  }, []);

  const fetchLeads = useCallback(async (key: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const response = await fetch(`/api/client-intake?key=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid access key.");
          sessionStorage.removeItem(STORAGE_KEY);
          setAccessKey(null);
        } else {
          setError(data.message || "Failed to load leads.");
        }
        return;
      }

      setLeads(data.data);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setError("Network error while fetching leads.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessKey) return;

    setLoading(true);
    fetchLeads(accessKey);

    const interval = setInterval(() => fetchLeads(accessKey), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessKey, fetchLeads]);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
    setAccessKey(keyInput.trim());
  };

  const filteredLeads = useMemo(() => {
    if (ageFilter === "All") return leads;
    return leads.filter((lead) => lead.ageCategory === ageFilter);
  }, [leads, ageFilter]);

  if (!accessKey) {
    return (
      <div className={styles.gate}>
        <form className={styles.gateForm} onSubmit={handleUnlock}>
          <h1>Admin Access</h1>
          <p>Enter the admin key to view submitted leads.</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Admin key"
            autoFocus
          />
          <button type="submit">Unlock</button>
          {error && <p className={styles.gateError}>{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Leads</h1>
          <p>
            {filteredLeads.length} of {leads.length} submissions
            {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString("en-IN")}`}
            {loading && " · refreshing…"}
          </p>
        </div>

        <div className={styles.filters}>
          <label htmlFor="age-filter">Age category</label>
          <select
            id="age-filter"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as AgeCategory | "All")}
          >
            <option value="All">All</option>
            {AGE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Business Type</th>
              <th>Industry Exp.</th>
              <th>Income Level</th>
              <th>Income Target</th>
              <th>Hitting Targets</th>
              <th>Investment Ready</th>
              <th>Found Us</th>
              <th>Website</th>
              <th>Social</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={14}>
                  {loading ? "Loading leads…" : "No submissions match this filter."}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>
                    {lead.age ?? "—"}
                    <span className={styles.ageTag}>{lead.ageCategory}</span>
                  </td>
                  <td>{lead.phone}</td>
                  <td className={styles.wrap}>{lead.businessType}</td>
                  <td>{lead.industryDuration}</td>
                  <td>{lead.incomeLevel}</td>
                  <td>{lead.incomeTarget}</td>
                  <td>{lead.meetingTargets}</td>
                  <td>{lead.investmentReady}</td>
                  <td className={styles.wrap}>
                    {lead.foundUs.join(", ")}
                    {lead.foundUsOther ? ` (${lead.foundUsOther})` : ""}
                  </td>
                  <td className={styles.wrap}>{lead.websiteDetails}</td>
                  <td className={styles.wrap}>{lead.socialLinks}</td>
                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
