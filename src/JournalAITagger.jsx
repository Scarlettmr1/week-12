import { useState } from "react";

const MOODS = {
  joyful: { color: "#C0DD97", text: "#3B6D11", label: "Joyful" },
  anxious: { color: "#FAC775", text: "#854F0B", label: "Anxious" },
  reflective: { color: "#B5D4F4", text: "#0C447C", label: "Reflective" },
  sad: { color: "#B5D4F4", text: "#185FA5", label: "Sad" },
  grateful: { color: "#9FE1CB", text: "#0F6E56", label: "Grateful" },
  frustrated: { color: "#F5C4B3", text: "#993C1D", label: "Frustrated" },
  excited: { color: "#C0DD97", text: "#27500A", label: "Excited" },
  neutral: { color: "#D3D1C7", text: "#444441", label: "Neutral" },
};

const SAMPLES = [
  "Today I finally finished the project I've been working on for weeks. My hands were shaking when I hit submit. I don't know if it's good enough, but I'm proud that I did it. Called my mom after and she said she was proud of me, which made me cry a little.",
  "Missed the bus again. Then spilled coffee on my shirt right before the meeting. Nobody noticed, or if they did they were polite enough not to say anything. Just one of those days where everything feels slightly off.",
  "Went hiking at Wekiva Springs today. The water was so clear and cold, perfect for the heat. My dog absolutely lost his mind — it was the best $8 I've ever spent. Feeling really lucky to live near something so beautiful.",
];

export default function JournalAITagger() {
  const [entry, setEntry] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyzeEntry() {
    if (!entry.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `Analyze this journal entry and respond ONLY with a JSON object (no markdown, no preamble):

{
  "mood": "<one word from: joyful, anxious, reflective, sad, grateful, frustrated, excited, neutral>",
  "summary": "<one sentence capturing the essence of the entry>",
  "themes": ["<theme1>", "<theme2>", "<theme3>"],
  "energy": <number 1-10>,
  "insight": "<one thoughtful observation about the writer based on this entry>"
}

Journal entry:
"""
${entry}
"""`;

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          stream: false,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const raw = data.message?.content || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong analyzing your entry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const moodStyle = result?.mood ? MOODS[result.mood] || MOODS.neutral : null;
  const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0;

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 680, margin: "0 auto", padding: "2rem 1rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500&display=swap');
        .ai-tagger * { box-sizing: border-box; }
        .ai-tagger textarea {
          width: 100%;
          min-height: 180px;
          border: 1px solid #D3D1C7;
          border-radius: 8px;
          padding: 14px 16px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          resize: vertical;
          color: var(--color-text-primary);
          background: var(--color-background-primary);
          transition: border-color 0.15s;
          outline: none;
        }
        .ai-tagger textarea:focus { border-color: #888780; }
        .ai-tagger textarea::placeholder { color: var(--color-text-tertiary); }
        .analyze-btn {
          background: var(--color-text-primary);
          color: var(--color-background-primary);
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
          letter-spacing: 0.02em;
        }
        .analyze-btn:hover:not(:disabled) { opacity: 0.8; }
        .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sample-btn {
          background: none;
          border: 1px solid var(--color-border-tertiary);
          border-radius: 4px;
          padding: 4px 10px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 12px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .sample-btn:hover { border-color: var(--color-border-primary); color: var(--color-text-primary); }
        .theme-tag {
          display: inline-block;
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border-tertiary);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 13px;
          font-family: 'Source Sans 3', sans-serif;
          color: var(--color-text-secondary);
          margin: 4px 4px 4px 0;
        }
        .result-card {
          border: 1px solid var(--color-border-tertiary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          background: var(--color-background-primary);
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .energy-bar-fill {
          height: 6px;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid transparent;
          border-top-color: var(--color-background-primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ai-tagger">
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 4px",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em"
          }}>
            Journal Analyzer
          </h1>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 14,
            color: "var(--color-text-secondary)",
            margin: 0,
            fontWeight: 300
          }}>
            AI-powered mood &amp; theme analysis — real API call via Anthropic
          </p>
        </div>

        <div style={{ marginBottom: 8 }}>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write or paste a journal entry here…"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "var(--color-text-tertiary)" }}>
              Try a sample:
            </span>
            {SAMPLES.map((s, i) => (
              <button key={i} className="sample-btn" onClick={() => setEntry(s)}>
                #{i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {wordCount > 0 && (
              <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "var(--color-text-tertiary)" }}>
                {wordCount} words
              </span>
            )}
            <button
              className="analyze-btn"
              onClick={analyzeEntry}
              disabled={loading || !entry.trim()}
            >
              {loading ? <><span className="spinner" />Analyzing…</> : "Analyze entry"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: "var(--color-background-danger)",
            border: "1px solid var(--color-border-danger)",
            borderRadius: 8,
            padding: "10px 14px",
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 14,
            color: "var(--color-text-danger)"
          }}>
            {error}
          </div>
        )}

        {result && (
          <div className="result-card fade-in">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 6 }}>
                  Detected mood
                </div>
                {moodStyle && (
                  <span style={{
                    display: "inline-block",
                    background: moodStyle.color,
                    color: moodStyle.text,
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                  }}>
                    {moodStyle.label}
                  </span>
                )}
              </div>

              <div style={{ minWidth: 140 }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 6 }}>
                  Energy level
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, background: "var(--color-background-tertiary)", borderRadius: 3, height: 6 }}>
                    <div
                      className="energy-bar-fill"
                      style={{
                        width: `${(result.energy / 10) * 100}%`,
                        background: result.energy > 6 ? "#639922" : result.energy > 3 ? "#BA7517" : "#A32D2D"
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", minWidth: 24 }}>
                    {result.energy}/10
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>
                Summary
              </div>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontStyle: "italic",
                color: "var(--color-text-primary)",
                margin: 0,
                lineHeight: 1.6
              }}>
                "{result.summary}"
              </p>
            </div>

            {result.themes?.length > 0 && (
              <div style={{ borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>
                  Themes
                </div>
                <div>
                  {result.themes.map((t, i) => (
                    <span key={i} className="theme-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {result.insight && (
              <div style={{ borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "1.25rem" }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>
                  Insight
                </div>
                <p style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  margin: 0,
                  lineHeight: 1.7
                }}>
                  {result.insight}
                </p>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div style={{
            borderTop: "1px solid var(--color-border-tertiary)",
            paddingTop: "1rem",
            marginTop: "0.5rem"
          }}>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              margin: 0,
              lineHeight: 1.6
            }}>
              This app calls the Anthropic API directly — <code style={{ fontFamily: "monospace", fontSize: 11, background: "var(--color-background-secondary)", padding: "1px 5px", borderRadius: 3 }}>POST /v1/messages</code> — to classify mood, extract themes, score energy, and surface an insight. Each button click is a live API call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
