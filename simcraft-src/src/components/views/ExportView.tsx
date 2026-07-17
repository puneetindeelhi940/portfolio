"use client";

import React, { useState } from "react";
import { Braces, Download, FileText, Package, Presentation, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { Scenario } from "@/lib/types";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge, Tabs } from "../ui";

function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function instructorGuideHtml(s: Scenario): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${s.title} — Instructor Guide</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;line-height:1.55;color:#1a1a1a;padding:0 24px}
h1{font-size:26px;border-bottom:2px solid #333;padding-bottom:8px}h2{font-size:17px;margin-top:28px;color:#2a2a6a}
table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #999;padding:6px 9px;text-align:left}
li{margin:4px 0;font-size:14px}p{font-size:14px}.meta{color:#555;font-size:13px}</style></head><body>
<h1>${s.title}</h1>
<p class="meta">SimCraft AI · Instructor Guide · v${s.version} · ${new Date(s.updatedAt).toLocaleDateString()}</p>
<h2>Patient</h2>
<p><b>${s.patient.name}</b>, ${s.patient.age}, ${s.patient.gender}, ${s.patient.weight} — ${s.patient.occupation}.<br/>
History: ${s.patient.history.join("; ")}. Allergies: ${s.patient.allergies.join("; ")}. Medications: ${s.patient.medications.join("; ")}.</p>
<h2>Chief complaint</h2><p>"${s.chiefComplaint}"</p>
<h2>Student brief</h2><p>${s.studentBrief}</p>
<h2>Timeline</h2>
<table><tr><th>T+</th><th>Event</th><th>HR</th><th>BP</th><th>RR</th><th>SpO₂</th><th>Instructor note</th></tr>
${s.timeline.map((e) => `<tr><td>${e.tMin} min</td><td><b>${e.title}</b><br/>${e.description}</td><td>${e.vitals.hr || "—"}</td><td>${e.vitals.sbp ? e.vitals.sbp + "/" + e.vitals.dbp : "—"}</td><td>${e.vitals.rr || "—"}</td><td>${e.vitals.spo2}%</td><td>${e.instructorNote || ""}</td></tr>`).join("")}
</table>
<h2>Critical actions</h2><ol>${s.criticalActions.map((c) => `<li>${c}</li>`).join("")}</ol>
<h2>Hidden prompts</h2><ul>${s.hiddenPrompts.map((h) => `<li>${h}</li>`).join("")}</ul>
<h2>Labs</h2>${s.labs.map((l) => `<h3 style="font-size:14px">${l.name}</h3><table><tr><th>Test</th><th>Value</th><th>Reference</th></tr>${l.results.map((r) => `<tr><td>${r.name}</td><td><b>${r.value}</b> ${r.unit} ${r.flag ? "(" + r.flag + ")" : ""}</td><td>${r.ref}</td></tr>`).join("")}</table>`).join("")}
<h2>Imaging</h2>${s.imaging.map((i) => `<p><b>${i.modality} — ${i.title}:</b> ${i.findings} <i>${i.impression}</i></p>`).join("")}
<h2>ECG</h2><p>${s.ecg.interpretation}</p>
<h2>Debrief plan</h2><p>${s.debrief.summary}</p>
<ul>${s.debrief.discussion.map((d) => `<li><b>${d.topic}:</b> ${d.questions.join(" · ")}</li>`).join("")}</ul>
<h2>Evidence</h2><ul>${s.debrief.evidence.map((e) => `<li><b>${e.source}</b> — ${e.text}</li>`).join("")}</ul>
</body></html>`;
}

function fhirJson(s: Scenario): string {
  return JSON.stringify({
    resourceType: "Bundle", type: "collection",
    meta: { source: "SimCraft AI", versionId: String(s.version) },
    entry: [
      { resource: { resourceType: "Patient", name: [{ text: s.patient.name }], gender: s.patient.gender.toLowerCase(), extension: [{ url: "sim/age", valueString: s.patient.age }, { url: "sim/weight", valueString: s.patient.weight }] } },
      { resource: { resourceType: "Condition", code: { text: s.input.condition }, clinicalStatus: { text: "active" } } },
      ...s.timeline.map((e) => ({
        resource: {
          resourceType: "Observation", status: "final",
          code: { text: `Simulation phase: ${e.title}` },
          effectiveDateTime: `T+${e.tMin}min`,
          component: [
            { code: { text: "heart-rate" }, valueQuantity: { value: e.vitals.hr, unit: "beats/min" } },
            { code: { text: "systolic-bp" }, valueQuantity: { value: e.vitals.sbp, unit: "mmHg" } },
            { code: { text: "respiratory-rate" }, valueQuantity: { value: e.vitals.rr, unit: "/min" } },
            { code: { text: "oxygen-saturation" }, valueQuantity: { value: e.vitals.spo2, unit: "%" } },
          ],
        },
      })),
    ],
  }, null, 2);
}

const FORMATS = [
  { id: "pdf", icon: Printer, name: "PDF", desc: "Print-ready instructor guide", sub: "Opens the formatted guide in a print dialog" },
  { id: "docx", icon: FileText, name: "DOCX", desc: "Editable Word document", sub: "Full instructor guide, opens in Word/Docs" },
  { id: "pptx", icon: Presentation, name: "PowerPoint outline", desc: "Slide-per-phase deck outline", sub: "Markdown outline ready for slide import" },
  { id: "fhir", icon: Braces, name: "FHIR JSON", desc: "HL7 FHIR R4 bundle", sub: "Patient, condition & phase observations" },
  { id: "scorm", icon: Package, name: "SCORM manifest", desc: "LMS package descriptor", sub: "imsmanifest.xml for SCORM 1.2 wrapper" },
  { id: "json", icon: Braces, name: "Scenario JSON", desc: "Complete structured scenario", sub: "Every artefact, re-importable" },
] as const;

export function ExportView() {
  const { current } = useStore();
  const s = current!;
  const [tab, setTab] = useState("instructor");
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const doExport = (id: string) => {
    const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
    switch (id) {
      case "pdf": {
        const w = window.open("", "_blank");
        if (w) { w.document.write(instructorGuideHtml(s)); w.document.close(); setTimeout(() => w.print(), 400); }
        flash("Instructor guide opened — use the print dialog to save as PDF");
        break;
      }
      case "docx":
        download(`${slug}-instructor-guide.doc`, instructorGuideHtml(s), "application/msword");
        flash("Word document downloaded");
        break;
      case "pptx":
        download(`${slug}-deck-outline.md`, [
          `# ${s.title}`,
          `## Slide 1 — Pre-brief\n${s.studentBrief}`,
          ...s.timeline.map((e) => `## Slide — T+${e.tMin} min · ${e.title}\n${e.description}\nVitals: HR ${e.vitals.hr} · BP ${e.vitals.sbp}/${e.vitals.dbp} · RR ${e.vitals.rr} · SpO₂ ${e.vitals.spo2}%`),
          `## Slide — Debrief\n${s.debrief.summary}`,
        ].join("\n\n"));
        flash("Slide outline downloaded");
        break;
      case "fhir":
        download(`${slug}-fhir-bundle.json`, fhirJson(s), "application/json");
        flash("FHIR R4 bundle downloaded");
        break;
      case "scorm":
        download("imsmanifest.xml", `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="simcraft.${s.id}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG"><organization identifier="ORG"><title>${s.title}</title>
    <item identifier="ITEM-1" identifierref="RES-1"><title>Simulation scenario</title></item>
  </organization></organizations>
  <resources><resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"><file href="index.html"/></resource></resources>
</manifest>`, "application/xml");
        flash("SCORM manifest downloaded");
        break;
      case "json":
        download(`${slug}.simcraft.json`, JSON.stringify(s, null, 2), "application/json");
        flash("Scenario JSON downloaded");
        break;
    }
  };

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="Export the complete simulation package" />
      <div className="max-w-[1000px] mx-auto px-8 py-6">
        <h1 className="text-lg font-semibold tracking-tight mb-1">Export & Preview</h1>
        <p className="text-[13px] text-dim mb-5">Instructor guide, student guide, script, assessment and interoperable formats — generated from the same structured scenario.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
          {FORMATS.map((f) => (
            <button key={f.id} onClick={() => doExport(f.id)} className="card card-hover p-4 text-left cursor-pointer group">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center">
                  <f.icon size={15} className="text-accent" />
                </span>
                <span className="text-[13.5px] font-semibold">{f.name}</span>
                <Download size={13} className="ml-auto text-faint group-hover:text-accent transition-colors" />
              </div>
              <div className="text-[12px] text-dim">{f.desc}</div>
              <div className="text-[10.5px] text-faint mt-0.5">{f.sub}</div>
            </button>
          ))}
        </div>

        <Tabs
          tabs={[
            { id: "instructor", label: "Instructor Guide" },
            { id: "student", label: "Student Guide" },
            { id: "script", label: "Scenario Script" },
            { id: "labs", label: "Patient Chart" },
          ]}
          active={tab} onChange={setTab}
        />

        <div className="card p-6">
          {tab === "instructor" && (
            <DocPreview title={`${s.title} — Instructor Guide`}>
              <DocSection h="Patient">
                <b>{s.patient.name}</b>, {s.patient.age}, {s.patient.gender}, {s.patient.weight} — {s.patient.occupation}. History: {s.patient.history.join("; ")}. Allergies: {s.patient.allergies.join("; ")}.
              </DocSection>
              <DocSection h="Critical actions">
                <ol className="list-decimal ml-5 space-y-1">{s.criticalActions.map((c) => <li key={c}>{c}</li>)}</ol>
              </DocSection>
              <DocSection h="Timeline">
                {s.timeline.map((e) => (
                  <div key={e.id} className="mb-2">
                    <span className="font-mono text-[11px] text-accent mr-2">T+{e.tMin}′</span>
                    <b>{e.title}.</b> {e.description}
                  </div>
                ))}
              </DocSection>
              <DocSection h="Hidden prompts">
                <ul className="list-disc ml-5 space-y-1">{s.hiddenPrompts.slice(0, 4).map((h) => <li key={h}>{h}</li>)}</ul>
              </DocSection>
            </DocPreview>
          )}
          {tab === "student" && (
            <DocPreview title={`${s.title} — Student Guide`}>
              <DocSection h="Your brief">{s.studentBrief}</DocSection>
              <DocSection h="Learning objectives">
                <ul className="list-disc ml-5 space-y-1">{s.input.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
              </DocSection>
              <DocSection h="What you'll be assessed on">
                Structured assessment via OSCE checklist and critical actions. Pass threshold: {s.assessment.passThreshold}%. The diagnosis and clinical course are intentionally withheld.
              </DocSection>
            </DocPreview>
          )}
          {tab === "script" && (
            <DocPreview title={`${s.title} — Scenario Script`}>
              <DocSection h="Opening state">&ldquo;{s.chiefComplaint}&rdquo;</DocSection>
              {s.dialogue.map((d, i) => (
                <div key={i} className="mb-2 text-[13px]">
                  <Badge tone="cyan" className="mr-2">{d.speaker}</Badge>
                  <i>&ldquo;{d.line}&rdquo;</i>
                </div>
              ))}
              <DocSection h="Confederate guidance">Cue with observations, never instructions. Escalate emotional intensity only when the team is coping.</DocSection>
            </DocPreview>
          )}
          {tab === "labs" && (
            <DocPreview title={`${s.patient.name} — Simulated Chart`}>
              {s.labs.map((l) => (
                <DocSection key={l.name} h={l.name}>
                  <table className="w-full text-[12px]">
                    <tbody>
                      {l.results.map((r) => (
                        <tr key={r.name} className="border-b border-line last:border-0">
                          <td className="py-1 pr-3">{r.name}</td>
                          <td className={`py-1 pr-3 font-mono font-semibold ${r.flag === "C" ? "text-danger" : r.flag ? "text-warn" : ""}`}>{r.value} {r.unit} {r.flag && `(${r.flag})`}</td>
                          <td className="py-1 text-faint">{r.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DocSection>
              ))}
              <DocSection h="ECG">{s.ecg.interpretation}</DocSection>
              {s.imaging.map((im) => <DocSection key={im.title} h={`${im.modality} — ${im.title}`}>{im.findings} <i className="text-dim">{im.impression}</i></DocSection>)}
            </DocPreview>
          )}
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg bg-raised border border-line text-[12.5px] shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function DocPreview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-[640px]">
      <div className="text-[15px] font-semibold border-b border-line2 pb-2 mb-4">{title}</div>
      <div className="text-[13px] leading-relaxed space-y-4">{children}</div>
    </div>
  );
}
function DocSection({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-1.5">{h}</div>
      <div className="text-dim">{children}</div>
    </div>
  );
}
