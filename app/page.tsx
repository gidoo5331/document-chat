"use client";

import ChatWidget from "@/components/ChatWidget";
import SearchBar from "@/components/SearchBar";
import { useCallback, useRef, useState } from "react";


const DOCUMENT_CONTENT = `
  <h1>General Service Agreement</h1>
  <p>This agreement outlines the terms and conditions under which services will be provided between the Service Provider and the Client.</p>

  <h2>1. Purpose</h2>
  <p>The purpose of this agreement is to define the responsibilities, expectations, and working relationship between both parties for the duration of the service engagement.</p>

  <h2>2. Services Provided</h2>
  <p>The Service Provider agrees to deliver professional services including consultation, technical support, and system maintenance as required by the Client. Specific service details may be defined in separate project documents or statements of work.</p>

  <h2>3. Communication</h2>
  <p>Both parties agree to maintain clear and timely communication throughout the engagement. Updates, feedback, and approvals will be shared through agreed communication channels such as email, messaging platforms, or scheduled meetings.</p>

  <h2>4. Client Responsibilities</h2>
  <p>The Client agrees to provide necessary information, access, and resources required for the successful delivery of services. Delays caused by the lack of required materials or approvals may affect the project schedule.</p>

  <h2>5. Confidentiality</h2>
  <p>Both parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the course of this agreement. Such information shall not be disclosed to third parties without prior written consent.</p>

  <h2>6. Payment Terms</h2>
  <p>The Client agrees to compensate the Service Provider according to the agreed pricing structure. Payment terms, due dates, and methods will be defined in the invoice issued for services rendered.</p>

  <h2>7. Termination</h2>
  <p>Either party may terminate this agreement by providing written notice within a reasonable time period. Upon termination, all outstanding payments for completed work shall become immediately due.</p>

  <h2>8. Liability</h2>
  <p>The Service Provider shall not be held liable for indirect damages or losses arising from the use of delivered services or materials beyond the scope of this agreement.</p>

  <h2>9. Governing Law</h2>
  <p>This agreement shall be governed and interpreted according to the applicable laws of the jurisdiction where the services are delivered.</p>

  <h2>10. Acceptance</h2>
  <p>By signing this document, both parties acknowledge that they have read, understood, and agreed to the terms outlined in this agreement.</p>
`;

export default function Home() {
   const containerRef = useRef<HTMLDivElement>(null);
    const [docContent, setDocContent] = useState(DOCUMENT_CONTENT);
  
    const handleEdit = useCallback((newContent: string) => {
      setDocContent(newContent);
    }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between px-16 bg-white dark:bg-black sm:items-start">
       <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="sticky top-0 z-10 bg-white py-4">
          <SearchBar containerRef={containerRef} />
        </div>
               <div
                 ref={containerRef}
                 className="doc-content bg-white rounded-2xl shadow-sm border border-slate-100 px-10 py-12 mt-6 text-slate-800 leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: docContent }}
               />
             </div>
       
             <ChatWidget documentContent={docContent} onEdit={handleEdit} />
          
      </main>
    </div>
  );
}
