"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ChatWidget from "@/components/ChatWidget";
import SearchBar from "@/components/SearchBar";

const DOCUMENT_CONTENT = `
  <h1>Project Contract Agreement</h1>
  <p>This agreement is entered into between the Client and the Developer for the purpose of delivering a web application with the following features and integrations.</p>

  <h2>1. Scope of Work</h2>
  <p>The developer agrees to complete the frontend development and integration of the following modules: Authentication and Security, E-Signing, Document Download, Admin Permissions, Dashboard Graphs, and Payment Integration.</p>

  <h2>2. Authentication & Security</h2>
  <p>The authentication system shall implement JWT-based token management with OAuth 2.0 support. Role-based access control will be enforced at all route levels. Sessions shall expire after a period of inactivity and refresh tokens will be securely stored.</p>

  <h2>3. E-Signing Module</h2>
  <p>The e-signing feature will allow authorized users to sign documents digitally. Integration with a third-party e-signing API such as DocuSign or HelloSign will be completed. Signed documents will be stored securely and made available for download.</p>

  <h2>4. Document Management</h2>
  <p>Users will be able to download documents in PDF and DOCX formats. Document generation will be handled server-side and served through secure signed URLs. Download history will be logged for audit purposes.</p>

  <h2>5. Admin Permissions</h2>
  <p>The admin panel will allow super administrators to manage user roles and permissions. Changes to permissions will be logged and reversible. Role templates will be provided to simplify onboarding of new team members.</p>

  <h2>6. Dashboard & Analytics</h2>
  <p>The dashboard will display key performance metrics using interactive charts. Data will be fetched from the backend API and refreshed on a configurable interval. Graphs will include bar charts, line graphs, and pie charts for various data categories.</p>

  <h2>7. Payment Integration</h2>
  <p>Payment processing will be integrated using Paystack or Flutterwave for local transactions. Stripe will be available as a fallback for international payments. All payment events will trigger webhook notifications and be stored in the transaction ledger.</p>

  <h2>8. Milestone & Payment Schedule</h2>
  <p>Payment shall be made per milestone upon delivery and approval of each module. A deposit of 30% is required before work begins. Remaining payments are tied to milestone completion and client sign-off.</p>

  <h2>9. Timeline</h2>
  <p>The estimated timeline for this project is 3 to 4 months from the date of contract signing. Delays caused by the client's failure to provide assets, APIs, or timely feedback shall not count against the developer's delivery timeline.</p>

  <h2>10. Amendments</h2>
  <p>Any amendments to this agreement must be made in writing and signed by both parties. Verbal agreements shall not be considered binding. Changes to scope may affect pricing and timeline.</p>
`;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [docContent, setDocContent] = useState(DOCUMENT_CONTENT);

  const handleEdit = useCallback((newContent: string) => {
    setDocContent(newContent);
  }, []);

  return (
    <main className="min-h-screen bg-[#f9f7f4] font-serif">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <SearchBar containerRef={containerRef} />

        <div
          ref={containerRef}
          className="doc-content bg-white rounded-2xl shadow-sm border border-slate-100 px-10 py-12 mt-6 text-slate-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: docContent }}
        />
      </div>

      <ChatWidget documentContent={docContent} onEdit={handleEdit} />
    </main>
  );
}
