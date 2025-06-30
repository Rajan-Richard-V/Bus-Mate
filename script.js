const allBuses = [
  { time: "07:45", name: "VSP", type: "home" },
  { time: "07:50", name: "Government bus", type: "college" },
  { time: "08:00", name: "Balamithusha", type: "college" },
  { time: "08:15", name: "Ananth", type: "home" },
  { time: "08:40", name: "Government bus", type: "college" },
  { time: "08:45", name: "Government bus", type: "home" },
  { time: "08:50", name: "Antony", type: "home" },
  { time: "09:00", name: "Government bus", type: "home" },
  { time: "09:10", name: "Ananth", type: "college" },
  { time: "10:20", name: "Ananth", type: "home" },
  { time: "10:25", name: "VSP", type: "home" },
  { time: "11:20", name: "Ananth", type: "home" },
  { time: "11:40", name: "Antony", type: "college" },
  { time: "12:15", name: "Ananth", type: "home" },
  { time: "12:30", name: "Antony", type: "home" },
  { time: "13:00", name: "Balamithusha", type: "college" },
  { time: "13:15", name: "Ananth", type: "home" },
  { time: "14:55", name: "Balamithusha", type: "college" },
  { time: "15:20", name: "Government bus", type: "college" },
  { time: "15:40", name: "Antony", type: "home" },
  { time: "16:10", name: "Ananth", type: "home" },
  { time: "16:50", name: "Balamithusha", type: "home" },
  { time: "17:00", name: "VSP", type: "home" },
  { time: "17:00", name: "Government bus", type: "college" },
  { time: "17:15", name: "Ananth", type: "college" },
  { time: "17:15", name: "Antony", type: "home" },
  { time: "17:20", name: "Government bus", type: "home" },
  { time: "17:45", name: "Balamithusha", type: "college" },
  { time: "18:20", name: "Ananth", type: "home" },
  { time: "18:50", name: "Balamithusha", type: "home" },
  { time: "19:05", name: "Ananth", type: "college" },
  { time: "19:45", name: "VSB", type: "home" },
  { time: "20:00", name: "Government bus", type: "college" },
];

const stopOffsetsTo = {
  "perumalpuram(Church Stop)": 0,
  "New Bus Stand": 5,
  "Palai Bus Stand": 15,
};

const stopOffsetsFrom = {
  "Vannarpettai": 0,
  "Palai Bus Stand": 10,
  "New Bus Stand": 20,
};

function populateStops() {
  const direction = document.getElementById("directionSelect").value;
  const stopSelect = document.getElementById("stopSelect");
  stopSelect.innerHTML = '<option value="">-- Select Location --</option>';

  const stops =
    direction === "to"
      ? stopOffsetsTo
      : direction === "from"
      ? stopOffsetsFrom
      : {};

  Object.keys(stops).forEach((stop) => {
    const opt = document.createElement("option");
    opt.value = stop;
    opt.text = stop;
    stopSelect.appendChild(opt);
  });
}

function updateBusInfo() {
  const direction = document.getElementById("directionSelect").value;
  const stop = document.getElementById("stopSelect").value;
  const mode = document.getElementById("modeSelect").value;
  const output = document.getElementById("output");

  if (!direction || !stop) {
    output.innerText = "Please select both direction and location.";
    return;
  }

  const offset =
    direction === "to" ? stopOffsetsTo[stop] : stopOffsetsFrom[stop];
  const type = direction === "to" ? "college" : "home";

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const filtered = allBuses
    .filter((b) => b.type === type)
    .map((b) => {
      const [h, m] = b.time.split(":").map(Number);
      const busTime = h * 60 + m + offset;
      return { ...b, adjustedTime: busTime, diff: busTime - nowMins };
    })
    .filter((b) => b.diff >= 0)
    .sort((a, b) => a.diff - b.diff);

  if (mode === "next") {
    if (filtered.length === 0) {
      output.innerText = "No more buses available today.";
      return;
    }
    const b = filtered[0];
    const h = Math.floor(b.adjustedTime / 60) % 24;
    const m = b.adjustedTime % 60;
    output.innerText = `🚌 Next bus is ${b.name} at ${h
      .toString()
      .padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")} at ${stop}. Arriving in ${formatDiff(b.diff)}.`;
  } else if (mode === "next2") {
    const within2hr = filtered.filter((b) => b.diff <= 120);
    if (within2hr.length === 0) {
      output.innerText = "No buses in the next 2 hours.";
    } else {
      output.innerHTML =
        `<strong>🕑 Buses in Next 2 Hours:</strong><br>` +
        within2hr
          .map((b) => {
            const h = Math.floor(b.adjustedTime / 60) % 24;
            const m = b.adjustedTime % 60;
            return `• ${b.name} at ${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")} (${formatDiff(b.diff)})`;
          })
          .join("<br>");
    }
  } else if (mode === "today") {
    if (filtered.length === 0) {
      output.innerText = "No more buses today.";
    } else {
      output.innerHTML =
        `<strong>📅 All Buses Today:</strong><br>` +
        filtered
          .map((b) => {
            const h = Math.floor(b.adjustedTime / 60) % 24;
            const m = b.adjustedTime % 60;
            return `• ${b.name} at ${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")} (${formatDiff(b.diff)})`;
          })
          .join("<br>");
    }
  }
}

function formatDiff(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} hr ${m} min` : `${m} min`;
}
