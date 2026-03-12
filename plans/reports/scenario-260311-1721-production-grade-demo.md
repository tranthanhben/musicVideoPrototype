# Production-Grade Demo — Cremi AI Music Video Generator
*Prototype 2: Monitor · Prototype 3: Flow*

**Date:** 2026-03-11 | **Purpose:** Làm prototype trông như sản phẩm thật 100%

---

## PHẦN 1 — ARTIST & SONG IDENTITY

> Mọi thông tin dưới đây là **fictional nhưng realistic** — như thể đây là một sản phẩm thật được người dùng thật sử dụng.

### Artist Profile

```
Name:       Lyra
Full name:  Han So-ra (한소라)
Age:        23
Origin:     Seoul, KR → Los Angeles, CA
Genre:      Dream Pop · Synth R&B · Indie
Label:      Self-released / Monsoon Music
Instagram:  @lyramusic_official — 247K followers
Spotify:    82,400 monthly listeners
```

### Song Metadata

```
Title:      Gravity
File:       lyra_gravity_master_v3.wav
Duration:   3:24 (204 seconds)
BPM:        108
Key:        D minor
Loudness:   -9.2 LUFS
Sample rate: 48kHz / 24-bit WAV

Segments:
  Intro      0:00 – 0:18   (18s)   #6366F1
  Verse 1    0:18 – 0:50   (32s)   #8B5CF6
  Pre-Chorus 0:50 – 1:04   (14s)   #A855F7
  Chorus 1   1:04 – 1:34   (30s)   #EC4899
  Verse 2    1:34 – 2:02   (28s)   #8B5CF6
  Chorus 2   2:02 – 2:30   (28s)   #EC4899
  Bridge     2:30 – 2:52   (22s)   #F59E0B
  Outro      2:52 – 3:24   (32s)   #6366F1

Energy Peaks: 1:04 (chorus), 2:02 (chorus), 2:35 (bridge)
Mood Tags: Dreamy · Romantic · Nostalgic · Cinematic · Uplifting
```

### Song Concept (story of the MV)

> "Gravity" là bài hát về cảm giác yêu nhau làm mất đi trọng lực — thế giới xung quanh tan biến, chỉ còn lại hai người. MV đi theo Lyra qua hai reality song song: thực tế (Seoul streets, Tokyo convenience store, LA rooftop) và cảm xúc nội tâm (vũ trụ, zero gravity, cosmic space). Hai thế giới dần hòa vào nhau khi tình cảm đạt đỉnh.

**Arc:** Cô đơn nhìn lên bầu trời → Nhớ lại kỷ niệm → Mất trọng lực (chorus đầu) → Flashback ấm áp → Đỉnh điểm cảm xúc (bridge) → Đoàn tụ + giải phóng.

---

## PHẦN 2 — 8 CẢNH PHIM + PROMPTS

> Mỗi cảnh có: **Midjourney prompt** (copy trực tiếp), **DALL-E 3 prompt** (alternative), **Style note**.

**STYLE SEED chung cho tất cả ảnh:**
- Color grade: Kodak Portra 400 film stock look — warm shadows, slightly desaturated greens, creamy skin tones
- Lyra: Young East Asian woman, 23, dark straight hair (shoulder length), dark expressive eyes, petite frame
- Aspect ratio scene cards: 4:3 (1280×960px hoặc 800×600px)

---

### SCENE 1 — "Seoul Rooftop" | INTRO 0:00–0:18

**Story beat:** Lyra đứng một mình trên sân thượng Seoul lúc 2am. Thành phố rực sáng bên dưới. Cô ngước nhìn bầu trời, các ngôi sao bắt đầu nhân lên bất thường.

**Midjourney prompt:**
```
cinematic shot of young East Asian woman standing alone on seoul rooftop at 2am, city lights glowing below, looking up at star-filled sky, stars multiplying unusually bright, slight mist, back-lit from city glow, wide angle, film grain, Kodak Portra aesthetic, lonely but beautiful, teal shadows warm highlights, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Cinematic film photography of a young East Asian woman, early 20s, dark hair, standing alone on a Seoul rooftop at night. City lights glow far below. She gazes upward at an unusually bright starry sky. Atmospheric mist. Warm ambient city light on her back. Film grain. Kodak Portra 400 color palette — warm shadows, creamy tones. Wide establishing shot.
```

**Style note:** Scene này là anchor — establish film aesthetic, không quá sci-fi, grounded và real.

---

### SCENE 2 — "Floating Apartment" | VERSE 1 0:18–0:50

**Story beat:** Lyra khiêu vũ chậm một mình trong căn hộ trắng minimalist. Ánh sáng sao chiếu qua cửa sổ tạo pattern trên tường và người cô. Intimate, personal.

**Midjourney prompt:**
```
young East Asian woman dancing slowly alone in minimalist white apartment at night, starlight projected patterns on walls and her body from large floor-to-ceiling windows, soft volumetric light, intimate bedroom-studio, pale wood floors, slow dreamy motion, editorial fashion photography, warm tungsten + cool moonlight mix, film grain, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Editorial fashion photography. Young East Asian woman in minimal white apartment at night, dancing slowly alone. Starlight patterns projected through large windows onto white walls and her body. Warm interior light mixed with cool silver moonlight. Pale wood floors. Dreamy, intimate. Film grain. Kodak Portra tones.
```

**Style note:** Không quá dark, tone ấm. Cảm giác một mình nhưng bình yên, không cô đơn.

---

### SCENE 3 — "First Levitation" | PRE-CHORUS 0:50–1:04

**Story beat:** Lyra bắt đầu nổi lên — chân rời khỏi sàn nhẹ nhàng. Hoa anh đào và cánh hoa khô cũng bay lên xung quanh cô. Biểu cảm ngạc nhiên → chấp nhận.

**Midjourney prompt:**
```
young East Asian woman beginning to levitate off wooden floor, feet just leaving ground, cherry blossom petals and dried leaves floating up around her, soft warm window light, eyes wide with wonder, apartment interior, magical realism, slow shutter motion blur on petals, cinematic, Kodak Portra 400, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Magical realism photography. Young East Asian woman gently levitating — feet just lifted off apartment floor. Cherry blossom petals and dried leaves float upward around her. Expression shifts from surprise to calm acceptance. Soft warm light from windows. Cinematic. Film grain. Warm color palette.
```

**Style note:** Key transition scene — chuyển từ real world sang fantasy. Giữ realistic feel, đừng quá CGI.

---

### SCENE 4 — "Zero Gravity" | CHORUS 1 1:04–1:34

**Story beat:** Cảnh đỉnh cao nhất. Lyra và bạn trai nổi trong vũ trụ đầy hoa anh đào và bụi sao vàng. Golden hour lighting. Romantic và epic đồng thời.

**Midjourney prompt:**
```
two people floating weightless in cosmic space filled with thousands of cherry blossoms and golden stardust, young Asian couple, romantic embrace, warm golden cosmic light, cherry blossoms drifting like stars, ethereal and magical, fashion editorial in space, cinematic wide shot, Kodak Portra warm tones, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Two young people floating together in zero gravity in a cosmic space. Thousands of pink cherry blossoms drift around them like stars mixed with golden stardust. Warm golden light suffuses everything. Romantic embrace. Epic scale. Cinematic fashion editorial. Warm film stock tones.
```

**Style note:** ĐÂY LÀ HERO IMAGE của toàn bộ MV — phải đẹp nhất. Generate nhiều lần, chọn cái đẹp nhất. Có thể thêm `--chaos 20` để có nhiều variation.

---

### SCENE 5 — "Tokyo Convenience Store" | VERSE 2 1:34–2:02

**Story beat:** Flashback. Lyra và bạn trai trong một convenience store ở Shinjuku lúc nửa đêm. Ánh đèn fluorescent ấm. Họ cười đùa bên quầy bánh. Analog warmth — contrast với cảnh cosmic.

**Midjourney prompt:**
```
young Asian couple laughing together inside japanese convenience store at midnight, warm fluorescent lighting on their faces, shelves of colorful snacks and drinks behind them, late night Shinjuku, candid intimate moment, 35mm film photography, slightly overexposed highlights, Kodak Ultramax 400, analog warmth, documentary style, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
35mm film photograph of two young Asian people laughing at the counter of a Japanese convenience store at midnight. Warm fluorescent overhead lighting. Rows of colorful packaged snacks behind them. Intimate, candid, slightly overexposed. Analog Kodak Ultramax warmth. Late-night Shinjuku atmosphere.
```

**Style note:** Cảnh thực tế nhất — contrast mạnh với cosmic scenes. Analog grain nhiều hơn, color pop hơn, overexposed slightly.

---

### SCENE 6 — "LA Rooftop Golden Hour" | CHORUS 2 2:02–2:30

**Story beat:** Rooftop tại LA lúc magic hour. Lyra và bạn trai nhảy cùng nhau. Camera quay vòng quanh họ. Ánh vàng trải rộng khắp. Thế giới xung quanh soft focus như đang tan biến.

**Midjourney prompt:**
```
young Asian couple dancing together on Los Angeles rooftop during golden hour, magic hour warm orange light, city skyline below out of focus, camera orbiting them, her skirt flowing in wind, joyful and free, soft bokeh background, cinematic fashion, Kodak Portra 160 warm tones, lens flare, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Cinematic rooftop dance. Young Asian couple dancing joyfully on LA rooftop at golden hour. Warm orange-gold magic hour light. Soft bokeh city skyline background. Her dress flowing in gentle wind. Camera seems to orbit them. World going soft and beautiful around them. Film grain. Warm Kodak Portra tones. Lens flare.
```

**Style note:** Warm và euphoric. Sky phải có texture (clouds, atmosphere), không blank blue sky.

---

### SCENE 7 — "Center of the Galaxy" | BRIDGE 2:30–2:52

**Story beat:** Lyra một mình ở trung tâm thiên hà đang xoáy. Cô dang tay rộng, đang chấp nhận mọi thứ. Stars explode outward từ cô. Emotional peak.

**Midjourney prompt:**
```
young East Asian woman at center of swirling spiral galaxy, arms extended wide, accepting pose, stars and cosmic dust exploding outward from her figure, dramatic cosmic scale, solo figure tiny against infinite universe, deep violet and gold nebula colors, cinematic wide shot, epic emotional, Hubble photography aesthetic with human figure, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Dramatic cinematic image of a young East Asian woman standing at the center of a massive swirling spiral galaxy. Arms extended, pose of acceptance or release. Cosmic energy and stars radiate outward from her. She is a tiny but powerful figure against infinite scale. Deep violet, cyan, and gold nebula colors. Hubble telescope aesthetic with human element.
```

**Style note:** Cảnh spectacular nhất về scale. Phải cảm nhận được sự nhỏ bé của con người vs vũ trụ.

---

### SCENE 8 — "Stars Falling" | OUTRO 2:52–3:24

**Story beat:** Trở lại sân thượng Seoul từ Scene 1. Lyra đang mỉm cười. Bạn trai xuất hiện bên cạnh. Họ nắm tay nhìn lên. Sao bắt đầu rơi như tuyết. Camera từ từ bay lên.

**Midjourney prompt:**
```
two young Asian people holding hands on seoul rooftop at night, looking up at stars falling like snow, warm smiles, city lights below, stars becoming shooting stars then falling like light snow, wide shot slowly pulling back, bittersweet joy, film grain, cinematic, Kodak Portra warm shadows, magical but real, --ar 4:3 --v 6.1 --style raw --q 2
```

**DALL-E 3 prompt:**
```
Two young people holding hands on a Seoul rooftop at night, looking up at falling stars — stars descending slowly like glowing snowflakes. Warm happy smiles. City below glowing. Camera beginning to pull back for wider view. Magical but emotionally grounded. Film grain. Warm cinematic palette.
```

**Style note:** Bookend với Scene 1 — same location, completely different energy. Resolution cảm xúc.

---

## PHẦN 3 — TAKES (Alternate versions)

> Mỗi take = regenerate cùng prompt với variation nhẹ. Thay `--seed [number]` trong MJ để vary.

### Takes cho Editing View (Monitor prototype)

**Scene 1 — Take 2:**
```
same as scene 1 prompt + add: camera level straight on instead of slight low angle, more city lights visible, less sky --seed 12847
```

**Scene 1 — Take 3:**
```
same as scene 1 prompt + add: extreme wide shot, figure very small on rooftop, city panorama dominates, cinematic skyline --seed 38291
```

**Scene 4 — Take 2 (key scene, có 3 takes):**
```
same as scene 4 prompt + add: closer crop on two faces, more intimate, cherry blossoms in extreme foreground, shallow depth of field --seed 55103
```

**Scene 4 — Take 3:**
```
same as scene 4 prompt + add: ultra wide showing vast cosmic space, couple tiny but centered, overwhelming scale --seed 71846
```

**Scene 7 — Take 2:**
```
same as scene 7 prompt + add: lower angle looking up at her, galaxy spiraling overhead, more dramatic perspective --seed 29341
```

**Scene 8 — Take 2:**
```
same as scene 8 prompt + add: medium close shot showing faces clearly, both looking up, emotional expressions, stars soft in background --seed 84521
```

> Các scene còn lại (2, 3, 5, 6) mỗi cái có 1 take thêm với variation góc nhẹ.

---

## PHẦN 4 — MOOD BOARD IMAGES (9 ảnh)

> Dùng trong Flow Step 5. Tỉ lệ **1:1 square**, 600×600px.

### Color & Palette (3 ảnh)

**mood-color-warm-golden.jpg**
```
[MJ] cinematic close up, golden hour light rays through cosmic dust and nebula, amber rose gold teal colors, dreamy warm tones, no people, abstract beautiful, --ar 1:1 --v 6.1 --style raw
```

**mood-color-cool-cosmic.jpg**
```
[MJ] deep space nebula, electric violet and cyan colors, dark background, bioluminescent quality, abstract cosmic beauty, cold and ethereal, no people, --ar 1:1 --v 6.1 --style raw
```

**mood-color-film-warm.jpg**
```
[MJ] kodak film aesthetic color study, warm amber orange shadows, teal highlights, analog grain texture, abstract color composition, warm nostalgic, --ar 1:1 --v 6.1 --style raw
```

### Mood & Emotion (3 ảnh)

**mood-emotion-melancholic.jpg**
```
[MJ] lone silhouette of person standing on cliff edge, facing vast starry ocean below, small figure huge scale, melancholic beautiful, film grain, blue hour lighting, --ar 1:1 --v 6.1 --style raw
```

**mood-emotion-euphoric.jpg**
```
[MJ] explosion of rainbow light rays and particles from central point, euphoric energy burst, white and gold center, colors radiating outward, joyful abstract, --ar 1:1 --v 6.1 --style raw
```

**mood-emotion-intimate.jpg**
```
[MJ] extreme close up of two people almost touching foreheads, eyes closed, soft warm light between them, intimate connection, shallow depth of field, analog film, --ar 1:1 --v 6.1 --style raw
```

### Scene Context (3 ảnh)

**mood-scene-night-city.jpg**
```
[MJ] tokyo shinjuku street at midnight, rain-slicked pavement reflecting neon signs, warm amber and cool pink neon, cinematic alley perspective, no people, analog film, --ar 1:1 --v 6.1 --style raw
```

**mood-scene-vast-sky.jpg**
```
[MJ] milky way galaxy panorama over dark mountain silhouette, infinite scale, stars reflecting in still lake below, long exposure photography aesthetic, no people, --ar 1:1 --v 6.1 --style raw
```

**mood-scene-intimate-room.jpg**
```
[MJ] cozy minimalist room at night, single lamp warm light, window showing city lights, book on bed, intimate personal space, analog photography, Kodak Portra, --ar 1:1 --v 6.1 --style raw
```

---

## PHẦN 5 — STORYLINE THUMBNAILS (3 ảnh)

> Dùng trong Flow Step 4. Tỉ lệ **16:10**, 800×500px.

**storyline-celestial-journey.jpg** ← storyline được chọn trong demo
```
[MJ] two ethereal figures as light forms meeting in center of colorful nebula, violet and cyan cosmic colors, cinematic wide, romantic cosmic, --ar 16:10 --v 6.1 --style raw
```

**storyline-neon-metropolis.jpg**
```
[MJ] rain-soaked city street at night, neon reflections on wet pavement, dramatic pink and blue lights, cyberpunk energy, cinematic establishing shot, no people, --ar 16:10 --v 6.1 --style raw
```

**storyline-ocean-memory.jpg**
```
[MJ] aerial photography golden hour ocean beach, waves meeting shore, warm amber light, nostalgic melancholic beauty, Kodak film quality, no people, --ar 16:10 --v 6.1 --style raw
```

---

## PHẦN 6 — CHARACTER CARDS (8 ảnh)

> Monitor → Character Setup. Tỉ lệ **1:1**, 400×400px.
> Style: AI-generated character portrait, slightly stylized nhưng photorealistic

**characters/mysterious-singer.jpg**
```
[MJ] portrait of young East Asian woman vocalist, dramatic side lighting, dark moody background, powerful gaze, editorial fashion, deep violet accent light, --ar 1:1 --v 6.1 --style raw
```

**characters/urban-dancer.jpg**
```
[MJ] dynamic portrait of young person in mid-dance pose, urban street background, neon lights, energetic movement blur on edges, hip hop streetwear, confident expression, --ar 1:1 --v 6.1
```

**characters/space-explorer.jpg**
```
[MJ] portrait of astronaut in futuristic suit, visor open, cosmic nebula behind them, soft space lighting on face, adventurous expression, cinematic, --ar 1:1 --v 6.1 --style raw
```

**characters/romantic-couple.jpg**
```
[MJ] cinematic portrait of young Asian couple close together, golden hour light, soft romantic mood, film grain, shallow depth of field, editorial, --ar 1:1 --v 6.1 --style raw
```

**characters/band-group.jpg**
```
[MJ] band of 4 musicians posed together, concert venue backstage, dramatic lighting, cool and confident, rock/indie aesthetic, editorial photography, --ar 1:1 --v 6.1 --style raw
```

**characters/abstract-figure.jpg**
```
[MJ] abstract human silhouette made of light particles and constellation lines, dark background, glowing blue white particles, concept art, --ar 1:1 --v 6.1
```

**characters/anime-hero.jpg**
```
[MJ] anime illustration style character portrait, expressive large eyes, detailed, vibrant colors, dynamic pose, Studio Ghibli quality, digital art, --ar 1:1 --niji 6
```

**characters/nature-spirit.jpg**
```
[MJ] ethereal nature spirit figure, translucent skin with flower petals and leaves woven in, forest light, magical realism photography, otherworldly beauty, --ar 1:1 --v 6.1 --style raw
```

---

## PHẦN 7 — EXPORT FINAL PREVIEW (1 ảnh)

> Flow Step 8 → VFX Export final preview. **16:9**, 1920×1080px.

**export/final-preview.jpg**
```
[MJ] cinematic letterboxed film frame of young Asian woman floating in zero gravity with cherry blossoms, golden cosmic background, professional color grade, subtle film grain, top and bottom black cinema bars, frame looks like high budget music video, rich deep colors, --ar 16:9 --v 6.1 --style raw --q 2
```

> Thêm cinema bars (black bars 2.39:1 ratio) trong Photoshop/Canva sau khi generate.

---

## PHẦN 8 — FOLDER STRUCTURE

```
public/
└── assets/
    ├── scenes/
    │   ├── scene-01-seoul-rooftop.jpg
    │   ├── scene-02-floating-apartment.jpg
    │   ├── scene-03-first-levitation.jpg
    │   ├── scene-04-zero-gravity.jpg          ← hero image
    │   ├── scene-05-tokyo-convenience.jpg
    │   ├── scene-06-la-rooftop-golden.jpg
    │   ├── scene-07-center-of-galaxy.jpg
    │   └── scene-08-stars-falling.jpg
    │
    ├── takes/
    │   ├── scene-01-take-2.jpg
    │   ├── scene-01-take-3.jpg
    │   ├── scene-02-take-2.jpg
    │   ├── scene-03-take-2.jpg
    │   ├── scene-04-take-2.jpg
    │   ├── scene-04-take-3.jpg
    │   ├── scene-05-take-2.jpg
    │   ├── scene-06-take-2.jpg
    │   ├── scene-07-take-2.jpg
    │   ├── scene-08-take-2.jpg
    │   └── scene-08-take-3.jpg
    │
    ├── mood-board/
    │   ├── color-warm-golden.jpg
    │   ├── color-cool-cosmic.jpg
    │   ├── color-film-warm.jpg
    │   ├── mood-melancholic.jpg
    │   ├── mood-euphoric.jpg
    │   ├── mood-intimate.jpg
    │   ├── scene-night-city.jpg
    │   ├── scene-vast-sky.jpg
    │   └── scene-intimate-room.jpg
    │
    ├── storylines/
    │   ├── celestial-journey.jpg
    │   ├── neon-metropolis.jpg
    │   └── ocean-memory.jpg
    │
    ├── characters/
    │   ├── mysterious-singer.jpg
    │   ├── urban-dancer.jpg
    │   ├── space-explorer.jpg
    │   ├── romantic-couple.jpg
    │   ├── band-group.jpg
    │   ├── abstract-figure.jpg
    │   ├── anime-hero.jpg
    │   └── nature-spirit.jpg
    │
    └── export/
        └── final-preview.jpg
```

**Tổng: 41 files**

---

## PHẦN 9 — DEMO INTERACTION SCRIPTS

> Scripts cho các tình huống tương tác — làm prototype trông LIVE và thật.

---

### Script A: REGENERATE SCENE

**Scenario:** User không thích Scene 3, muốn thử lại

**UI Flow:**
1. User click nút "↻ Regenerate" trên Scene 3 card
2. Card chuyển sang loading state: `"Re-prompting with variation seed #2847..."`
3. Activity feed hiện: `› Regenerating Scene 3 — applying variation seed #2847`
4. 2-3 giây sau, ảnh mới xuất hiện (scene-03-take-2.jpg) với animation fade-in
5. Hiện badge nhỏ: `"New generation — 96% consistency"`
6. Nút "Keep this" hoặc "Try again" xuất hiện

**Activity feed messages khi regenerate:**
```
› Regenerating Scene 3 — variation seed #2847
› Flux 1.1 Pro: new prompt dispatched
› Consistency check: style seed CREMI-D4M1-GRAV verified
› Scene 3 (v2) ready — 96% consistency score
```

---

### Script B: TAKE SELECTION trong Editing View

**Scenario:** User đang review Scene 4 (zero gravity — cảnh đẹp nhất), muốn chọn take khác

**UI Flow:**
1. User click vào Scene 4 trong Editing View
2. Panel mở ra hiện 3 takes với thumbnails
3. Take 1: Wide romantic (default)
4. Take 2: Close intimate (closer crop)
5. Take 3: Epic scale (ultra wide)
6. User hover Take 2 → preview lớn hơn
7. User click "Select Take 2"
8. Timeline cập nhật, badge `"Take 2 selected"`

---

### Script C: AI CHAT — "Make it more dramatic"

**Scenario (Monitor prototype):** User gửi message trong chat panel

**User message:**
```
Make the chorus scenes more dramatic, I want more cosmic scale
```

**AI response (text trong chat):**
```
Updating Scenes 4 and 6 for maximum cosmic drama:

• Scene 4 (Zero Gravity): Expanding the cosmic backdrop — deeper space depth,
  more nebula density, increasing cherry blossom density 3×
• Scene 6 (LA Rooftop): Adding subtle city-to-cosmos transition at edges,
  bokeh background replaced with star field bleeding in

Re-dispatching to Kling 2.6 with updated prompts...
Style seed CREMI-D4M1-GRAV maintained for character consistency.
```

**Activity feed tiếp theo:**
```
› User override: "more dramatic" applied to Scenes 4, 6
› Updating prompt: cosmic scale +40%, nebula density +60%
› Flux 1.1 Pro: Scene 4 v2 dispatched
› Scene 4 v2 complete — 94% style consistency
› Updating Scene 6...
```

---

### Script D: STYLE CHANGE — Color Grade

**Scenario (Flow Step 8):** User đổi VFX preset từ "Cosmic Cinema" → "Film Noir"

**UI Flow:**
1. User click "Film Noir" preset trong VFX step
2. Preview thumbnail đổi (dark, high contrast, desaturated)
3. Activity feed: `"Applying Film Noir grade to 8 scenes..."`
4. Scenes trong preview cập nhật với dark desaturated look
5. Stats cập nhật: `"Film Noir — High contrast · Vignette · -40% saturation"`

---

### Script E: SONG UPLOAD (Flow Step 2 — Setup)

**Scenario:** Đây là demo từ đầu — user upload bài nhạc

**Realistic file info hiển thị sau upload:**
```
File: lyra_gravity_master_v3.wav
Size: 38.4 MB
Format: WAV 48kHz / 24-bit
Duration: 3:24
Upload: 100% — complete
```

**Analysis text (hiện trong Step 3):**
```
Analyzing "Gravity" by Lyra...
├─ BPM detected: 108
├─ Key detected: D minor
├─ Loudness: -9.2 LUFS
├─ Dynamic range: 8.1 DR
├─ Segments: 8 identified
├─ Energy peaks: 3 mapped (1:04 · 2:02 · 2:35)
└─ Emotion tags: Dreamy · Romantic · Nostalgic · Cinematic
```

---

## PHẦN 10 — REALISTIC UI TEXT UPDATES

> Thay thế các placeholder text trong codebase bằng nội dung realistic sau.

### Monitor — Chat Panel (response-bank.ts)

**`idle` state:**
```
Welcome to Cremi. I'm your AI director — tell me about your track, or upload to start.
```

**`uploaded` state:**
```
Received "Gravity" by Lyra (3:24, WAV 48kHz). Running deep audio analysis — extracting BPM, key, waveform, segment boundaries, and emotion curve...
```

**`analyzing` state:**
```
Analysis complete.

**BPM:** 108 · **Key:** D minor · **Duration:** 3:24
**Segments:** 8 (Intro → Verse → Pre-Chorus → Chorus × 2 → Verse → Bridge → Outro)
**Energy peaks:** 3 mapped at 1:04, 2:02, 2:35
**Mood tags:** Dreamy · Romantic · Nostalgic · Cinematic · Uplifting

Ready to generate 3 creative storyline concepts aligned to this music's emotional structure.
```

**`vision_ready` state:**
```
Concept Agent generated **3 storylines**, each beat-mapped to "Gravity":

1. **Celestial Journey** _(match: 94%)_ — Zero-gravity romance through cosmic space, cherry blossoms and stardust synced to energy peaks
2. **Neon Metropolis** _(match: 87%)_ — High-contrast urban narrative, Seoul/Tokyo/LA, editorial cuts on every beat
3. **Ocean Memory** _(match: 81%)_ — Introspective coastal journey, warm analog aesthetic, slow nostalgic pacing

Style seed `CREMI-D4M1-GRAV` applied for character and color consistency across all scenes.
```

**`plan_ready` state:**
```
Storyboard locked — 8 scenes, 3:24 total, beat-synced:

- **Scene 4** (Chorus 1:04) — zero-gravity climax at energy peak #1
- **Scene 7** (Bridge 2:30) — galaxy center at energy peak #3
- All 8 cuts land on downbeats for perfect rhythmic sync
- Lipsync applied to Scenes 2, 4, 6 (Lyra on-screen)

Estimated render time: ~4 minutes · Est. cost: $2.80
```

**`assets_ready` state:**
```
Dispatching **parallel render jobs** with music-aware motion strategy:

- **Kling 2.6** → Scenes 4, 6, 7 (high-energy, dynamic motion)
- **Runway Gen-4** → Scenes 1, 2, 8 (cinematic, slow flow)
- **Flux 1.1 Pro** → Scenes 3, 5 (still frames with subtle motion)
- **MuseTalk v1.5** → Lipsync for Scenes 2, 4, 6

Style seed `CREMI-D4M1-GRAV` active across all workers.
```

**`assembled` state:**
```
Timeline assembled with **beat-synced transitions**. Applied **"Dreamy Soft"** VFX preset:

- Soft focus + warm tint + light leaks at chorus transitions
- Color grade: Kodak Portra-inspired, warm shadows, teal mids
- All 8 scene cuts land on downbeats of the track

Final runtime: 3:24 · Resolution: 1920×1080 · Ready for export.
```

**`complete` state:**
```
✓ Production complete. "Gravity" by Lyra is ready in 3 formats:

- **YouTube** — 16:9 · 1920×1080 · Full 3:24
- **TikTok** — 9:16 · 1080×1920 · 60s chorus highlight (1:04–2:04)
- **Instagram Reels** — 9:16 · 1080×1920 · 30s teaser (0:50–1:20)

Total production cost: **$2.80** (vs. $8,000–$25,000 traditional budget)
Production time: **6 min 14s** (vs. 3–6 weeks traditional)
```

---

### Monitor — Generation Activity Feed (realistic messages)

Thay thế `MESSAGES` array trong `generation-activity-feed.tsx`:

```ts
const MESSAGES = [
  'Kling 2.6: Scene 4 job dispatched — dynamic motion preset',
  'Flux 1.1 Pro: Scene 1 image complete (0.8s · 1920×1080)',
  'Style seed CREMI-D4M1-GRAV: consistency verified ✓',
  'Runway Gen-4: Scene 2 rendering — cinematic flow mode',
  'MuseTalk v1.5: lipsync applied to Scene 4 (sync: 96.3%)',
  'Scene 6 quality check: 94% — approved ✓',
  'Beat-sync: all cuts mapped to D minor grid (108 BPM)',
  'Scene 7 — galaxy center render: 18.4s elapsed',
  'Character anchor maintained: Lyra identity consistent',
  'Scene 5 (Tokyo) complete — analog warmth filter applied',
]
```

---

### Flow — Generation Step (SCENE_DESCRIPTIONS trong storyline-data.ts)

Thay thế `celestial-journey` scenes:

```ts
'celestial-journey': [
  'Seoul rooftop · 2AM · Lyra alone looking up at multiplying stars',
  'Minimalist apartment · Starlight patterns projected on walls · Solo dance',
  'First levitation · Cherry blossoms rising · Eyes wide with wonder',
  'Zero gravity · Cherry blossoms + stardust · Romantic embrace',
  'Tokyo · Shinjuku convenience store · Midnight · Warm fluorescent light',
  'LA rooftop · Magic hour · Camera orbiting couple · World soft focus',
  'Galaxy center · Arms extended · Stars exploding outward',
  'Seoul rooftop · Stars falling like snow · Hands held · Camera rising',
]
```

---

### Pipeline Artifacts (mock-artifacts.ts) — Updated descriptions

```ts
L1_INPUT: [
  { name: 'Audio Analysis — Gravity', description: 'BPM: 108 · Key: D minor · Duration: 3:24 · 8 segments · 3 energy peaks mapped' },
  { name: 'Lyra — Artist Profile', description: 'Style ref extracted · Character anchor locked · Korean-American, 23, dark hair' },
]

L2_CREATIVE: [
  { name: 'Creative Vision', description: 'Celestial Journey selected (94% match) · Dual-reality: grounded ↔ cosmic · Film stock aesthetic' },
  { name: 'Mood Board', description: '9 reference images approved · Tone: Romantic, Dreamy · Palette: warm film + cool cosmic' },
  { name: 'Color Palette', description: 'Primary: Kodak Portra warm · Secondary: deep violet #7C3AED · Accent: electric cyan #22D3EE' },
  { name: 'Style Seed', description: 'CREMI-D4M1-GRAV · Consistency target: 95%+ across 8 scenes' },
]

L3_PREPRODUCTION: [
  { name: 'Storyboard — 8 Scenes', description: '8 scenes · 3:24 total · Beat-synced at 108 BPM · D minor grid applied' },
  { name: 'Production Plan', description: 'Kling 2.6 (3 scenes) · Runway Gen-4 (3 scenes) · Flux 1.1 Pro (2 scenes) · Est. cost: $2.80' },
  { name: 'Style Guide', description: 'Lyra character anchor locked · Camera rules per segment · Color grade: Dreamy Soft' },
]

L4_PRODUCTION: [
  { name: 'Scene 4 — Zero Gravity', description: 'Kling 2.6 · 5s clip · 1920×1080 · Style consistency: 96%' },
  { name: 'Scene 4 — Lipsync', description: 'MuseTalk v1.5 · Sync accuracy: 96.3% · D minor vocal timing mapped' },
  { name: 'Scene 7 — Galaxy Center', description: 'Kling 2.6 · 5s clip · Style consistency: 93% · Energy peak at 2:35 mapped' },
]

L5_POSTPRODUCTION: [
  { name: 'Assembled Timeline', description: '8 scenes · 3:24 · Beat-synced transitions · Dreamy Soft VFX preset applied' },
  { name: 'Final Video — Gravity', description: 'Color graded · Lipsync verified · Multi-platform exports ready · Cost: $2.80' },
]
```

---

## PHẦN 11 — KEY DEMO NARRATIVE (Câu chuyện demo)

> Đây là narrative để kể khi demo cho user/investor

**Hero story:**
> Lyra — một nghệ sĩ indie 23 tuổi với 247K Instagram followers — muốn làm MV cho single debut "Gravity". Budget video thực tế: $0. Với Cremi, cô upload file WAV lúc 11pm, và 6 phút 14 giây sau có một MV cinematic hoàn chỉnh trị giá $2.80. Sáng hôm sau post lên YouTube và TikTok.

**Product positioning:**
- Traditional MV: $8,000–$25,000 · 3–6 weeks
- Cremi: **$2.80 · 6 minutes**

**Key moments to show trong demo:**
1. Upload WAV → instant analysis (số liệu real-feeling)
2. 3 storyline options → chọn Celestial Journey (94% match)
3. Mood board approval → 9 real reference images
4. Storyboard với real scene thumbnails
5. Generation với activity feed log chạy
6. **Regenerate Scene 3** → user thấy take mới ngay lập tức
7. Editing — chọn Take 2 cho Scene 4
8. Export screen: $2.80 · 6 phút

---

## Câu hỏi chưa giải quyết

1. Audio file `.wav` thật có cần thiết không (để waveform animation accurate), hay giữ synthetic?
2. Video clips (5s per scene) có cần không, hay chỉ cần still images là đủ cho prototype?
3. Nhân vật Lyra — có reference ảnh thật để giữ consistent identity qua 8 scenes không?
4. Demo song "Gravity" — có muốn dùng một bài nhạc thật (licensed/free) để phát khi demo không?
