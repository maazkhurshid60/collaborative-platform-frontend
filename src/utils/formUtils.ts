export const generateFormHtml = (doc: any): string => {
  let schema = doc.schema;
  if (typeof schema === "string") {
    try {
      schema = JSON.parse(schema);
    } catch (e) {
      console.error("Invalid form schema JSON:", e);
      return "<p>Error: Invalid form schema.</p>";
    }
  }
  if (!schema || !schema.fields) {
    return "<p>Error: Invalid form schema.</p>";
  }

  // Load Google Fonts (Inter & Great Vibes) for premium rendering
  let html = `
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; box-sizing: border-box; text-align: left; padding: 20px;">
      <div style="height: 4px; background-color: #0F9282; border-radius: 4px 4px 0 0; margin-bottom: 24px;"></div>
      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">${doc.title || "Form Template"}</h1>
        ${doc.description ? `<p style="font-size: 13.5px; color: #6b7280; margin: 8px 0 0 0; line-height: 1.5;">${doc.description}</p>` : ""}
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px;">
  `;

  const fieldsArray = Array.isArray(schema.fields)
    ? schema.fields
    : Object.values(schema.fields);

  fieldsArray.forEach((field: any) => {
    html += `<div>`;
    if (field.type === "heading") {
      const level = field.level || 2;
      let headingStyle = "";
      if (level === 1) {
        headingStyle = "font-size: 20px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-top: 16px; margin-bottom: 8px;";
      } else if (level === 2) {
        headingStyle = "font-size: 18px; font-weight: 600; color: #1f2937; margin-top: 14px; margin-bottom: 6px;";
      } else if (level === 3) {
        headingStyle = "font-size: 16px; font-weight: 600; color: #374151; margin-top: 12px; margin-bottom: 4px;";
      } else if (level === 4) {
        headingStyle = "font-size: 14px; font-weight: 600; color: #4b5563; margin-top: 10px; margin-bottom: 4px;";
      } else if (level === 5) {
        headingStyle = "font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 10px; margin-bottom: 4px;";
      } else {
        headingStyle = "font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 10px; margin-bottom: 4px;";
      }
      html += `<h${level} style="${headingStyle} margin-left: 0; margin-right: 0;">${field.text || ""}</h${level}>`;
    } else if (field.type === "paragraph") {
      html += `<p style="font-size: 13.5px; color: #4b5563; line-height: 1.6; margin: 0 0 12px 0; text-align: justify; white-space: pre-wrap;">${field.text || ""}</p>`;
    } else if (field.type === "list") {
      html += `<ul style="margin: 0 0 12px 0; padding: 0 0 0 20px; list-style-type: disc;">`;
      field.items?.forEach((item: string) => {
        html += `<li style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 4px; padding-left: 2px;">${item}</li>`;
      });
      html += `</ul>`;
    } else if (field.type === "text") {
      html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Text Input"}</label>
          <div style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb; color: #9ca3af; min-height: 38px; line-height: 1.4;">(Empty)</div>
        </div>
      `;
    } else if (field.type === "date") {
      html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Date"}</label>
          <div style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb; color: #9ca3af; min-height: 38px; line-height: 1.4;">YYYY-MM-DD</div>
        </div>
      `;
    } else if (field.type === "checkbox-group") {
      html += `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <label style="
        display:block;
        font-size:12px;
        font-weight:600;
        color:#374151;
      ">
        ${field.label || "Options"}
      </label>

      <div style="
        border:1px solid #e5e7eb;
        border-radius:8px;
        background-color:#f9fafb;
        padding:12px;
        display:flex;
        flex-flow:row wrap;
        gap:10px 24px;
        box-sizing:border-box;
      ">
  `;

      field.options?.forEach((opt: string) => {
        html += `
      <div style="
        display:flex;
        align-items:center;
        gap:8px;
        line-height:1.4;
      ">
        <span style="
          width:14px;
          height:14px;
          min-width:14px;
          border:1.5px solid #6b7280;
          border-radius:3px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:#fff;
          box-sizing:border-box;
        "></span>

        <span style="
          font-size:13px;
          color:#374151;
          line-height:1.4;
        ">
          ${opt}
        </span>
      </div>
    `;
      });

      html += `</div></div>`;
    } else if (field.type === "boolean") {
      html += `
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      margin-top:4px;
    ">
      <span style="
        width:14px;
        height:14px;
        min-width:14px;
        border:1.5px solid #6b7280;
        border-radius:3px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background:#fff;
        box-sizing:border-box;
      "></span>

      <span style="
        font-size:13px;
        color:#374151;
        line-height:1.4;
        font-weight:500;
      ">
        ${field.label || "I agree"}
      </span>
    </div>
  `;
    } else if (field.type === "signature") {
      html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Signature"}</label>
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 16px; max-width: 320px; box-sizing: border-box;">
            <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-sizing: border-box;">
              <span style="font-family: 'Great Vibes', 'Playball', 'Georgia', cursive; font-size: 24px; font-weight: normal; color: #94a3b8; font-style: italic;">${field.label || "Signature Preview"}</span>
              <div style="border-top: 1px solid #f1f5f9; margin-top: 8px; padding-top: 6px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Certified E-Signature Preview</div>
            </div>
          </div>
        </div>
      `;
    }
    html += `</div>`;
  });
  html += `</div></div>`;

  return html;
};

export const generateSubmittedFormHtml = (
  doc: any,
  submissionData: any,
  signature: string | null,
): string => {
  let schema = doc.schema;
  if (typeof schema === "string") {
    try {
      schema = JSON.parse(schema);
    } catch (e) {
      console.error("Invalid form schema JSON:", e);
      return "<p>Error: Invalid form schema.</p>";
    }
  }
  if (!schema || !schema.fields) {
    return "<p>Error: Invalid form schema.</p>";
  }

  // Load Google Fonts (Inter & Great Vibes) for premium rendering
  let html = `
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; box-sizing: border-box; text-align: left; padding: 20px;">
      <div style="height: 4px; background-color: #0F9282; border-radius: 4px 4px 0 0; margin-bottom: 24px;"></div>
      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">${doc.title || "Form Template"}</h1>
        ${doc.description ? `<p style="font-size: 13.5px; color: #6b7280; margin: 8px 0 0 0; line-height: 1.5;">${doc.description}</p>` : ""}
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px;">
  `;

  const fieldsArray = Array.isArray(schema.fields)
    ? schema.fields
    : Object.values(schema.fields);

  fieldsArray.forEach((field: any) => {
    html += `<div>`;
    if (field.type === "heading") {
      const level = field.level || 2;
      let headingStyle = "";
      if (level === 1) {
        headingStyle = "font-size: 20px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-top: 16px; margin-bottom: 8px;";
      } else if (level === 2) {
        headingStyle = "font-size: 18px; font-weight: 600; color: #1f2937; margin-top: 14px; margin-bottom: 6px;";
      } else if (level === 3) {
        headingStyle = "font-size: 16px; font-weight: 600; color: #374151; margin-top: 12px; margin-bottom: 4px;";
      } else if (level === 4) {
        headingStyle = "font-size: 14px; font-weight: 600; color: #4b5563; margin-top: 10px; margin-bottom: 4px;";
      } else if (level === 5) {
        headingStyle = "font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 10px; margin-bottom: 4px;";
      } else {
        headingStyle = "font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 10px; margin-bottom: 4px;";
      }
      html += `<h${level} style="${headingStyle} margin-left: 0; margin-right: 0;">${field.text || ""}</h${level}>`;
    } else if (field.type === "paragraph") {
      html += `<p style="font-size: 13.5px; color: #4b5563; line-height: 1.6; margin: 0 0 12px 0; text-align: justify; white-space: pre-wrap;">${field.text || ""}</p>`;
    } else

      if (field.type === "list") {
        html += `
    <div style="
      display:flex;
      flex-direction:column;
      gap:6px;
      margin:0 0 12px 0;
    ">
  `;

        field.items?.forEach((item: string) => {
          html += `
      <div style="
        display:flex;
        align-items:flex-start;
        gap:8px;
        line-height:1.5;
      ">
        <span style="
          font-size:16px;
          line-height:1;
          color:#6b7280;
          margin-top:1px;
          flex-shrink:0;
        ">
          •
        </span>

        <span style="
          font-size:13px;
          color:#4b5563;
        ">
          ${item}
        </span>
      </div>
    `;
        });

        html += `</div>`;
      } else if (field.type === "text") {
        const value = submissionData?.[field.id] || "";
        html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Text Input"}</label>
          <div style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb; color: #1f2937; min-height: 38px; line-height: 1.4;">${value || "&mdash;"}</div>
        </div>
      `;
      } else if (field.type === "date") {
        const value = submissionData?.[field.id] || "";
        html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Date"}</label>
          <div style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb; color: #1f2937; min-height: 38px; line-height: 1.4;">${value || "&mdash;"}</div>
        </div>
      `;
      } else if (field.type === "checkbox-group") {

        html += `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <label style="
        display:block;
        font-size:12px;
        font-weight:600;
        color:#374151;
      ">
        ${field.label || "Options"}
      </label>

      <div style="
        border:1px solid #e5e7eb;
        border-radius:8px;
        background-color:#f9fafb;
        padding:12px;
        display:flex;
        flex-flow:row wrap;
        gap:10px 24px;
        box-sizing:border-box;
      ">
  `;

        field.options?.forEach((opt: string) => {
          const submittedOpts = submissionData?.[field.id];

          const isChecked = Array.isArray(submittedOpts)
            ? submittedOpts.includes(opt)
            : submittedOpts === opt ||
            (typeof submittedOpts === "object" &&
              submittedOpts?.[opt]);

          html += `
      <div style="
        display:flex;
        align-items:center;
        gap:8px;
        line-height:1.4;
      ">
        <span style="
          width:14px;
          height:14px;
          min-width:14px;
          border:1.5px solid #6b7280;
          border-radius:3px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          font-size:11px;
          font-weight:bold;
          color:#111827;
          background:#fff;
          box-sizing:border-box;
        ">
          ${isChecked ? "✓" : ""}
        </span>

        <span style="
          font-size:13px;
          color:#374151;
          line-height:1.4;
        ">
          ${opt}
        </span>
      </div>
    `;
        });

        html += `</div></div>`;
      } else if (field.type === "boolean") {
        const checked = submissionData?.[field.id];

        html += `
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      margin-top:4px;
    ">
      <span style="
        width:14px;
        height:14px;
        min-width:14px;
        border:1.5px solid #6b7280;
        border-radius:3px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        font-size:11px;
        font-weight:bold;
        color:#111827;
        background:#fff;
        box-sizing:border-box;
      ">
        ${checked ? "✓" : ""}
      </span>

      <span style="
        font-size:13px;
        color:#374151;
        line-height:1.4;
        font-weight:500;
      ">
        ${field.label || "I agree"}
      </span>
    </div>
  `;
      } else if (field.type === "signature") {
        const signatureValue = submissionData?.[field.id] || signature || "";
        html += `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151;">${field.label || "Signature"}</label>
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 16px; max-width: 320px; box-sizing: border-box;">
      `;
        if (signatureValue) {
          const isImage =
            signatureValue.startsWith("data:") ||
            signatureValue.startsWith("http://") ||
            signatureValue.startsWith("https://");
          html += `
          <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-sizing: border-box;">
        `;
          if (isImage) {
            html += `<img src="${signatureValue}" style="max-width: 280px; max-height: 80px; object-fit: contain; display: block;" />`;
          } else {
            html += `<span style="font-family: 'Great Vibes', 'Playball', 'Georgia', cursive; font-size: 32px; font-weight: normal; color: #1e293b; font-style: italic;">${signatureValue}</span>`;
          }
          html += `
            <div style="border-top: 1px solid #f1f5f9; margin-top: 8px; padding-top: 6px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Certified E-Signature</div>
          </div>
        `;
        } else {
          html += `
          <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; min-height: 80px; display: flex; justify-content: center; align-items: center; color: #94a3b8; font-size: 12px;">
            Signature (Not Provided)
          </div>
        `;
        }
        html += `</div></div>`;
      }
    html += `</div>`;
  });
  html += `</div></div>`;

  return html;
};
