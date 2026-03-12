import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const persona = {
  name: "Minh — Music Producer / Indie Artist",
  avatar: "🎧",
  desc: "Có bài nhạc muốn làm MV, quen dùng AI tools, biết prompt, nhưng không phải developer",
};

const beforeSteps = [
  {
    id: 1,
    phase: "ANALYZE",
    time: "~45 phút",
    title: "Tự phân tích nhạc + viết prompt context",
    what: "Dùng ChatGPT để describe cảm xúc bài nhạc. Nghe tay, ghi timestamp thủ công. Paste lyrics vào Claude hỏi về mood & themes. Tự tổng hợp lại thành một doc để dùng làm context cho các bước sau.",
    friction: [
      "Phân tích cảm xúc bằng tay, không có waveform/BPM data thực",
      "Context doc tự tạo — inconsistent, dễ miss detail",
      "Mỗi tool không biết kết quả của tool kia",
    ],
    tools: ["ChatGPT (phân tích lyrics/mood)", "Claude (ideation)", "Notepad / Notion (ghi tay)"],
    quote: '"ChatGPT nói mood là melancholic... Claude nói nostalgic... tôi tự chọn cái nào hợp hơn"',
    color: "#ff6b6b",
    icon: "🎵",
  },
  {
    id: 2,
    phase: "CONCEPT",
    time: "~1–2 giờ",
    title: "Brainstorm storyline & storyboard",
    what: "Chat với Claude/ChatGPT để ra storyline. Phải copy-paste context doc vào mỗi chat mới. Hỏi nhiều lần, chọn lọc thủ công. Dùng ChatGPT gen image prompts cho từng scene. Tự quyết định scene nào match timestamp nào.",
    friction: [
      "Không có memory giữa các session — phải re-paste context liên tục",
      "Storyline & storyboard là 2 conversation khác nhau, dễ lạc",
      "Không có cách visual hóa kết quả trên timeline ngay lập tức",
    ],
    tools: ["Claude (storyline)", "ChatGPT (scene breakdown)", "Google Docs (organize)"],
    quote: '"Viết được storyline hay rồi, nhưng giờ phải bắt đầu lại conversation mới để làm storyboard..."',
    color: "#ffa94d",
    icon: "💭",
  },
  {
    id: 3,
    phase: "VISUAL",
    time: "~2–4 giờ",
    title: "Gen ảnh storyboard — từng cảnh một",
    what: "Dùng Midjourney hoặc Flux để gen ảnh cho từng scene. Phải craft prompt riêng cho mỗi ảnh. Chạy nhiều lần vì style không nhất quán. Manually check từng ảnh có consistent character không. Re-roll nhiều lần.",
    friction: [
      "Style drift giữa các scene — cùng character nhưng trông khác nhau",
      "Không có shared style seed/reference giữa các image gen",
      "Mỗi ảnh ~5–10 prompts thử mới ưng — 16 scene = hàng trăm attempts",
    ],
    tools: ["Midjourney / Flux / DALL-E", "Discord bot", "Tự prompt từng cảnh"],
    quote: '"Scene 1 và scene 8 cùng nhân vật nhưng trông như 2 người khác nhau..."',
    color: "#cc5de8",
    icon: "🎨",
  },
  {
    id: 4,
    phase: "VIDEO",
    time: "~3–6 giờ",
    title: "Gen video clips — orchestrate thủ công",
    what: "Export ảnh từ Midjourney → Upload lên Kling/Runway làm i2v. Viết motion prompt cho từng clip. Chờ render (5–15 phút/clip). Download, xem, nếu không ưng thì prompt lại. Lặp lại cho 10–16 scenes. Không có context chung giữa các clip.",
    friction: [
      "Kling/Runway không biết gì về nhạc — motion không sync beat",
      "Phải manually quản lý file: scene1_v1.mp4, scene1_v2.mp4...",
      "Không có timeline preview để thấy toàn bộ MV trông như thế nào",
    ],
    tools: ["Kling / Runway / Pika", "File manager", "Viết motion prompt tay"],
    quote: '"16 clips, mỗi clip 3–4 attempts. Folder của tôi có 50 file mp4 không biết cái nào dùng..."',
    color: "#339af0",
    icon: "🎬",
  },
  {
    id: 5,
    phase: "EDIT",
    time: "~3–5 giờ",
    title: "Edit, sync, assemble — tự dựng",
    what: "Import tất cả clip vào CapCut/Premiere. Kéo tay từng clip vào đúng timestamp. Sync beat bằng mắt và tai. Thêm transition, text, effects thủ công. Export thử, xem lại, sửa, export lại.",
    friction: [
      "Không có AI nào giúp sync beat tự động trong bước này",
      "Color grading không nhất quán vì clip từ nhiều nguồn khác nhau",
      "Mỗi lần muốn thay 1 scene phải làm lại từ bước gen image",
    ],
    tools: ["CapCut / Premiere", "DaVinci (color)", "Tay + tai để sync"],
    quote: '"Đây là bước tốn thời gian nhất. Và nếu tôi muốn đổi scene 5 thì phải quay lại từ đầu..."',
    color: "#51cf66",
    icon: "✂️",
  },
];

const afterSteps = [
  {
    id: 1,
    phase: "ANALYZE",
    time: "< 2 phút",
    title: "Upload nhạc → Agent tự build context",
    what: "Upload file nhạc. MCP Music Analysis skill tự chạy: trích xuất BPM, key, waveform, segment structure (intro/verse/chorus), emotion curve theo timestamp. Output là structured data dùng cho toàn bộ pipeline — không cần user làm gì.",
    value: [
      "Context được build từ data thực, không phải cảm nhận chủ quan",
      "Tất cả agents downstream đều share cùng 1 music context",
      "Timeline editor hiển thị ngay emotion map & segment markers",
    ],
    tools: ["MCP: Music Analysis", "Waveform parser", "Emotion segmentation model"],
    quote: '"Nó phát hiện ra 3 emotional peaks mà tôi không chú ý khi nghe — và đề xuất đặt scene climax đúng chỗ đó"',
    color: "#74c0fc",
    icon: "🎵",
    good: true,
  },
  {
    id: 2,
    phase: "CONCEPT",
    time: "10–15 phút",
    title: "Input intent → Agent gen storyline + scene map",
    what: "User nhập: character reference, bối cảnh mong muốn, prompt ý tưởng sơ bộ. Concept Agent (powered by Claude) dùng music context + user input để gen 3 storyline options với scene breakdown đã được map sẵn vào timestamp nhạc. User chọn hoặc mix.",
    value: [
      "Storyline được gen ra đã gắn với structure nhạc — không phải viết chung chung",
      "Không cần copy-paste context — agent nhớ toàn bộ",
      "3 options với tone khác nhau để chọn hoặc lấy ý tưởng",
    ],
    tools: ["Claude Agent (concept)", "Music context binding", "Scene-timestamp mapper"],
    quote: '"3 storyline options, mỗi cái đều có breakdown rõ ràng: scene X ở timestamp Y vì đây là đoạn chorus—tôi chỉ cần chọn"',
    color: "#a9e34b",
    icon: "💭",
    good: true,
  },
  {
    id: 3,
    phase: "VISUAL",
    time: "15–20 phút",
    title: "Auto storyboard — consistent style, toàn bộ MV",
    what: "Image Agent nhận scene breakdown + character ref + style preference → gen toàn bộ storyboard với shared style seed. Mọi scene dùng consistent character appearance và visual language. Kết quả hiển thị trên timeline editor, user có thể swap từng scene.",
    value: [
      "Style consistency được đảm bảo bởi shared seed — không cần check tay",
      "User chỉ cần approve hoặc yêu cầu regenerate scene cụ thể",
      "Thấy toàn bộ visual flow trước khi gen video",
    ],
    tools: ["Image Gen Agent (Flux/SD)", "Style consistency layer", "Timeline preview UI"],
    quote: '"16 ảnh, cùng nhân vật, cùng màu sắc, cùng mood — lần đầu tiên tôi thấy MV của mình trước khi nó tồn tại"',
    color: "#ffd43b",
    icon: "🎨",
    good: true,
  },
  {
    id: 4,
    phase: "VIDEO",
    time: "20–30 phút (render parallel)",
    title: "Video Agent gen clips — music-aware motion",
    what: "Video Agent nhận storyboard + music data → tự craft motion prompts có tính đến nhịp nhạc (slow motion ở đoạn quiet, dynamic motion ở chorus). Gửi batch sang Kling/Runway qua MCP. Clips được render song song, tự động organized theo scene ID.",
    value: [
      "Motion được design để phù hợp với energy của nhạc — không phải random",
      "Parallel rendering: 16 clips chạy cùng lúc thay vì nối đuôi nhau",
      "Files tự được đặt tên và gắn vào đúng slot trên timeline",
    ],
    tools: ["MCP: Kling / Runway connector", "Music-aware motion planner", "Parallel job orchestration"],
    quote: '"Tôi bấm Generate All rồi đi pha cà phê. Quay lại thấy 16 clips đã xong và đang preview trên timeline"',
    color: "#ff922b",
    icon: "🎬",
    good: true,
  },
  {
    id: 5,
    phase: "EDIT",
    time: "10–15 phút",
    title: "Review trên timeline → Iterate by exception",
    what: "Toàn bộ clips đã được auto-assembled trên timeline với nhạc. Beat sync đã được tính khi gen. User review, chỉ cần flag cảnh nào không ưng → Re-gen scene đó (không ảnh hưởng cảnh khác). Apply color grade, effects, lyric animation bằng 1-click preset. Export.",
    value: [
      "Chỉ sửa cái cần sửa — không làm lại từ đầu",
      "Re-gen 1 scene giữ nguyên context — character & style không bị drift",
      "Export đa platform (YouTube / TikTok / Instagram) tự động optimize",
    ],
    tools: ["Timeline editor", "Scene re-gen (isolated)", "Color + effects presets", "Multi-platform export"],
    quote: '"Tôi chỉ đổi 2 cảnh và chỉnh màu một chút. 15 phút sau có MV hoàn chỉnh trông pro hơn tôi tưởng"',
    color: "#20c997",
    icon: "✂️",
    good: true,
  },
];

const frictionSummary = [
  {
    category: "Context sharing",
    before: "User tự copy-paste context giữa ChatGPT, Claude, Kling, Midjourney",
    after: "Shared music context object — tất cả agents đều nhìn thấy cùng 1 source of truth",
  },
  {
    category: "Style consistency",
    before: "Manually check từng ảnh/clip, re-prompt nhiều lần, vẫn có drift",
    after: "Shared style seed + character embedding → tự động nhất quán",
  },
  {
    category: "Music-visual sync",
    before: "Không có tool nào biết về nhạc khi gen visual — sync hoàn toàn thủ công",
    after: "Music context bind vào mọi bước gen — motion & timing tự align với beat",
  },
  {
    category: "File management",
    before: "Tự đặt tên, tự sắp xếp, tự nhớ cái nào là cái nào",
    after: "Scene ID system — mọi asset tự organize theo pipeline",
  },
  {
    category: "Iteration cost",
    before: "Đổi 1 scene = làm lại toàn bộ chain từ bước đó",
    after: "Re-gen isolated scene — không ảnh hưởng gì khác",
  },
  {
    category: "Orchestration",
    before: "User là 'keo dính' — tự copy output tool này làm input tool kia",
    after: "Agent orchestration + MCP connectors xử lý toàn bộ handoff",
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const phaseColors = {
  ANALYZE: "#74c0fc",
  CONCEPT: "#a9e34b",
  VISUAL: "#ffd43b",
  VIDEO: "#ff922b",
  EDIT: "#20c997",
};

const StepCard = ({ step, side }) => {
  const [expanded, setExpanded] = useState(false);
  const isGood = step.good;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${step.color}12, ${step.color}06)`,
        border: `1px solid ${step.color}35`,
        borderLeft: `4px solid ${step.color}`,
        borderRadius: "12px",
        padding: "18px 20px",
        marginBottom: "14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: step.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            flexShrink: 0,
          }}
        >
          {step.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                background: phaseColors[step.phase] + "30",
                color: phaseColors[step.phase],
                border: `1px solid ${phaseColors[step.phase]}50`,
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "4px",
                letterSpacing: "0.5px",
              }}
            >
              {step.phase}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: step.color,
                fontWeight: "600",
                background: `${step.color}20`,
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              ⏱ {step.time}
            </span>
          </div>
          <h3
            style={{
              margin: "6px 0 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#1a1a2e",
              lineHeight: 1.4,
            }}
          >
            {step.title}
          </h3>
        </div>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", flexShrink: 0 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${step.color}25` }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#444", lineHeight: 1.7 }}>
            {step.what}
          </p>

          {/* Friction or Value */}
          <div
            style={{
              background: isGood ? "rgba(32,201,151,0.08)" : "rgba(255,107,107,0.08)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: isGood ? "#20c997" : "#ff6b6b",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              {isGood ? "✅ GIÁ TRỊ MANG LẠI" : "⚡ FRICTION POINTS"}
            </div>
            {(step.friction || step.value).map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "6px",
                  fontSize: "12px",
                  color: "#555",
                  lineHeight: 1.5,
                }}
              >
                <span>{isGood ? "→" : "×"}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(0,0,0,0.04)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#666",
              fontStyle: "italic",
              borderLeft: `3px solid ${step.color}70`,
              marginBottom: "12px",
            }}
          >
            {step.quote}
          </div>

          {/* Tools */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {step.tools.map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                  padding: "3px 8px",
                  color: "#555",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("compare");
  const [showFriction, setShowFriction] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a3e 0%, #2d1b69 50%, #1e1b4b 100%)",
          padding: "40px 28px 36px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 0%, rgba(139,92,246,0.2) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "11px",
              color: "#a78bfa",
              fontWeight: "600",
              letterSpacing: "0.5px",
              marginBottom: "16px",
            }}
          >
            🎬 MV AGENT — USER SCENARIO RESEARCH
          </div>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: "800", margin: "0 0 10px", lineHeight: 1.3 }}>
            User đang dùng AI tools thủ công<br />
            <span style={{ color: "#a78bfa" }}>vs</span> AI Agent orchestration
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", margin: "0 0 24px", maxWidth: "560px", lineHeight: 1.7 }}>
            Cả 2 kịch bản đều dùng AI. Điểm khác biệt: ai đang làm "keo dính" giữa các tools — <strong style={{ color: "rgba(255,255,255,0.8)" }}>user hay hệ thống?</strong>
          </p>

          {/* Persona */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "10px 16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>{persona.avatar}</span>
            <div>
              <div style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{persona.name}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{persona.desc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "20px 28px 0", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
          {[
            { id: "compare", label: "⇄ So sánh" },
            { id: "before", label: "🛠 Trước — Tự orchestrate AI" },
            { id: "after", label: "🤖 Sau — Agentic system" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: view === t.id ? "#a78bfa" : "rgba(255,255,255,0.12)",
                background: view === t.id ? "rgba(139,92,246,0.25)" : "transparent",
                color: view === t.id ? "#a78bfa" : "rgba(255,255,255,0.5)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "16px 28px 40px", maxWidth: "900px", margin: "0 auto" }}>

        {/* COMPARE */}
        {view === "compare" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", textAlign: "center" }}>
                <div style={{ color: "#ff6b6b", fontWeight: "700", fontSize: "13px" }}>🛠 Tự orchestrate AI tools</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "4px" }}>ChatGPT + Claude + Kling + Midjourney + CapCut</div>
                <div style={{ color: "#ff6b6b", fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>~8–15 giờ</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>User làm keo dính giữa các tools</div>
              </div>
              {beforeSteps.map((s, i) => <StepCard key={s.id} step={s} index={i} />)}
            </div>
            <div>
              <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", textAlign: "center" }}>
                <div style={{ color: "#a78bfa", fontWeight: "700", fontSize: "13px" }}>🤖 Agentic MV System</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "4px" }}>Agent orchestration + MCP + Shared context</div>
                <div style={{ color: "#a78bfa", fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>~60–90 phút</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>System làm keo dính, user chỉ review</div>
              </div>
              {afterSteps.map((s, i) => <StepCard key={s.id} step={s} index={i} />)}
            </div>
          </div>
        )}

        {/* BEFORE ONLY */}
        {view === "before" && (
          <div style={{ maxWidth: "560px" }}>
            <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px" }}>
              <div style={{ color: "#ff6b6b", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>🛠 Tự orchestrate AI tools</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", lineHeight: 1.7 }}>
                User có kiến thức AI tools, biết prompt, nhưng phải tự mình làm "integration layer" — copy output của tool này làm input của tool kia, maintain context thủ công, và handle mọi inconsistency.
              </div>
            </div>
            {beforeSteps.map((s, i) => <StepCard key={s.id} step={s} index={i} />)}
          </div>
        )}

        {/* AFTER ONLY */}
        {view === "after" && (
          <div style={{ maxWidth: "560px" }}>
            <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px" }}>
              <div style={{ color: "#a78bfa", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>🤖 Agentic MV System</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", lineHeight: 1.7 }}>
                Cùng các AI tools đó (Claude, Kling, Flux...) nhưng được orchestrate bởi agent layer với shared context, MCP connectors, và skills. User chỉ làm 2 việc: <strong style={{ color: "rgba(255,255,255,0.8)" }}>input intent và review output.</strong>
              </div>
            </div>
            {afterSteps.map((s, i) => <StepCard key={s.id} step={s} index={i} />)}
          </div>
        )}

        {/* Friction Analysis */}
        <div style={{ marginTop: "28px" }}>
          <button
            onClick={() => setShowFriction(!showFriction)}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🔍 Bảng tóm tắt: Các friction cụ thể mà agentic system giải quyết</span>
            <span>{showFriction ? "▲" : "▼"}</span>
          </button>

          {showFriction && (
            <div
              style={{
                marginTop: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {frictionSummary.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 1fr",
                    gap: "0",
                    borderBottom: i < frictionSummary.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.04)", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.6)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center" }}>
                    {row.category}
                  </div>
                  <div style={{ padding: "14px 16px", borderRight: "1px solid rgba(255,255,255,0.06)", fontSize: "12px", color: "rgba(255,107,107,0.8)", lineHeight: 1.6 }}>
                    {row.before}
                  </div>
                  <div style={{ padding: "14px 16px", fontSize: "12px", color: "rgba(139,92,246,0.9)", lineHeight: 1.6 }}>
                    {row.after}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
