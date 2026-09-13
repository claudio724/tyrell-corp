/* ─── SUPABASE CONFIG ─── */
const SUPABASE_URL = "https://jhftgebpynvtekrgftnr.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Mhe8vut0WBV2n2gedN57Q_kWn8TOvS";

/* ─── RENDER CARDS ─── */
function buildCards(androids) {
  const grid = document.getElementById("android-grid");
  grid.innerHTML = androids
    .map(
      (a) => `
    <div class="android-card">
      <div class="android-card-corner"></div>
      <div class="android-img-wrap">
        ${
          a.image_url
            ? `<img src="${a.image_url}" alt="${a.name}" loading="lazy" />`
            : `<div class="android-img-placeholder">
              <svg viewBox="0 0 64 64" fill="none" stroke-width="1.5">
                <rect x="12" y="8" width="40" height="48" rx="4"/>
                <circle cx="32" cy="24" r="8"/>
                <path d="M16 56c0-8.837 7.163-16 16-16s16 7.163 16 16"/>
                <line x1="24" y1="8" x2="24" y2="4"/>
                <line x1="32" y1="8" x2="32" y2="2"/>
                <line x1="40" y1="8" x2="40" y2="4"/>
              </svg>
              <span>Image Slot — ${a.series}</span>
            </div>`
        }
        <div class="android-scan-line"></div>
      </div>
      <div class="android-body">
        <p class="android-series">${a.series}</p>
        <h3 class="android-name">${a.name}</h3>
        <p class="android-tagline">${a.tagline}</p>
        <div class="android-specs">
          <div class="spec-item">
            <span class="spec-label">Cognitive</span>
            <span class="spec-value">${a.spec_cognitive}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Strength</span>
            <span class="spec-value">${a.spec_strength}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Lifespan</span>
            <span class="spec-value">${a.spec_lifespan}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">${a.spec_extra_label}</span>
            <span class="spec-value">${a.spec_extra_value}</span>
          </div>
        </div>
        <div class="android-footer">
          <div class="android-price">
            ${a.price}
            <span>${a.price_note}</span>
          </div>
          <span class="android-availability ${a.availability}">
            ${a.availability === "available" ? "Available" : a.availability === "limited" ? "Limited" : "Classified"}
          </span>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function renderCards() {
  const grid = document.getElementById("android-grid");
  grid.innerHTML = `<p style="font-family:var(--font-mono);color:var(--text-dim);font-size:0.7rem;letter-spacing:0.2em;padding:2rem;">LOADING UNITS...</p>`;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/androids?order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    const data = await res.json();
    buildCards(data);
  } catch (err) {
    console.error("Supabase error:", err);
    grid.innerHTML = `<p style="font-family:var(--font-mono);color:var(--red);font-size:0.7rem;letter-spacing:0.2em;padding:2rem;">ERROR: UNABLE TO CONNECT TO DATABASE</p>`;
  }
}

/* ─── RAIN ANIMATION ─── */
function initRain() {
  const canvas = document.getElementById("rain-canvas");
  const ctx = canvas.getContext("2d");
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 120; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 1.5 + Math.random() * 3,
      length: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.4,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.length);
      ctx.strokeStyle = `rgba(200, 150, 12, ${d.opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      d.y += d.speed;
      if (d.y > canvas.height) {
        d.y = -d.length;
        d.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── SCROLL REVEAL ─── */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );
  els.forEach((el) => obs.observe(el));
}

/* ─── FORM ACQUISITION ─── */
async function initForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.textContent = "TRANSMITTING...";
    btn.disabled = true;
    const payload = {
      first_name: document.getElementById("fname").value.trim(),
      last_name: document.getElementById("lname").value.trim(),
      email: document.getElementById("email").value.trim(),
      unit_requested: document.getElementById("unit").value,
      deployment_context: document.getElementById("deployment").value.trim(),
    };
    try {
      const res = await fetch(SUPABASE_URL + "/rest/v1/acquisitions", {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        btn.textContent = "APPLICATION RECEIVED";
        btn.style.background = "#00ff88";
        btn.style.color = "#000";
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = "";
          btn.style.color = "";
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Form error:", err);
      btn.textContent = "TRANSMISSION FAILED — RETRY";
      btn.style.background = "var(--red)";
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = "";
        btn.disabled = false;
      }, 3000);
    }
  });
}
/* ─── SUPABASE AUTH CLIENT ─── */
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ─── LOGIN MODAL LOGIC ─── */
function initLoginModal() {
  const overlay = document.getElementById("login-overlay");
  const trigger = document.getElementById("admin-trigger");
  const closeBtn = document.getElementById("login-close");
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit-btn");

  trigger.addEventListener("click", () => {
    overlay.classList.add("open");
    errorMsg.classList.remove("visible");
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.classList.remove("visible");
    submitBtn.textContent = "AUTHENTICATING...";
    submitBtn.disabled = true;

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorMsg.textContent = "Access denied — invalid credentials.";
      errorMsg.classList.add("visible");
      submitBtn.textContent = "Authenticate";
      submitBtn.disabled = false;
    } else {
      submitBtn.textContent = "ACCESS GRANTED";
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 800);
    }
  });
}
/* ─── INIT ─── */
renderCards();
initRain();
initReveal();
initForm();
initLoginModal();
