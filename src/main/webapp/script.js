// ---------- 1. DATA ----------
// Sample memes. Replace these with real, publicly sourced memes.
let memes = [
  { id: 1, title: "Budget Day", leader: "Leader A", platform: "X", date: "2024-07-23", issue: "Economy", event: "Union Budget", likes: 5400, shares: 1200, comments: 310, tone: "Critical", framing: "Policy", url: "https://example.com/1", explain: "Posted after the budget speech. It questions a tax change, so it is tagged critical.", status: "live", reactions: 0, saves: 0, notes: [] },
  { id: 2, title: "Rally Crowd", leader: "Leader B", platform: "Instagram", date: "2024-04-12", issue: "Elections", event: "General Election", likes: 8800, shares: 2100, comments: 540, tone: "Supportive", framing: "Election", url: "https://example.com/2", explain: "A campaign-season edit that praises a rally.", status: "live", reactions: 0, saves: 0, notes: [] },
  { id: 3, title: "Fuel Joke", leader: "Leader A", platform: "Instagram", date: "2023-09-03", issue: "Inflation", event: "Fuel price hike", likes: 4100, shares: 900, comments: 220, tone: "Humorous", framing: "Governance", url: "https://example.com/3", explain: "A light-hearted meme about fuel prices.", status: "live", reactions: 0, saves: 0, notes: [] },
  { id: 4, title: "Debate Night", leader: "Leader C", platform: "X", date: "2024-05-20", issue: "Elections", event: "TV debate", likes: 6200, shares: 1700, comments: 480, tone: "Satirical", framing: "Personality", url: "https://example.com/4", explain: "Satire of a debate answer using exaggeration.", status: "live", reactions: 0, saves: 0, notes: [] },
  { id: 5, title: "Metro Launch", leader: "Leader B", platform: "X", date: "2022-11-14", issue: "Infrastructure", event: "Metro opening", likes: 3000, shares: 600, comments: 140, tone: "Supportive", framing: "Governance", url: "https://example.com/5", explain: "Celebrates a new metro line.", status: "live", reactions: 0, saves: 0, notes: [] },
  { id: 6, title: "Farm Bill", leader: "Leader C", platform: "Instagram", date: "2021-12-01", issue: "Agriculture", event: "Bill withdrawal", likes: 7200, shares: 1900, comments: 610, tone: "Critical", framing: "Policy", url: "https://example.com/6", explain: "Criticises how a farm law was handled.", status: "live", reactions: 0, saves: 0, notes: [] }
];

// Load saved data from the browser if it exists
if (localStorage.getItem("memes")) {
  memes = JSON.parse(localStorage.getItem("memes"));
}

function saveData() {
  localStorage.setItem("memes", JSON.stringify(memes));
}

// Colour for each tone (used in the Compare charts)
const toneColors = {
  Supportive: "#25513a",
  Critical: "#1f2cff",
  Humorous: "#f0dc5a",
  Satirical: "#000000"
};

// ---------- 2. SMALL HELPERS ----------
function getYear(meme) {
  return meme.date.slice(0, 4);
}

// Engagement score out of 100, compared with the most engaged meme
function engagement(meme) {
  return meme.likes + meme.shares * 2 + meme.comments * 3;
}

function getScore(meme) {
  let best = 0;
  for (let m of memes) {
    if (engagement(m) > best) best = engagement(m);
  }
  return Math.round((engagement(meme) / best) * 100);
}

// Stops user text from being treated as HTML
function safe(text) {
  return String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function find(id) {
  return memes.find(m => m.id == id);
}

// ---------- 3. SWITCH PAGES ----------
function showPage(name, button) {
  for (let page of document.querySelectorAll(".page")) page.classList.remove("show");
  for (let tab of document.querySelectorAll(".tab")) tab.classList.remove("active");
  document.getElementById(name).classList.add("show");
  button.classList.add("active");

  if (name === "compare") showCompare();
  if (name === "admin") showAdmin();
}

// ---------- 4. MEME CATALOGUE ----------
// Fill the leader and year dropdowns from the data
function fillFilters() {
  let leaders = [];
  let years = [];
  for (let m of memes) {
    if (m.status !== "live") continue;
    if (!leaders.includes(m.leader)) leaders.push(m.leader);
    if (!years.includes(getYear(m))) years.push(getYear(m));
  }
  leaders.sort();
  years.sort().reverse();

  document.getElementById("leaderFilter").innerHTML =
    "<option value=''>All leaders</option>" + leaders.map(l => `<option>${safe(l)}</option>`).join("");
  document.getElementById("yearFilter").innerHTML =
    "<option value=''>Any year</option>" + years.map(y => `<option>${y}</option>`).join("");
}

// Return only the memes that match the search and filters
function getFiltered() {
  let text = document.getElementById("search").value.toLowerCase();
  let leader = document.getElementById("leaderFilter").value;
  let platform = document.getElementById("platformFilter").value;
  let tone = document.getElementById("toneFilter").value;
  let year = document.getElementById("yearFilter").value;

  let result = memes.filter(function (m) {
    if (m.status !== "live") return false;
    if (leader && m.leader !== leader) return false;
    if (platform && m.platform !== platform) return false;
    if (tone && m.tone !== tone) return false;
    if (year && getYear(m) !== year) return false;
    let words = (m.title + " " + m.leader + " " + m.issue + " " + m.event).toLowerCase();
    return words.includes(text);
  });

  // Most engaged first
  result.sort((a, b) => engagement(b) - engagement(a));
  return result;
}

function showMemes() {
  let list = getFiltered();
  document.getElementById("count").textContent = list.length + " memes";

  if (list.length === 0) {
    document.getElementById("grid").innerHTML = "<p>No memes match. Try a different search or filter.</p>";
    return;
  }

  let html = "";
  for (let m of list) {
    html += `
      <div class="card" onclick="openMeme(${m.id})">
        <div class="cover c${m.id % 4}"><span>${safe(m.title.split(" ")[0].toLowerCase())}</span></div>
        <div class="card-top">
          <h3>${safe(m.title)}</h3>
          <div class="score">${getScore(m)}<small> /100</small></div>
        </div>
        <div class="card-info">${safe(m.leader)} · ${m.platform} · ${m.tone} · ${getYear(m)}</div>
      </div>`;
  }
  document.getElementById("grid").innerHTML = html;
}

// ---------- 5. MEME POPUP ----------
function openMeme(id) {
  let m = find(id);

  let notes = "";
  for (let n of m.notes) notes += `<div class="comment">${safe(n)}</div>`;
  if (notes === "") notes = "<p>No comments yet.</p>";

  document.getElementById("modalBox").innerHTML = `
    <div class="cover c${m.id % 4}"><span>${safe(m.title.split(" ")[0].toLowerCase())}</span></div>
    <h2>${safe(m.title)}</h2>
    <p><b>${m.tone}</b> · ${m.framing} · ${safe(m.issue)}</p>
    <p>Leader: ${safe(m.leader)} | Platform: ${m.platform} | Posted: ${m.date}</p>
    <p>Event: ${safe(m.event)} | Likes: ${m.likes} | Shares: ${m.shares} | Comments: ${m.comments}</p>
    <p><a href="${safe(m.url)}" target="_blank">View original post</a></p>
    <p class="explain">${safe(m.explain)}</p>

    <div class="modal-buttons">
      <button class="pill" onclick="react(${m.id})">👍 ${m.reactions}</button>
      <button class="pill" onclick="saveMeme(${m.id})">🔖 Save ${m.saves}</button>
      <button class="pill" onclick="shareMeme(${m.id})">Share</button>
      <button class="pill" onclick="closeMeme()">Close</button>
    </div>

    ${notes}
    <div class="comment-form">
      <input id="commentBox" placeholder="Add a respectful comment...">
      <button class="pill dark" onclick="addComment(${m.id})">Post</button>
    </div>`;

  document.getElementById("modal").classList.add("show");
}

function closeMeme() {
  document.getElementById("modal").classList.remove("show");
}

function react(id) { find(id).reactions++; saveData(); openMeme(id); }
function saveMeme(id) { find(id).saves++; saveData(); openMeme(id); }

function shareMeme(id) {
  navigator.clipboard.writeText(find(id).url);
  alert("Source link copied!");
}

function addComment(id) {
  let text = document.getElementById("commentBox").value.trim();
  if (text === "") return;
  find(id).notes.push(text);
  saveData();
  openMeme(id);
}

// ---------- 6. COMPARE CHARTS ----------
// Draw one stacked bar per group (for example per leader)
function drawBars(field, elementId) {
  let groups = [];
  for (let m of memes) {
    if (m.status === "live" && !groups.includes(m[field])) groups.push(m[field]);
  }

  let html = "";
  for (let group of groups) {
    let items = memes.filter(m => m.status === "live" && m[field] === group);

    let bar = "";
    for (let tone in toneColors) {
      let n = items.filter(m => m.tone === tone).length;
      let percent = (n / items.length) * 100;
      bar += `<div style="width:${percent}%; background:${toneColors[tone]}" title="${tone}: ${n}"></div>`;
    }

    html += `<div class="bar-row">
      <span class="bar-name">${safe(group)}</span>
      <div class="bar">${bar}</div>
      <span>${items.length}</span>
    </div>`;
  }
  document.getElementById(elementId).innerHTML = html;
}

function showCompare() {
  drawBars("leader", "byLeader");
  drawBars("platform", "byPlatform");
}

// ---------- 7. EXPORT CSV ----------
function exportCSV() {
  let rows = ["title,leader,platform,date,issue,event,likes,shares,comments,tone,framing,url"];
  for (let m of getFiltered()) {
    let line = [m.title, m.leader, m.platform, m.date, m.issue, m.event, m.likes, m.shares, m.comments, m.tone, m.framing, m.url];
    rows.push(line.map(v => '"' + v + '"').join(","));
  }
  let file = new Blob([rows.join("\n")], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "memes.csv";
  link.click();
}

// ---------- 8. SUBMIT A MEME ----------
document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  let data = Object.fromEntries(new FormData(e.target));
  let message = document.getElementById("message");

  // Duplicate check: same link, or same title and leader
  for (let m of memes) {
    let sameLink = m.url.toLowerCase() === data.url.toLowerCase();
    let sameTitle = m.title.toLowerCase() === data.title.toLowerCase() && m.leader.toLowerCase() === data.leader.toLowerCase();
    if (sameLink || sameTitle) {
      message.textContent = "This meme is already in the archive.";
      return;
    }
  }

  memes.push({
    id: memes.length + 1,
    title: data.title, url: data.url, leader: data.leader,
    platform: data.platform, date: data.date, issue: data.issue,
    event: data.event, likes: Number(data.likes), shares: 0, comments: 0,
    tone: data.tone, framing: data.framing, explain: data.explain,
    status: "pending", reactions: 0, saves: 0, notes: []
  });
  saveData();
  e.target.reset();
  message.textContent = "Submitted! An admin will review it.";
});

// ---------- 9. ADMIN ----------
function showAdmin() {
  let html = "";
  for (let m of memes) {
    let button = "";
    if (m.status === "pending") button = `<button class="pill" onclick="setStatus(${m.id}, 'live')">Approve</button>`;
    if (m.status === "live") button = `<button class="pill" onclick="setStatus(${m.id}, 'removed')">Take down</button>`;
    if (m.status === "removed") button = `<button class="pill" onclick="setStatus(${m.id}, 'live')">Restore</button>`;

    html += `<tr>
      <td>${safe(m.title)}<br><small>${safe(m.leader)} · ${m.platform}</small></td>
      <td><a href="${safe(m.url)}" target="_blank">Source</a></td>
      <td>${m.status}</td>
      <td>${button}</td>
    </tr>`;
  }
  document.getElementById("adminRows").innerHTML = html;
}

function setStatus(id, status) {
  find(id).status = status;
  saveData();
  showAdmin();
  fillFilters();
  showMemes();
}

// ---------- 10. START ----------
fillFilters();
showMemes();