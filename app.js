const STORAGE_KEY = "weightJourney_v2";
const ACCOUNT_EMAIL = "devftme@gmail.com";
const initialState = {
  selectedDay: 0,
  meals: {},
  workouts: {},
  notes: [],
  weights: [],
  dark: false,
  updatedAt: 0
};

const state = {
  ...initialState,
  ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {})
};

state.meals = state.meals || {};
state.workouts = state.workouts || {};
state.notes = state.notes || [];
state.weights = state.weights || [];

let cloudClient = null;
let cloudUser = null;
let syncTimer = null;
let cloudReady = false;
let cloudChannel = null;
let cloudLoadingUserId = null;

const dayNames = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه"
];

const mealData = {
  صبحانه: {
    icon: "☀️",
    time: "۸:۳۰",
    options: [
      "نان سنگک ۶۰ گرم + پنیر ۳۰ گرم + گردو ۱۵ گرم + شیر پرچرب ۲۰۰ میلی‌لیتر · حدود ۴۶۰ کیلوکالری",
      "جو دوسر ۵۰ گرم با شیر ۲۵۰ میلی‌لیتر + موز کوچک + کرهٔ بادام‌زمینی ۱۰ گرم · حدود ۴۸۰ کیلوکالری",
      "۲ تخم‌مرغ به‌صورت املت + نان ۶۰ گرم + گوجه + ماست ۱۵۰ گرم · حدود ۴۵۰ کیلوکالری"
    ]
  },

  میان‌وعده: {
    icon: "🍌",
    time: "۱۱:۰۰",
    options: [
      "موز متوسط + شیر پرچرب ۲۵۰ میلی‌لیتر + ارده ۱۵ گرم · حدود ۳۶۰ کیلوکالری",
      "مغزها ۳۰ گرم + کشمش ۳۰ گرم + ماست پرچرب ۱۵۰ گرم · حدود ۳۸۰ کیلوکالری",
      "نان ۴۰ گرم + کرهٔ بادام‌زمینی ۲۵ گرم + شیرکاکائو ۲۰۰ میلی‌لیتر · حدود ۳۹۰ کیلوکالری"
    ]
  },

  ناهار: {
    icon: "🍲",
    time: "۱۴:۰۰",
    options: [
      "عدس‌پلو: برنج پخته ۲۵۰ گرم + عدس ۱۰۰ گرم + گوشت ۶۰ گرم + روغن ۱ قاشق غذاخوری + ماست ۱۵۰ گرم · حدود ۷۰۰ کیلوکالری",
      "چلو مرغ: برنج پخته ۲۵۰ گرم + مرغ ۱۲۰ گرم + روغن ۱ قاشق غذاخوری + سالاد با روغن · حدود ۷۲۰ کیلوکالری",
      "خوراک لوبیا ۲۰۰ گرم + نان ۹۰ گرم + پنیر ۳۰ گرم + روغن ۱ قاشق غذاخوری · حدود ۶۸۰ کیلوکالری"
    ]
  },

  شام: {
    icon: "🌙",
    time: "۲۰:۳۰",
    options: [
      "املت ۳ تخم‌مرغ با گوجه و روغن ۱ قاشق غذاخوری + نان ۹۰ گرم + ماست ۱۰۰ گرم · حدود ۶۳۰ کیلوکالری",
      "سیب‌زمینی پخته ۲۵۰ گرم + تن ماهی آبکش‌شده ۱۲۰ گرم + روغن ۱ قاشق غذاخوری + نان ۳۰ گرم · حدود ۶۵۰ کیلوکالری",
      "کوکو سیب‌زمینی ۲۵۰ گرم + ۲ تخم‌مرغ + ماست ۱۵۰ گرم + نان ۶۰ گرم · حدود ۶۲۰ کیلوکالری"
    ]
  }
};

const workouts = [
  {
    title: "پایین‌تنه و باسن",
    desc: "۱۵ دقیقه، آرام و بدون حبس‌کردن نفس",
    items: [
      "پل باسن · ۲ ست ۱۰ تایی",
      "اسکات به صندلی · ۲ ست ۸ تایی",
      "بالا آوردن پاشنه · ۲ ست ۱۲ تایی",
      "کشش خم‌کنندهٔ ران · هر طرف ۲۰ ثانیه"
    ]
  },

  {
    title: "وضعیت بدن و میان‌تنه",
    desc: "حرکت‌ها باید بدون درد و با دامنهٔ راحت باشند",
    items: [
      "Chin tuck · ۲ ست ۸ تایی",
      "Wall angel · ۲ ست ۸ تایی",
      "Cat-cow · ۸ تکرار آرام",
      "Dead bug ساده · هر طرف ۵ تایی"
    ]
  },

  {
    title: "بالاتنه، مچ و انگشت",
    desc: "با بطری آب سبک یا کش نرم شروع کن",
    items: [
      "شنا روی دیوار · ۲ ست ۸ تایی",
      "پرس سینه با بطری · ۲ ست ۱۰ تایی",
      "Wrist curl · هر دست ۲ ست ۱۰ تایی",
      "بازکردن انگشت با کش · ۲ ست ۱۲ تایی"
    ]
  }
];

function save() {
  state.updatedAt = Date.now();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

  scheduleCloudSync();
}

function fa(number) {
  return String(number).replace(
    /\d/g,
    digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
  );
}

function key(type, name) {
  return `${state.selectedDay}_${type}_${name}`;
}

function toast(message) {
  const element = document.getElementById("toast");

  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character])
  );
}

function dayDates() {
  const today = new Date();

  const saturdayOffset = (today.getDay() + 1) % 7;

  const saturday = new Date(today);
  saturday.setHours(12, 0, 0, 0);
  saturday.setDate(today.getDate() - saturdayOffset);

  return dayNames.map((name, index) => {
    const date = new Date(saturday);
    date.setDate(saturday.getDate() + index);

    return {
      name,
      date,
      full: new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      ).format(date)
    };
  });
}

function dateForSelected() {
  return dayDates()[state.selectedDay];
}

function renderDays() {
  const dates = dayDates();

  document.getElementById("dayTabs").innerHTML = dates
    .map((item, index) => {
      const dateOnly = item.full
        .replace(item.name, "")
        .trim();

      return `
        <button
          class="day-tab ${index === state.selectedDay ? "active" : ""}"
          role="tab"
          aria-selected="${index === state.selectedDay}"
          data-day="${index}"
        >
          <strong>${item.name}</strong>
          <small>${dateOnly}</small>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".day-tab").forEach(button => {
    button.onclick = () => {
      state.selectedDay = Number(button.dataset.day);
      save();
      render();
    };
  });
}

function renderSummary() {
  const selectedDate = dateForSelected();

  document.getElementById("daySummary").innerHTML = `
    <b>
      روز ${fa(state.selectedDay + 1)} · ${selectedDate.full}
    </b>
    <br>
    <span>
      چهار وعدهٔ کوچک + تمرین کوتاه.
      اگر اشتها کم بود، هر وعده را به دو بخش تقسیم کن.
    </span>
  `;
}

function renderMeals() {
  const list = document.getElementById("mealList");
  let done = 0;

  list.innerHTML = Object.entries(mealData)
    .map(([name, data]) => {
      const mealKey = key("meal", name);
      const item = state.meals[mealKey] || {};
      const selectedOption = Number.isInteger(item.option)
        ? item.option
        : 0;

      if (item.done) {
        done++;
      }

      return `
        <article class="meal-card ${item.done ? "done" : ""}">
          <div class="meal-top">
            <div class="meal-icon">
              ${data.icon}
            </div>

            <div>
              <div class="meal-name">${name}</div>
              <span class="meal-time">
                ساعت پیشنهادی ${data.time}
              </span>
            </div>

            <div class="meal-actions">
              <input
                type="checkbox"
                aria-label="تکمیل ${name}"
                data-meal-done="${name}"
                ${item.done ? "checked" : ""}
              >
            </div>
          </div>

          <div class="custom-select" data-select="${name}">
            <button
              type="button"
              class="select-trigger"
              aria-expanded="false"
            >
              <span>
                ${escapeHtml(data.options[selectedOption])}
              </span>
              <b>⌄</b>
            </button>

            <div class="select-menu">
              ${data.options
                .map(
                  (option, index) => `
                    <button
                      type="button"
                      class="select-option ${
                        index === selectedOption ? "selected" : ""
                      }"
                      data-option="${name}"
                      data-index="${index}"
                    >
                      <span class="option-number">
                        ${fa(index + 1)}
                      </span>

                      <span>
                        ${escapeHtml(option)}
                      </span>

                      <i>
                        ${index === selectedOption ? "✓" : ""}
                      </i>
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>

          <label class="check-line">
            <input
              type="checkbox"
              data-meal-done="${name}"
              ${item.done ? "checked" : ""}
            >
            این وعده را انجام دادم
          </label>
        </article>
      `;
    })
    .join("");

  document
    .querySelectorAll(".select-trigger")
    .forEach(button => {
      button.onclick = () => {
        const wrapper = button.closest(".custom-select");

        document
          .querySelectorAll(".custom-select.open")
          .forEach(item => {
            if (item !== wrapper) {
              item.classList.remove("open");
            }
          });

        wrapper.classList.toggle("open");

        button.setAttribute(
          "aria-expanded",
          wrapper.classList.contains("open")
        );
      };
    });

  document.querySelectorAll("[data-option]").forEach(button => {
    button.onclick = () => {
      const name = button.dataset.option;
      const selected = Number(button.dataset.index);

      state.meals[key("meal", name)] = {
        ...(state.meals[key("meal", name)] || {}),
        option: selected
      };

      save();
      renderMeals();
      toast("انتخاب وعده ذخیره شد");
    };
  });

  document.querySelectorAll("[data-meal-done]").forEach(element => {
    element.onchange = () => {
      const name = element.dataset.mealDone;

      state.meals[key("meal", name)] = {
        ...(state.meals[key("meal", name)] || {}),
        done: element.checked
      };

      save();
      renderMeals();
      updateProgress();
    };
  });

  document.querySelectorAll(".meal-card").forEach(card => {
    const optionElement = card.querySelector("[data-option]");
    const name = optionElement?.dataset.option;

    if (!name) {
      return;
    }

    const item = state.meals[key("meal", name)] || {};

    const note = document.createElement("textarea");
    note.className = "meal-note";
    note.dataset.mealNote = name;
    note.placeholder =
      "یادداشت این وعده؛ غذای متفاوت، مقدار مصرف‌شده یا حال اشتها...";
    note.value = item.note || "";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "save-meal-note";
    button.textContent = "ذخیرهٔ یادداشت وعده";

    button.onclick = () => {
      state.meals[key("meal", name)] = {
        ...(state.meals[key("meal", name)] || {}),
        note: note.value.trim()
      };

      save();
      toast("یادداشت وعده ذخیره شد");
    };

    card.appendChild(note);
    card.appendChild(button);
  });

  document.getElementById("mealCount").textContent =
    `${fa(done)} از ۴`;
}

function renderWorkout() {
  const workout = workouts[state.selectedDay % workouts.length];
  const workoutKey = key("workout", "");
  const checks = state.workouts[workoutKey] || [];

  document.getElementById("workoutCard").innerHTML = `
    <div class="workout-card">
      <h3>${workout.title}</h3>
      <p>${workout.desc}</p>

      <div class="exercise-list">
        ${workout.items
          .map(
            (item, index) => `
              <label class="exercise-item">
                <input
                  type="checkbox"
                  data-exercise="${index}"
                  ${checks.includes(index) ? "checked" : ""}
                >
                ${item}
              </label>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  document.querySelectorAll("[data-exercise]").forEach(element => {
    element.onchange = () => {
      let exercises = state.workouts[workoutKey] || [];

      exercises = element.checked
        ? [...new Set([...exercises, Number(element.dataset.exercise)])]
        : exercises.filter(
            item => item !== Number(element.dataset.exercise)
          );

      state.workouts[workoutKey] = exercises;

      save();
      updateProgress();
    };
  });
}

function updateProgress() {
  const meals = Object.values(state.meals)
    .filter(item => item.done)
    .length;

  const exercises = (
    state.workouts[key("workout", "")] || []
  ).length;

  const total =
    meals + Math.min(exercises, 4);

  const percentage = Math.round((total / 8) * 100);

  document.getElementById("weekProgress").textContent =
    `${fa(percentage)}٪`;

  document.getElementById("weekProgressLabel").textContent =
    `${fa(meals)} وعده و ${fa(exercises)} حرکت ثبت شده`;
}

function renderNote() {
  const note = state.notes.find(
    item => item.day === state.selectedDay
  );

  document.getElementById("dailyNote").value =
    note?.text || "";

  document.getElementById("notesList").innerHTML =
    state.notes
      .slice()
      .reverse()
      .map(
        item => `
          <article class="note-item">
            <span class="note-date">
              ${item.date} · ${dayNames[item.day]}
            </span>

            <p class="note-text">
              ${escapeHtml(item.text)}
            </p>
          </article>
        `
      )
      .join("") ||
    `<p class="helper">هنوز یادداشتی ثبت نشده است.</p>`;

  document.getElementById("noteCount").textContent =
    `${fa(state.notes.length)} یادداشت`;
}

function renderChart() {
  const canvas = document.getElementById("weightChart");
  const context = canvas.getContext("2d");
  const empty = document.getElementById("chartEmpty");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (!state.weights.length) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  const values = state.weights.map(item => item.weight);
  const minimum = Math.min(...values) - 1;
  const maximum = Math.max(...values) + 1;

  const width = canvas.width;
  const height = canvas.height;

  context.strokeStyle = "#e5eee7";
  context.lineWidth = 1;

  for (let index = 0; index < 5; index++) {
    const y = 20 + index * ((height - 45) / 4);

    context.beginPath();
    context.moveTo(40, y);
    context.lineTo(width - 15, y);
    context.stroke();
  }

  context.strokeStyle = "#6f9f82";
  context.lineWidth = 4;
  context.beginPath();

  values.forEach((value, index) => {
    const x =
      55 +
      index *
        ((width - 85) /
          Math.max(values.length - 1, 1));

    const y =
      height -
      25 -
      ((value - minimum) /
        (maximum - minimum)) *
        (height - 55);

    if (index) {
      context.lineTo(x, y);
    } else {
      context.moveTo(x, y);
    }
  });

  context.stroke();

  values.forEach((value, index) => {
    const x =
      55 +
      index *
        ((width - 85) /
          Math.max(values.length - 1, 1));

    const y =
      height -
      25 -
      ((value - minimum) /
        (maximum - minimum)) *
        (height - 55);

    context.fillStyle = "#315c4c";
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#55675d";
    context.font = "13px Vazirmatn";
    context.fillText(
      value.toFixed(1),
      x - 12,
      y - 12
    );
  });
}

function render() {
  document.body.classList.toggle(
    "dark",
    state.dark
  );

  renderDays();
  renderSummary();
  renderMeals();
  renderWorkout();
  renderNote();
  renderChart();
  updateProgress();
}

function setCloudStatus(text, tone = "") {
  const element = document.getElementById("cloudStatus");

  if (element) {
    element.textContent = text;
    element.className = tone;
  }
}

function scheduleCloudSync() {
  if (!cloudReady || !cloudClient || !cloudUser) {
    return;
  }

  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncToCloud, 650);
}

async function syncToCloud() {
  if (!cloudClient || !cloudUser) {
    return;
  }

  const { error } = await cloudClient
    .from("user_data")
    .upsert(
      {
        user_id: cloudUser.id,
        data: state,
        updated_at: new Date(
          state.updatedAt
        ).toISOString()
      },
      {
        onConflict: "user_id"
      }
    );

  if (error) {
    setCloudStatus(
      "خطا در همگام‌سازی",
      "error"
    );
    return;
  }

  setCloudStatus(
    "همگام‌سازی فعال",
    "ok"
  );
}

function applyCloudData(data, updatedAt) {
  const remoteUpdated =
    data?.updatedAt ||
    Date.parse(updatedAt || "") ||
    0;

  if (!data || remoteUpdated <= state.updatedAt) {
    return;
  }

  Object.assign(state, data);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
  render();
}

function subscribeToCloudChanges() {
  if (cloudChannel) {
    cloudClient.removeChannel(cloudChannel);
  }

  cloudChannel = cloudClient
    .channel(`user-data-${cloudUser.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_data",
        filter: `user_id=eq.${cloudUser.id}`
      },
      ({ new: row }) => {
        if (row?.data) {
          applyCloudData(row.data, row.updated_at);
        }
      }
    )
    .subscribe();
}

async function loadCloudUser(user) {
  if (!user) {
    throw new Error("No authenticated user");
  }

  if (
    cloudUser?.id === user.id &&
    (cloudReady || cloudLoadingUserId === user.id)
  ) {
    return;
  }

  cloudUser = user;
  cloudReady = false;
  cloudLoadingUserId = user.id;

  if (cloudChannel) {
    cloudClient.removeChannel(cloudChannel);
    cloudChannel = null;
  }

  try {
    const { data: remote, error } = await cloudClient
      .from("user_data")
      .select("data,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (cloudUser?.id !== user.id) {
      return;
    }

    if (
      remote?.data &&
      (remote.data.updatedAt ||
        Date.parse(remote.updated_at || "") ||
        0) > state.updatedAt
    ) {
      applyCloudData(remote.data, remote.updated_at);
    } else if (state.updatedAt) {
      await syncToCloud();
    }

    cloudReady = true;
    subscribeToCloudChanges();
    setCloudStatus(
      user.is_anonymous
        ? "حساب موقت · برای دستگاه دیگر ایمیل وصل کن"
        : `واردشده با ${ACCOUNT_EMAIL} · همگام‌سازی فعال`,
      "ok"
    );
  } catch (error) {
    if (cloudUser?.id === user.id) {
      cloudUser = null;
    }
    throw error;
  } finally {
    if (cloudLoadingUserId === user.id) {
      cloudLoadingUserId = null;
    }
  }
}

async function initCloud() {
  const config = window.SUPABASE_CONFIG || {};
  const emailInput = document.getElementById("emailInput");

  if (emailInput) {
    emailInput.value = config.accountEmail || ACCOUNT_EMAIL;
  }

  if (
    !config.url ||
    !config.anonKey ||
    !window.supabase
  ) {
    setCloudStatus("ذخیرهٔ محلی", "local");
    return;
  }

  setCloudStatus("در حال اتصال…");

  try {
    cloudClient = window.supabase.createClient(
      config.url,
      config.anonKey
    );

    cloudClient.auth.onAuthStateChange((event, session) => {
      if (
        event !== "SIGNED_IN" ||
        !session?.user ||
        session.user.is_anonymous
      ) {
        return;
      }

      window.setTimeout(() => {
        loadCloudUser(session.user).catch(error => {
          console.warn("Supabase sign-in sync failed", error);
          setCloudStatus(
            "ورود انجام شد · بارگذاری داده ناموفق",
            "error"
          );
        });
      }, 0);
    });

    let { data: sessionData } =
      await cloudClient.auth.getSession();

    if (!sessionData.session) {
      const result =
        await cloudClient.auth.signInAnonymously();

      if (result.error) {
        throw result.error;
      }

      sessionData = result.data;
    }

    await loadCloudUser(sessionData.session?.user);
  } catch (error) {
    console.warn(
      "Supabase sync unavailable",
      error
    );

    setCloudStatus(
      "ذخیرهٔ محلی · اتصال ناموفق",
      "error"
    );
  }
}

async function connectEmail() {
  const email =
    window.SUPABASE_CONFIG?.accountEmail || ACCOUNT_EMAIL;

  if (!cloudClient) {
    toast(
      "اول آدرس Supabase را در config.js وارد کن"
    );
    return;
  }

  const { error } =
    await cloudClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href
      }
    });

  if (error) {
    toast("ارسال لینک ورود انجام نشد");
    return;
  }

  toast("لینک ورود به ایمیلت ارسال شد");
}

document.addEventListener("click", event => {
  if (!event.target.closest(".custom-select")) {
    document
      .querySelectorAll(".custom-select.open")
      .forEach(item => {
        item.classList.remove("open");
      });
  }
});

document.getElementById("saveNote").onclick = () => {
  const text = document
    .getElementById("dailyNote")
    .value
    .trim();

  if (!text) {
    toast("اول یک یادداشت بنویس");
    return;
  }

  state.notes = state.notes.filter(
    item => item.day !== state.selectedDay
  );

  state.notes.push({
    day: state.selectedDay,
    text,
    date: new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian",
      {
        dateStyle: "medium"
      }
    ).format(new Date())
  });

  save();
  renderNote();
  toast("یادداشت ذخیره شد");
};

document.getElementById("saveWeight").onclick = () => {
  const value = Number(
    document.getElementById("weightInput").value
  );

  if (!value) {
    toast("وزن را وارد کن");
    return;
  }

  state.weights.push({
    weight: value,
    date: new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian",
      {
        dateStyle: "medium"
      }
    ).format(new Date())
  });

  save();

  document.getElementById("weightInput").value = "";
  document.getElementById("weightMessage").textContent =
    "وزن امروز ثبت شد.";

  renderChart();
  toast("وزن ذخیره شد");
};

document.getElementById("todayButton").onclick = () => {
  const today = new Date();

  state.selectedDay =
    (today.getDay() + 1) % 7;

  save();
  render();
};

document.getElementById("themeToggle").onclick = () => {
  state.dark = !state.dark;
  save();
  render();
};

document.getElementById("exportButton").onclick = () => {
  const report = {
    generatedAt: new Date().toISOString(),

    profile: {
      age: 27,
      heightCm: 163,
      currentWeightKg: 40,
      targetWeightKg: 50
    },

    weights: state.weights,
    notes: state.notes,
    meals: state.meals,
    workouts: state.workouts
  };

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    {
      type: "application/json"
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    `گزارش-هفته-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  link.click();

  URL.revokeObjectURL(url);

  toast("گزارش آماده شد");
};

document.getElementById("emailLogin").onclick =
  connectEmail;

render();
initCloud();