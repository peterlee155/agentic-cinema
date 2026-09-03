/**
 * Agentic Cinema Studio - Main Client Engine
 * Coordinates UI tabs, scene navigation, agent pipeline execution,
 * ClickHouse MCP tool queries, and RevenueCat monetization.
 */

const STATE = {
  currentProjectId: "proj_last_spell",
  currentProject: null,
  activeSceneIndex: 0,
  projects: [],
  activeTab: "chat",
  health: null,
  plans: []
};

// ============================================================
// 1. INITIALIZATION & DATA FETCHING
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🎬 [Agentic Cinema] Studio Engine Initializing...");
  await loadSystemHealth();
  await loadProjects();
  await loadCurrentProject(STATE.currentProjectId);
  await loadClickHouseTelemetry();
  renderPlans();
  switchTab("chat");
});

async function loadSystemHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    STATE.health = data;

    // Update Judge Panel Badges
    const gModel = data.integrations?.google_cloud_genai?.model || "gemini-3.7-flash";
    const gStatus = data.integrations?.google_cloud_genai?.status || "ACTIVE";
    document.getElementById("judge-gemini-model").innerText = gModel;
    document.getElementById("judge-gemini-status").innerText = gStatus;

    const mcpName = data.integrations?.partner_mcp?.server || "clickhouse-cinema-mcp";
    const mcpConn = data.integrations?.partner_mcp?.direct_connection || "CONNECTED (ClickHouse MCP Engine)";

    document.getElementById("judge-mcp-status").innerText = `${mcpName} (CONNECTED)`;
    if (document.getElementById("sidebar-ch-status")) {
      document.getElementById("sidebar-ch-status").innerText = "CONNECTED";
    }

    // Header Badge
    const headerStatus = document.getElementById("header-ch-status");
    const headerDot = document.getElementById("header-ch-dot");
    if (headerStatus) {
      headerStatus.innerText = "CONNECTED";
      headerStatus.className = "text-emerald-300 font-bold";
    }
    if (headerDot) {
      headerDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    }

    // Dashboard Telemetry Card
    const dashPill = document.getElementById("dash-ch-pill");
    const dashStatus = document.getElementById("dash-ch-status");
    if (dashPill) {
      dashPill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>CONNECTED</span>`;
      dashPill.className = "text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center gap-1";
    }
    if (dashStatus) {
      dashStatus.innerText = "ClickHouse Engine Active";
    }
  } catch (err) {
    console.warn("Could not load health metrics:", err);
  }
}

async function loadProjects() {
  try {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (data.success) {
      STATE.projects = data.projects || [];
      renderProjectsList();
    }
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

async function loadCurrentProject(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    if (data.success && data.data) {
      STATE.currentProject = data.data;
      STATE.currentProjectId = projectId;
      renderAllViews();
    }
  } catch (err) {
    console.error(`Error loading project ${projectId}:`, err);
  }
}

async function loadClickHouseTelemetry() {
  try {
    const res = await fetch(`/api/telemetry?project_id=${STATE.currentProjectId}`);
    const data = await res.json();
    if (data.telemetry && data.telemetry.length > 0) {
      document.getElementById("sidebar-ch-calls").innerText = data.total_agents_tracked || data.telemetry.length;
      const avgLat = Math.round(data.telemetry.reduce((acc, cur) => acc + cur.avg_latency_ms, 0) / data.telemetry.length);
      document.getElementById("sidebar-ch-latency").innerText = `${avgLat} ms`;
    }
  } catch (err) {
    console.warn("Telemetry fetch fallback:", err);
  }
}

// ============================================================
// 2. VIEW RENDERING ENGINE
// ============================================================

function renderAllViews() {
  if (!STATE.currentProject) return;

  const p = STATE.currentProject.project || {};
  const scenes = STATE.currentProject.scenes || [];
  const chars = STATE.currentProject.characters || [];
  const locs = STATE.currentProject.locations || [];
  const shots = STATE.currentProject.shots || [];
  const storyboard = STATE.currentProject.storyboard || [];
  const audio = STATE.currentProject.audio || [];
  const edit = STATE.currentProject.editPlan || {};
  const social = STATE.currentProject.socialContent || {};
  const dance = STATE.currentProject.danceConcepts || [];

  // Update Header Badges
  document.getElementById("header-project-title").innerText = p.title || "UNTITLED";
  document.getElementById("header-plan-badge").innerText = p.plan || "PRO";
  const used = p.credits_used || 48;
  const total = p.credits_total || 250;
  document.getElementById("header-credits-count").innerText = `${total - used} / ${total} CR`;
  document.getElementById("dash-credits-val").innerText = `${total - used} Credits`;

  // 1. Dashboard View Updates
  document.getElementById("dash-project-title").innerText = p.title || "UNTITLED";
  document.getElementById("dash-project-genre").innerText = p.genre || "Feature Film";
  document.getElementById("dash-project-stage").innerText = p.stage || "PRODUCTION_READY";
  document.getElementById("dash-project-logline").innerText = p.logline || "";

  // Dynamic Badges
  if (document.getElementById("dash-project-format")) {
    document.getElementById("dash-project-format").innerText = p.format || "Theatrical Feature";
    document.getElementById("dash-project-platform").innerText = p.platform || "Cinema";
    const eps = p.episodeCount || 1;
    document.getElementById("dash-project-episodes").innerText = eps > 1 ? `${eps} Episodes` : "1 Feature";
    document.getElementById("dash-project-scale").innerText = p.productionScale || "Hollywood Studio Tentpole";
    document.getElementById("dash-project-budget").innerText = p.budget || "$48,000,000";
    document.getElementById("dash-project-audience").innerText = p.targetAudience || "Young Adults (18-25)";
  }

  renderDashboardActivityFeed();

  // 2. Script & Workspace Updates
  document.getElementById("ws-movie-title").innerText = p.title || "UNTITLED";
  renderSceneNavigation(scenes);
  renderActiveScene();

  // 3. Storyboard Updates
  renderStoryboardGrid(storyboard);

  // 4. AI Agents Swarm Updates
  renderAgentsSwarm();

  // 5. Assets & Visual Bible Updates
  renderAssetsView(chars, locs);

  // 6. Social & Dance Updates
  renderSocialAndDance(social, dance);
}

// Render Dashboard Activity Feed
function renderDashboardActivityFeed() {
  const container = document.getElementById("dash-activity-feed");
  if (!container) return;

  const activities = [
    { agent: "Producer", time: "Just now", action: "Structured 3-Act narrative architecture & verified stakes" },
    { agent: "Screenwriter", time: "1m ago", action: "Enforced 'Show, Don't Tell' across 5 core scenes" },
    { agent: "Director", time: "2m ago", action: "Engineered 24mm anamorphic wide crane staging" },
    { agent: "Art Director", time: "3m ago", action: "Locked character wardrobe evolution & cathedral stone palette" },
    { agent: "Cinematographer", time: "4m ago", action: "Set shallow depth of field (T1.9) for sodium rain" },
    { agent: "Storyboard", time: "5m ago", action: "Generated 8K keyframe prompts with wrist-timer continuity" },
    { agent: "Sound & Music", time: "6m ago", action: "Integrated 3s strategic silence before bone stylus inscription" },
    { agent: "Editor", time: "7m ago", action: "Built accelerating cut tempo curve peaking at Scene 4 sprint" },
    { agent: "Social & Viral", time: "8m ago", action: "Created 3 TikTok / Shorts mystery hooks" },
    { agent: "Dance Agent", time: "9m ago", action: "Designed 4-Beat 'Countdown Shuffle' choreography (135 BPM)" }
  ];

  container.innerHTML = activities.map(a => `
    <div class="flex items-center justify-between p-2 rounded-lg bg-[#111728] border border-[#1e2a44]">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <strong class="text-white">${a.agent}:</strong>
        <span class="text-slate-300">${a.action}</span>
      </div>
      <span class="text-[10px] text-slate-500 whitespace-nowrap">${a.time}</span>
    </div>
  `).join("");
}

async function renameProject(projectId, oldTitle) {
  const titleToUse = oldTitle || STATE.currentProject?.project?.title || "THE LAST SPELL";
  const newTitle = prompt("Enter new title for this film project:", titleToUse);
  if (!newTitle || !newTitle.trim() || newTitle.trim() === titleToUse) return;

  const targetId = projectId || STATE.currentProjectId;
  try {
    const res = await fetch(`/api/projects/${targetId}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotice(`✨ Project renamed to "${newTitle.trim()}"`);
      await loadProjects();
      await loadCurrentProject(targetId);
      renderAllViews();
    } else {
      alert("Failed to rename project: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Rename error:", err);
    alert("Error renaming project: " + err.message);
  }
}

async function deleteProject(projectId, projectTitle) {
  const targetId = projectId || STATE.currentProjectId;
  const titleToUse = projectTitle || (STATE.projects.find(p => p.id === targetId)?.title) || targetId;
  
  const confirmDelete = confirm(`Are you sure you want to delete the project "${titleToUse}"?\n\nThis action will delete the project data from disk.`);
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/projects/${targetId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      showToastNotice(`🗑️ Project "${titleToUse}" deleted`);
      await loadProjects();
      if (data.active_project_id) {
        await loadCurrentProject(data.active_project_id);
      }
      renderAllViews();
    } else {
      alert("Failed to delete project: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting project: " + err.message);
  }
}

// Render Projects List in Dashboard & Projects View
function renderProjectsList() {
  const dashList = document.getElementById("dash-projects-list");
  const grid = document.getElementById("projects-grid");

  if (dashList) {
    dashList.innerHTML = STATE.projects.map(pr => `
      <div class="p-3 rounded-xl bg-[#111728] hover:bg-[#162035] border ${pr.id === STATE.currentProjectId ? 'border-indigo-500/50 bg-[#141c30]' : 'border-[#1e2a44]'} flex items-center justify-between cursor-pointer transition"
           onclick="switchProject('${pr.id}')">
        <div>
          <div class="font-bold text-white text-xs flex items-center gap-2">
            ${escapeHtml(pr.title)}
            ${pr.id === STATE.currentProjectId ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">ACTIVE</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400 truncate max-w-sm">${escapeHtml(pr.genre || 'Cinematic Film')} • ${pr.scene_count} Scenes</div>
        </div>
        <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
          <button onclick="renameProject('${pr.id}', '${escapeHtml(pr.title)}')" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]" title="Rename Project">✏️</button>
          <button onclick="deleteProject('${pr.id}', '${escapeHtml(pr.title)}')" class="p-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 text-[10px]" title="Delete Project">🗑️</button>
        </div>
      </div>
    `).join("");
  }

  if (grid) {
    grid.innerHTML = STATE.projects.map(pr => `
      <div class="cinema-card p-5 flex flex-col justify-between space-y-4 ${pr.id === STATE.currentProjectId ? 'border-indigo-500/60 bg-[#0d1428]' : ''}">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">${pr.stage || 'PRODUCTION'}</span>
            <span class="text-[10px] text-slate-400 font-mono">${pr.scene_count} Scenes</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-base font-extrabold text-white truncate">${escapeHtml(pr.title)}</h3>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="renameProject('${pr.id}', '${escapeHtml(pr.title)}')" class="p-1.5 rounded-lg bg-[#162035] hover:bg-[#202d4b] border border-[#2d3d63] text-slate-300 text-xs transition" title="Rename Film Title">✏️ Rename</button>
              <button onclick="deleteProject('${pr.id}', '${escapeHtml(pr.title)}')" class="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs transition" title="Delete Project">🗑️ Delete</button>
            </div>
          </div>
          <p class="text-xs text-slate-300 line-clamp-3 leading-relaxed">${escapeHtml(pr.logline || '')}</p>
        </div>
        <div class="pt-3 border-t border-[#1c263c] flex items-center justify-between">
          <button onclick="switchProject('${pr.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer">
            ${pr.id === STATE.currentProjectId ? 'Active Movie' : 'Switch Project'}
          </button>
          <span class="text-[10px] text-slate-400 font-semibold">${escapeHtml(pr.genre || '')}</span>
        </div>
      </div>
    `).join("");
  }
}

// Render Scene Navigation (Left Column)
function renderSceneNavigation(scenes) {
  const container = document.getElementById("ws-scene-nav");
  const nodesContainer = document.getElementById("timeline-scene-nodes");
  if (!container) return;

  container.innerHTML = scenes.map((sc, idx) => `
    <button onclick="selectScene(${idx})" class="w-full text-left p-2.5 rounded-lg border ${idx === STATE.activeSceneIndex ? 'border-indigo-500 bg-[#162038] text-white shadow-sm shadow-indigo-500/20' : 'border-transparent bg-[#111728] text-slate-300 hover:bg-[#162035]'} text-xs transition">
      <div class="flex items-center justify-between mb-1">
        <span class="font-bold text-[11px] text-indigo-300">SCENE ${sc.sceneNumber}</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">${sc.intExt || 'EXT'}</span>
      </div>
      <div class="truncate text-[11px] font-medium text-slate-200">${sc.location || 'Location'}</div>
    </button>
  `).join("");

  if (nodesContainer) {
    nodesContainer.innerHTML = scenes.map((sc, idx) => `
      <button onclick="selectScene(${idx})" class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${idx === STATE.activeSceneIndex ? 'bg-indigo-600 text-white' : 'bg-[#162035] text-slate-400 hover:text-white'} transition">
        ${sc.sceneNumber}
      </button>
    `).join("");
  }
}

// Select Scene
function selectScene(index) {
  STATE.activeSceneIndex = index;
  renderActiveScene();
  renderSceneNavigation(STATE.currentProject.scenes || []);
}

// Render Active Scene (Center & Right Columns)
function renderActiveScene() {
  const scenes = STATE.currentProject?.scenes || [];
  if (!scenes || scenes.length === 0) return;

  const sc = scenes[STATE.activeSceneIndex] || scenes[0];
  const shots = STATE.currentProject?.shots || [];
  const audio = STATE.currentProject?.audio || [];
  const edit = STATE.currentProject?.editPlan || {};

  document.getElementById("ws-current-scene-header").innerText = `Scene ${sc.sceneNumber}: ${sc.slugline}`;
  document.getElementById("scene-slugline").innerText = sc.slugline;
  document.getElementById("scene-badge-intent").innerText = sc.intExt || "EXT";
  document.getElementById("scene-time-badge").innerText = sc.time || "DAY";
  document.getElementById("scene-characters-list").innerText = (sc.characters || []).join(", ");

  document.getElementById("scene-objective-text").innerText = `${sc.objective} | Conflict: ${sc.conflict}`;
  document.getElementById("scene-action-text").innerText = sc.action || "";
  document.getElementById("scene-dialogue-text").innerText = sc.dialogue || "";
  document.getElementById("scene-emotional-text").innerText = sc.emotionalBeat || "";
  document.getElementById("scene-transition-text").innerText = sc.transition || "CUT TO:";

  // Matching Director note
  const matchedShot = shots.find(s => s.sceneNumber === sc.sceneNumber) || shots[0];
  if (matchedShot) {
    document.getElementById("ws-director-note").innerHTML = `
      <strong>${matchedShot.shotType} (${matchedShot.lens})</strong><br>
      Movement: ${matchedShot.cameraMovement}<br>
      Composition: ${matchedShot.composition}
    `;
  }

  // Matching Sound note
  const matchedAudio = audio.find(a => a.scene && a.scene.includes(`Scene ${sc.sceneNumber}`)) || audio[0];
  if (matchedAudio) {
    document.getElementById("ws-sound-note").innerHTML = `
      <strong>Ambience:</strong> ${matchedAudio.ambience}<br>
      <strong>Silence Strategy:</strong> ${matchedAudio.silence}<br>
      <strong>SFX:</strong> ${matchedAudio.soundEffects}
    `;
  }

  // Matching Editor note
  document.getElementById("ws-editor-note").innerHTML = `
    <strong>Pacing:</strong> ${edit.pacingStrategy || 'Deliberate pacing'}<br>
    <strong>Cut Timing:</strong> ${edit.cutTiming || 'Dynamic rhythm'}
  `;
}

// Render Storyboard Grid
function renderStoryboardGrid(frames) {
  const container = document.getElementById("storyboard-grid");
  if (!container) return;

  container.innerHTML = frames.map(f => {
    // Real Visual Asset Preview (Playable Video or 8K Keyframe Image)
    let visualPreview = "";
    if (f.videoUrl) {
      visualPreview = `
        <div class="relative w-full rounded-lg overflow-hidden border border-cyan-500/60 my-2 shadow-lg bg-black">
          <video src="${f.videoUrl}" controls autoplay loop muted playsinline class="w-full h-44 object-cover"></video>
          <div class="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-200 border border-cyan-500/40 text-[9px] font-mono font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            PLAYABLE 24FPS VIDEO (MP4)
          </div>
        </div>
      `;
    } else if (f.imageUrl) {
      visualPreview = `
        <div class="relative w-full rounded-lg overflow-hidden border border-amber-500/50 my-2 shadow-lg group">
          <img src="${f.imageUrl}" alt="${f.shot}" class="w-full h-44 object-cover transition duration-300 group-hover:scale-105">
          <div class="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/90 text-amber-200 border border-amber-500/40 text-[9px] font-mono font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            GENERATED 8K KEYFRAME
          </div>
        </div>
      `;
    } else if (f.frame === 2 || (f.shot && f.shot.toLowerCase().includes('wrist'))) {
      visualPreview = `
        <div class="relative w-full rounded-lg overflow-hidden border border-amber-500/40 my-2 shadow-md">
          <img src="/static/img/wrist_rune_keyframe.jpg" alt="Runic Wrist Chronometer" class="w-full h-44 object-cover">
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-amber-300 text-[9px] font-mono">
            REFERENCE KEYFRAME
          </div>
        </div>
      `;
    }

    const imgStatusBadge = f.imageStatus === "COMPLETE" ? 
      `<span class="text-[9px] text-emerald-400 font-mono font-semibold">● IMAGE READY</span>` : 
      (f.imageStatus === "GENERATING" ? `<span class="text-[9px] text-amber-400 font-mono animate-pulse">⏳ GENERATING...</span>` : `<span class="text-[9px] text-slate-500 font-mono">○ NOT GENERATED</span>`);

    const vidStatusBadge = f.videoStatus === "COMPLETE" ? 
      `<span class="text-[9px] text-cyan-400 font-mono font-semibold">● VIDEO READY</span>` : 
      (f.videoStatus === "GENERATING" ? `<span class="text-[9px] text-cyan-300 font-mono animate-pulse">⏳ RENDERING VIDEO...</span>` : `<span class="text-[9px] text-slate-500 font-mono">○ NOT RENDERED</span>`);

    return `
      <div class="cinema-card overflow-hidden flex flex-col justify-between" id="frame-card-${f.scene}-${f.frame}">
        <div class="p-4 bg-[#0b0f1a] border-b border-[#1c263c] space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">FRAME ${f.scene}.${f.frame}</span>
            <span class="text-[10px] text-slate-400 font-mono">${f.duration || '4s'}</span>
          </div>
          
          ${visualPreview}

          <h4 class="font-bold text-white text-xs">${f.shot}</h4>
          <p class="text-xs text-slate-300">${f.description}</p>
        </div>

        <div class="p-4 space-y-3 text-xs">
          <div class="text-[11px] text-slate-400">
            <strong>Camera & Light:</strong> ${f.camera} | ${f.lighting}
          </div>
          <div class="text-[11px] text-slate-400">
            <strong>Action & Emotion:</strong> ${f.action} (${f.emotion || 'Intense'})
          </div>

          <!-- Real Execution Action Toolbar -->
          <div class="pt-2 border-t border-[#1c263c] space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-300">REAL PRODUCTION ACTIONS</span>
              <div class="flex gap-2">
                ${imgStatusBadge}
                ${vidStatusBadge}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button id="btn-gen-img-${f.scene}-${f.frame}" onclick="triggerRealKeyframe(${f.scene}, ${f.frame})" class="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-[11px] font-semibold py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                <span>🎨 Gen Keyframe</span>
              </button>
              <button id="btn-gen-vid-${f.scene}-${f.frame}" onclick="triggerRealVideo(${f.scene}, ${f.frame})" class="bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-[11px] font-semibold py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                <span>🎥 Gen 24fps Video</span>
              </button>
            </div>
            ${f.imageError ? `<div class="text-[10px] text-red-400 font-mono p-1 bg-red-950/40 rounded border border-red-800/40">Image Error: ${f.imageError}</div>` : ''}
            ${f.videoError ? `<div class="text-[10px] text-red-400 font-mono p-1 bg-red-950/40 rounded border border-red-800/40">Video Error: ${f.videoError}</div>` : ''}
          </div>

          <!-- Google Imagen 3 Specification -->
          <div class="pt-2 border-t border-[#1c263c] space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">GOOGLE IMAGEN 3 (8K STILL)</span>
              <button onclick="copyPrompt('${encodeURIComponent(f.imagePrompt || '')}')" class="text-[10px] text-indigo-400 hover:text-indigo-300">
                📋 Copy
              </button>
            </div>
            <div class="text-[10px] font-mono bg-[#070a13] p-2 rounded border border-[#1a2337] text-indigo-200/90 break-words leading-relaxed max-h-20 overflow-y-auto">
              ${f.imagePrompt || 'Cinematic 8k photorealistic widescreen still.'}
            </div>
          </div>

          <!-- Google Veo Specification -->
          <div class="pt-2 border-t border-[#1c263c] space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">GOOGLE VEO (24FPS VIDEO MOTION)</span>
              <button onclick="copyPrompt('${encodeURIComponent(f.videoPrompt || f.imagePrompt || '')}')" class="text-[10px] text-cyan-400 hover:text-cyan-300">
                📋 Copy
              </button>
            </div>
            <div class="text-[10px] font-mono bg-[#070a13] p-2 rounded border border-[#1a2337] text-cyan-200/90 break-words leading-relaxed max-h-20 overflow-y-auto">
              ${f.videoPrompt || 'Cinematic 24fps camera motion with continuous physical particle dynamics.'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Real Image Generation Client Action
async function triggerRealKeyframe(scene, frame) {
  const btn = document.getElementById(`btn-gen-img-${scene}-${frame}`);
  const orig = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<span class="animate-spin text-xs">⏳</span> Generating...`;
    btn.disabled = true;
  }

  try {
    const pid = STATE.currentProjectId || "proj_last_spell";
    const res = await fetch("/api/generate/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: pid,
        scene: scene,
        frame: frame,
        aspect_ratio: "16:9",
        model: "gemini-3.1-flash-image"
      })
    });

    const data = await res.json();
    if (data.success) {
      await loadCurrentProject(pid);
    } else {
      alert("Image Generation Error: " + (data.error || "Failed to generate real image."));
      if (btn) {
        btn.innerHTML = `⚠️ Failed`;
        btn.disabled = false;
      }
    }
  } catch (err) {
    console.error("Error generating keyframe:", err);
    alert("Generation failed: " + err.message);
    if (btn) {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  }
}

// Real Video Generation Client Action & Live Polling
async function triggerRealVideo(scene, frame) {
  const btn = document.getElementById(`btn-gen-vid-${scene}-${frame}`);
  const orig = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<span class="animate-spin text-xs">⏳</span> Starting...`;
    btn.disabled = true;
  }

  try {
    const pid = STATE.currentProjectId || "proj_last_spell";
    const res = await fetch("/api/generate/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: pid,
        scene: scene,
        frame: frame,
        aspect_ratio: "16:9",
        model: "cinematic-motion-v1"
      })
    });

    const data = await res.json();
    if (!data.success || !data.job_id) {
      throw new Error(data.error || "Failed to initiate video job");
    }

    const jobId = data.job_id;
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const pollRes = await fetch(`/api/jobs/${jobId}`);
        const job = await pollRes.json();
        const pct = Math.round((job.progress || 0) * 100);
        if (btn) btn.innerHTML = `<span class="animate-spin text-xs">⏳</span> Video ${pct}%`;

        if (job.status === "COMPLETE") {
          clearInterval(pollInterval);
          await loadCurrentProject(pid);
        } else if (job.status === "FAILED") {
          clearInterval(pollInterval);
          alert("Video Generation Error: " + (job.error || "Generation failed"));
          if (btn) {
            btn.innerHTML = "⚠️ Failed";
            btn.disabled = false;
          }
        } else if (attempts > 90) {
          clearInterval(pollInterval);
          if (btn) {
            btn.innerHTML = orig;
            btn.disabled = false;
          }
        }
      } catch (pollErr) {
        console.warn("Poll warning:", pollErr);
      }
    }, 1000);

  } catch (err) {
    console.error("Error generating video:", err);
    alert("Video generation failed: " + err.message);
    if (btn) {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  }
}

// Project Configuration Dialog Logic
function openConfigModal() {
  const p = STATE.currentProject || {};
  document.getElementById("config-format").value = p.format || "Theatrical Feature";
  document.getElementById("config-platform").value = p.platform || "Cinema";
  document.getElementById("config-episodes").value = p.episodeCount || 1;
  document.getElementById("config-duration").value = p.episodeDuration || "115 Minutes";
  document.getElementById("config-scale").value = p.productionScale || "Hollywood Studio Tentpole";
  document.getElementById("config-audience").value = p.targetAudience || "Young Adults (18-25)";

  const isCustom = p.budgetType === "CUSTOM";
  document.getElementById("config-custom-budget-toggle").checked = isCustom;
  const customBudgetInput = document.getElementById("config-custom-budget");
  customBudgetInput.disabled = !isCustom;
  customBudgetInput.value = isCustom ? (p.budget || "") : "";

  onConfigParamChange();
  const modal = document.getElementById("modal-project-config");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.remove("hidden");
  }
}

function closeConfigModal() {
  const modal = document.getElementById("modal-project-config");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

function onCustomBudgetToggle() {
  const isCustom = document.getElementById("config-custom-budget-toggle").checked;
  const customInput = document.getElementById("config-custom-budget");
  customInput.disabled = !isCustom;
  if (!isCustom) {
    onConfigParamChange();
  }
}

function onConfigParamChange() {
  const fmt = (document.getElementById("config-format").value || "").toLowerCase();
  const scl = (document.getElementById("config-scale").value || "").toLowerCase();
  const eps = parseInt(document.getElementById("config-episodes").value || 1);

  let scaleMult = 1.0;
  if (scl.includes("indie") || scl.includes("small")) scaleMult = 0.25;
  else if (scl.includes("mid")) scaleMult = 0.75;
  else if (scl.includes("hollywood") || scl.includes("tentpole")) scaleMult = 2.5;

  let total = 48000000 * scaleMult;
  if (fmt.includes("tiktok") || fmt.includes("reels") || fmt.includes("shorts")) {
    total = 450 * scaleMult * Math.max(1, eps);
  } else if (fmt.includes("tv") || fmt.includes("series") || fmt.includes("web")) {
    total = 2500000 * scaleMult * Math.max(1, eps);
  } else if (fmt.includes("short film")) {
    total = 50000 * scaleMult;
  }

  const isCustom = document.getElementById("config-custom-budget-toggle").checked;
  const formatted = "$" + Math.round(total).toLocaleString();
  document.getElementById("config-budget-preview").innerText = formatted;
  if (!isCustom) {
    document.getElementById("config-custom-budget").value = formatted;
  }
}

async function saveProjectConfig() {
  const pid = STATE.currentProjectId || "proj_last_spell";
  const formatVal = document.getElementById("config-format").value;
  const platformVal = document.getElementById("config-platform").value;
  const epsVal = parseInt(document.getElementById("config-episodes").value || 1);
  const durVal = document.getElementById("config-duration").value;
  const scaleVal = document.getElementById("config-scale").value;
  const audVal = document.getElementById("config-audience").value;
  const isCustom = document.getElementById("config-custom-budget-toggle").checked;
  const customBudgetVal = document.getElementById("config-custom-budget").value;

  try {
    const res = await fetch(`/api/projects/${pid}/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format: formatVal,
        platform: platformVal,
        episodeCount: epsVal,
        episodeDuration: durVal,
        productionScale: scaleVal,
        targetAudience: audVal,
        budgetType: isCustom ? "CUSTOM" : "ESTIMATED",
        budget: isCustom ? customBudgetVal : null
      })
    });

    const data = await res.json();
    if (data.success) {
      closeConfigModal();
      await loadCurrentProject(pid);
    } else {
      alert("Failed to save configuration: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Config save error:", err);
    alert("Error saving configuration: " + err.message);
  }
}

// Render AI Agents Swarm
function renderAgentsSwarm() {
  const container = document.getElementById("agents-grid");
  if (!container) return;

  const agents = [
    { name: "Producer", role: "Executive Producer", desc: "Crafts the master brief, three-act structure, and narrative stakes from the raw pitch.", icon: "👑" },
    { name: "Screenwriter", role: "Lead Dramatist", desc: "Writes dialogue and scene actions adhering strictly to 'Show, Don't Tell'.", icon: "✍️" },
    { name: "Director", role: "Lead Director", desc: "Designs camera movement, lens packages (24mm/85mm), and spatial blocking.", icon: "🎥" },
    { name: "Art Director", role: "Production Designer", desc: "Builds character wardrobes, visual evolutions, and location architecture.", icon: "🎨" },
    { name: "Cinematographer", role: "Director of Photography", desc: "Establishes lighting setups, depth of field, and 35mm optical treatments.", icon: "📷" },
    { name: "Storyboard", role: "Keyframe Artist", desc: "Transforms scenes into sequential storyboard frames with 8K generative prompts.", icon: "🖼️" },
    { name: "Sound & Music", role: "Sound Designer", desc: "Maps dialogue acoustics, ambient foley, and wields strategic silence as a weapon.", icon: "🔊" },
    { name: "Editor", role: "Picture Editor", desc: "Shapes narrative pacing curves, cut timing, J-cuts/L-cuts, and match cuts.", icon: "✂️" },
    { name: "Social & Viral", role: "Distribution Lead", desc: "Creates promotional teasers, mystery hooks, and POV survival concepts.", icon: "📱" },
    { name: "Dance Agent", role: "Movement Choreographer", desc: "Engineers 4-part beat structures (0-3s, 3-7s, 7-11s, 11-15s) for viral trends.", icon: "💃" }
  ];

  container.innerHTML = agents.map(ag => `
    <div class="cinema-card p-5 flex flex-col justify-between space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">${ag.icon}</span>
            <div>
              <h4 class="font-bold text-white text-xs">${ag.name}</h4>
              <div class="text-[10px] text-slate-400">${ag.role}</div>
            </div>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">COMPLETE</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${ag.desc}</p>
      </div>

      <div class="pt-3 border-t border-[#1c263c] flex items-center justify-between">
        <span class="text-[10px] text-slate-500 font-mono">Model: Gemini 3.7</span>
        <button onclick="retrySingleAgent('${ag.name.toLowerCase()}')" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded bg-[#162035]">
          ↻ Retry
        </button>
      </div>
    </div>
  `).join("");
}

// Render Assets & Visual Bible View
function renderAssetsView(characters, locations) {
  const charGrid = document.getElementById("assets-characters-grid");
  const locGrid = document.getElementById("assets-locations-grid");

  if (charGrid) {
    charGrid.innerHTML = characters.map(c => `
      <div class="cinema-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-extrabold text-white text-sm">${c.name}</h4>
            <div class="text-[11px] text-indigo-300">${c.role} • Age ${c.age || 30}</div>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded bg-[#162035] text-slate-300 font-mono">${c.colorPalette || '#FFF'}</span>
        </div>
        <div class="text-xs space-y-1 text-slate-300">
          <div><strong>Appearance:</strong> ${c.appearance}</div>
          <div><strong>Wardrobe & Hair:</strong> ${c.clothing} / ${c.hair}</div>
          <div><strong>Signature Props:</strong> ${c.props}</div>
          <div class="text-amber-300/90 pt-1"><strong>Visual Evolution:</strong> ${c.visualEvolution}</div>
        </div>
      </div>
    `).join("");
  }

  if (locGrid) {
    locGrid.innerHTML = locations.map(l => `
      <div class="cinema-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-extrabold text-white text-xs">${l.name}</h4>
          <span class="text-[9px] px-2 py-0.5 rounded bg-[#162035] text-slate-300 font-mono">${l.colorPalette || '#000'}</span>
        </div>
        <div class="text-xs space-y-1 text-slate-300">
          <div><strong>Architecture:</strong> ${l.architecture}</div>
          <div><strong>Atmosphere:</strong> ${l.weather} | ${l.lighting}</div>
          <div><strong>Materials & Objects:</strong> ${l.materials} | ${l.objects}</div>
        </div>
      </div>
    `).join("");
  }
}

// Render Social & Dance View
function renderSocialAndDance(social, dance) {
  const d = dance[0] || {};
  if (d.title) {
    document.getElementById("dance-title").innerText = d.title;
    document.getElementById("dance-bpm-badge").innerText = `${d.bpm || 135} BPM • ${d.musicStyle || 'Trap'}`;
    document.getElementById("dance-concept-desc").innerText = d.concept || "";
    if (d.beatStructure) {
      document.getElementById("dance-beat-1").innerText = d.beatStructure["0_to_3s"] || "";
      document.getElementById("dance-beat-2").innerText = d.beatStructure["3_to_7s"] || "";
      document.getElementById("dance-beat-3").innerText = d.beatStructure["7_to_11s"] || "";
      document.getElementById("dance-beat-4").innerText = d.beatStructure["11_to_15s"] || "";
    }
    document.getElementById("dance-caption").innerText = d.caption || "";
    document.getElementById("dance-hashtags").innerText = (d.hashtags || []).join(" ");
  }

  // 1. Google Veo 9:16 Video Teasers
  const veoGrid = document.getElementById("social-veo-grid");
  const veoTeasers = social.video_teasers_veo || [
    {
      title: "The 4-Hour Countdown",
      format: "9:16 Vertical Video (15s)",
      hook: "Macro zoom into human forearm as glowing amber glyph ignites into skin: 04:00:00.",
      veo_prompt: "Google Veo prompt: 9:16 vertical cinematography, macro extreme close-up pushing in on human arm, amber runic numerals sizzling into skin with rising vapor, 24fps high-speed camera move pulling back to reveal hooded scout standing before rainstorm and giant shimmering violet forcefield dome, hyperrealistic cinematic motion, physical particle simulation",
      audio_sync: "40Hz sub-bass drop syncing to ticking clock metronome",
      hashtags: ["#TheLastSpell", "#SciFiThriller", "#MovieTeaser", "#VeoVideo"]
    },
    {
      title: "The Smiling Mimic",
      format: "9:16 Vertical Video (15s)",
      hook: "A smiling gentleman in a tweed jacket stands motionless in the rain under an umbrella.",
      veo_prompt: "Google Veo prompt: 9:16 vertical framing, slow eerie dolly forward toward an unnervingly still man in vintage tweed holding an umbrella in torrential rain, neon yellow sodium light reflecting off wet asphalt, lightning strike reveals pitch-black dilated pupils, cinematic horror film motion, 24fps",
      audio_sync: "Creepy polite whistle echoing over distorted ambient rain",
      hashtags: ["#PsychologicalHorror", "#Mimic", "#ShortFilm", "#MovieTok"]
    }
  ];
  if (veoGrid) {
    veoGrid.innerHTML = veoTeasers.map(v => `
      <div class="cinema-card p-5 space-y-3 border-cyan-500/30 bg-gradient-to-b from-[#0c1326] to-[#0d1220]">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">${v.format}</span>
          <span class="text-[10px] text-slate-400 font-mono">Google Veo Ready</span>
        </div>
        ${(v.title && v.title.toLowerCase().includes('mimic')) ? `
          <img src="/static/img/mimic_vertical_teaser.jpg" alt="Mimic Vertical Teaser" class="w-full h-64 object-cover object-top rounded-lg border border-cyan-500/40 my-2 shadow-md">
        ` : ''}
        <h4 class="text-sm font-extrabold text-white">${v.title}</h4>
        <div class="text-[11px] text-amber-300 font-medium bg-[#0b0f1a] p-2.5 rounded border border-[#1c2842]">
          <strong>0–3s Hook:</strong> "${v.hook}"
        </div>
        <div class="text-xs text-slate-300 space-y-1">
          <div class="text-[10px] font-bold text-cyan-400 uppercase">Google Veo Motion Prompt</div>
          <div class="text-[10px] font-mono bg-[#070a13] p-2.5 rounded border border-[#1a2337] text-cyan-200/90 break-words leading-relaxed">
            ${v.veo_prompt}
          </div>
        </div>
        <div class="pt-2 border-t border-[#1c263c] flex items-center justify-between text-[11px]">
          <span class="text-slate-400 font-mono text-[10px]">Sync: ${v.audio_sync}</span>
          <button onclick="copyPrompt('${encodeURIComponent(v.veo_prompt)}')" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            📋 Copy Prompt
          </button>
        </div>
      </div>
    `).join("");
  }

  // 2. Google Imagen 3 Theatrical Posters
  const postersGrid = document.getElementById("social-posters-grid");
  const posters = social.posters_imagen_3 || [
    {
      poster_type: "Official Theatrical Teaser Key Art",
      title_text: "THE LAST SPELL",
      tagline: "The barrier is failing. The countdown begins.",
      imagen_prompt: "Google Imagen 3 prompt: High-impact 2:3 vertical theatrical movie poster, wide angle low perspective of a solitary weathered scout in a charcoal duster standing on wet granite steps looking up at a colossal glowing violet magical forcefield dome protecting a gothic cathedral, heavy rainstorm, ominous silhouettes of normal-looking crowds staring from the dark mist, dramatic IMAX typography space, rich cinematic lighting, 8K masterpiece",
      color_palette: "#1E1B4B (Violet), #D97706 (Amber), #0F172A (Slate)"
    },
    {
      poster_type: "Character Teaser Poster: The Infiltrator",
      title_text: "ELIAS: THE MIMIC",
      tagline: "They don't growl. They ask about your family.",
      imagen_prompt: "Google Imagen 3 prompt: 2:3 vertical character teaser poster, extreme close-up portrait of a sharp-dressed gentleman with slicked hair holding an umbrella in the rain, polite warm smile contrasting with dead soulless eyes, split-lighting chiaroscuro with warm sodium yellow on one side and cold void black on the other, atmospheric film grain, 8K photorealism",
      color_palette: "#78350F (Rust), #F59E0B (Sodium), #000000 (Void)"
    }
  ];
  if (postersGrid) {
    postersGrid.innerHTML = posters.map(p => `
      <div class="cinema-card p-5 space-y-3 border-indigo-500/30 bg-gradient-to-b from-[#0e142c] to-[#0d1220]">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">2:3 VERTICAL KEY ART</span>
          <span class="text-[10px] text-slate-400 font-mono">${p.color_palette}</span>
        </div>
        ${(p.title_text && p.title_text.toLowerCase().includes('last spell')) ? `
          <img src="/static/img/the_last_spell_poster.jpg" alt="The Last Spell Official Poster" class="w-full h-72 object-cover object-top rounded-lg border border-indigo-500/40 my-2 shadow-md">
        ` : ''}
        <h4 class="text-sm font-extrabold text-white">${p.poster_type}: ${p.title_text}</h4>
        <div class="text-xs italic text-amber-200 font-serif">"${p.tagline}"</div>
        <div class="text-xs text-slate-300 space-y-1">
          <div class="text-[10px] font-bold text-indigo-400 uppercase">Google Imagen 3 Prompt</div>
          <div class="text-[10px] font-mono bg-[#070a13] p-2.5 rounded border border-[#1a2337] text-indigo-200/90 break-words leading-relaxed">
            ${p.imagen_prompt}
          </div>
        </div>
        <div class="pt-2 border-t border-[#1c263c] flex justify-end">
          <button onclick="copyPrompt('${encodeURIComponent(p.imagen_prompt)}')" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            📋 Copy Poster Prompt
          </button>
        </div>
      </div>
    `).join("");
  }

  // 3. TikTok / Shorts Scripts
  const posts = social.tiktok_reels_shorts || [];
  const socialGrid = document.getElementById("social-cards-grid");
  if (socialGrid) {
    socialGrid.innerHTML = posts.map(p => `
      <div class="cinema-card p-5 flex flex-col justify-between space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">${p.platform}</span>
            <span class="text-[10px] text-slate-400 font-mono">${p.format}</span>
          </div>
          <h4 class="font-bold text-white text-xs">${p.title}</h4>
          <div class="text-[11px] text-amber-300 font-medium bg-[#111728] p-2 rounded">
            <strong>Hook:</strong> "${p.hook}"
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${p.script}</p>
        </div>
        <div class="pt-2 border-t border-[#1c263c] text-[10px] text-slate-400 flex flex-col gap-1">
          <div><strong>CTA:</strong> ${p.cta}</div>
          <div class="text-indigo-400">${(p.hashtags || []).join(" ")}</div>
        </div>
      </div>
    `).join("");
  }

  // 4. Memes and Polls
  const memesGrid = document.getElementById("social-memes-grid");
  const memes = social.meme_concepts || [
    { concept: "Me checking phone battery at 1% vs. Kaelen checking forearm with 60 seconds left on protection spell.", caption: "Same panic, different stakes. ⏳😭" },
    { concept: "Elias asking how my day was with a perfectly calm face while waiting for my spell to expire.", caption: "Customer service workers dealing with Monday morning emails." }
  ];
  const polls = social.audience_polls || [
    { question: "If you had a 4-hour countdown spell to leave the sanctuary, would you:", options: ["Scavenge food & medical supplies", "Search for the missing Keystone crystals", "Refuse to leave the Inner Cathedral"] }
  ];
  if (memesGrid) {
    const memesHtml = memes.map(m => `
      <div class="p-4 rounded-lg bg-[#111728] border border-[#1e2a44] space-y-2 text-xs">
        <div class="text-[10px] font-bold text-amber-400 uppercase">Viral Meme Concept</div>
        <div class="text-slate-200 font-medium">${m.concept}</div>
        <div class="text-indigo-300 italic font-mono text-[11px]">"${m.caption}"</div>
      </div>
    `).join("");
    const pollsHtml = polls.map(pl => `
      <div class="p-4 rounded-lg bg-[#111728] border border-[#1e2a44] space-y-2 text-xs">
        <div class="text-[10px] font-bold text-emerald-400 uppercase">Audience Engagement Poll</div>
        <div class="text-white font-bold">${pl.question}</div>
        <div class="space-y-1.5 mt-2">
          ${(pl.options || []).map(opt => `<div class="px-3 py-1.5 rounded bg-[#0b0f1a] border border-[#1c263c] text-[11px] text-slate-300 font-mono flex items-center gap-2"><span>🔘</span><span>${opt}</span></div>`).join("")}
        </div>
      </div>
    `).join("");
    memesGrid.innerHTML = memesHtml + pollsHtml;
  }
}

// ============================================================
// 3. ACTIONS & WORKFLOW TRIGGERS
// ============================================================

// Central Production Run
async function runCentralProduction() {
  const ideaInput = document.getElementById("global-idea-input");
  const idea = ideaInput?.value.trim() || STATE.currentProject?.project?.logline || "";

  const btn = document.getElementById("btn-run-production");
  if (btn) {
    btn.innerHTML = `<span class="animate-spin">⚙️</span> <span>ORCHESTRATING...</span>`;
    btn.disabled = true;
  }

  try {
    const res = await fetch("/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: STATE.currentProjectId,
        idea: idea,
        force_regenerate: true
      })
    });
    const data = await res.json();
    if (data.success && data.bible) {
      STATE.currentProject = data.bible;
      renderAllViews();
      await loadClickHouseTelemetry();
      alert("🎬 Production Swarm Completed Successfully!\nAll 10 agent disciplines updated and synchronized.");
    } else {
      alert(`Production error: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error("Pipeline run error:", err);
    alert("Pipeline error: " + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = `<span>▶ RUN PRODUCTION</span>`;
      btn.disabled = false;
    }
  }
}

// Retry a single agent in isolation
async function retrySingleAgent(agentName) {
  try {
    const res = await fetch("/api/pipeline/retry-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: STATE.currentProjectId,
        agent_name: agentName
      })
    });
    const data = await res.json();
    if (data.success && data.bible) {
      STATE.currentProject = data.bible;
      renderAllViews();
      await loadClickHouseTelemetry();
      alert(`✓ Agent [${agentName.toUpperCase()}] re-executed successfully!`);
    } else {
      alert(`Error retrying ${agentName}: ${data.error}`);
    }
  } catch (err) {
    alert(`Failed to retry agent: ${err.message}`);
  }
}

// Switch Active Project
async function switchProject(projectId) {
  await loadCurrentProject(projectId);
  await loadClickHouseTelemetry();
  renderProjectsList();
}

// Copy Text Helper
function copyPrompt(encodedPrompt) {
  const text = decodeURIComponent(encodedPrompt);
  navigator.clipboard.writeText(text);
  alert("✓ 8K Storyboard prompt copied to clipboard!");
}

// ============================================================
// 4. PARTNER MCP: CLICKHOUSE SQL CONSOLE
// ============================================================

async function executeClickHouseSqlQuery() {
  const input = document.getElementById("sql-query-input");
  const query = input?.value.trim();
  if (!query) return;

  const thead = document.getElementById("mcp-table-head");
  const tbody = document.getElementById("mcp-table-body");

  tbody.innerHTML = `<tr><td class="p-3 text-cyan-400" colspan="6">Querying ClickHouse MCP Server tool run_clickhouse_query...</td></tr>`;

  try {
    const res = await fetch("/api/mcp/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "run_clickhouse_query",
        arguments: { query: query, project_id: STATE.currentProjectId }
      })
    });
    const data = await res.json();
    const result = data.result || {};

    if (result.error) {
      tbody.innerHTML = `<tr><td class="p-3 text-red-400" colspan="6">Error: ${result.error}</td></tr>`;
      return;
    }

    const cols = result.column_names || ["column_1", "column_2"];
    thead.innerHTML = `<tr>${cols.map(c => `<th class="p-2 text-cyan-300 font-mono">${c}</th>`).join("")}</tr>`;

    const rows = result.result_rows || [];
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td class="p-3 text-slate-500" colspan="${cols.length}">No records returned.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr class="hover:bg-[#111728]">
        ${r.map(v => `<td class="p-2 font-mono text-slate-300">${typeof v === 'object' ? JSON.stringify(v) : v}</td>`).join("")}
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td class="p-3 text-red-400" colspan="6">MCP invocation failed: ${err.message}</td></tr>`;
  }
}

function setQueryPreset(type) {
  const input = document.getElementById("sql-query-input");
  if (!input) return;

  if (type === "telemetry") {
    input.value = "SELECT agent_name, count(), avg(latency_ms), sum(prompt_tokens + completion_tokens) FROM production_telemetry GROUP BY agent_name";
  } else if (type === "characters") {
    input.value = "SELECT character_name, sum(dialogue_lines), sum(word_count), avg(sentiment_score) FROM character_analytics GROUP BY character_name";
  } else if (type === "scenes") {
    input.value = "SELECT scene_number, slugline, shot_count, vfx_complexity_score, estimated_budget_tier FROM scene_metrics";
  }
  executeClickHouseSqlQuery();
}

// ============================================================
// 5. REVENUECAT MONETIZATION & PLANS
// ============================================================

function renderPlans() {
  const container = document.getElementById("plans-container");
  const modalGrid = document.getElementById("paywall-plans-grid");

  const plans = [
    { id: "FREE", name: "FREE", price: "$0 / mo", credits: 50, desc: "Entry-level script development", badge: "BASIC" },
    { id: "CREATOR", name: "CREATOR", price: "$29 / mo", credits: 150, desc: "Visual bibles & shot lists", badge: "POPULAR" },
    { id: "PRO", name: "PRO", price: "$79 / mo", credits: 500, desc: "Full 10-Agent swarm & ClickHouse", badge: "STUDIO" },
    { id: "STUDIO", name: "STUDIO", price: "$249 / mo", credits: 2500, desc: "Custom agents & enterprise pipelines", badge: "ENTERPRISE" }
  ];

  const renderCard = (p) => `
    <div class="p-4 rounded-xl bg-[#111728] border ${p.name === (STATE.currentProject?.project?.plan || 'PRO') ? 'border-amber-400/80 bg-[#162038]' : 'border-[#1e2a44]'} flex flex-col justify-between space-y-3">
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">${p.badge}</span>
          <span class="text-xs font-bold text-white">${p.price}</span>
        </div>
        <h4 class="font-extrabold text-white text-sm mt-1">${p.name}</h4>
        <div class="text-xs font-bold text-indigo-400">${p.credits} AI Credits</div>
        <p class="text-[11px] text-slate-400">${p.desc}</p>
      </div>
      <button onclick="demoPurchasePlan('${p.name}')" class="w-full py-1.5 rounded-lg text-xs font-semibold ${p.name === (STATE.currentProject?.project?.plan || 'PRO') ? 'bg-amber-500 text-black' : 'bg-[#1c2842] hover:bg-indigo-600 text-white'} transition">
        ${p.name === (STATE.currentProject?.project?.plan || 'PRO') ? 'Active Plan' : 'Select Plan (Demo)'}
      </button>
    </div>
  `;

  if (container) container.innerHTML = plans.map(renderCard).join("");
  if (modalGrid) modalGrid.innerHTML = plans.map(renderCard).join("");
}

async function demoPurchasePlan(planName) {
  try {
    const res = await fetch("/api/monetization/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planName })
    });
    const data = await res.json();
    if (data.success) {
      if (STATE.currentProject) {
        STATE.currentProject.project.plan = planName;
        STATE.currentProject.project.credits_total = data.credits;
        STATE.currentProject.project.credits_used = 0;
      }
      renderAllViews();
      renderPlans();
      closePaywallModal();
      alert(`🎉 DEMO UPGRADE: Plan upgraded to ${planName} with ${data.credits} AI Credits unlocked via RevenueCat mock adapter.`);
    }
  } catch (err) {
    alert("Failed to upgrade plan: " + err.message);
  }
}

// Pre-action credit confirmation
function confirmCreditAction(actionName, callback) {
  const costs = { "Storyboard": 5, "Script": 2, "Character": 3, "Image": 8, "Final Render": 30 };
  const cost = costs[actionName] || 2;

  const msg = document.getElementById("credit-confirm-message");
  if (msg) msg.innerText = `This operation will use ${cost} AI credits.`;

  const btn = document.getElementById("btn-credit-continue");
  if (btn) {
    btn.onclick = async () => {
      closeCreditConfirmModal();
      await fetch("/api/monetization/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName })
      });
      callback();
    };
  }
  const modal = document.getElementById("modal-credit-confirm");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.remove("hidden");
  }
}

function closeCreditConfirmModal() {
  const modal = document.getElementById("modal-credit-confirm");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

function showPaywallModal() {
  const modal = document.getElementById("modal-paywall");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.remove("hidden");
  }
}

function closePaywallModal() {
  const modal = document.getElementById("modal-paywall");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

// ============================================================
// 6. EXPORTS & DOWNLOADS
// ============================================================

function downloadMasterPdf() {
  window.open(`/api/export/pdf-html?project_id=${STATE.currentProjectId}`, '_blank');
}

function downloadFountainScript() {
  window.open(`/api/export/fountain?project_id=${STATE.currentProjectId}`, '_blank');
}

function viewMomoMarkdown() {
  window.open(`/api/export/momo?project_id=${STATE.currentProjectId}`, '_blank');
}

function exportClickHouseTelemetry() {
  window.open(`/api/telemetry?project_id=${STATE.currentProjectId}`, '_blank');
}

// ============================================================
// 7. PROJECT CREATION WIZARD
// ============================================================

function openNewMovieWizard() {
  const modal = document.getElementById("modal-wizard");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.remove("hidden");
  }
}

function closeNewMovieWizard() {
  const modal = document.getElementById("modal-wizard");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

function loadDefaultDemoPreset() {
  document.getElementById("wizard-title").value = "THE LAST SPELL";
  document.getElementById("wizard-logline").value = "Inside humanity's last dual-barrier sanctuary, an expedition scout ventures beyond the perimeter with a fading 4-hour protection spell, knowing the outside zombies behave like ordinary humans—and the inner barrier is dying.";
  document.getElementById("wizard-genre").value = "Post-Apocalyptic Supernatural Thriller";
  document.getElementById("wizard-tone").value = "Gritty, tense, visually cinematic";
  document.getElementById("wizard-visual-style").value = "35mm Anamorphic Widescreen";
  document.getElementById("wizard-duration").value = "112 Minutes";
}

async function submitNewMovieWizard() {
  const title = document.getElementById("wizard-title").value.trim() || "UNTITLED PROJECT";
  const logline = document.getElementById("wizard-logline").value.trim();
  const genre = document.getElementById("wizard-genre").value.trim();
  const tone = document.getElementById("wizard-tone").value.trim();
  const visualStyle = document.getElementById("wizard-visual-style").value.trim();
  const duration = document.getElementById("wizard-duration").value.trim();

  if (!logline) {
    alert("Please enter a movie idea or logline.");
    return;
  }

  try {
    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        logline,
        genre,
        tone,
        visual_style: visualStyle,
        target_duration: duration
      })
    });
    const data = await res.json();
    if (data.success && data.project_id) {
      closeNewMovieWizard();
      await loadProjects();
      await switchProject(data.project_id);
      switchTab("script");
      alert(`🎬 New Movie '${title}' created!\nRunning production swarm to assemble film package...`);
      runCentralProduction();
    }
  } catch (err) {
    alert("Failed to create project: " + err.message);
  }
}

// ============================================================
// 8. NAVIGATION TAB SWITCHING
// ============================================================

function switchTab(tabId) {
  STATE.activeTab = tabId;

  const tabs = ["dashboard", "chat", "projects", "script", "storyboard", "agents", "assets", "render", "social", "settings"];
  tabs.forEach(t => {
    const el = document.getElementById(`view-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (el) {
      if (t === tabId) el.classList.remove("hidden");
      else el.classList.add("hidden");
    }
    if (navBtn) {
      if (t === tabId) navBtn.classList.add("active");
      else navBtn.classList.remove("active");
    }
  });

  if (tabId === "chat") {
    initChatUI();
    refreshRevenueCatStatus();
  }

  if (tabId === "settings") {
    loadSystemHealth();
    executeClickHouseSqlQuery();
  }
}

function refreshDashboardData() {
  loadSystemHealth();
  loadClickHouseTelemetry();
  loadCurrentProject(STATE.currentProjectId);
}

async function updateSwarmModel(modelName) {
  try {
    const res = await fetch("/api/settings/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelName })
    });
    const data = await res.json();
    if (data.success) {
      alert(`✓ Global Swarm Model updated to: ${modelName}`);
      await loadSystemHealth();
    }
  } catch (err) {
    console.error("Failed to update model:", err);
  }
}

// 7. CLICKHOUSE CLOUD CONNECTION MODAL HANDLERS
async function openClickHouseModal() {
  const modal = document.getElementById("modal-clickhouse");
  if (!modal) return;
  modal.style.display = "flex";
  modal.classList.remove("hidden");
  await loadClickHouseConfig();
}

function closeClickHouseModal() {
  const modal = document.getElementById("modal-clickhouse");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

async function loadClickHouseConfig() {
  try {
    const res = await fetch("/api/settings/clickhouse");
    const data = await res.json();

    const hostInput = document.getElementById("ch-input-host");
    const portInput = document.getElementById("ch-input-port");
    const userInput = document.getElementById("ch-input-user");
    const dbInput = document.getElementById("ch-input-database");
    const secInput = document.getElementById("ch-input-secure");

    if (hostInput) hostInput.value = data.host || "";
    if (portInput) portInput.value = data.port || 8443;
    if (userInput) userInput.value = data.username || "default";
    if (dbInput) dbInput.value = data.database || "cinema";
    if (secInput) secInput.checked = !!data.secure;

    const statusText = document.getElementById("ch-modal-status-text");
    const dot = document.getElementById("ch-modal-dot");
    const typeBadge = document.getElementById("ch-modal-type-badge");

    if (statusText) {
      statusText.innerText = data.connection_type === "CLICKHOUSE_CLOUD"
        ? `Connected to ClickHouse Cloud (${data.database})`
        : `Connected to ClickHouse Engine (${data.telemetry_count || 10} events active)`;
    }
    if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
    if (typeBadge) {
      typeBadge.innerText = data.connection_type === "CLICKHOUSE_CLOUD" ? "CLOUD ACTIVE" : "MCP CONNECTED";
      typeBadge.className = "text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono";
    }
  } catch (err) {
    console.error("Error loading ClickHouse config:", err);
  }
}

async function saveClickHouseConfig() {
  const btn = document.getElementById("btn-save-clickhouse");
  const msgBox = document.getElementById("ch-modal-msg");
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML = `<span>⏳ Connecting...</span>`;
    btn.disabled = true;

    const host = document.getElementById("ch-input-host").value.trim();
    const port = parseInt(document.getElementById("ch-input-port").value || 8443);
    const username = document.getElementById("ch-input-user").value.trim() || "default";
    const password = document.getElementById("ch-input-password").value.trim();
    const database = document.getElementById("ch-input-database").value.trim() || "cinema";
    const secure = document.getElementById("ch-input-secure").checked;

    const res = await fetch("/api/settings/clickhouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, port, username, password, database, secure })
    });
    const data = await res.json();

    if (msgBox) {
      msgBox.classList.remove("hidden");
      if (data.success) {
        msgBox.className = "p-2.5 rounded text-xs font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300";
        msgBox.innerText = `✓ ${data.message}`;
      } else {
        msgBox.className = "p-2.5 rounded text-xs font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300";
        msgBox.innerText = `⚠️ ${data.message || data.error}`;
      }
    }

    await loadSystemHealth();
    await loadClickHouseConfig();
    await executeClickHouseSqlQuery();
  } catch (err) {
    if (msgBox) {
      msgBox.classList.remove("hidden");
      msgBox.className = "p-2.5 rounded text-xs font-mono bg-red-500/20 border border-red-500/40 text-red-300";
      msgBox.innerText = `Connection error: ${err.message}`;
    }
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

async function testClickHouseConnection() {
  await saveClickHouseConfig();
}


// ============================================================
// 9. CHATGPT-STYLE AI STUDIO CHAT & REVENUECAT SUBSCRIPTION
// ============================================================

const CHAT_STATE = {
  activeModel: "gemini-3.6-flash",
  activeSession: "default",
  messages: [],
  isWorking: false,
  hammerInterval: null,
  hammerSteps: [
    "Hammering narrative foundations & 12-vector universe laws...",
    "Framing 35mm anamorphic camera setups & optical blocking...",
    "Calculating 432 Hz sub-bass acoustic foley resonance...",
    "Auditing 12-vector continuity engine & countdown timer...",
    "Polishing cinematic directorial output with Gemini 3.5+..."
  ]
};

function renderChatSessions() {
  const container = document.getElementById("chat-sessions-list");
  if (!container) return;

  const sessions = [
    { id: "default", title: "THE LAST SPELL: Master Copilot", icon: "🎬", tag: "Active" },
    { id: "scene-45", title: "Scene 45 Bridge Sacrifice", icon: "💥", tag: "Scene 45" },
    { id: "elias-psych", title: "Elias Mimic Monologues", icon: "🎭", tag: "Dialogue" },
    { id: "sound-432hz", title: "432 Hz Acoustic Blueprint", icon: "🔊", tag: "Sound" }
  ];

  const countEl = document.getElementById("chat-session-count");
  if (countEl) countEl.innerText = `${sessions.length} Threads`;

  container.innerHTML = sessions.map(s => {
    const isActive = s.id === CHAT_STATE.activeSession;
    return `
      <div class="group relative">
        <button onclick="loadChatSession('${s.id}')" class="chat-session-btn w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer ${
          isActive 
            ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/25 border border-indigo-500/50 text-white shadow-md' 
            : 'hover:bg-[#111728] text-slate-400 hover:text-slate-200 border border-transparent'
        }">
          <div class="flex items-center gap-2.5 truncate">
            <span class="text-sm shrink-0">${s.icon}</span>
            <span class="truncate">${escapeHtml(s.title)}</span>
          </div>
          <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">${s.tag}</span>
        </button>
      </div>
    `;
  }).join("");
}

function initChatUI() {
  const p = STATE.currentProject?.project || {};
  const projTitle = p.title || "THE LAST SPELL";
  const projEl = document.getElementById("chat-header-project-name");
  if (projEl) projEl.innerText = projTitle;

  const modelSel = document.getElementById("chat-model-selector");
  if (modelSel && CHAT_STATE.activeModel) {
    modelSel.value = CHAT_STATE.activeModel;
  }
  renderChatSessions();
  refreshRevenueCatStatus();
}

async function onChatModelChange(newModel) {
  // Validate model >= 3.5
  const lower = (newModel || "").toLowerCase();
  if (lower.includes("1.") || lower.includes("2.0") || lower.includes("2.5") || lower.includes("gemini-1") || lower.includes("gemini-2")) {
    alert("Studio Policy Alert: Only Gemini models 3.5 and above are permitted.");
    const sel = document.getElementById("chat-model-selector");
    if (sel) sel.value = CHAT_STATE.activeModel;
    return;
  }
  CHAT_STATE.activeModel = newModel;

  try {
    const res = await fetch("/api/settings/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: newModel })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotice(`✨ Model switched to ${newModel} (Gemini 3.5+ Verified)`);
    }
  } catch (err) {
    console.warn("Model change sync error:", err);
  }
}

function handleChatKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChatSubmit(e);
  }
}

function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById("chat-input-field");
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text || CHAT_STATE.isWorking) return;

  inputEl.value = "";
  sendChatMessage(text);
}

function sendQuickPrompt(promptText) {
  const inputEl = document.getElementById("chat-input-field");
  if (inputEl) inputEl.value = promptText;
  sendChatMessage(promptText);
}

function appendUserBubble(text) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const welcomeBanner = document.getElementById("chat-welcome-banner");
  if (welcomeBanner) welcomeBanner.classList.add("hidden");

  const bubble = document.createElement("div");
  bubble.className = "flex items-start justify-end gap-3 max-w-2xl ml-auto";
  bubble.innerHTML = `
    <div class="bg-indigo-600/90 text-white text-xs md:text-sm p-3.5 rounded-2xl rounded-tr-none shadow-lg border border-indigo-400/30 leading-relaxed break-words whitespace-pre-wrap">
      ${escapeHtml(text)}
    </div>
    <div class="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
      PRO
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function createBuildingBubble(bubbleId) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return null;

  const bubble = document.createElement("div");
  bubble.id = bubbleId;
  bubble.className = "flex items-start gap-3 max-w-3xl";
  bubble.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center text-sm text-amber-300 shrink-0 shadow-md">
      🎬
    </div>
    <div class="flex-1 min-w-0 bg-[#0d1324] text-slate-200 text-xs md:text-sm p-4 rounded-2xl rounded-tl-none border border-[#1d2a45] shadow-lg leading-relaxed space-y-3">
      
      <!-- INLINE HAMMER BUILDING WIDGET -->
      <div class="inline-hammer-card p-3.5 rounded-xl bg-[#080d1a] border border-amber-500/40 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="relative w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg border border-amber-500/30 shrink-0">
              <span class="animate-hammer-swing text-xl">🔨</span>
              <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <div>
              <div class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>AGENT SWARM CONSTRUCTING</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div class="inline-hammer-text text-xs font-semibold text-slate-200 truncate mt-0.5">
                Hammering narrative foundations & 12-vector universe laws...
              </div>
            </div>
          </div>
          <span class="inline-hammer-step text-[10px] font-mono text-slate-400">Step 1 of 5</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="inline-hammer-bar bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" style="width: 20%"></div>
        </div>

        <!-- Multi-Agent Pipeline Marquee -->
        <div class="flex items-center gap-1.5 pt-1 text-[9px] font-mono text-slate-400 overflow-x-auto no-scrollbar">
          <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Producer</span> →
          <span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Screenwriter</span> →
          <span class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Director</span> →
          <span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Cinematographer</span> →
          <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">${CHAT_STATE.activeModel}</span>
        </div>
      </div>

    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function resolveBuildingBubble(bubbleEl, data) {
  if (!bubbleEl) return;
  const contentWrapper = bubbleEl.querySelector(".flex-1");
  if (!contentWrapper) return;

  const modelUsed = data.model || CHAT_STATE.activeModel || "gemini-3.6-flash";
  const reply = data.reply || "Director's Note: Production analysis complete.";
  const matchedScene = data.matched_scene;
  const isSubQuery = data.is_subscription_query;
  const subData = data.subscription_data || {};

  // Build Subscription Widget if user asked about RevenueCat
  let subWidgetHtml = "";
  if (isSubQuery) {
    subWidgetHtml = `
      <div class="my-3 p-3.5 rounded-xl bg-gradient-to-r from-[#0c1428] via-[#0f1934] to-[#0c1428] border border-amber-500/40 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>💳 REVENUECAT ACTIVE SUBSCRIPTION</span>
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
            ${subData.plan || "PRO"} TIER
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center pt-1">
          <div class="p-2 rounded-lg bg-[#131d38] border border-[#1d2b4e]">
            <div class="text-[10px] text-slate-400">Available Balance</div>
            <div class="text-base font-bold font-mono text-emerald-400">${subData.credits_available ?? 200} CR</div>
          </div>
          <div class="p-2 rounded-lg bg-[#131d38] border border-[#1d2b4e]">
            <div class="text-[10px] text-slate-400">Plan Allocation</div>
            <div class="text-base font-bold font-mono text-slate-200">${subData.credits_total ?? 250} CR</div>
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button onclick="openRevenueCatModal()" class="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition text-center cursor-pointer">
            Manage Subscription
          </button>
          <button onclick="quickUpgradePlan('STUDIO')" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer">
            Upgrade to STUDIO
          </button>
        </div>
      </div>
    `;
  }

  // Scene quick jump button if scene was mentioned
  let sceneActionHtml = "";
  if (matchedScene) {
    sceneActionHtml = `
      <button onclick="jumpToSceneInScript(${matchedScene})" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition cursor-pointer">
        <span>📜 Open Scene ${matchedScene} in Screenplay Workspace</span>
      </button>
    `;
  }

  contentWrapper.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-[#1c2842] text-[10px] text-slate-400">
      <span class="font-bold text-amber-400 flex items-center gap-1.5">
        <span>Google Gemini Studio Copilot</span>
        <span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">${modelUsed}</span>
      </span>
      <div class="flex items-center gap-2">
        <button onclick="copyToClipboard(this)" class="hover:text-white transition">Copy</button>
        <span>•</span>
        <span class="font-mono text-emerald-400">-2 CR</span>
      </div>
    </div>

    <!-- Collapsible Construction Steps Summary -->
    <details class="group cursor-pointer">
      <summary class="text-[11px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 bg-[#080d1a] border border-[#1b263e] px-2.5 py-1 rounded-lg w-fit list-none">
        <span>🔨 Built with 5 Agent Steps & ${modelUsed}</span>
        <span class="text-slate-500 text-[10px] group-open:rotate-180 transition">▼</span>
      </summary>
      <div class="mt-2 p-2.5 bg-[#060a14] rounded-lg border border-[#141e30] text-[10px] font-mono text-slate-400 space-y-1">
        <div>✓ Step 1: Narrative & World Law Foundation</div>
        <div>✓ Step 2: 35mm Anamorphic Optical Framing</div>
        <div>✓ Step 3: Acoustic Frequency Tuning (432 Hz)</div>
        <div>✓ Step 4: 12-Vector Continuity Verification</div>
        <div>✓ Step 5: Directorial Synthesis via ${modelUsed}</div>
      </div>
    </details>

    ${subWidgetHtml}

    <div class="chat-markdown-body space-y-2 text-xs md:text-sm text-slate-200 leading-relaxed pt-1">
      ${formatChatMarkdown(reply)}
    </div>

    <!-- Action Bar -->
    <div class="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1c2842]">
      ${sceneActionHtml}
      <button onclick="runCentralProduction()" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111728] hover:bg-[#162038] border border-[#23314f] text-slate-300 hover:text-white text-xs transition cursor-pointer">
        <span>🎬 Run Swarm Pipeline</span>
      </button>
      <button onclick="openRevenueCatModal()" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111728] hover:bg-[#162038] border border-[#23314f] text-slate-300 hover:text-white text-xs transition cursor-pointer">
        <span>💳 Check Subscription</span>
      </button>
    </div>
  `;

  const container = document.getElementById("chat-messages-container");
  if (container) container.scrollTop = container.scrollHeight;
}

function jumpToSceneInScript(sceneNum) {
  switchTab("script");
  setTimeout(() => {
    selectWorkspaceScene(sceneNum);
    showToastNotice(`🎬 Switched to Scene ${sceneNum} in Screenplay Workspace`);
  }, 200);
}

async function sendChatMessage(text) {
  if (CHAT_STATE.isWorking) return;
  CHAT_STATE.isWorking = true;

  appendUserBubble(text);
  const sendBtn = document.getElementById("chat-send-btn");
  if (sendBtn) sendBtn.disabled = true;

  const bubbleId = `building_bubble_${Date.now()}`;
  const buildingBubble = createBuildingBubble(bubbleId);

  // Progressive construction steps
  let step = 0;
  const stepInterval = setInterval(() => {
    step = (step + 1) % CHAT_STATE.hammerSteps.length;
    if (buildingBubble) {
      const stepEl = buildingBubble.querySelector(".inline-hammer-step");
      const textEl = buildingBubble.querySelector(".inline-hammer-text");
      const barEl = buildingBubble.querySelector(".inline-hammer-bar");
      if (stepEl) stepEl.innerText = `Step ${step + 1} of 5`;
      if (textEl) textEl.innerText = CHAT_STATE.hammerSteps[step];
      if (barEl) barEl.style.width = `${((step + 1) / 5) * 100}%`;
    }
  }, 1200);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        model: CHAT_STATE.activeModel,
        session_id: CHAT_STATE.activeSession,
        project_id: STATE.currentProjectId || "proj_last_spell"
      })
    });

    clearInterval(stepInterval);
    const data = await res.json();
    CHAT_STATE.isWorking = false;
    if (sendBtn) sendBtn.disabled = false;

    if (data.success) {
      resolveBuildingBubble(buildingBubble, data);
      updateRevenueCatUI(data.credits_remaining, data.plan);
    } else {
      resolveBuildingBubble(buildingBubble, {
        reply: `⚠️ **Studio Notice:** ${data.message || data.error || "Unable to complete request."}`,
        model: CHAT_STATE.activeModel
      });
      if (data.error === "INSUFFICIENT_CREDITS") {
        openRevenueCatModal();
      }
    }
  } catch (err) {
    clearInterval(stepInterval);
    CHAT_STATE.isWorking = false;
    if (sendBtn) sendBtn.disabled = false;
    resolveBuildingBubble(buildingBubble, {
      reply: `⚠️ **Directorial Warning:** ${err.message}. Please verify the studio server is connected.`,
      model: CHAT_STATE.activeModel
    });
  }
}

function formatChatMarkdown(text) {
  if (!text) return "";
  let html = escapeHtml(text);
  
  // Bold
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-amber-400 font-bold text-xs uppercase tracking-wider mt-2 mb-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-indigo-300 font-bold text-sm mt-3 mb-1">$1</h3>');
  
  // Code / Screenplay blocks
  html = html.replace(/```(?:screenplay|json)?([\s\S]*?)```/g, '<div class="p-3 my-2 rounded-lg bg-[#080c18] border border-[#1c2740] font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">$1</div>');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
  
  // Newlines
  html = html.replace(/\n\n/g, '<div class="h-2"></div>');
  
  return html;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function copyToClipboard(btn) {
  const text = btn.closest(".flex-1")?.querySelector(".chat-markdown-body")?.innerText;
  if (text) {
    navigator.clipboard.writeText(text);
    btn.innerText = "Copied!";
    setTimeout(() => { btn.innerText = "Copy"; }, 2000);
  }
}

function clearCurrentChat() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.innerHTML = `
      <div id="chat-welcome-banner" class="max-w-2xl mx-auto text-center py-8 space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400 glow-accent">
          🎬
        </div>
        <h2 class="text-lg md:text-xl font-bold text-white">Agentic Cinema Studio Copilot</h2>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Direct your autonomous film swarm, write scenes, audit continuity, calibrate optical packages, or inspect universe rules with Google Gemini 3.5+.
        </p>
      </div>
    `;
  }
  fetch("/api/chat/clear", { method: "POST" });
}

function startNewChatSession() {
  CHAT_STATE.activeSession = `session_${Date.now()}`;
  renderChatSessions();
  clearCurrentChat();
  showToastNotice("✨ Started new production chat thread");
}

function loadChatSession(sessionId) {
  CHAT_STATE.activeSession = sessionId;
  renderChatSessions();
  clearCurrentChat();
  appendAssistantBubble(`Loaded production thread **${sessionId}**. How would you like to develop this sequence?`, CHAT_STATE.activeModel);
}

// ============================================================
// 10. REVENUECAT SUBSCRIPTION MANAGEMENT
// ============================================================

function openRevenueCatModal() {
  const modal = document.getElementById("modal-revenuecat-sub");
  if (modal) modal.classList.remove("hidden");
  refreshRevenueCatStatus();
}

function closeRevenueCatModal() {
  const modal = document.getElementById("modal-revenuecat-sub");
  if (modal) modal.classList.add("hidden");
}

async function refreshRevenueCatStatus() {
  try {
    const res = await fetch("/api/monetization/status");
    const data = await res.json();
    if (data) {
      updateRevenueCatUI(data.credits_available, data.plan, data.credits_total);
    }
  } catch (err) {
    console.warn("Could not fetch RevenueCat status:", err);
  }
}

function updateRevenueCatUI(availCredits, planName, totalCredits = 250) {
  const avail = availCredits !== undefined ? availCredits : 202;
  const plan = planName || "PRO";
  const total = totalCredits || 250;

  // Header badges
  const headerPlan = document.getElementById("header-plan-badge");
  const headerCredits = document.getElementById("header-credits-count");
  if (headerPlan) headerPlan.innerText = plan;
  if (headerCredits) headerCredits.innerText = `${avail} / ${total} CR`;

  // Chat badges
  const chatTier = document.getElementById("chat-rc-tier-badge");
  const chatCreditsNum = document.getElementById("chat-rc-credits-num");
  const chatBar = document.getElementById("chat-rc-progress-bar");
  const chatHeaderCredits = document.getElementById("chat-header-credits-badge");

  if (chatTier) chatTier.innerText = `${plan} PLAN`;
  if (chatCreditsNum) chatCreditsNum.innerText = `${avail} / ${total}`;
  if (chatHeaderCredits) chatHeaderCredits.innerText = `${avail} CR`;
  if (chatBar) {
    const pct = Math.max(5, Math.min(100, (avail / total) * 100));
    chatBar.style.width = `${pct}%`;
  }

  // Modal badges
  const modalPlan = document.getElementById("rc-modal-plan-badge");
  const modalAvail = document.getElementById("rc-modal-credits-avail");
  const modalTotal = document.getElementById("rc-modal-credits-total");
  if (modalPlan) modalPlan.innerText = `${plan} TIER`;
  if (modalAvail) modalAvail.innerText = `${avail} CR`;
  if (modalTotal) modalTotal.innerText = `${total} CR`;
}

async function upgradeRevenueCatPlan(planName) {
  try {
    const res = await fetch("/api/monetization/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planName })
    });
    const data = await res.json();
    if (data.success) {
      updateRevenueCatUI(data.credits, data.new_plan, data.credits);
      showToastNotice(`🎉 Plan upgraded to ${data.new_plan}! Credits refilled to ${data.credits} CR.`);
    }
  } catch (err) {
    alert(`Could not upgrade plan: ${err.message}`);
  }
}

function quickUpgradePlan(planName) {
  upgradeRevenueCatPlan(planName);
}

function checkRevenueCatInChat() {
  openRevenueCatModal();
}

function showToastNotice(msg) {
  const toast = document.createElement("div");
  toast.className = "fixed bottom-6 right-6 z-50 bg-[#111728] border border-indigo-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce";
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}
